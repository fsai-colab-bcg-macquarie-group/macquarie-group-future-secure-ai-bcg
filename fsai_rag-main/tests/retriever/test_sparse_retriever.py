import pytest
from llama_index.core.schema import NodeWithScore

from fsai_rag.retriever.SparseRetriever import SparseRetriever, SparseRetrieverConfig
from fsai_rag.vectoriser.SparseVectoriser import SparseVectoriser
from fsai_rag.vectoriser.SparseVectoriserConfig import (
    get_baseline_sparse_vectoriser_config,
)


@pytest.fixture
def sparse_retriever():
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()
    sparse_retriever_config = SparseRetrieverConfig(
        sparse_top_k=1,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    sparse_vectoriser = SparseVectoriser(
        file_paths=["./tests/data/barack_obama.txt"],  # Only change is here
        sparse_vectoriser_config=sparse_vectoriser_config,
    )
    return SparseRetriever(
        sparse_retriever_config=sparse_retriever_config,
        sparse_vectoriser=sparse_vectoriser,
    )


def test_sparse_retriever_retrieve(sparse_retriever):
    query = "What is the birthday of Barrack Obama?"
    retrieved_nodes = sparse_retriever.retriever.retrieve(query)
    assert len(retrieved_nodes) > 0
    assert isinstance(retrieved_nodes[0], NodeWithScore)
