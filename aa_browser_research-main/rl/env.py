# # browser_use/rl/env.py
# import asyncio
# import json

# import gymnasium as gym
# import nest_asyncio
# import torch
# from browser_use import Agent, Browser, BrowserConfig
# from browser_use.controller import Controller
# from browser_use.rl.reward import HeuristicReward
# from gymnasium import spaces
# from langchain_openai import ChatOpenAI
# from transformers import AutoTokenizer

# MAX_STEPS = 30
# MAX_TOKENS = 256

# _tok = AutoTokenizer.from_pretrained("microsoft/phi-3-mini-128k-instruct")


# class BrowserUseEnv(gym.Env):
#     metadata = {"render_modes": []}

#     def __init__(self, reward_model=None):
#         super().__init__()
#         self.reward_model = reward_model or HeuristicReward()

#         self.observation_space = spaces.Box(
#             low=0,
#             high=_tok.vocab_size,
#             shape=(MAX_TOKENS,),
#             dtype=int,
#         )
#         self.action_space = spaces.Text(max_length=128)

#         self.ctrl = Controller()
#         import browser_use.macros  # registers macro tools

#         self.browser_cfg = BrowserConfig(headless=True, disable_security=True)

#     # ─── reset ────────────────────────────────────────────────────────────────
#     def reset(self, *, seed=None, options=None):
#         super().reset(seed=seed)
#         self.browser = Browser(config=self.browser_cfg)

#         task = "Add 2x canned corn on Woolworths AU"
#         llm = ChatOpenAI(model="o3-mini")

#         self.agent = Agent(
#             task=task,
#             llm=llm,  # executor
#             planner_llm=llm,  # planner (will be swapped during PPO roll‐outs)
#             browser=self.browser,
#             controller=self.ctrl,
#             max_steps=MAX_STEPS,
#             verbose=False,
#         )
#         self.step_idx = 0
#         obs_ids, prompt_str = self._encode("")
#         return obs_ids, {"prompt": prompt_str}

#     # ─── step ─────────────────────────────────────────────────────────────────
#     def step(self, action: str):
#         self.step_idx += 1

#         try:
#             action_dict = json.loads(action)
#         except json.JSONDecodeError:
#             return *self._encode("BAD_JSON"), -1.0, True, False, {}

#         tool_output = self.ctrl.execute_json(action_dict, self.browser)

#         done = self.step_idx >= MAX_STEPS or '"final cart total"' in tool_output.lower()
#         reward = self.reward_model.score(tool_output, done)
#         obs_ids, prompt_str = self._encode(tool_output)
#         info = {"tool_output": tool_output, "prompt": prompt_str}
#         return obs_ids, reward, done, False, info

#     # ─── helpers ─────────────────────────────────────────────────────────────
#     def _encode(self, tool_output: str):
#         prompt = self.agent._build_planner_prompt(tool_output)
#         ids = _tok(
#             prompt,
#             truncation=True,
#             max_length=MAX_TOKENS,
#             padding="max_length",
#         ).input_ids
#         return torch.tensor(ids, dtype=torch.int32), prompt

#     def close(self):
#         try:
#             nest_asyncio.apply()
#             asyncio.run(self.browser.close())
#         except Exception:
#             pass
