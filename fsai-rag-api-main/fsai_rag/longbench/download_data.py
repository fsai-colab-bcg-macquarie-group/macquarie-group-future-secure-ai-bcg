import os

import pandas as pd
from datasets import load_dataset

from fsai_rag.utils.txt.remove_special_tokens import remove_special_tokens


def download_if_not_exists(save_to_disk: bool = False) -> pd.DataFrame:
    if not os.path.exists("./data/"):
        os.makedirs("./data/")
        os.makedirs("./data/longbench/")

    if not os.path.exists("./data/longbench/txt"):
        os.makedirs("./data/longbench/txt")

        dataset = load_dataset("THUDM/LongBench-v2", split="train")

        # Convert to pandas dataframe
        dfr = dataset.to_pandas()

        # Remove special tokens
        dfr["context"] = dfr["context"].apply(remove_special_tokens)

        # build context_len
        dfr["context_len"] = dfr["context"].apply(len)

        dfr = dfr[:50]
        # build context_token_count

        # enc = tiktoken.get_encoding("gpt2")
        # dfr['context_token_count'] = dfr['context'].apply(lambda x: len(enc.encode(x, disallowed_special=())))
        # print(dfr['context_token_count'].describe())

        if save_to_disk:
            for i, row in dfr.iterrows():
                with open(f"./data/longbench/txt/context_{i}.txt", "w") as f:
                    f.write(row["context"])

    return None
