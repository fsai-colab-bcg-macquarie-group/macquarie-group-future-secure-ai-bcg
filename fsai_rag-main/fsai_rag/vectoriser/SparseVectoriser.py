import os

from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import NodeParser
from llama_index.core.schema import Document, NodeWithScore
from llama_index.core.storage.docstore import SimpleDocumentStore
from pydantic import BaseModel, ConfigDict

from fsai_rag.retriever.SparseRetrieverConfig import SparseRetrieverConfig
from fsai_rag.vectoriser.contextualisor import get_contextual_appendum
from fsai_rag.vectoriser.SparseVectoriserConfig import (
    SparseVectoriserConfig,
    get_baseline_sparse_vectoriser_config,
)
from fsai_rag.vectoriser.splitter import get_splitter


class SparseVectoriser(BaseModel):
    sparse_vectoriser_config: SparseVectoriserConfig
    documents: list[Document] = []
    splitter: NodeParser | None = None
    nodes: list[NodeWithScore] = []
    docstore: SimpleDocumentStore | None = None
    model_config = ConfigDict(arbitrary_types_allowed=True)

    def __init__(self, file_paths: list[str], **data):
        super().__init__(**data)
        assert file_paths, "file_paths list cannot be empty"
        assert all(os.path.exists(f) for f in file_paths), "All files must exist"

        self.documents = SimpleDirectoryReader(input_files=file_paths).load_data()
        self.splitter = get_splitter(
            chunking_strategy=self.sparse_vectoriser_config.splitter_config.chunking_strategy,
            chunk_size=self.sparse_vectoriser_config.splitter_config.chunk_size,
            chunk_overlap=self.sparse_vectoriser_config.splitter_config.chunk_overlap,
        )

        # Get base nodes
        self.nodes = self.splitter.get_nodes_from_documents(
            self.documents, show_progress=True
        )

        # Add context if configured
        if self.sparse_vectoriser_config.contextualisor_config.contextualise_src_chunk:
            for node in self.nodes:
                file_path = node.source_node.metadata["file_path"]
                with open(file_path, "r") as f:
                    full_doc = f.read()

                contextual_appendum = get_contextual_appendum(
                    document=full_doc, chunk=node.text
                )
                node.text = (
                    "<contextual_appendum>\n"
                    + contextual_appendum
                    + "\n</contextual_appendum>\n"
                    + node.text
                )

        # Store nodes in docstore
        self.docstore = SimpleDocumentStore()
        self.docstore.add_documents(self.nodes)


if __name__ == "__main__":
    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()

    # params
    sparse_vectoriser_config.splitter_config.chunk_size = 1000
    sparse_vectoriser_config.splitter_config.chunk_overlap = 100

    test_files = ["./tests/data/barack_obama.txt"]
    sparse_vectoriser = SparseVectoriser(
        file_paths=test_files,
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    # Output prints
    print(f"Number of chunks created: {len(sparse_vectoriser.nodes)}")
    print(
        f"Average chunk size: {sum(len(n.text) for n in sparse_vectoriser.nodes) / len(sparse_vectoriser.nodes)}"
    )

    # Print first chunk to see content
    print(f"\nFirst chunk:\n{sparse_vectoriser.nodes[0].text[:200]}...")
