from pydantic import BaseModel

from fsai_rag.vectoriser.SparseVectoriserConfig import SparseVectoriserConfig


class SparseRetrieverConfig(BaseModel):
    sparse_top_k: int
    sparse_vectoriser_config: SparseVectoriserConfig  # nesting SparseVectoriserConfig in SparseRetrieverConfig will be helpful for retrieval
