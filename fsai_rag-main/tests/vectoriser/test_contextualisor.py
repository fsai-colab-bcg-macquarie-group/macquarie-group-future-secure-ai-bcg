import pytest

from fsai_rag.vectoriser.contextualisor import get_contextual_appendum


class TestContextualisor:
    def test_get_contextual_appendum(self):
        document = (
            "This is a sample document. It contains multiple sentences and paragraphs."
        )
        chunk = "It contains multiple sentences"

        result = get_contextual_appendum(document, chunk)

        assert isinstance(result, str), "The result should be a string"
        assert len(result) > 0, "The result should not be an empty string"
