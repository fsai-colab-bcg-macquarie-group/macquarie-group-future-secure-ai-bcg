from llama_index.embeddings.openai import OpenAIEmbedding
from pydantic import BaseModel


class EmbedderConfig(BaseModel):
    embed_model: str

    def __init__(self, **data):
        super().__init__(**data)
        assert self.embed_model == "BM25", "embed_model must be 'BM25'"


class SplitterConfig(BaseModel):
    chunking_strategy: str
    embed_model: str | None
    chunk_size: int
    chunk_overlap: int

    def __init__(self, **data):
        super().__init__(**data)
        if self.chunking_strategy == "fixed":
            assert (
                self.embed_model is None
            ), "embed_model must be None for fixed chunking strategy"


class ContextualisorConfig(BaseModel):
    contextualise_src_chunk: bool


class SparseVectoriserConfig(BaseModel):
    embedder_config: EmbedderConfig
    splitter_config: SplitterConfig
    contextualisor_config: ContextualisorConfig


def get_baseline_sparse_vectoriser_config() -> SparseVectoriserConfig:

    embedder_config = EmbedderConfig(embed_model="BM25")

    splitter_config = SplitterConfig(
        chunking_strategy="fixed",
        embed_model=None,
        chunk_size=8000,
        chunk_overlap=1000,
    )

    contextualisor_config = ContextualisorConfig(contextualise_src_chunk=False)

    baseline_vectoriser_config = SparseVectoriserConfig(
        splitter_config=splitter_config,
        embedder_config=embedder_config,
        contextualisor_config=contextualisor_config,
        collection_name="test_bm25",
    )

    return baseline_vectoriser_config
