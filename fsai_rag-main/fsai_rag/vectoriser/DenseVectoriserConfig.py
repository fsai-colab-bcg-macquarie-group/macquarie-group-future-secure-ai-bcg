from typing import Optional

from llama_index.embeddings.openai import OpenAIEmbedding
from pydantic import BaseModel


class EmbedderConfig(BaseModel):
    embed_model: str
    llama_index_embed_model: Optional[OpenAIEmbedding] = None


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


class DenseVectoriserConfig(BaseModel):
    embedder_config: EmbedderConfig
    splitter_config: SplitterConfig
    contextualisor_config: ContextualisorConfig


def get_baseline_dense_vectoriser_config() -> DenseVectoriserConfig:

    embedder_config = EmbedderConfig(embed_model="text-embedding-ada-002")
    embedder_config.llama_index_embed_model = OpenAIEmbedding(
        model=embedder_config.embed_model
    )

    splitter_config = SplitterConfig(
        chunking_strategy="fixed",
        embed_model=None,
        chunk_size=10000,
        chunk_overlap=1000,
    )

    contextualisor_config = ContextualisorConfig(contextualise_src_chunk=False)

    baseline_vectoriser_config = DenseVectoriserConfig(
        splitter_config=splitter_config,
        embedder_config=embedder_config,
        contextualisor_config=contextualisor_config,
    )

    return baseline_vectoriser_config
