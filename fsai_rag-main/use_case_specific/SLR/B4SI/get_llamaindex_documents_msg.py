import inspect
import uuid
from enum import Enum

import pandas as pd
from openai import OpenAI
from pydantic import BaseModel
from tqdm import tqdm

from fsai_rag.utils.sql_connection import get_engine
from fsai_rag.vectoriser.DenseVectoriserConfig import (
    DenseVectoriserConfig,
    get_baseline_dense_vectoriser_config,
)
from use_case_specific.SLR.B4SI.B4SI_LlamaIndexDocument import B4SI_LlamaIndexDocument
from use_case_specific.SLR.B4SI.get_llamaindex_documents_txt import chunk_dfr


class GetLlamaIndexDocumentsEnum(str, Enum):
    QUESTION = "question"
    ANSWER = "answer"
    BOTH = "both"


class QnA(BaseModel):
    parent_question_number: int
    question_number: int
    question: str
    options: list[str] | None
    answer: str


class QnAList(BaseModel):
    qnas: list[QnA]


def read_emails_from_db(email_table: str = "b4si_emails") -> pd.DataFrame:
    engine = get_engine()
    query = f"SELECT * FROM {email_table}"
    emails_df = pd.read_sql(query, engine)
    return emails_df


def extract_qna_from_emails(
    vectoriser_config: DenseVectoriserConfig,
    collection: str,
    email_table: str = "b4si_emails",
) -> pd.DataFrame:
    dfr = read_emails_from_db(email_table)

    # Rename msg_id as pre_split_id
    dfr = dfr.rename(columns={"msg_id": "pre_split_id"})
    dfr.columns

    # dfr = dfr.iloc[0:3]

    # if htmlBody is not null, use it, otherwise use body
    if dfr.htmlBody.notna().any():
        dfr["coalesced_body"] = dfr.htmlBody.fillna(dfr.body)
    else:
        dfr["coalesced_body"] = dfr.body

    dfr["char_len"] = dfr.coalesced_body.str.len()
    dfr["word_count"] = dfr.coalesced_body.str.split().str.len()

    chunks = chunk_dfr(
        char_len_dfr=dfr,
        splitter_config=vectoriser_config.splitter_config,
        qa_bank=collection,
    )

    # Join chunks and dfr on pre_split_id
    chunks = chunks.merge(
        dfr[["pre_split_id", "coalesced_body"]], on="pre_split_id", how="left"
    )

    # Limit coalesced_body to characters specified in start_index and end_index
    chunks["coalesced_body"] = chunks.apply(
        lambda row: row["coalesced_body"][row["start_index"] : row["end_index"]], axis=1
    )

    prompt = """
    You are an AI question answering assistant working for the company SLR/B4SI.
    You are given a dataframe with a column called 'body' which contains the email content.
    Your job is to extract the `question` and `answer` from the email marked up in html.
    Optionally, the client might have provided a list of options for the question, if so, provide them under `options`, but do not create your own.
    Some question are part of a larger question, if so, provide the parent question number and the question number in the `parent_question_number` and `question_number` fields.
    Ensure that the `question` is a standalone question rephrased with the context of the email provided.
    DO NOT mark-up any of the `question` or `answer` or `options` in the html, only return it as text.
    """

    client = OpenAI()

    all_qnas_df = pd.DataFrame()

    for idx in tqdm(
        range(len(chunks)), desc=inspect.currentframe().f_code.co_name  # type:ignore
    ):

        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": chunks.iloc[idx].coalesced_body},
            ],
            response_format=QnAList,
        )

        qna_list = completion.choices[0].message.parsed

        # Convert to dataframe
        qna_df = pd.DataFrame.from_records(
            [
                (
                    qna.parent_question_number,
                    qna.question_number,
                    qna.question,
                    qna.options,
                    qna.answer,
                )
                for qna in qna_list.qnas
            ],
            columns=[
                "parent_question_number",
                "question_number",
                "question",
                "options",
                "answer",
            ],
        )

        qna_df["msg_id"] = chunks.iloc[idx].pre_split_id

        all_qnas_df = pd.concat([all_qnas_df, qna_df])
        all_qnas_df["qna_id"] = [str(uuid.uuid4()) for _ in range(len(all_qnas_df))]

    print(all_qnas_df.head())

    return all_qnas_df


def get_llamaindex_documents(
    qa_bank: str,
    question_or_answer: GetLlamaIndexDocumentsEnum,
) -> list[B4SI_LlamaIndexDocument]:

    # baseline_vectoriser_config = get_baseline_dense_vectoriser_config()
    # splitter_config = baseline_vectoriser_config.splitter_config
    # contextualisor_config = baseline_vectoriser_config.contextualisor_config

    # Not performing contextualisation due to input size
    # Moreover, contextualisation is performed when extracting the QnA from emails.

    # Retrieve the QnA DataFrame from the database
    qna_df = pd.read_sql("SELECT * FROM b4si_qnas", get_engine())

    documents = []
    metadata_keys = list(qna_df.columns)

    # Iterate over each row in the QnA DataFrame
    for idx in tqdm(
        range(len(qna_df)), desc=inspect.currentframe().f_code.co_name  # type:ignore
    ):
        row = qna_df.iloc[idx]

        # Determine whether to use the question or answer text
        if question_or_answer == GetLlamaIndexDocumentsEnum.QUESTION:
            text = row["question"]
        elif question_or_answer == GetLlamaIndexDocumentsEnum.ANSWER:
            text = row["answer"]
        elif question_or_answer == GetLlamaIndexDocumentsEnum.BOTH:
            text = f"{row['question']}\n{row['answer']}"

        # Create metadata for the document
        metadata = {
            "chunk_id": row["qna_id"],
            "qa_bank": qa_bank,
            "msg_id": row["msg_id"],
            "qna_id": row["qna_id"],
        }

        # Create and append a B4SI_LlamaIndexDocument object for the question or answer
        documents.append(
            B4SI_LlamaIndexDocument(
                text=text,
                metadata=metadata,
                excluded_embed_metadata_keys=metadata_keys,
            )
        )

    # Every row has a question or answer, so the length of documents should be equal to the length of qna_df
    assert len(documents) == qna_df.shape[0]

    return documents


if __name__ == "__main__":
    vectoriser_config = get_baseline_dense_vectoriser_config()
    email_table = "b4si_emails"
    collection = "mlflow_tuning_config_tuning_config"
    all_qnas_df = extract_qna_from_emails(vectoriser_config, email_table, collection)
    engine = get_engine()
    all_qnas_df.to_sql("b4si_qnas", engine, if_exists="replace", index=False)
