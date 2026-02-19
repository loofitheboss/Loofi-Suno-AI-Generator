import logging

from fastapi import HTTPException

from app.models.schemas import (
    ExtendRequest,
    ExtendResponse,
    GenerateRequest,
    GenerateResponse,
)
from app.providers.base import ProviderError, ProviderErrorCode
from app.providers.router import ProviderRouter


logger = logging.getLogger(__name__)


def _friendly_reason(error: ProviderError) -> str:
    mapping = {
        ProviderErrorCode.CONFIGURATION: "Provider is not configured on the server.",
        ProviderErrorCode.AUTH: "Authentication failed. Check server API keys.",
        ProviderErrorCode.QUOTA: "Provider credits or quota are exhausted.",
        ProviderErrorCode.RATE_LIMIT: "Provider is rate limited. Try again shortly.",
        ProviderErrorCode.TIMEOUT: "Provider request timed out.",
        ProviderErrorCode.NETWORK: "Network issue while contacting provider.",
        ProviderErrorCode.INVALID_RESPONSE: "Provider returned invalid response format.",
        ProviderErrorCode.UNKNOWN: "Unknown provider error occurred.",
    }
    return mapping.get(error.code, "Unknown provider error occurred.")


def _http_status_for_error(error: ProviderError) -> int:
    mapping = {
        ProviderErrorCode.AUTH: 401,
        ProviderErrorCode.QUOTA: 402,
        ProviderErrorCode.RATE_LIMIT: 429,
        ProviderErrorCode.CONFIGURATION: 503,
        ProviderErrorCode.TIMEOUT: 503,
        ProviderErrorCode.NETWORK: 503,
        ProviderErrorCode.INVALID_RESPONSE: 502,
        ProviderErrorCode.UNKNOWN: 503,
    }
    return mapping.get(error.code, 503)


def _format_error(provider_name: str, error: ProviderError) -> str:
    return (
        f"{provider_name}: code={error.code.value}, retryable={str(error.retryable).lower()}, "
        f"reason={_friendly_reason(error)}"
    )


class SongService:
    def __init__(self, provider_router: ProviderRouter):
        self._provider_router = provider_router

    @property
    def provider_router(self) -> ProviderRouter:
        return self._provider_router

    def generate(self, payload: GenerateRequest) -> GenerateResponse:
        errors: list[str] = []
        last_error: ProviderError | None = None
        order = self._provider_router.resolve_order(payload.provider)
        for provider_name in order:
            try:
                provider = self._provider_router.get_provider(provider_name)
                result = provider.generate_pack(payload)
                return GenerateResponse(
                    title=result.title,
                    style=result.style,
                    lyrics=result.lyrics,
                    explanation=result.explanation,
                    providerUsed=result.provider_name,  # type: ignore[arg-type]
                    modelUsed=result.model_name,
                )
            except ProviderError as exc:
                last_error = exc
                errors.append(_format_error(provider_name, exc))
                logger.warning(
                    "generate_provider_failed",
                    extra={
                        "event": "generate_provider_failed",
                        "provider": provider_name,
                        "code": exc.code.value,
                        "retryable": exc.retryable,
                    },
                )

        if last_error and payload.provider != "auto":
            raise HTTPException(
                status_code=_http_status_for_error(last_error),
                detail=(
                    f"Generation failed for provider '{payload.provider}'. "
                    f"{_friendly_reason(last_error)}"
                ),
            )

        raise HTTPException(
            status_code=503,
            detail="No available provider could generate content. "
            + " | ".join(errors),
        )

    def extend(self, payload: ExtendRequest) -> ExtendResponse:
        errors: list[str] = []
        last_error: ProviderError | None = None
        order = self._provider_router.resolve_order(payload.provider)
        for provider_name in order:
            try:
                provider = self._provider_router.get_provider(provider_name)
                result = provider.extend_lyrics(
                    current_lyrics=payload.currentLyrics,
                    topic=payload.topic,
                    style=payload.style,
                    language=payload.language,
                )
                return ExtendResponse(
                    addedLyrics=result.added_lyrics,
                    providerUsed=result.provider_name,  # type: ignore[arg-type]
                    modelUsed=result.model_name,
                )
            except ProviderError as exc:
                last_error = exc
                errors.append(_format_error(provider_name, exc))
                logger.warning(
                    "extend_provider_failed",
                    extra={
                        "event": "extend_provider_failed",
                        "provider": provider_name,
                        "code": exc.code.value,
                        "retryable": exc.retryable,
                    },
                )

        if last_error and payload.provider != "auto":
            raise HTTPException(
                status_code=_http_status_for_error(last_error),
                detail=(
                    f"Lyric extension failed for provider '{payload.provider}'. "
                    f"{_friendly_reason(last_error)}"
                ),
            )

        raise HTTPException(
            status_code=503,
            detail="No available provider could extend lyrics. " + " | ".join(errors),
        )
