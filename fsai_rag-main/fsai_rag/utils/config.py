from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str
    UPLOAD_DIR: str = "uploads"
    MAX_WORKERS: int = 5  # Default value of 5 if not specified in .env
    ENV: str = "development"
    OPENAI_API_KEY: str
    # MLFLOW_CONN_STR: str
    MLFLOW_TRACKING_URI: str
    MLFLOW_TRACKING_USERNAME: str
    MLFLOW_TRACKING_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file=".devcontainer/devcontainer.env", env_file_encoding="utf-8"
    )


settings = Settings()


def get_settings() -> Settings:
    return settings
