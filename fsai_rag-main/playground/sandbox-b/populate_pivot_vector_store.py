import os

import psycopg2
import tiktoken
from llama_index.core import Settings, StorageContext, VectorStoreIndex
from llama_index.vector_stores.supabase import SupabaseVectorStore

import fsai_rag.utils.sql_connection as sqc
import use_case_specific.SLR.B4SI.get_llamaindex_documents_msg as get_llamaindex_documents_msg
import use_case_specific.SLR.B4SI.get_llamaindex_documents_txt as get_llamaindex_documents_txt
from fsai_rag.utils.sql_connection import drop_table_if_exists, get_connection_string
from fsai_rag.vectoriser.DenseVectoriserConfig import (
    DenseVectoriserConfig,
    get_baseline_dense_vectoriser_config,
)
from use_case_specific.SLR.B4SI.B4SI_LlamaIndexDocument import B4SI_LlamaIndexDocument


def recreate_table(
    collection_name: str,
    output_table: str | None = None,
    schema: str = "vecs",
    drop_existing_table: bool = True,
    job_id: str | None = None,
) -> None:
    """
    Recreates a table in the PostgreSQL database with the specified collection name.

    This function connects to the PostgreSQL database using the connection string obtained
    from the `sql_connection` utility. It then drops the existing table if it exists and
    creates a new table with the specified collection name. The new table is created by
    selecting specific fields from the original table and renaming them accordingly.

    Args:
        collection_name (str): The collection name to select from
        output_table (str | None): The output table name
        schema (str): Schema name
        drop_existing_table (bool): Whether to drop existing table before creating

    Raises:
        psycopg2.DatabaseError: If there is an error while executing the SQL statements.
        Exception: If there is any other error during the execution of the function.

    """

    if output_table is None:
        output_table = f"{collection_name}_emb"

    # PostgreSQL connection string
    conn_string = sqc.get_connection_string()

    # collection_name = f"b4si_knowledge_base"

    try:
        # Connect to your PostgreSQL database
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()

        # SQL to drop the existing table if it exists
        if drop_existing_table:
            drop_table_sql = f"DROP TABLE IF EXISTS {schema}.{output_table} CASCADE;"
            cursor.execute(drop_table_sql)
            conn.commit()

        # SQL to create the new table "final"
        create_table_sql = f"""
        CREATE TABLE {schema}.{output_table} AS SELECT "id",
            (metadata->>'_node_content')::jsonb->>'text' AS "pageContent",
            "metadata",
            "vec" AS "embedding",
            '{job_id}' AS "job_id"
        FROM {schema}.{collection_name};"""

        cursor.execute(create_table_sql)
        conn.commit()

        print(f"Table {schema}.{output_table} has been recreated successfully.")

    except psycopg2.DatabaseError as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close the database connection
        if conn:
            cursor.close()
            conn.close()


def count_tokens(text: str, model: str = "text-embedding-ada-002") -> int:
    """Count the number of tokens in a text string"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))


def get_llamaindex_documents_pivot_tables(
    txt_files: list[str], qa_bank: str = "data table"
) -> list[B4SI_LlamaIndexDocument]:
    """
    Create LlamaIndex documents from pivot table txt files, treating each file as a single chunk
    """
    documents = []

    for file_path in txt_files:
        with open(file_path, "r") as f:
            content = f.read()

        # Print token count for this document
        token_count = count_tokens(content)
        print(f"File: {os.path.basename(file_path)}")
        print(f"Content length: {len(content)} characters")
        print(f"Token count: {token_count} tokens")
        print("-" * 50)

        # Create a single document for the entire file content
        doc = B4SI_LlamaIndexDocument(
            text=content,
            metadata={
                "qa_bank": qa_bank,
                "chunk_id": "1",
                "msg_id": "data table",
                "qna_id": "data table",
            },
        )
        documents.append(doc)

    return documents


from llama_index.core.node_parser import TextSplitter


class NoOpTextSplitter(TextSplitter):
    def __init__(self):
        super().__init__(chunk_size=8000, chunk_overlap=0)

    def split_text(self, text: str) -> list[str]:
        """Return the text as a single chunk"""
        print(f"split_text called with text length: {len(text)}")
        return [text]

    def split_documents(self, documents):
        """Override to prevent any document splitting"""
        print(f"split_documents called with {len(documents)} documents")
        return documents

    def split_node(self, node):
        """Override to prevent any node splitting"""
        print(f"split_node called")
        return [node]


def populate_vector_store(
    vectoriser_config: DenseVectoriserConfig,
    collection_name: str,
    pivot_files: list[str],
    output_table: str | None = None,
    job_id: str | None = None,
    drop_existing_table: bool = True,
) -> None:

    drop_table_if_exists(f"vecs.{collection_name}")

    # Disable splitting in vectoriser config
    vectoriser_config.splitter_config.chunk_size = 100000  # Large chunk size
    vectoriser_config.splitter_config.chunk_overlap = 0

    # Configure global settings
    Settings.chunk_size = 100000  # Large chunk size
    Settings.chunk_overlap = 0
    Settings.embed_model = vectoriser_config.embedder_config.llama_index_embed_model

    # Get pivot documents as single chunks
    documents = get_llamaindex_documents_pivot_tables(pivot_files)
    print(f"Number of input documents: {len(documents)}")

    # Print total tokens across all documents
    total_tokens = sum(count_tokens(doc.text) for doc in documents)
    print(f"Total tokens across all documents: {total_tokens}")

    if total_tokens > 8192:
        print("WARNING: Total tokens exceed OpenAI's limit of 8192!")
        return

    # Persist
    vector_store = SupabaseVectorStore(
        postgres_connection_string=get_connection_string(),
        collection_name=collection_name,
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # Create the table with splitting disabled at all levels
    index = VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        show_progress=True,
        text_splitter=NoOpTextSplitter(),
    )

    print(f"Number of nodes in index: {len(index.docstore.docs)}")

    recreate_table(
        collection_name=collection_name,
        output_table=output_table,
        job_id=job_id,
        drop_existing_table=drop_existing_table,
    )


if __name__ == "__main__":
    # Define pivot table files
    PIVOT_FILES = [
        os.path.join(
            "data",
            "b4si",
            "xlsx",
            "TXT",
            "Benchmark sample provisional database - BH pivots_Pivot 1 .txt",
        ),
        os.path.join(
            "data",
            "b4si",
            "xlsx",
            "TXT",
            "Benchmark sample provisional database - BH pivots_Pivot 2.txt",
        ),
    ]

    vectoriser_config = get_baseline_dense_vectoriser_config()
    # Note: chunk size settings won't affect pivot tables as we're treating them as single chunks
    vectoriser_config.splitter_config.chunk_size = 32066
    vectoriser_config.splitter_config.chunk_overlap = 12034
    vectoriser_config.contextualisor_config.contextualise_src_chunk = False

    print("testing populate_vector_store")
    pivot_table = "b4si_pivot_tables_vectors"
    pivot_collection = "b4si_pivot_tables_collection"

    populate_vector_store(
        vectoriser_config=vectoriser_config,
        collection_name=pivot_collection,
        pivot_files=PIVOT_FILES,
        output_table=pivot_table,
    )
    print("testing populate_vector_store complete")
