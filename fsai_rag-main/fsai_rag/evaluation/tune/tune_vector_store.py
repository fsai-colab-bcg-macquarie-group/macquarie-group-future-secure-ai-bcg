import json
import os
from glob import glob

import mlflow
import optuna
import pandas as pd
from datasets import Dataset
from langchain.text_splitter import TextSplitter
from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.supabase import SupabaseVectorStore
from pydantic import BaseModel
from ragas import evaluate  # load the documents
from ragas.metrics import (
    answer_relevancy,
    context_precision,
    context_recall,
    faithfulness,
)
from ragas.run_config import RunConfig
from ragas.testset.evolutions import multi_context, reasoning, simple
from ragas.testset.generator import TestsetGenerator

import fsai_rag.evaluation.predict.hybrid_rag as hybrid_rag
import fsai_rag.evaluation.predict.vanilla_rag as vanilla_rag
import fsai_rag.evaluation.tune.optuna_mlflow as optuna_mlflow
import fsai_rag.evaluation.tune.tune_vector_store as tune_vector_store
import use_case_specific.SLR.B4SI.populate_vector_store as populate_vector_store
from fsai_rag.retriever.DenseRetrieverConfig import DenseRetrieverConfig
from fsai_rag.retriever.SparseRetrieverConfig import SparseRetrieverConfig
from fsai_rag.utils.sql_connection import get_engine
from fsai_rag.vectoriser.DenseVectoriserConfig import (
    DenseVectoriserConfig,
    get_baseline_dense_vectoriser_config,
)
from fsai_rag.vectoriser.SparseVectoriserConfig import (
    SparseVectoriserConfig,
    get_baseline_sparse_vectoriser_config,
)


class VectoriserConfigs(BaseModel):
    dense_vectoriser: DenseVectoriserConfig
    dense_retriever: DenseRetrieverConfig
    sparse_vectoriser: SparseVectoriserConfig | None = None
    sparse_retriever: SparseRetrieverConfig | None = None


class TrialParams(BaseModel):
    use_sparse: bool
    chunk_size: int
    contextualise_src_chunk: bool
    dense_top_k: int
    chunk_overlap: int
    # Optional sparse params
    sparse_chunk_size: int | None = None
    sparse_chunk_overlap: int | None = None
    sparse_contextualise_src_chunk: bool | None = None
    sparse_top_k: int | None = None


def get_question_dataset(
    vectoriser_config: DenseVectoriserConfig, policy_files: list[str]
) -> pd.DataFrame:
    # vectoriser_config = get_baseline_dense_vectoriser_config()

    documents = populate_vector_store.get_llamaindex_documents_all(
        vectoriser_config=vectoriser_config, policy_files=policy_files
    )
    print(len(documents))

    # generator with openai models
    generator_llm = OpenAI(model="gpt-4o-mini")
    critic_llm = OpenAI(model="gpt-4o")
    embeddings = OpenAIEmbedding()

    generator = TestsetGenerator.from_llama_index(
        generator_llm=generator_llm,
        critic_llm=critic_llm,
        embeddings=embeddings,
    )

    testset = generator.generate_with_llamaindex_docs(
        documents,
        test_size=100,
        distributions={simple: 0.3, reasoning: 0.35, multi_context: 0.35},
        is_async=False,
        run_config=RunConfig(max_workers=4),
        raise_exceptions=False,
    )

    dfr = testset.to_pandas()
    dfr["contexts_json"] = dfr["contexts"].apply(lambda x: json.dumps(x))
    dfr["metadata_json"] = dfr["metadata"].apply(lambda x: json.dumps(x))

    dfr = dfr[
        [
            "question",
            "contexts_json",
            "ground_truth",
            "evolution_type",
            "metadata_json",
            "episode_done",
        ]
    ]

    # Remove answer not present
    substr = "The answer to given question is not present"
    dfr = dfr[~dfr["ground_truth"].str.contains(substr)]

    return dfr


def suggest_trial_vectoriser_config(
    trial,
) -> tuple[TrialParams, VectoriserConfigs]:
    # use_sparse: bool = bool(trial.suggest_categorical("use_sparse", [True, False]))
    use_sparse: bool = False  # TODO: use_sparse is false because sparse is not working

    # Dense vectoriser params
    params = {
        "chunk_size": trial.suggest_int("chunk_size", 1000, 100000),
        "contextualise_src_chunk": trial.suggest_categorical(
            "contextualise_src_chunk", [True, False]
        ),
        "dense_top_k": trial.suggest_int("dense_top_k", 1, 10),
        "use_sparse": use_sparse,
        "hybrid_search": 1 if use_sparse else 0,
    }

    # Add dependent dense vectoriser params
    params["chunk_overlap"] = trial.suggest_int(
        "chunk_overlap", 10, params["chunk_size"] // 2
    )

    # Add sparse params and their dependent params if use_sparse is True
    if params["use_sparse"]:
        params["sparse_chunk_size"] = trial.suggest_int(
            "sparse_chunk_size", 1000, 100000
        )
        params["sparse_chunk_overlap"] = trial.suggest_int(
            "sparse_chunk_overlap",
            10,
            params["sparse_chunk_size"] // 2,  # Note the dependency
        )
        params["sparse_contextualise_src_chunk"] = trial.suggest_categorical(
            "sparse_contextualise_src_chunk", [True, False]
        )
        params["sparse_top_k"] = trial.suggest_int("sparse_top_k", 1, 10)

    # Create TrialParams after all params are calculated
    trial_params = TrialParams(**params)

    # Create Dense configs
    dense_vectoriser = get_baseline_dense_vectoriser_config()
    dense_vectoriser.splitter_config.chunk_size = params["chunk_size"]
    dense_vectoriser.splitter_config.chunk_overlap = params["chunk_overlap"]
    dense_vectoriser.contextualisor_config.contextualise_src_chunk = params[
        "contextualise_src_chunk"
    ]

    dense_retriever = DenseRetrieverConfig(
        dense_top_k=params["dense_top_k"], dense_vectoriser_config=dense_vectoriser
    )

    sparse_vectoriser = None
    sparse_retriever = None

    if params["use_sparse"]:

        sparse_vectoriser = get_baseline_sparse_vectoriser_config()
        sparse_vectoriser.splitter_config.chunk_size = params["sparse_chunk_size"]
        sparse_vectoriser.splitter_config.chunk_overlap = params["sparse_chunk_overlap"]
        sparse_vectoriser.contextualisor_config.contextualise_src_chunk = params[
            "sparse_contextualise_src_chunk"
        ]

        sparse_retriever = SparseRetrieverConfig(
            sparse_top_k=params["sparse_top_k"],
            sparse_vectoriser_config=sparse_vectoriser,
        )

    vectoriser_configs = VectoriserConfigs(
        dense_vectoriser=dense_vectoriser,
        dense_retriever=dense_retriever,
        sparse_vectoriser=sparse_vectoriser,
        sparse_retriever=sparse_retriever,
    )

    return trial_params, vectoriser_configs


def objective(
    trial,
    policy_files: list[str],
    job_id: str,
    experiment_id: str,
    ragas_testset_tbl_name: str,
) -> float:
    with mlflow.start_run(experiment_id=experiment_id, nested=True):

        # Unpack params and configs dictionary
        params, configs = suggest_trial_vectoriser_config(trial)

        print(f"\nTrial configuration:")
        print(f"Number of input files: {len(policy_files)}")
        if params.use_sparse:
            print(f"Sparse chunk size: {params.sparse_chunk_size}")
            print(f"Sparse chunk overlap: {params.sparse_chunk_overlap}")
            print(f"Sparse top_k: {params.sparse_top_k}")

        # Hardcode the intermediate table names
        tuning_table = "mlflow_tuning_config_vectors"
        tuning_collection = "mlflow_tuning_config_collection"

        # Populate vector store using new params
        populate_vector_store.populate_vector_store(
            vectoriser_config=configs.dense_vectoriser,
            collection_name=tuning_collection,
            policy_files=policy_files,
            output_table=tuning_table,
            job_id=job_id,
        )

        # Prepare test questions
        engine = get_engine()
        dfr = pd.read_sql(ragas_testset_tbl_name, engine)
        dfr["options"] = pd.NA
        test_dfr = dfr[["question", "options"]]
        test_dfr = vanilla_rag.create_question_with_options(test_dfr)

        # predicts = vanilla_rag.predict(
        #    test_dfr,
        #    collection_name=tuning_collection
        # )  # Simple version without extra params

        predicts = hybrid_rag.predict(
            test_dfr,
            collection_name=tuning_collection,
            file_paths=policy_files,  # Add folder path for sparse docs
            use_sparse=params.use_sparse,
            dense_retriever_config=configs.dense_retriever,
            sparse_retriever_config=(
                configs.sparse_retriever if params.use_sparse else None
            ),
        )

        eval_dfr = dfr.merge(predicts, on=["question", "options"])

        eval_result = tune_vector_store.evaluate_rag_predictions(eval_dfr)
        macro_average = tune_vector_store.compute_macro_average(eval_result)

        # Log metrics
        mlflow.log_params(params.model_dump())
        mlflow.log_metric("macro_average", macro_average)
        mlflow.log_metric("context_precision", eval_result["context_precision"].mean())
        mlflow.log_metric("context_recall", eval_result["context_recall"].mean())
        mlflow.log_metric("answer_relevancy", eval_result["answer_relevancy"].mean())
        mlflow.log_metric("faithfulness", eval_result["faithfulness"].mean())

    return macro_average


def tune_knowledge_base(
    files: list[str],
    table_name: str,
    job_id: str,
    ragas_testset_tbl_name: str,
    n_trials: int = 30,
):  # Move main logic to function

    # Create parent experiment
    experiment_name = f"{job_id}_HRAG_tuning"
    print(f"Creating experiment with name: {experiment_name}")
    experiment_id = optuna_mlflow.get_or_create_experiment(experiment_name)
    print(f"Got experiment ID: {experiment_id}")

    # Initiate the parent run and call the hyperparameter tuning child run logic
    with mlflow.start_run(experiment_id=experiment_id):
        # Initialize the Optuna study
        study = optuna.create_study(direction="maximize")

        study.enqueue_trial(
            {
                # Dense vectoriser params
                "chunk_size": 10000,
                "chunk_overlap": 1000,
                "contextualise_src_chunk": False,
                # Dense retriever params
                "dense_top_k": 1,
                # Control flag
                "use_sparse": False,
                # Sparse vectoriser params (Included for testing, only used if use_sparse=True)
                "sparse_chunk_size": 8000,
                "sparse_chunk_overlap": 1000,
                "sparse_contextualise_src_chunk": False,
                # Sparse retriever params (Included for testing, only used if use_sparse=True)
                "sparse_top_k": 1,
            }
        )

        # Execute the hyperparameter optimization trials.
        # Note the addition of the `champion_callback` inclusion to control our logging
        study.optimize(
            lambda trial: objective(
                trial,
                files,
                job_id,
                experiment_id,
                ragas_testset_tbl_name=ragas_testset_tbl_name,
            ),
            n_trials=n_trials,  # Parameterized
            callbacks=[optuna_mlflow.champion_callback],
        )

        mlflow.log_params(study.best_params)
        mlflow.log_metric("best_macro_average", study.best_value)

        # Create final vector store with best parameters
        _, best_configs = suggest_trial_vectoriser_config(
            optuna.trial.FixedTrial(study.best_params)
        )

        # Populate final vector store with optimal parameters
        populate_vector_store.populate_vector_store(
            vectoriser_config=best_configs.dense_vectoriser,
            collection_name=f"{table_name}_collection",
            policy_files=files,
            output_table=f"{table_name}_vectors",
            # drop_existing_table=False,
            job_id=job_id,
        )

        # Clean up intermediate tables after final table is created
        engine = get_engine()
        conn = engine.raw_connection()
        try:
            cur = conn.cursor()
            cur.execute("DROP TABLE IF EXISTS vecs.mlflow_tuning_config_vectors")
            cur.execute("DROP TABLE IF EXISTS vecs.mlflow_tuning_config_collection")
            cur.execute(f"DROP TABLE IF EXISTS vecs.{table_name}_collection")
            conn.commit()
            cur.close()
        finally:
            conn.close()

    return study.best_params, study.best_value


def evaluate_rag_predictions(dfr: pd.DataFrame) -> pd.DataFrame:
    # dfr = eval_dfr[["question_with_options", "ground_truth", "prediction_contexts", "prediction"]]

    assert "question_with_options" in dfr.columns
    assert "ground_truth" in dfr.columns
    assert "prediction_contexts" in dfr.columns
    assert "prediction" in dfr.columns

    # Convert prediction_contexts to list of strings
    assert type(dfr.prediction_contexts.iloc[0]) == str
    dfr.prediction_contexts = dfr.prediction_contexts.apply(json.loads)

    data_samples = {
        "question": dfr.question_with_options.to_list(),
        "answer": dfr.prediction.to_list(),
        "contexts": dfr.prediction_contexts.to_list(),
        "ground_truth": dfr.ground_truth.to_list(),
    }
    dataset = Dataset.from_dict(data_samples)

    result = evaluate(
        dataset,
        metrics=[
            context_precision,
            faithfulness,
            answer_relevancy,
            context_recall,
        ],
    )

    eval_result = result.to_pandas()
    return eval_result


def compute_macro_average(dfr: pd.DataFrame) -> float:
    assert "context_precision" in dfr.columns
    assert "context_recall" in dfr.columns
    assert "answer_relevancy" in dfr.columns
    assert "faithfulness" in dfr.columns

    context_precision_mean = dfr["context_precision"].mean()
    context_recall_mean = dfr["context_recall"].mean()
    answer_relevancy_mean = dfr["answer_relevancy"].mean()
    faithfulness_mean = dfr["faithfulness"].mean()

    macro_average = (
        context_precision_mean
        + context_recall_mean
        + answer_relevancy_mean
        + faithfulness_mean
    ) / 4
    return macro_average
