import asyncio
import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from fsai_rag.utils.config import get_settings
from fsai_rag.utils.database_schemas import SchemaType, StatusType, get_schema
from fsai_rag.utils.logger import logger


class DatabaseManager:
    def __init__(self):
        self.settings = get_settings()
        db_url = self._get_db_url()
        self.engine = create_async_engine(
            db_url,
            future=True,
            echo=True,
            connect_args={
                "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
                "statement_cache_size": 0,
                "prepared_statement_cache_size": 0,
            },
        )

    async def initialise(self):
        await self.engine.connect()
        await self.create_status_type()

    async def create_status_type(self):
        schema = get_schema(SchemaType.CREATE_STATUS_TYPE)
        logger.info(f"Creating status type: {schema}")
        async with self.engine.begin() as conn:
            await conn.execute(text(schema))

    def _get_db_url(self, tmp_db_name: str | None = None):
        db_user = self.settings.DB_USER
        db_password = self.settings.DB_PASSWORD
        db_host = self.settings.DB_HOST
        db_port = self.settings.DB_PORT
        db_name = tmp_db_name
        if db_name is None:
            db_name = self.settings.DB_NAME
        return f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}".replace(
            " ", ""
        )

    async def create_table_if_not_exists(self, table_name: str):
        schema = get_schema(SchemaType.CREATE_TABLE, table_name=table_name)
        async with self.engine.begin() as conn:
            sql = text(schema)
            await conn.execute(sql)

    async def insert(
        self,
        table_name: str,
        job_id: str,
        files: list[str],
        n_trials: int,
        status: StatusType = StatusType.PENDING,
    ):
        await self.create_table_if_not_exists(table_name)
        schema = get_schema(SchemaType.INSERT, table_name=table_name)
        params = {
            "job_id": job_id,
            "files": files,
            "n_trials": n_trials,
            "status": status.value,
        }
        async with AsyncSession(self.engine) as session:
            async with session.begin():
                sql = text(schema)
                await session.stream(sql, params)

    async def update(self, table_name: str, job_id: str, status: StatusType):
        schema = get_schema(SchemaType.UPDATE, table_name=table_name)
        params = {"job_id": job_id, "status": status.value}
        async with AsyncSession(self.engine) as session:
            async with session.begin():
                sql = text(schema)
                await session.stream(sql, params)

    async def get(self, table_name: str, job_id: str):
        schema = get_schema(SchemaType.GET, table_name=table_name)
        params = {"job_id": job_id}
        async with AsyncSession(self.engine) as session:
            sql = text(schema)
            result = await session.stream(sql, params)
            return await result.fetchall()

    async def delete(self, table_name: str, job_id: str):
        schema = get_schema(SchemaType.DELETE, table_name=table_name)
        params = {"job_id": job_id}
        async with AsyncSession(self.engine) as session:
            async with session.begin():
                sql = text(schema)
                await session.stream(sql, params)

    async def close(self):
        await self.engine.dispose()


_db_manager = None


async def get_db_manager() -> DatabaseManager:
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
        await _db_manager.initialise()
    return _db_manager
