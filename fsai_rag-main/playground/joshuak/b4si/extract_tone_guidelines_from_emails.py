import inspect
import os
import uuid
from concurrent.futures import ProcessPoolExecutor

import extract_msg
import pandas as pd
from openai import OpenAI
from tqdm import tqdm

from fsai_rag.utils.sql_connection import get_engine


def process_msg_file(file_path: str) -> dict:
    # file_path=r"data/b4si/msg/For Astra - B4SI Catch-Up_volunteering targets.msg"
    msg = extract_msg.Message(file_path)
    msg_dict = {
        "body": msg.body,
        "htmlBody": msg.htmlBody,
        "subject": msg.subject,
        "has_attachments": len(msg.attachments) > 0,
        "to": msg.to,
        "cc": msg.cc,
        "sender": msg.sender,
    }
    return msg_dict


def get_emails_dfr(msg_path: str) -> pd.DataFrame:
    # msg_path = r"data/b4si/msg"
    # List all .msg files in the given directory
    msg_files = [
        os.path.join(msg_path, f) for f in os.listdir(msg_path) if f.endswith(".msg")
    ]

    msgs = []

    with ProcessPoolExecutor(max_workers=16) as executor:
        msgs = list(
            tqdm(
                executor.map(process_msg_file, msg_files),
                total=len(msg_files),
                desc=inspect.currentframe().f_code.co_name,  # type:ignore
            )
        )
    msgs_dfr = pd.DataFrame(msgs)

    # assign uuid4 as msg_id
    msgs_dfr["msg_id"] = [str(uuid.uuid4()) for _ in range(len(msgs_dfr))]

    msgs_dfr = msgs_dfr[
        [
            "msg_id",
            "subject",
            "body",
            "htmlBody",
            "has_attachments",
            "to",
            "cc",
            "sender",
        ]
    ]

    # Cast as string and replace to avoid error
    msgs_dfr["body"] = msgs_dfr["body"].astype(str).str.replace("\x00", "", regex=False)
    msgs_dfr["htmlBody"] = (
        msgs_dfr["htmlBody"].astype(str).str.replace("\x00", "", regex=False)
    )
    return msgs_dfr


def extract_tone_guidelines(msgs_dfr: pd.DataFrame) -> str:
    # Extract guidelines from emails
    msgs_dfr["word_count"] = msgs_dfr["body"].apply(lambda x: len(x.split()))
    msgs_dfr["word_count"].sum()

    # Shuffle
    msgs_dfr = msgs_dfr.sample(frac=1).reset_index(drop=True)

    msgs_dfr["cumulative_word_count"] = msgs_dfr["word_count"].cumsum()

    # Break msgs_dfr into chunks of cumulative_word_count of 40k
    msgs_dfr["chunk_id"] = (msgs_dfr["cumulative_word_count"] / 40000).astype(int)

    guidelines = ""
    chunk_id = 0
    for chunk_id in msgs_dfr["chunk_id"].unique():
        chunk_dfr = msgs_dfr[msgs_dfr["chunk_id"] == chunk_id]
        chunk_str = chunk_dfr["body"].str.cat(sep=" ")

        prompt = f"""
        You are a helpful assistant that extracts tone guidelines from emails for a company called SLR.
        SLR answers questions from clients regarding ESG and sustainability.
        The emails are delimited by <email> and </email> tags.
        Within the email tags, there is a <chunk> tag and an optional <contextual_appendum> tag, use only the <chunk> tags.
        Within the <chunk> tags, there are email correspondences between SLR and its clients.
        Extract the tone guidelines from the SLR emails and return under two headings DOs and DONTs.
        You are working through one chunk of emails at a time, refining your guidelines as you go.

        <email>
        {chunk_str}
        </email>

        The tone guidelines are delimited by <guidelines> and </guidelines> tags.
        Please modify and output only the guidelines.
        If there is nothing to change, output the original guidelines so that we know it has converged.
        <guidelines>
        {guidelines}
        </guidelines>
        """
        # Call OpenAI API
        llm = OpenAI()
        response = llm.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts tone guidelines from emails.",
                },
                {"role": "user", "content": prompt},
            ],
            n=1,
            stop=None,
            temperature=0.0,
        )

        new_guidelines = response.choices[0].message.content
        if new_guidelines == guidelines:
            break
        guidelines = new_guidelines

    return guidelines


if __name__ == "__main__":

    msgs_dfr = get_emails_dfr(r"data/b4si/msg")
    ###guidelines = extract_tone_guidelines(msgs_dfr)

    engine = get_engine()
    msgs_dfr.to_sql("b4si_emails", engine, if_exists="replace", index=False)
