from fsai_rag.vectoriser.LlamaIndexDocument import LlamaIndexDocument


# Example subclass for a specific use case
class B4SI_LlamaIndexDocument(LlamaIndexDocument):
    ACCEPTED_METADATA_KEYS = ["msg_id", "chunk_id", "qna_id", "qa_bank"]
