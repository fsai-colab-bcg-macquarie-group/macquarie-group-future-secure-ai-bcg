import os

import psycopg2
from llama_index.core import StorageContext, VectorStoreIndex
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


def get_llamaindex_documents_all(
    vectoriser_config: DenseVectoriserConfig,
    policy_files: list[str],
) -> list[B4SI_LlamaIndexDocument]:
    # Policy Content docs
    # Hardcoding file names here, to refactor as param if this is called from another script
    # txt_policy_dir = os.path.join("data/b4si/docx/TXT")

    policy_contents_docs = get_llamaindex_documents_txt.get_llamaindex_documents(
        txt_files=policy_files,
        splitter_config=vectoriser_config.splitter_config,
        contextualisor_config=vectoriser_config.contextualisor_config,
        qa_bank="policy contents",
    )

    assert len(policy_contents_docs) > 0
    # Assert it is list[B4SI_LlamaIndexDocument]
    assert all(isinstance(doc, B4SI_LlamaIndexDocument) for doc in policy_contents_docs)

    return policy_contents_docs


def populate_vector_store(
    vectoriser_config: DenseVectoriserConfig,
    collection_name: str,
    policy_files: list[str],
    output_table: str | None = None,
    job_id: str | None = None,
    drop_existing_table: bool = True,
) -> None:

    drop_table_if_exists(f"vecs.{collection_name}")

    # vectoriser_config = get_baseline_dense_vectoriser_config()
    # vectoriser_config = get_baseline_vectoriser_config()
    documents = get_llamaindex_documents_all(vectoriser_config, policy_files)

    # Persist
    # Initialize the Supabase vector store with the provided configuration and collection name.
    vector_store = SupabaseVectorStore(
        postgres_connection_string=get_connection_string(),
        collection_name=collection_name,
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # Create the table
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        embed_model=vectoriser_config.embedder_config.llama_index_embed_model,
        show_progress=True,
    )

    recreate_table(
        collection_name=collection_name,
        output_table=output_table,
        job_id=job_id,
        drop_existing_table=drop_existing_table,
    )


if __name__ == "__main__":
    # Hardcoded values
    POLICY_FILES = [
        os.path.join("data", "b4si", "docx", "TXT", "B4SI BI Guidance Manual.txt"),
        os.path.join("data", "b4si", "docx", "TXT", "B4SI CI Guidance Manual.txt"),
    ]

    vectoriser_config = get_baseline_dense_vectoriser_config()
    vectoriser_config.splitter_config.chunk_size = (
        32066  # these are the values from the best config from tuning hard
    )
    vectoriser_config.splitter_config.chunk_overlap = 12034
    vectoriser_config.contextualisor_config.contextualise_src_chunk = False

    print("testing populate_vector_store")
    # Match the tuning case exactly
    tuning_table = "mlflow_tuning_config_vectors"
    tuning_collection = "mlflow_tuning_config_collection"

    populate_vector_store(
        vectoriser_config=vectoriser_config,
        collection_name=tuning_collection,
        policy_files=POLICY_FILES,
        output_table=tuning_table,
    )
    print("testing populate_vector_store complete")
