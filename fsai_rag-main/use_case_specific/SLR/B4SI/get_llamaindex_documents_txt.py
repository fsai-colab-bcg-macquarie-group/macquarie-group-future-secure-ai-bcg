import glob
import inspect
import os
import uuid

import pandas as pd
from tqdm import tqdm

from fsai_rag.vectoriser.contextualisor import get_contextual_appendum
from fsai_rag.vectoriser.DenseVectoriserConfig import ContextualisorConfig
from fsai_rag.vectoriser.splitter import SplitterConfig
from use_case_specific.SLR.B4SI.B4SI_LlamaIndexDocument import B4SI_LlamaIndexDocument


def get_char_len_dfr(txt_files: list[str]) -> pd.DataFrame:
    # assert os.path.exists(txt_policy_dir) Expect list of txt file paths
    # txt_files = glob.glob(os.path.join(txt_policy_dir, "*.txt"))

    # Initiate DFR
    dfr = pd.DataFrame(txt_files, columns=["txt_paths"])
    dfr["pre_split_id"] = dfr["txt_paths"]
    dfr["char_len"] = 0

    # dfr = dfr.iloc[0:2]

    # Populate char_len
    for idx in range(len(dfr)):
        txt_path = dfr["txt_paths"].iloc[idx]

        with open(txt_path, "r", encoding="utf-8") as file:
            policy_str = file.read()

        dfr["char_len"].at[idx] = len(policy_str)

    return dfr


def chunk_dfr(
    char_len_dfr: pd.DataFrame, splitter_config: SplitterConfig, qa_bank: str
) -> pd.DataFrame:
    # splitter_config = SplitterConfig(chunking_strategy="fixed", chunk_size=2000, chunk_overlap=500)
    # txt_policy_dir = os.path.join("data/b4si/docx/TXT")
    assert (
        splitter_config.chunking_strategy == "fixed"
    ), "Only `fixed` chunking strategy is supported"

    assert "char_len" in char_len_dfr.columns

    # splitter_config = SplitterConfig(chunking_strategy="fixed", chunk_size=2000, chunk_overlap=500)
    # txt_policy_dir = os.path.join("data/b4si/docx/TXT")
    # contextualisor_config = {"contextualise_src_chunk": True}
    # Initiate parameters
    chunk_size = splitter_config.chunk_size
    chunk_overlap = splitter_config.chunk_overlap

    # Compute the chunks starting and ending indexes
    chunks = pd.DataFrame()
    idx = 0
    for idx in range(len(char_len_dfr)):
        source_row = char_len_dfr.iloc[idx]
        start_index = 0
        end_index = chunk_size
        document_length = int(source_row["char_len"])

        assert isinstance(start_index, int)
        assert isinstance(end_index, int)
        assert isinstance(document_length, int)
        assert isinstance(chunk_size, int)
        assert isinstance(chunk_overlap, int)

        while start_index < document_length:
            # If the end index is beyond the document length, adjust it to the document's end
            if end_index > document_length:
                end_index = document_length

            # Append the current chunk to the result list
            target_row = {
                "pre_split_id": source_row["pre_split_id"],
                "char_len": source_row["char_len"],
                "start_index": start_index,
                "end_index": end_index,
            }

            # Append the current chunk as a new row in the chunks DataFrame
            chunks = pd.concat([chunks, pd.DataFrame([target_row])], ignore_index=True)

            # If we've reached the end of the document, break out of the loop
            if end_index == document_length:
                break

            # Update start and end indices for the next chunk
            # Ensuring overlap by subtracting overlap_size_characters from the end_index
            start_index = int(end_index - chunk_overlap)
            end_index = int(start_index + chunk_size)

    # Initiatlize metadata
    chunks["chunk_id"] = chunks.apply(lambda _: uuid.uuid4(), axis=1).astype(str)
    chunks["qa_bank"] = qa_bank

    return chunks


def get_llamaindex_documents(
    txt_files: list[str],
    splitter_config: SplitterConfig,
    contextualisor_config: ContextualisorConfig,
    qa_bank: str,
) -> list[B4SI_LlamaIndexDocument]:
    assert txt_files, "No files provided"

    # Check if all provided file paths exist
    for file_path in txt_files:
        assert os.path.exists(file_path), f"File not found: {file_path}"

    # chunks = chunks.iloc[0:2]
    char_len_dfr = get_char_len_dfr(txt_files=txt_files)
    chunks = chunk_dfr(
        char_len_dfr=char_len_dfr, splitter_config=splitter_config, qa_bank=qa_bank
    )

    # Initialize variables before the chunks for loop
    prev_txt_path = ""
    documents = []
    metadata_keys = list(chunks.columns)

    # chunks = chunks.iloc[0:2]

    for idx in tqdm(
        range(len(chunks)), desc=inspect.currentframe().f_code.co_name  # type:ignore
    ):  # type:ignore
        chunk_row = chunks.iloc[idx]

        if chunk_row["pre_split_id"] != prev_txt_path:
            # It is a new file, read it.
            with open(chunk_row["pre_split_id"], "r", encoding="utf-8") as file:
                policy_str = file.read()
            # Now that it is read, update this variable
            prev_txt_path = chunk_row["pre_split_id"]

        assert len(policy_str) > 0

        policy_chunk = policy_str[chunk_row["start_index"] : chunk_row["end_index"]]
        policy_chunk = "<chunk> \n" + policy_chunk + "\n </chunk> \n"

        # Commented out formatting because Highlighter can never use Policy Content
        # policy_chunk_formatted = mdr.get_excel_formatted_response(question=policy_chunk)
        # policy_chunk_formatted = policy_chunk_formatted.get('text')

        metadata = {
            "chunk_id": chunk_row["chunk_id"],
            "qa_bank": chunk_row["qa_bank"],
            "msg_id": None,
            "qna_id": None,
        }

        if contextualisor_config.contextualise_src_chunk:
            contextual_appendum = get_contextual_appendum(
                document=policy_str, chunk=policy_chunk
            )
            policy_chunk = (
                "<contextual_appendum> \n"
                + contextual_appendum
                + "\n </contextual_appendum> \n"
                + policy_chunk
            )

        # Create and append a Document object for the question
        documents.append(
            B4SI_LlamaIndexDocument(
                text=policy_chunk,
                metadata=metadata,
                excluded_embed_metadata_keys=metadata_keys,
            )
        )

    assert len(documents) == chunks.shape[0]

    return documents
