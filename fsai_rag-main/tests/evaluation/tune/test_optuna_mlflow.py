import fsai_rag.evaluation.tune.optuna_mlflow as optuna_mlflow


class TestOptunaMLFlow:
    def test_get_or_create_experiment(self):
        experiment_name = "pytest_test_optuna_mlflow"
        experiment_id = optuna_mlflow.get_or_create_experiment(experiment_name)
        assert experiment_id is not None
