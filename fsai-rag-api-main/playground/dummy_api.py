from sklearn import datasets
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import optuna
from fastapi import FastAPI
from pydantic import BaseModel, conlist
from typing import List


# Loading the data setS
def load_data():
    iris = datasets.load_iris()

    return iris


#  Training the model and fine tuning it
def create_objective(n_estimators, max_depth):
    def objective(trial):
        iris = load_data()
        x, y = iris.data, iris.target

        rf_max_depth = trial.suggest_int(
            "rf_max_depth", max_depth[0], max_depth[1], log=True
        )
        rf_n_estimators = trial.suggest_int(
            "n_estimators", n_estimators[0], n_estimators[1], log=True
        )
        classifier_obj = RandomForestClassifier(
            max_depth=rf_max_depth, n_estimators=rf_n_estimators
        )

        score = cross_val_score(classifier_obj, x, y, n_jobs=-1, cv=3)
        accuracy = score.mean()
        return accuracy

    return objective


app = FastAPI()


class ExperimentRequest(BaseModel):
    n_estimators: conlist(int, min_length=2, max_length=2)  # type: ignore
    max_depth: conlist(int, min_length=2, max_length=2)  # type: ignore
    n_trials: int


@app.post("/run_experiments")
def experiment(req: ExperimentRequest):
    n_estimators = req.n_estimators
    rf_max_depth = req.max_depth
    n_trials = req.n_trials
    study = optuna.create_study(direction="maximize")
    study.optimize(create_objective(n_estimators, rf_max_depth), n_trials=n_trials)
    return study.best_trial




# Payload : ntrial
# reponse:study.best_params, study.best_value