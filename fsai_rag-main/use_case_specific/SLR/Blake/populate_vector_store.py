import glob
import os

import psycopg2
from llama_index.core import Settings, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import NodeParser

# from llama_index.core.text_splitter import TextSplitter
from llama_index.vector_stores.supabase import SupabaseVectorStore

import fsai_rag.utils.sql_connection as sqc
import use_case_specific.SLR.B4SI.get_llamaindex_documents_msg as get_llamaindex_documents_msg
import use_case_specific.SLR.B4SI.get_llamaindex_documents_txt as get_llamaindex_documents_txt
from fsai_rag.utils.sql_connection import drop_table_if_exists, get_connection_string
from fsai_rag.vectoriser.DenseVectoriserConfig import (
    ContextualisorConfig,
    DenseVectoriserConfig,
    get_baseline_dense_vectoriser_config,
)
from fsai_rag.vectoriser.splitter import SplitterConfig
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


def populate_vector_store(
    collection_name: str,
    drop_existing_table: bool = True,
) -> None:
    # collection_name = "blake_knowledge_base"
    if drop_existing_table:
        drop_table_if_exists(f"vecs.{collection_name}")

    splitter_config = SplitterConfig(
        chunking_strategy="fixed", chunk_size=200, chunk_overlap=50
    )
    contextualisor_config = ContextualisorConfig(contextualise_src_chunk=False)

    documents = get_llamaindex_documents_txt.get_llamaindex_documents(
        txt_files=glob.glob("data/blake/all cvs/**/*.txt", recursive=True),
        splitter_config=splitter_config,
        contextualisor_config=contextualisor_config,
        qa_bank="policy content",
    )

    # Persist
    # Initialize the Supabase vector store with the provided configuration and collection name.
    vector_store = SupabaseVectorStore(
        postgres_connection_string=get_connection_string(),
        collection_name=collection_name,
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    Settings.chunk_size = 1000000
    Settings.chunk_overlap = 0
    # Create the table
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        show_progress=True,
    )

    recreate_table(
        collection_name=collection_name,
        output_table="blake_knowledge_base_emb",
        job_id=None,
        drop_existing_table=True,
    )


if __name__ == "__main__":
    populate_vector_store(
        collection_name="blake_knowledge_base",
        drop_existing_table=True,
    )
