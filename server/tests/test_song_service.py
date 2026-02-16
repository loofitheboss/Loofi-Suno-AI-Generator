from fastapi import HTTPException

from app.models.schemas import ExtendRequest, GenerateRequest
from app.providers.base import (
    ExtendProviderResult,
    GenerateProviderResult,
    ProviderError,
    ProviderErrorCode,
)
from app.services.song_service import SongService


class _FailingProvider:
    def __init__(self, code: ProviderErrorCode):
        self._code = code

    def generate_pack(self, payload: GenerateRequest) -> GenerateProviderResult:
        raise ProviderError("provider failed", code=self._code)

    def extend_lyrics(
        self, current_lyrics: str, topic: str, style: str, language: str
    ) -> ExtendProviderResult:
        raise ProviderError("provider failed", code=self._code)


class _WorkingProvider:
    def generate_pack(self, payload: GenerateRequest) -> GenerateProviderResult:
        return GenerateProviderResult(
            provider_name="openai",
            model_name="gpt-4.1-mini",
            title="Working Result",
            style="Calm, medium energy, piano, soft drums, female vocals, pop, 44.1kHz, Wide Stereo, Clean Mix",
            lyrics="[Verse]\nHello",
            explanation="ok",
        )

    def extend_lyrics(
        self, current_lyrics: str, topic: str, style: str, language: str
    ) -> ExtendProviderResult:
        return ExtendProviderResult(
            provider_name="openai",
            model_name="gpt-4.1-mini",
            added_lyrics="[Bridge]\nWorld",
        )


class _FakeRouter:
    def __init__(self, providers: dict[str, object], order: list[str]):
        self._providers = providers
        self._order = order

    def resolve_order(self, requested: str) -> list[str]:
        if requested == "auto":
            return self._order
        return [requested]

    def get_provider(self, name: str):
        provider = self._providers.get(name)
        if not provider:
            raise ProviderError(
                "missing provider", code=ProviderErrorCode.CONFIGURATION
            )
        return provider


def test_generate_uses_fallback_when_auto() -> None:
    service = SongService(
        provider_router=_FakeRouter(
            providers={
                "gemini": _FailingProvider(ProviderErrorCode.RATE_LIMIT),
                "openai": _WorkingProvider(),
            },
            order=["gemini", "openai"],
        )
    )
    response = service.generate(
        GenerateRequest(
            topic="Test",
            provider="auto",
        )
    )
    assert response.providerUsed == "openai"
    assert response.title == "Working Result"


def test_generate_maps_auth_error_to_401_for_direct_provider() -> None:
    service = SongService(
        provider_router=_FakeRouter(
            providers={"gemini": _FailingProvider(ProviderErrorCode.AUTH)},
            order=["gemini"],
        )
    )
    try:
        service.generate(GenerateRequest(topic="Test", provider="gemini"))
    except HTTPException as exc:
        assert exc.status_code == 401
        assert "Authentication failed" in str(exc.detail)
    else:
        raise AssertionError("Expected HTTPException")


def test_extend_returns_503_after_auto_exhaustion() -> None:
    service = SongService(
        provider_router=_FakeRouter(
            providers={
                "gemini": _FailingProvider(ProviderErrorCode.NETWORK),
                "openai": _FailingProvider(ProviderErrorCode.TIMEOUT),
            },
            order=["gemini", "openai"],
        )
    )
    try:
        service.extend(
            ExtendRequest(
                currentLyrics="[Verse] test",
                topic="test",
                style="pop",
                language="English",
                provider="auto",
            )
        )
    except HTTPException as exc:
        assert exc.status_code == 503
        assert "No available provider" in str(exc.detail)
    else:
        raise AssertionError("Expected HTTPException")
