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
from fsai_rag.evaluation.tune.tune_vector_store import (
    TrialParams,
    VectoriserConfigs,
    objective,
    suggest_trial_vectoriser_config,
    tune_knowledge_base,
)
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


def export_question_dataset(
    vectoriser_config: DenseVectoriserConfig, policy_files: list[str]
):
    dfr = tune_vector_store.get_question_dataset(vectoriser_config, policy_files)

    engine = get_engine()
    dfr.to_sql("b4si_ragas_testset", engine, if_exists="replace", index=False)


if __name__ == "__main__":
    POLICY_FILES = glob(os.path.join("data", "b4si", "docx", "TXT", "*.txt"))
    POLICY_FILES = POLICY_FILES[:2]

    tune_knowledge_base(
        files=POLICY_FILES,
        table_name="mlflow_final_config",
        job_id="job_id_test",
        ragas_testset_tbl_name="b4si_ragas_testset",
        n_trials=2,
    )
