import os

from datasets import Dataset
from langchain.text_splitter import TextSplitter
from llama_index.core import SimpleDirectoryReader
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from ragas import evaluate  # load the documents
from ragas.metrics import (
    answer_relevancy,
    context_precision,
    context_recall,
    faithfulness,
)
from ragas.run_config import RunConfig
from ragas.testset.docstore import Document, DocumentStore, InMemoryDocumentStore
from ragas.testset.evolutions import multi_context, reasoning, simple
from ragas.testset.generator import TestsetGenerator

if __name__ == "__main__":

    documents = SimpleDirectoryReader("data/b4si/docx/TXT").load_data()
    # generator with openai models
    generator_llm = OpenAI(model="gpt-4o")
    critic_llm = OpenAI(model="gpt-4o")
    embeddings = OpenAIEmbedding()

    generator = TestsetGenerator.from_llama_index(
        generator_llm=generator_llm,
        critic_llm=critic_llm,
        embeddings=embeddings,
    )

    # generate testset
    testset = generator.generate_with_llamaindex_docs(
        documents,
        test_size=5,
        distributions={simple: 0.5, reasoning: 0.25, multi_context: 0.25},
        is_async=False,
        run_config=RunConfig(max_workers=1),
    )

    dfr = testset.to_pandas()

    dfr["answer"] = ""
    idx = 0
    for idx in dfr.index:
        dfr["answer"][idx] = generator_llm.complete(dfr["question"][idx]).text

    contexts = dfr.contexts.to_list()

    data_samples = {
        "question": dfr.question.to_list(),
        "answer": dfr.answer.to_list(),
        "contexts": dfr.contexts.to_list(),
        "ground_truth": dfr.ground_truth.to_list(),
    }
    dataset = Dataset.from_dict(data_samples)

    result = evaluate(
        dataset,
        metrics=[
            context_precision,
            faithfulness,
            answer_relevancy,
            context_recall,
        ],
    )

    df = result.to_pandas()
    df.head()
