import pytest

from use_case_specific.SLR.B4SI.B4SI_LlamaIndexDocument import B4SI_LlamaIndexDocument


def test_b4si_llama_index_document_initialization():
    text = "Sample text for testing"
    metadata = {
        "chunk_id": "12345",
        "qa_bank": "policy content",
        "msg_id": None,
        "qna_id": None,
    }
    excluded_embed_metadata_keys = ["chunk_id", "qa_bank", "msg_id", "qna_id"]

    document = B4SI_LlamaIndexDocument(
        text=text,
        metadata=metadata,
        excluded_embed_metadata_keys=excluded_embed_metadata_keys,
    )

    assert document.text == text
    assert document.metadata == metadata
    assert document.excluded_embed_metadata_keys == excluded_embed_metadata_keys


def test_b4si_llama_index_document_accepted_metadata_keys():
    assert "chunk_id" in B4SI_LlamaIndexDocument.ACCEPTED_METADATA_KEYS
    assert "qa_bank" in B4SI_LlamaIndexDocument.ACCEPTED_METADATA_KEYS


def test_b4si_llama_index_document_invalid_metadata_key():
    text = "Sample text for testing"
    metadata = {"invalid_key": "value"}
    excluded_embed_metadata_keys = ["invalid_key"]

    with pytest.raises(AssertionError):
        B4SI_LlamaIndexDocument(
            text=text,
            metadata=metadata,
            excluded_embed_metadata_keys=excluded_embed_metadata_keys,
        )
