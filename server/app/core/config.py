from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str | None = None
    openai_api_key: str | None = None
    default_llm_provider: str = "auto"
    auto_provider_order: str = "gemini,openai"
    gemini_model: str = "gemini-2.0-flash"
    openai_model: str = "gpt-4.1-mini"

    model_config = SettingsConfigDict(
        env_file="server/.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
