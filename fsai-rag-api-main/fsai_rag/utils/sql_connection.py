import os

import psycopg2
import sqlalchemy as sa


def get_engine() -> sa.Engine:
    connection_str = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}".replace(
        " ", ""
    )
    engine = sa.create_engine(connection_str)
    return engine


def get_connection_string() -> str:
    connection_str = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}".replace(
        " ", ""
    )
    return connection_str


def drop_table_if_exists(table_name: str) -> None:

    connection_str = get_connection_string()
    conn = psycopg2.connect(connection_str)
    conn.autocommit = True
    with conn.cursor() as cursor:
        cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE")
    conn.close()
