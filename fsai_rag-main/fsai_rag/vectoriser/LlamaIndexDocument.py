from typing import ClassVar, Optional

from llama_index.core import Document


class LlamaIndexDocument(Document):
    ACCEPTED_METADATA_KEYS: ClassVar[list] = []

    def __init__(
        self,
        text: str,
        metadata: dict,
        excluded_embed_metadata_keys: Optional[list[str]] = None,
    ):
        # Use the class-level ACCEPTED_METADATA_KEYS
        accepted_keys = set(self.ACCEPTED_METADATA_KEYS)

        # Calculate the difference between the provided keys and the accepted keys
        provided_keys = set(metadata.keys())
        missing_keys = accepted_keys - provided_keys
        extra_keys = provided_keys - accepted_keys

        # Assert that the metadata keys set is exactly the same as accepted_keys
        assert (
            provided_keys == accepted_keys
        ), f"Metadata keys mismatch. Missing keys: {missing_keys}, Extra keys: {extra_keys}"

        # Call the superclass initializer with the parameters
        if excluded_embed_metadata_keys:
            super().__init__(
                text=text,
                metadata=metadata,
                excluded_embed_metadata_keys=excluded_embed_metadata_keys,
            )
        else:
            super().__init__(text=text, metadata=metadata)
