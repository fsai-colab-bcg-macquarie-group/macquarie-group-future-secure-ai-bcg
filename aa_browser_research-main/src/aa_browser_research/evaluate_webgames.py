import json
from statistics import mean


def load_webgames_dataset(path="data", filename="webgames.jsonl"):
    """
    Load the WebGames dataset from a JSON Lines file.
    Returns a dictionary mapping task titles to a dictionary of expected secret password and category.
    """
    mapping = {}
    with open(path + "/" + filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                title = record.get("title")
                password = record.get("password")
                category = record.get("category", "uncategorized")
                if title and password:
                    mapping[title] = {"password": password, "category": category}
            except json.JSONDecodeError:
                print("Error decoding line:", line)
    return mapping


def load_evaluation_results(path="results", filename="webgames_eval_results.json"):
    """
    Load evaluation results from the given JSON file.
    """
    with open(path + "/" + filename, "r", encoding="utf-8") as f:
        return json.load(f)


def assess_task(task_name, task_data, expected_password):
    """
    Print token count and duration, and assess whether the expected secret password is found in the result text.
    Returns a tuple: (success, duration, tokens)
    """
    tokens = task_data.get("tokens")
    duration = task_data.get("duration_seconds")
    result_text = task_data.get("result", "")

    if expected_password is None:
        assessment = "No expected password specified."
        success = None
    else:
        if expected_password in result_text:
            assessment = f"SUCCESS: Secret password '{expected_password}' found."
            success = True
        else:
            assessment = f"FAILURE: Secret password '{expected_password}' NOT found."
            success = False

    # print(f"Task: {task_name}")
    # print(f"   Duration (s): {duration}")
    # print(f"   Tokens: {tokens}")
    # print(f"   Assessment: {assessment}")
    # print("-" * 50)
    return success, duration, tokens


def main():
    # Load expected task mapping (including category) from the dataset
    expected_mapping = load_webgames_dataset()

    # Load evaluation results from evaluation_results.json
    eval_results = load_evaluation_results()

    evaluated_tasks = set(eval_results.keys())
    expected_tasks = set(expected_mapping.keys())

    category_metrics = {}

    print("\nTask-level assessment for evaluated tasks:\n")

    successful_total = 0
    failed_total = 0

    # Process tasks that have evaluation results
    for task_name, task_data in eval_results.items():
        expected_info = expected_mapping.get(task_name, {})
        expected_secret = expected_info.get("password")
        category = expected_info.get("category", "uncategorized")

        outcome, duration, tokens = assess_task(task_name, task_data, expected_secret)

        # Accumulate per category metrics
        if category not in category_metrics:
            category_metrics[category] = {
                "durations": [],
                "tokens": [],
                "successes": [],
            }
        if duration is not None:
            category_metrics[category]["durations"].append(duration)
        if tokens is not None:
            category_metrics[category]["tokens"].append(tokens)
        if outcome is not None:
            category_metrics[category]["successes"].append(outcome)

        if outcome is True:
            successful_total += 1
        elif outcome is False:
            failed_total += 1

    # Identify tasks that exist in expected mapping but missing from the evaluation results
    missing_tasks = expected_tasks - evaluated_tasks
    missing = len(missing_tasks)
    if missing_tasks:
        print("\nThe following tasks are missing from the evaluation results:")
        for task_name in missing_tasks:
            print(f" - {task_name}")
    count_categories = 0
    # Print per-category analysis
    print("\n" + "=" * 50)
    print("Per-Category Analysis:")
    for category, metrics in category_metrics.items():
        count_categories += 1
        num_tasks = len(metrics["successes"])
        if num_tasks > 0:
            success_count = sum(1 for s in metrics["successes"] if s)
            success_rate = (success_count / num_tasks) * 100
            avg_duration = mean(metrics["durations"]) if metrics["durations"] else 0
            avg_tokens = mean(metrics["tokens"]) if metrics["tokens"] else 0
        else:
            success_rate = 0
            avg_duration = 0
            avg_tokens = 0

        print(f"Category: {category}")
        print(f"   Number of evaluated tasks: {num_tasks}")
        print(f"   Success rate: {success_rate:.2f}%")
        print(f"   Average duration (s): {avg_duration:.2f}")
        print(f"   Average tokens used: {avg_tokens:.2f}")
        print("-" * 50)
    print("CATS: ", count_categories)
    total_expected = len(expected_mapping)
    print("\n" + "=" * 50)
    print("Overall Summary:")
    print(f"Total Expected Tasks: {total_expected}")
    print(f"Evaluated Tasks: {len(evaluated_tasks)}")
    print(f"  Successful (secret found): {successful_total}")
    print(f"  Failed (secret not found): {failed_total}")
    print(f"Missing Evaluations: {missing}")


if __name__ == "__main__":
    main()
