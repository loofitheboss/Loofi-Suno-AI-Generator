from functools import lru_cache

from fastapi import APIRouter

from app.core.config import get_settings
from app.models.schemas import (
    ExtendRequest,
    ExtendResponse,
    GenerateRequest,
    GenerateResponse,
    ProvidersResponse,
)
from app.providers.router import ProviderRouter
from app.services.song_service import SongService


router = APIRouter(prefix="/api/song", tags=["song"])


@lru_cache
def get_song_service() -> SongService:
    settings = get_settings()
    provider_router = ProviderRouter(settings=settings)
    return SongService(provider_router=provider_router)


@router.post("/generate", response_model=GenerateResponse)
def generate_song(payload: GenerateRequest) -> GenerateResponse:
    service = get_song_service()
    return service.generate(payload)


@router.post("/extend", response_model=ExtendResponse)
def extend_song(payload: ExtendRequest) -> ExtendResponse:
    service = get_song_service()
    return service.extend(payload)


@router.get("/providers", response_model=ProvidersResponse)
def get_providers() -> ProvidersResponse:
    service = get_song_service()
    provider_router = service.provider_router
    return ProvidersResponse(
        configured=provider_router.configured,
        defaultProvider=provider_router.default_provider,
        autoOrder=provider_router.auto_order,
    )
