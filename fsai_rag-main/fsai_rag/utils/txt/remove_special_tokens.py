import tiktoken


def remove_special_tokens(text: str) -> str:
    """
    Remove special tokens from a text string.
    """
    enc = tiktoken.get_encoding("cl100k_base")
    try:
        enc.encode(text)
    except ValueError:
        print(f"Special tokens found in text")
        special_tokens = enc.special_tokens_set
        for token in special_tokens:
            text = text.replace(token, "")
    return text
