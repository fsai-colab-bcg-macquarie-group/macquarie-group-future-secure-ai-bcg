from typing import Optional

from llama_index.core.node_parser import SemanticSplitterNodeParser, SentenceSplitter
from llama_index.core.node_parser.interface import NodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.openai.base import OpenAIEmbeddingModelType
from pydantic import BaseModel, Field


class SplitterConfig(BaseModel):
    chunking_strategy: str = Field(..., pattern="^(semantic|fixed)$")
    embed_model: Optional[str] = None
    buffer_size: Optional[int] = None
    breakpoint_percentile_threshold: Optional[int] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.chunking_strategy == "semantic":
            self.buffer_size = self.buffer_size or 1
            self.breakpoint_percentile_threshold = (
                self.breakpoint_percentile_threshold or 95
            )
        elif self.chunking_strategy == "fixed":
            self.chunk_size = self.chunk_size or 1000
            self.chunk_overlap = self.chunk_overlap or 200


def get_splitter(
    chunking_strategy: str = "semantic",
    embed_model: str = "text-embedding-ada-002",
    **kwargs,
) -> NodeParser:
    """
    Create a NodeParser based on the specified chunking strategy and embedding model.

    Parameters:
    - chunking_strategy (str): The strategy to use for chunking the text.
      Options are "semantic" or "fixed". Default is "semantic".
    - embed_model (str): The embedding model to use. Must be a valid member of
      OpenAIEmbeddingModelType. Default is "text-embedding-ada-002".
    - **kwargs: Additional configuration parameters to override default settings.

    Returns:
    - NodeParser: An instance of NodeParser configured with the specified
      chunking strategy and embedding model.

    Raises:
    - AssertionError: If the chunking_strategy is not one of the allowed values
      or if the embed_model is not a valid OpenAIEmbeddingModelType.
    """
    assert chunking_strategy in ["semantic", "fixed"]
    assert (
        embed_model in OpenAIEmbeddingModelType.__members__.values()
    ), f"Invalid embedding model type: {embed_model}"

    # Default configuration
    config = SplitterConfig(
        chunking_strategy=chunking_strategy, embed_model=embed_model, **kwargs
    )

    if chunking_strategy == "semantic":
        splitter = SemanticSplitterNodeParser(
            embed_model=OpenAIEmbedding(model=embed_model),
            buffer_size=config.buffer_size,
            breakpoint_percentile_threshold=config.breakpoint_percentile_threshold,
        )
    else:
        splitter = SentenceSplitter(
            chunk_size=config.chunk_size, chunk_overlap=config.chunk_overlap
        )

    return splitter
