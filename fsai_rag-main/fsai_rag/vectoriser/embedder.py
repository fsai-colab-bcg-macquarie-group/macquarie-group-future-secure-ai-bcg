from enum import Enum

from llama_index.core.node_parser.interface import NodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.openai.base import OpenAIEmbeddingModelType


class EmbedderType(str, Enum):
    OPENAI = "OPENAI"
    BM25 = "BM25"


class OAIEmbeddingType(str, Enum):
    TEXT_EMBED_ADA_002 = "text-embedding-ada-002"
    TEXT_EMBED_3_LARGE = "text-embedding-3-large"
    TEXT_EMBED_3_SMALL = "text-embedding-3-small"


class EmbedderConfig:
    def __init__(self, embed_type: EmbedderType, embed_model: OAIEmbeddingType | None):
        self.embed_type = embed_type
        self.embed_model = embed_model


def get_embed_model(embedder_config: EmbedderConfig) -> OpenAIEmbedding:
    if embedder_config.embed_type == EmbedderType.OPENAI:
        return OpenAIEmbedding(model=embedder_config.embed_model)
