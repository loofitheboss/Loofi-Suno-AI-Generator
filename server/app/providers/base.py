from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.models.schemas import GenerateRequest


@dataclass
class ProviderResult:
    provider_name: str
    model_name: str


@dataclass
class GenerateProviderResult(ProviderResult):
    title: str
    style: str
    lyrics: str
    explanation: str


@dataclass
class ExtendProviderResult(ProviderResult):
    added_lyrics: str


class ProviderError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class BaseLlmProvider(ABC):
    provider_name: str

    @abstractmethod
    def generate_pack(self, payload: GenerateRequest) -> GenerateProviderResult:
        raise NotImplementedError

    @abstractmethod
    def extend_lyrics(
        self, current_lyrics: str, topic: str, style: str, language: str
    ) -> ExtendProviderResult:
        raise NotImplementedError
