import pytest

from fsai_rag.vectoriser.SparseVectoriser import SparseVectoriser
from fsai_rag.vectoriser.SparseVectoriserConfig import (
    get_baseline_sparse_vectoriser_config,
)


def test_sparse_vectoriser_initialization():
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()
    file_paths = ["./tests/data/barack_obama.txt"]

    sparse_vectoriser = SparseVectoriser(
        file_paths=file_paths,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    assert sparse_vectoriser.documents is not None
    assert sparse_vectoriser.splitter is not None
    assert sparse_vectoriser.nodes is not None
    assert sparse_vectoriser.docstore is not None


def test_sparse_vectoriser_documents_loading():
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()
    file_paths = ["./tests/data/barack_obama.txt"]

    sparse_vectoriser = SparseVectoriser(
        file_paths=file_paths,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    assert len(sparse_vectoriser.documents) > 0


def test_sparse_vectoriser_nodes_generation():
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()
    file_paths = ["./tests/data/barack_obama.txt"]

    sparse_vectoriser = SparseVectoriser(
        file_paths=file_paths,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    assert len(sparse_vectoriser.nodes) > 0


def test_sparse_vectoriser_docstore_population():
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()
    file_paths = ["./tests/data/barack_obama.txt"]

    sparse_vectoriser = SparseVectoriser(
        file_paths=file_paths,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    assert len(sparse_vectoriser.docstore.get_all_document_hashes()) > 0
