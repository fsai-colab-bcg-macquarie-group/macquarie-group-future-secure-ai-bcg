import Stemmer
from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.core.schema import NodeWithScore
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.vector_stores.supabase import SupabaseVectorStore
from pydantic import BaseModel, ConfigDict

from fsai_rag.retriever.SparseRetrieverConfig import SparseRetrieverConfig
from fsai_rag.utils.sql_connection import get_connection_string
from fsai_rag.vectoriser.SparseVectoriser import SparseVectoriser
from fsai_rag.vectoriser.SparseVectoriserConfig import (
    SparseVectoriserConfig,
    get_baseline_sparse_vectoriser_config,
)


class SparseRetriever(BaseModel):
    sparse_retriever_config: SparseRetrieverConfig | None = None
    sparse_vectoriser: SparseVectoriser | None = None
    retriever: BM25Retriever | None = None

    model_config = ConfigDict(arbitrary_types_allowed=True)

    def __init__(
        self,
        sparse_retriever_config: SparseRetrieverConfig,
        sparse_vectoriser: SparseVectoriser,
        **data
    ):
        super().__init__(**data)
        self.sparse_retriever_config = sparse_retriever_config
        self.sparse_vectoriser = sparse_vectoriser

        # Use nodes directly instead of from docstore
        self.retriever = BM25Retriever(
            nodes=self.sparse_vectoriser.nodes,
            similarity_top_k=self.sparse_retriever_config.sparse_top_k,
            stemmer=Stemmer.Stemmer("english"),
            language="english",
        )


if __name__ == "__main__":
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()

    # Set chunk size
    sparse_vectoriser_config.splitter_config.chunk_size = 1000
    sparse_vectoriser_config.splitter_config.chunk_overlap = 100

    sparse_retriever_config = SparseRetrieverConfig(
        sparse_top_k=5,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    test_files = ["./tests/data/barack_obama.txt"]
    sparse_vectoriser = SparseVectoriser(
        file_paths=test_files,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    sparse_retriever = SparseRetriever(
        sparse_retriever_config=sparse_retriever_config,
        sparse_vectoriser=sparse_vectoriser,
    )
    assert sparse_retriever.retriever is not None
    print(
        sparse_retriever.retriever.retrieve("What is the birthday of Barrack Obama?")[
            0
        ].text
    )
