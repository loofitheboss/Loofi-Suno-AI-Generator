from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum

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


class ProviderErrorCode(str, Enum):
    CONFIGURATION = "configuration"
    AUTH = "auth"
    QUOTA = "quota"
    RATE_LIMIT = "rate_limit"
    TIMEOUT = "timeout"
    NETWORK = "network"
    INVALID_RESPONSE = "invalid_response"
    UNKNOWN = "unknown"


class ProviderError(Exception):
    def __init__(
        self,
        message: str,
        code: ProviderErrorCode = ProviderErrorCode.UNKNOWN,
        retryable: bool = False,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.retryable = retryable


def classify_exception(exc: Exception) -> tuple[ProviderErrorCode, bool]:
    text = str(exc).lower()
    if any(
        token in text
        for token in ["unauthorized", "invalid api key", "authentication", "401"]
    ):
        return ProviderErrorCode.AUTH, False
    if any(
        token in text
        for token in ["insufficient", "quota", "credits exhausted", "billing", "402"]
    ):
        return ProviderErrorCode.QUOTA, False
    if any(token in text for token in ["rate limit", "too many requests", "429"]):
        return ProviderErrorCode.RATE_LIMIT, True
    if any(token in text for token in ["timeout", "timed out", "deadline exceeded"]):
        return ProviderErrorCode.TIMEOUT, True
    if any(
        token in text
        for token in ["connection", "network", "dns", "temporary", "502", "503", "504"]
    ):
        return ProviderErrorCode.NETWORK, True
    return ProviderErrorCode.UNKNOWN, False


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
