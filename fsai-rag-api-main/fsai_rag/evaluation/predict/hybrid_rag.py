import inspect
import json
import os

import pandas as pd
from llama_index.core import VectorStoreIndex
from llama_index.core.schema import NodeWithScore, QueryBundle
from llama_index.vector_stores.supabase import SupabaseVectorStore
from tqdm import tqdm

from fsai_rag.retriever.DenseRetrieverConfig import DenseRetrieverConfig
from fsai_rag.retriever.SparseRetriever import SparseRetriever
from fsai_rag.retriever.SparseRetrieverConfig import SparseRetrieverConfig
from fsai_rag.utils.sql_connection import get_connection_string
from fsai_rag.vectoriser.SparseVectoriser import SparseVectoriser


def create_question_with_options(dfr: pd.DataFrame) -> pd.DataFrame:
    # Keep exactly the same as vanilla_rag
    assert "question" in dfr.columns
    assert "options" in dfr.columns

    dfr["question_with_options"] = dfr["question"]
    for idx in range(len(dfr)):
        options = dfr.at[idx, "options"]
        if isinstance(options, str):
            if len(options) > 0:
                dfr.at[idx, "question_with_options"] = (
                    dfr.at[idx, "question"] + "\n\nOptions:\n" + dfr.at[idx, "options"]
                )
    return dfr


def predict(
    dfr: pd.DataFrame,
    collection_name: str,
    file_paths: list[str] | None = None,
    use_sparse: bool = False,
    dense_retriever_config: DenseRetrieverConfig | None = None,
    sparse_retriever_config: SparseRetrieverConfig | None = None,
) -> pd.DataFrame:
    """
    Used to run Retrieval Augmented Generation (RAG) with optional sparse vectors.

     Args:
        dfr: Input dataframe with questions
        collection_name: Name of the collection to query from
        file_paths: List of file paths for sparse vectorisation
        use_sparse: Whether to use sparse retrieval
        dense_retriever_config: Config for dense retrieval (top_k, etc)
        sparse_retriever_config: Config for sparse retrieval (includes vectoriser config)

    Two key columns are required in the input dataframe:
    - question_with_options: str representing the question to be answered

    Two key columns are produced:
    - prediction_contexts: str representing a JSON array of strings representing the contexts used for retrieval
    - prediction: str representing the predicted answer to the question
    """
    # Assert that the input dataframe has the required columns
    assert "question_with_options" in dfr.columns

    # Validate sparse params if sparse is enabled
    if use_sparse:
        if not isinstance(file_paths, list) or not file_paths:
            raise ValueError("file_paths must be a non-empty list when use_sparse=True")
        if not all(os.path.exists(f) for f in file_paths):
            raise FileNotFoundError("One or more files in file_paths not found")

    # Use LlamaIndex to run Dense Retrieval portion of RAG
    vector_store = SupabaseVectorStore(
        postgres_connection_string=get_connection_string(),
        collection_name=collection_name,
    )
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

    # Optional sparse setup
    sparse_retriever = None
    if use_sparse and file_paths and sparse_retriever_config:
        sparse_vectorizer = SparseVectoriser(
            file_paths=file_paths,
            sparse_vectoriser_config=sparse_retriever_config.sparse_vectoriser_config,
        )
        sparse_retriever = SparseRetriever(
            sparse_retriever_config=sparse_retriever_config,
            sparse_vectoriser=sparse_vectorizer,
        )

    for idx in tqdm(
        range(len(dfr)), desc=inspect.currentframe().f_code.co_name  # type:ignore
    ):
        question_str = dfr.iloc[idx]["question_with_options"]
        qn = QueryBundle(query_str=question_str)

        # Dense retrieval from vector DB
        query_engine = index.as_query_engine(
            similarity_top_k=(
                dense_retriever_config.dense_top_k if dense_retriever_config else None
            )
        )
        query_engine_response = query_engine.query(qn)
        dense_contexts = [node.node.text for node in query_engine_response.source_nodes]

        # Sparse retrieval using pre-processed documents and BM25
        sparse_contexts = []
        if use_sparse and sparse_retriever and sparse_retriever.retriever:
            sparse_nodes = sparse_retriever.retriever.retrieve(
                qn
            )  # Only pass the query
            sparse_contexts = [node.node.text for node in sparse_nodes]
        # Combine contexts in text space
        prediction_contexts = dense_contexts + sparse_contexts
        prediction = query_engine_response.response

        dfr.at[idx, "prediction_contexts"] = json.dumps(prediction_contexts)
        dfr.at[idx, "prediction"] = prediction
    return dfr
