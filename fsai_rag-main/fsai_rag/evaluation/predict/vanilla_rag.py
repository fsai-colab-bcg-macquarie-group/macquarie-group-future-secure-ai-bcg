import inspect
import json

import pandas as pd
from llama_index.core import VectorStoreIndex
from llama_index.core.schema import NodeWithScore, QueryBundle
from llama_index.vector_stores.supabase import SupabaseVectorStore
from tqdm import tqdm

from fsai_rag.utils.sql_connection import get_connection_string


def create_question_with_options(dfr: pd.DataFrame) -> pd.DataFrame:
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


def predict(dfr: pd.DataFrame, collection_name: str) -> pd.DataFrame:
    """
    Used to run Retrieval Augmented Generation (RAG).

    Args:
        dfr: Input dataframe with questions
        collection_name: Name of the collection to query from

    Two key columns are required in the input dataframe:
    - question_with_options: str representing the question to be answered

    Two key columns are produced:
    - prediction_contexts: str representing a JSON array of strings representing the contexts used for retrieval
    - prediction: str representing the predicted answer to the question
    """

    # dfr = test_dfr

    # Assert that the input dataframe has the required columns
    assert "question_with_options" in dfr.columns

    # Use LlamaIndex to run Retrieval portion of RAG
    vector_store = SupabaseVectorStore(
        postgres_connection_string=get_connection_string(),
        collection_name=collection_name,
    )

    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    idx = 0
    for idx in tqdm(
        range(len(dfr)), desc=inspect.currentframe().f_code.co_name  # type:ignore
    ):
        question_str = dfr.iloc[idx]["question_with_options"]

        qn = QueryBundle(query_str=question_str)

        query_engine = index.as_query_engine()
        query_engine_response = query_engine.query(qn)

        type(query_engine_response.source_nodes)
        type(query_engine_response.source_nodes[0])
        source_nodes: list[NodeWithScore] = query_engine_response.source_nodes
        prediction_contexts: list[str] = [node.node.text for node in source_nodes]

        prediction = query_engine_response.response

        dfr.at[idx, "prediction_contexts"] = json.dumps(prediction_contexts)
        dfr.at[idx, "prediction"] = prediction

    return dfr
