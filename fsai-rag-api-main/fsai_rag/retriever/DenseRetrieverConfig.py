from pydantic import BaseModel

from fsai_rag.vectoriser.DenseVectoriserConfig import DenseVectoriserConfig


class DenseRetrieverConfig(BaseModel):
    dense_top_k: int
    dense_vectoriser_config: DenseVectoriserConfig
