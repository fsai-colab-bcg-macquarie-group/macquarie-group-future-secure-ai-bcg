from enum import Enum
from typing import TypedDict, Union


class StatusType(Enum):
    PENDING = "Pending"
    STARTED = "Started"
    SUCCEEDED = "Succeeded"
    FAILED = "Failed"

    @classmethod
    def status_values(cls) -> str:
        return ", ".join(f"'{status.value}'" for status in cls)


class SchemaType(Enum):

    CHECK_DATABASE_EXISTS = """
        SELECT 1 FROM pg_database WHERE datname = '{db_name}';
    """

    CREATE_DATABASE = """
        CREATE DATABASE {db_name};
    """

    CREATE_STATUS_TYPE = f"""
        DO $$ BEGIN
            CREATE TYPE demo_status AS ENUM ({StatusType.status_values()});
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """

    CREATE_TABLE = f"""
        CREATE TABLE IF NOT EXISTS "{{table_name}}" (
            id SERIAL PRIMARY KEY,
            job_id VARCHAR(255) NOT NULL,
            files TEXT[] NOT NULL,
            n_trials INTEGER NOT NULL,
            status demo_status NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """
    INSERT = """
        INSERT INTO "{table_name}" (job_id, files, n_trials, status, updated_at)
        VALUES (:job_id, :files, :n_trials, :status, CURRENT_TIMESTAMP);
    """

    UPDATE = """
        UPDATE "{table_name}"
        SET status = :status, updated_at = CURRENT_TIMESTAMP
        WHERE job_id = :job_id;
    """

    DELETE = """
        DELETE FROM "{table_name}"
        WHERE job_id = :job_id;
    """

    GET = """
        SELECT * FROM "{table_name}"
        WHERE job_id = :job_id;
    """


def get_schema(type: SchemaType, **kwargs) -> str:
    schema_template = type.value
    table_name = kwargs.get("table_name", None)
    db_name = kwargs.get("db_name", None)
    if type == SchemaType.CREATE_STATUS_TYPE:
        return schema_template
    elif (
        type == SchemaType.CREATE_DATABASE or type == SchemaType.CHECK_DATABASE_EXISTS
    ) and db_name is not None:
        return schema_template.format(db_name=db_name)
    elif type == SchemaType.CREATE_TABLE and table_name is not None:
        return schema_template.format(table_name=table_name)
    elif schema_template is not None:
        return schema_template.format(**kwargs)
    else:
        raise ValueError(
            f"No schema found for {type} with db_name: {db_name} and table_name: {table_name}"
        )


if __name__ == "__main__":
    print(get_schema(SchemaType.CREATE_DATABASE, db_name="test_db"))
    print(get_schema(SchemaType.CREATE_TABLE, table_name="test_table"))
