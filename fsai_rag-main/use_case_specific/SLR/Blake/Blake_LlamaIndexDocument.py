from fsai_rag.vectoriser.LlamaIndexDocument import LlamaIndexDocument


# Example subclass for a specific use case
class Blake_LlamaIndexDocument(LlamaIndexDocument):
    ACCEPTED_METADATA_KEYS = ["resume_id", "resume_filename", "resume_fullpath"]
