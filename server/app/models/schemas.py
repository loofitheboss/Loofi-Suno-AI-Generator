from typing import Literal

from pydantic import BaseModel, Field


ProviderName = Literal["auto", "gemini", "openai"]
StructureName = Literal["Auto", "Standard", "Pop", "Rap", "Ambient", "Custom"]


class GenerateRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=500)
    genre: str = ""
    mood: str = ""
    voice: str = "Any"
    tempo: str = ""
    structure: StructureName = "Auto"
    language: str = "English"
    isInstrumental: bool = False
    provider: ProviderName = "auto"
    weirdness: int | None = Field(default=None, ge=0, le=100)
    styleInfluence: int | None = Field(default=None, ge=0, le=100)


class GenerateResponse(BaseModel):
    title: str
    style: str
    lyrics: str
    explanation: str
    providerUsed: ProviderName
    modelUsed: str


class ExtendRequest(BaseModel):
    currentLyrics: str = Field(min_length=1)
    topic: str = Field(min_length=1, max_length=500)
    style: str = ""
    language: str = "English"
    provider: ProviderName = "auto"


class ExtendResponse(BaseModel):
    addedLyrics: str
    providerUsed: ProviderName
    modelUsed: str


class ProvidersResponse(BaseModel):
    configured: list[ProviderName]
    defaultProvider: ProviderName
    autoOrder: list[ProviderName]
