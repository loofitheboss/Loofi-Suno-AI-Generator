from app.core.config import Settings
from app.providers.router import ProviderRouter


def test_provider_router_order_and_defaults() -> None:
    settings = Settings(
        gemini_api_key="g-key",
        openai_api_key="o-key",
        default_llm_provider="auto",
        auto_provider_order="openai,gemini",
    )
    router = ProviderRouter(settings=settings)
    assert router.configured == ["gemini", "openai"]
    assert router.default_provider == "auto"
    assert router.auto_order == ["openai", "gemini"]
