# rl/ppo_train.py
import gymnasium as gym
import torch
from browser_use.rl.env import BrowserUseEnv, HeuristicReward
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import PPOConfig, PPOTrainer

BASE_MODEL = "microsoft/phi-3-mini-128k-instruct"  # open‑weights 3.8 B

tok = AutoTokenizer.from_pretrained(BASE_MODEL)
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL, torch_dtype=torch.bfloat16, device_map="auto"
)
ref_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL, torch_dtype=torch.bfloat16, device_map="auto"
)

ppo_cfg = PPOConfig(
    batch_size=4,  # accumulate a few steps before update
    forward_batch_size=1,
    ppo_epochs=4,
    learning_rate=2e-5,
    target_kl=0.1,
    max_steps=500,  # total PPO iterations
)

env = BrowserUseEnv(reward_model=HeuristicReward())

ppo = PPOTrainer(
    config=ppo_cfg,
    model=model,
    ref_model=ref_model,
    tokenizer=tok,
)

for ep in range(ppo_cfg.max_steps):
    obs_ids, info = env.reset()
    prompt_str = info["prompt"]
    done = False
    rewards, query_ids, response_ids = [], [], []

    while not done:
        input_ids = tok(prompt_str, return_tensors="pt").input_ids.to(model.device)
        gen_ids = model.generate(
            input_ids,
            max_new_tokens=32,
            temperature=0.2,
            eos_token_id=tok.eos_token_id,
            pad_token_id=tok.eos_token_id,
        )
        action_str = tok.decode(gen_ids[0, input_ids.shape[1] :])
        obs_ids, reward, done, _, info = env.step(action_str)
        prompt_str = info["prompt"]

        # buffer for PPO
        rewards.append(torch.tensor([reward]).to(model.device))
        query_ids.append(input_ids)
        response_ids.append(gen_ids[:, input_ids.shape[1] :])

    # one PPO update per episode
    ppo.step(query_ids, response_ids, rewards)

    if ep % 20 == 0:
        print(f"Episode {ep} finished. Last reward={reward}")
        ppo.save_pretrained(f"checkpoints/ppo-{ep}")

env.close()
