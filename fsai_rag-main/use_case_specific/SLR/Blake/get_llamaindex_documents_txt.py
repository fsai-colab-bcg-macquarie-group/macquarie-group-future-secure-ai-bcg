import glob
import inspect
import os
import uuid
from collections import defaultdict
from typing import Dict

import pandas as pd
import tiktoken
from tqdm import tqdm

from fsai_rag.vectoriser.contextualisor import get_contextual_appendum
from fsai_rag.vectoriser.DenseVectoriserConfig import ContextualisorConfig
from fsai_rag.vectoriser.splitter import SplitterConfig
from use_case_specific.SLR.B4SI.B4SI_LlamaIndexDocument import B4SI_LlamaIndexDocument
from use_case_specific.SLR.Blake.Blake_LlamaIndexDocument import (
    Blake_LlamaIndexDocument,
)


def get_char_len_dfr(txt_files: list[str]) -> pd.DataFrame:
    # assert os.path.exists(txt_policy_dir) Expect list of txt file paths
    # txt_files = glob.glob("data/blake/all cvs/**/*.txt", recursive=True)

    # Initiate DFR
    dfr = pd.DataFrame(txt_files, columns=["txt_paths"])
    dfr["pre_split_id"] = dfr["txt_paths"]
    dfr["char_len"] = 0
    dfr["token_count"] = 0

    # dfr = dfr.iloc[0:2]

    # Initialize tiktoken encoding
    encoding = tiktoken.get_encoding("cl100k_base")

    # Populate char_len and token_count
    for idx in range(len(dfr)):
        txt_path = dfr["txt_paths"].iloc[idx]

        with open(txt_path, "r", encoding="utf-8") as file:
            policy_str = file.read()

        dfr["char_len"].at[idx] = len(policy_str)
        dfr["token_count"].at[idx] = len(encoding.encode(policy_str))

    return dfr


def get_llamaindex_documents(
    txt_files: list[str],
) -> list[Blake_LlamaIndexDocument]:
    assert txt_files, "No files provided"

    # txt_files = txt_files[0:50]

    # Check if all provided file paths exist
    for file_path in txt_files:
        assert os.path.exists(file_path), f"File not found: {file_path}"

    # chunks = chunks.iloc[0:2]
    char_len_dfr = get_char_len_dfr(txt_files=txt_files)
    char_len_dfr = char_len_dfr[char_len_dfr["token_count"] < 8000]

    # Initialize variables before the chunks for loop
    char_len_dfr["resume_id"] = [str(uuid.uuid4()) for _ in range(len(char_len_dfr))]
    char_len_dfr["resume_filename"] = char_len_dfr["txt_paths"].apply(os.path.basename)

    # chunks = chunks.iloc[0:2]
    idx = 0
    documents = []

    for idx in tqdm(
        range(len(char_len_dfr)),
        desc=inspect.currentframe().f_code.co_name,  # type:ignore
    ):  # type:ignore
        row = char_len_dfr.iloc[idx]

        with open(row["txt_paths"], "r", encoding="utf-8") as file:
            resume_content = file.read()

        metadata = {
            "resume_id": row["resume_id"],
            "resume_filename": row["resume_filename"],
        }
        # Create and append a Document object for the question
        documents.append(
            Blake_LlamaIndexDocument(
                text=resume_content,
                metadata=metadata,
                excluded_embed_metadata_keys=["resume_id", "resume_filename"],
            )
        )

    assert len(documents) == char_len_dfr.shape[0]

    return documents


if __name__ == "__main__":

    # Search for all files in the specified directory recursively
    all_files = glob.glob("data/blake/all cvs/**/*", recursive=True)
    txt_files = [file for file in all_files if os.path.splitext(file)[1] == ".txt"]

    # Count files by their extensions
    file_count_by_type: Dict[str, int] = defaultdict(int)
    for file in all_files:
        if os.path.isfile(file):
            ext = os.path.splitext(file)[1]
            file_count_by_type[ext] += 1

    # Print the count of files by type
    for ext, count in file_count_by_type.items():
        print(f"{ext}: {count}")

    dfr = get_char_len_dfr(txt_files=txt_files)
    print(dfr)

    # Filter for token_count < 8000
    dfr = dfr[dfr["token_count"] < 8000]
    print(dfr)

    docs = get_llamaindex_documents(txt_files=dfr["txt_paths"].tolist())
