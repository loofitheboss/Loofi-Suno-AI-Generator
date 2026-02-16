from app.core.config import Settings
from app.models.schemas import ProviderName
from app.providers.base import BaseLlmProvider, ProviderError, ProviderErrorCode
from app.providers.gemini_provider import GeminiProvider
from app.providers.openai_provider import OpenAiProvider


class ProviderRouter:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._providers: dict[str, BaseLlmProvider] = {}

        if settings.gemini_api_key:
            self._providers["gemini"] = GeminiProvider(
                api_key=settings.gemini_api_key,
                model_name=settings.gemini_model,
            )
        if settings.openai_api_key:
            self._providers["openai"] = OpenAiProvider(
                api_key=settings.openai_api_key,
                model_name=settings.openai_model,
            )

    @property
    def configured(self) -> list[ProviderName]:
        return [name for name in ["gemini", "openai"] if name in self._providers]

    @property
    def auto_order(self) -> list[ProviderName]:
        allowed = {"gemini", "openai"}
        parsed = [
            x.strip()
            for x in self._settings.auto_provider_order.split(",")
            if x.strip() in allowed
        ]
        order: list[ProviderName] = []
        for name in parsed + ["gemini", "openai"]:
            if name in allowed and name not in order:
                order.append(name)  # type: ignore[arg-type]
        return order

    @property
    def default_provider(self) -> ProviderName:
        value = self._settings.default_llm_provider.strip().lower()
        if value in {"auto", "gemini", "openai"}:
            return value  # type: ignore[return-value]
        return "auto"

    def resolve_order(self, requested: ProviderName) -> list[ProviderName]:
        if requested != "auto":
            return [requested]
        return self.auto_order

    def get_provider(self, name: ProviderName) -> BaseLlmProvider:
        if name == "auto":
            raise ProviderError(
                "Cannot resolve provider for auto directly",
                code=ProviderErrorCode.CONFIGURATION,
            )
        provider = self._providers.get(name)
        if not provider:
            raise ProviderError(
                f"Provider '{name}' is not configured",
                code=ProviderErrorCode.CONFIGURATION,
            )
        return provider
