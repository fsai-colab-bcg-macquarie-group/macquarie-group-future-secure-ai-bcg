from llama_index.core import SimpleDirectoryReader, VectorStoreIndex

from fsai_rag.vectoriser.embedder import (
    EmbedderConfig,
    EmbedderType,
    OAIEmbeddingType,
    get_embed_model,
)


class TestEmbedder:
    def test_embedder_with_ada_model(self):
        embedder_config = EmbedderConfig(
            embed_type=EmbedderType.OPENAI,
            embed_model=OAIEmbeddingType.TEXT_EMBED_ADA_002,
        )
        embed_model = get_embed_model(embedder_config)

        documents = SimpleDirectoryReader(
            input_files=["tests/data/barack_obama.txt"]
        ).load_data()
        index = VectorStoreIndex.from_documents(documents, embed_model=embed_model)
        index_dict = index.vector_store.dict()
        assert len(list(index_dict["data"]["embedding_dict"].values())[0]) == 1536

    def test_embedder_with_large_model(self):
        embedder_config = EmbedderConfig(
            embed_type=EmbedderType.OPENAI,
            embed_model=OAIEmbeddingType.TEXT_EMBED_3_LARGE,
        )
        embed_model = get_embed_model(embedder_config)
        documents = SimpleDirectoryReader(
            input_files=["tests/data/barack_obama.txt"]
        ).load_data()
        index = VectorStoreIndex.from_documents(documents, embed_model=embed_model)
        index_dict = index.vector_store.dict()
        assert len(list(index_dict["data"]["embedding_dict"].values())[0]) == 3072
