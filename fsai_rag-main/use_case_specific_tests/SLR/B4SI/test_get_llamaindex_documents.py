import pytest

from fsai_rag.vectoriser.DenseVectoriserConfig import ContextualisorConfig
from fsai_rag.vectoriser.splitter import SplitterConfig
from use_case_specific.SLR.B4SI.get_llamaindex_documents_txt import (
    get_llamaindex_documents,
)


@pytest.fixture
def setup_test_environment(tmp_path):
    # Create a temporary directory and files for testing
    test_dir = tmp_path / "test_txt_files"
    test_dir.mkdir()

    # Create sample text files
    file1 = test_dir / "test1.txt"
    file1.write_text("This is a sample document for testing. " * 100)

    file2 = test_dir / "test2.txt"
    file2.write_text("Another sample document for testing purposes. " * 100)

    return [str(file1), str(file2)]


def test_get_llamaindex_documents(setup_test_environment):
    txt_policy_files = setup_test_environment
    splitter_config = SplitterConfig(
        chunking_strategy="fixed", chunk_size=200, chunk_overlap=50
    )
    contextualisor_config = ContextualisorConfig(contextualise_src_chunk=False)

    documents = get_llamaindex_documents(
        txt_files=txt_policy_files,
        splitter_config=splitter_config,
        contextualisor_config=contextualisor_config,
        qa_bank="policy content",
    )

    # Check if the number of documents is as expected
    assert len(documents) > 0

    # Check if the documents have the expected structure
    for document in documents:
        assert hasattr(document, "text")
        assert hasattr(document, "metadata")
        assert "chunk_id" in document.metadata
        assert "qa_bank" in document.metadata


def test_get_llamaindex_documents_invalid_files():
    txt_policy_files = ["invalid/file/path1.txt", "invalid/file/path2.txt"]
    splitter_config = SplitterConfig(
        chunking_strategy="fixed", chunk_size=200, chunk_overlap=50
    )
    contextualisor_config = ContextualisorConfig(contextualise_src_chunk=False)

    with pytest.raises(AssertionError):
        get_llamaindex_documents(
            txt_files=txt_policy_files,
            splitter_config=splitter_config,
            contextualisor_config=contextualisor_config,
            qa_bank="policy content",
        )


def test_get_llamaindex_documents_empty_list():
    txt_policy_files = []
    splitter_config = SplitterConfig(
        chunking_strategy="fixed", chunk_size=200, chunk_overlap=50
    )
    contextualisor_config = ContextualisorConfig(contextualise_src_chunk=False)

    with pytest.raises(AssertionError):
        get_llamaindex_documents(
            txt_files=txt_policy_files,
            splitter_config=splitter_config,
            contextualisor_config=contextualisor_config,
            qa_bank="policy content",
        )
