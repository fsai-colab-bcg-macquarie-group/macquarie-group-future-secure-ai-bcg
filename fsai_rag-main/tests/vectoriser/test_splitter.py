import pytest
from llama_index.core import SimpleDirectoryReader
from pydantic_core import ValidationError

from fsai_rag.vectoriser.splitter import SplitterConfig, get_splitter


class TestSplitter:
    def test_get_nodes_from_documents_semantic(self):
        splitter = get_splitter(
            chunking_strategy="semantic", embed_model="text-embedding-ada-002"
        )
        documents = SimpleDirectoryReader(
            input_files=["tests/data/barack_obama.txt"]
        ).load_data()
        nodes = splitter.get_nodes_from_documents(documents)
        assert len(nodes) > 1

    def test_get_nodes_from_documents_fixed_sizes(self):
        config = {"chunk_size": 50, "chunk_overlap": 20}
        splitter = get_splitter(
            chunking_strategy="fixed", embed_model="text-embedding-ada-002", **config
        )
        documents = SimpleDirectoryReader(
            input_files=["tests/data/barack_obama.txt"]
        ).load_data()
        small_nodes = splitter.get_nodes_from_documents(documents)

        config = {"chunk_size": 500, "chunk_overlap": 200}
        splitter = get_splitter(
            chunking_strategy="fixed", embed_model="text-embedding-ada-002", **config
        )
        documents = SimpleDirectoryReader(
            input_files=["tests/data/barack_obama.txt"]
        ).load_data()
        large_nodes = splitter.get_nodes_from_documents(documents)

        assert len(large_nodes) > 1
        assert len(small_nodes) > 1
        assert len(large_nodes) < len(small_nodes)


class TestSplitterConfig:
    def test_get_config(self):
        config = SplitterConfig(
            chunking_strategy="semantic",
            embed_model="text-embedding-ada-002",
            buffer_size=1,
            breakpoint_percentile_threshold=95,
        )
        assert config.chunking_strategy == "semantic"
        assert config.embed_model == "text-embedding-ada-002"
        assert config.buffer_size == 1
        assert config.breakpoint_percentile_threshold == 95

    def test_get_config_fixed(self):
        config = SplitterConfig(
            chunking_strategy="fixed", chunk_size=1000, chunk_overlap=200
        )
        assert config.chunking_strategy == "fixed"
        assert config.chunk_size == 1000
        assert config.chunk_overlap == 200

    def test_get_config_invalid_strategy(self):
        with pytest.raises(ValidationError):
            SplitterConfig(
                chunking_strategy="invalid", embed_model="text-embedding-ada-002"
            )
