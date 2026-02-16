from fastapi import HTTPException

from app.models.schemas import (
    ExtendRequest,
    ExtendResponse,
    GenerateRequest,
    GenerateResponse,
)
from app.providers.base import ProviderError
from app.providers.router import ProviderRouter


class SongService:
    def __init__(self, provider_router: ProviderRouter):
        self._provider_router = provider_router

    @property
    def provider_router(self) -> ProviderRouter:
        return self._provider_router

    def generate(self, payload: GenerateRequest) -> GenerateResponse:
        errors: list[str] = []
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
                errors.append(f"{provider_name}: {exc.message}")

        raise HTTPException(
            status_code=503,
            detail="No available provider could generate content. "
            + " | ".join(errors),
        )

    def extend(self, payload: ExtendRequest) -> ExtendResponse:
        errors: list[str] = []
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
                errors.append(f"{provider_name}: {exc.message}")

        raise HTTPException(
            status_code=503,
            detail="No available provider could extend lyrics. " + " | ".join(errors),
        )
