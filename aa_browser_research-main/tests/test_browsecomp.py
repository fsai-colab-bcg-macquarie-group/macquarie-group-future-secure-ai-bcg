# mypy: ignore-errors

import asyncio
import base64
import hashlib
import json
import os
import random
import re
import time

import pandas as pd
import tiktoken
from browser_use import Agent  # Ensure this is the Browser Use Agent class
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from aa_browser_research.simple_evals import common
from aa_browser_research.simple_evals.types import (
    Eval,
    EvalResult,
    SamplerBase,
    SingleEvalResult,
)


# --- Token-based truncation with fallback ---
def truncate_to_max_tokens(
    text: str, max_tokens: int, encoding_name: str = "gpt-4"
) -> str:
    try:
        encoder = tiktoken.get_encoding(encoding_name)
    except Exception as exc:
        print(
            f"Warning: Unknown encoding '{encoding_name}', falling back to 'cl100k_base'. Exception: {exc}"
        )
        encoder = tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)
    if len(tokens) > max_tokens:
        tokens = tokens[:max_tokens]
        return encoder.decode(tokens)
    return text


# Set the maximum prompt token length (using 3000 tokens as an example)
MAX_PROMPT_TOKENS = 3000

# Query and Grader Templates
QUERY_TEMPLATE = """
{Question}

Your response should be in the following format:
Explanation: {{your explanation for your final answer}}
Exact Answer: {{your succinct, final answer}}
Confidence: {{your confidence score between 0% and 100% for your answer}}
""".strip()

GRADER_TEMPLATE = """
Judge whether the following [response] to [question] is correct or not based on the precise and unambiguous [correct_answer] below.

[question]: {question}

[response]: {response}

Your judgement must be in the format and criteria specified below:

extracted_final_answer: The final exact answer extracted from the [response]. Put the extracted answer as 'None' if there is no exact, final answer to extract from the response.

[correct_answer]: {correct_answer}

reasoning: Explain why the extracted_final_answer is correct or incorrect based on [correct_answer], focusing only on whether there are meaningful differences between [correct_answer] and the extracted_final_answer. Do not comment on any background to the problem, do not attempt to solve the problem, do not argue for any answer different than [correct_answer], focus only on whether the answers match.

correct: Answer 'yes' if extracted_final_answer matches the [correct_answer] given above, or is within a small margin of error for numerical problems. Answer 'no' otherwise.

confidence: The extracted confidence score between 0% and 100% from [response]. Put 100 if there is no confidence score available.
""".strip()

CHOICE_STRINGS = ["yes", "no"]


def derive_key(password: str, length: int) -> bytes:
    hasher = hashlib.sha256()
    hasher.update(password.encode())
    key = hasher.digest()
    return key * (length // len(key)) + key[: length % len(key)]


def decrypt(ciphertext_b64: str, password: str) -> str:
    encrypted = base64.b64decode(ciphertext_b64)
    key = derive_key(password, len(encrypted))
    decrypted = bytes(a ^ b for a, b in zip(encrypted, key))
    return decrypted.decode()


def pack_message(content: str, role: str) -> HumanMessage:
    return HumanMessage(content=content)


# --- Helper function to safely compute the mean ---
def safe_mean(values):
    filtered = [v for v in values if v is not None]
    return sum(filtered) / len(filtered) if filtered else None


# --- BrowserUse Sampler Wrapper (async version) ---
class BrowserUseSampler(SamplerBase):
    """
    A wrapper for the Browser Use Agent that runs each evaluation task sequentially
    (or with controlled parallelism when used with asyncio.gather).
    """

    def __init__(self, model: ChatOpenAI, max_steps: int = 20):
        self.model = model
        self.max_steps = max_steps

    def _pack_message(self, content: str, role: str) -> dict:
        return {"role": role, "content": content}

    async def sample_async(self, prompt_messages: list[dict]) -> dict:
        composite_task = prompt_messages[0]["content"]
        # Optionally: modify composite_task to include instructions for concise search queries.
        print("Composite Task:", composite_task)
        agent = Agent(task=composite_task, llm=self.model)
        history = await agent.run(max_steps=self.max_steps)
        # Get total input tokens if available.
        tokens_used = None
        if hasattr(history, "total_input_tokens"):
            try:
                tokens_used = history.total_input_tokens()
            except Exception:
                tokens_used = getattr(history, "token_count", None)
        else:
            tokens_used = getattr(history, "token_count", None)
        steps_used = getattr(history, "steps", None)
        return {
            "final_result": history.final_result(),
            "steps": steps_used,
            "tokens": tokens_used,
        }

    def __call__(self, prompt_messages: list[dict]) -> dict:
        return asyncio.run(self.sample_async(prompt_messages))


# --- BrowseComp Evaluation Class (async version) ---
class BrowseCompEval(Eval):
    def __init__(
        self,
        grader_model: SamplerBase,
        num_examples: int | None = None,
        n_repeats: int = 1,
    ):
        df = pd.read_csv(
            "https://openaipublic.blob.core.windows.net/simple-evals/browse_comp_test_set.csv"
        )
        examples = [row.to_dict() for _, row in df.iterrows()]
        if num_examples:
            assert n_repeats == 1, "n_repeats only supported when num_examples is None"
            rng = random.Random(0)
            examples = rng.sample(examples, num_examples)
        self.examples = examples * n_repeats
        self.grader_model = grader_model

    def grade_sample(self, question: str, correct_answer: str, response: dict) -> str:
        grader_prompt = GRADER_TEMPLATE.format(
            question=question,
            correct_answer=correct_answer,
            response=response.get("final_result", ""),
        )
        grader_prompt = truncate_to_max_tokens(grader_prompt, MAX_PROMPT_TOKENS)
        prompt_messages = [pack_message(grader_prompt, role="user")]
        grading_response = self.grader_model(prompt_messages)
        grading_response_str = getattr(
            grading_response, "content", str(grading_response)
        )
        match = re.search(r"correct: (yes|no)", grading_response_str)
        return match.group(0) if match else "no"

    async def run_all(
        self, sampler: SamplerBase, concurrency_limit: int = 5
    ) -> EvalResult:
        results = []
        output_filename = "results/browsecomp_eval_results.json"
        processed_ids = set()
        if os.path.exists(output_filename):
            try:
                with open(output_filename, "r", encoding="utf-8") as f:
                    existing = json.load(f)
                    for res in existing.get("results", []):
                        if "id" in res:
                            processed_ids.add(res["id"])
            except Exception:
                processed_ids = set()
        total_tasks = len(self.examples)
        start_time = time.time()

        semaphore = asyncio.Semaphore(concurrency_limit)

        async def process_row(row: dict) -> SingleEvalResult:
            async with semaphore:
                return await self._process_row_async(sampler, row)

        tasks = []
        for i, row in enumerate(self.examples):
            task_id = row.get("id")
            if task_id in processed_ids:
                print(f"Skipping task {task_id} (already processed)")
                continue
            tasks.append(process_row(row))
        # Run tasks concurrently with the given concurrency limit.
        for i, task in enumerate(asyncio.as_completed(tasks), 1):
            try:
                result = await task
                results.append(result)
            except Exception as e:
                print(f"Error processing task {i}: {e}")
                results.append(
                    SingleEvalResult(
                        html="", score=False, convo=[], metrics={"is_correct": False}
                    )
                )
            # Write intermediate results after each completed task.
            temp_eval_result = common.aggregate_results(results)
            with open(output_filename, "w", encoding="utf-8") as f:
                # Optionally remove keys from results that are empty.
                clean_results = []
                for r in results:
                    r_dict = r.__dict__.copy()
                    if "html" in r_dict and not r_dict["html"]:
                        r_dict.pop("html")
                    if "id" in r_dict and r_dict["id"] is None:
                        r_dict.pop("id")
                    if (
                        "steps" in r_dict.get("metrics", {})
                        and r_dict["metrics"]["steps"] == 0
                    ):
                        r_dict["metrics"].pop("steps")
                    clean_results.append(r_dict)
                json.dump(
                    {
                        "aggregate": {
                            "total_tasks": total_tasks,
                            "processed_tasks": len(results),
                            "accuracy": sum(r.metrics["is_correct"] for r in results)
                            / len(results),
                        },
                        "results": clean_results,
                    },
                    f,
                    indent=2,
                )
            current_accuracy = sum(r.metrics["is_correct"] for r in results) / len(
                results
            )
            print(
                f"Processed {i}/{total_tasks} tasks, current accuracy: {current_accuracy:.3f}"
            )

        final_accuracy = sum(r.metrics["is_correct"] for r in results) / len(results)
        total_time = time.time() - start_time
        successful_tasks = sum(1 for r in results if r.metrics["is_correct"])
        steps_list = [
            r.metrics["steps"] for r in results if r.metrics.get("steps") is not None
        ]
        tokens_list = [
            r.metrics["tokens"] for r in results if r.metrics.get("tokens") is not None
        ]
        time_list = [
            r.metrics["time"] for r in results if r.metrics.get("time") is not None
        ]
        avg_steps = safe_mean(steps_list)
        avg_tokens = safe_mean(tokens_list)
        avg_time = safe_mean(time_list)

        print("AGGREGATE METRICS:")
        print(
            {
                "is_correct": final_accuracy,
                "total_tasks": total_tasks,
                "time_elapsed": total_time,
                "successful_tasks": successful_tasks,
                "avg_steps": avg_steps,
                "avg_tokens": avg_tokens,
                "avg_time": avg_time,
            }
        )
        print("##################")
        aggregate = common.aggregate_results(results)
        aggregate.__dict__["aggregate_stats"] = {
            "total_tasks": total_tasks,
            "processed_tasks": len(results),
            "accuracy": final_accuracy,
            "time_elapsed_seconds": total_time,
            "successful_tasks": successful_tasks,
            "avg_steps": avg_steps,
            "avg_tokens": avg_tokens,
            "avg_time": avg_time,
        }
        return aggregate

    async def _process_row_async(
        self, sampler: SamplerBase, row: dict
    ) -> SingleEvalResult:
        task_start = time.time()
        problem = decrypt(row.get("problem", ""), row.get("canary", ""))
        safe_problem = problem.replace("{", "{{").replace("}", "}}")
        answer = decrypt(row.get("answer", ""), row.get("canary", ""))
        query_text = QUERY_TEMPLATE.format(Question=safe_problem)
        query_text = truncate_to_max_tokens(query_text, MAX_PROMPT_TOKENS)
        prompt_messages = [sampler._pack_message(content=query_text, role="user")]
        sample_dict = await sampler.sample_async(prompt_messages)
        response_text = sample_dict.get("final_result", "")
        steps_used = sample_dict.get("steps") or 0
        tokens_used = sample_dict.get("tokens") or 0
        grade_result = self.grade_sample(problem, answer, sample_dict)
        is_correct = grade_result == "correct: yes"
        task_time = time.time() - task_start
        convo = prompt_messages + [{"role": "assistant", "content": response_text}]
        result = SingleEvalResult(
            html="",  # No HTML output
            score=is_correct,
            convo=convo,
            metrics={
                "is_correct": is_correct,
                "tokens": tokens_used,
                "time": task_time,
            },
        )
        # Only include steps if nonzero.
        if steps_used:
            result.metrics["steps"] = steps_used
        if row.get("id") is not None:
            result.__dict__["id"] = row.get("id")
        return result


# --- Main evaluation driver (async) ---
async def main_async():
    grader_llm = ChatOpenAI(model="gpt-4o", temperature=0)
    sampler = BrowserUseSampler(model=grader_llm, max_steps=20)
    eval_instance = BrowseCompEval(grader_model=grader_llm)
    aggregate = await eval_instance.run_all(sampler, concurrency_limit=5)

    with open("results/browsecomp_eval_results.json", "w", encoding="utf-8") as f:
        json.dump(aggregate.__dict__, f, indent=2)
    print(
        "BrowseComp evaluation completed. Results saved to 'results/browsecomp_eval_results.json'."
    )


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
