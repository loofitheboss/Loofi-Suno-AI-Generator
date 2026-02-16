import json

from openai import OpenAI

from app.models.schemas import GenerateRequest
from app.providers.base import (
    BaseLlmProvider,
    ExtendProviderResult,
    GenerateProviderResult,
    ProviderErrorCode,
    ProviderError,
    classify_exception,
)
from app.services.prompt_builder import build_extend_messages, build_generation_messages


class OpenAiProvider(BaseLlmProvider):
    provider_name = "openai"

    def __init__(self, api_key: str, model_name: str):
        self._client = OpenAI(api_key=api_key)
        self._model_name = model_name

    def generate_pack(self, payload: GenerateRequest) -> GenerateProviderResult:
        system_instruction, user_prompt = build_generation_messages(payload)
        try:
            response = self._client.chat.completions.create(
                model=self._model_name,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt},
                ],
            )
            text = response.choices[0].message.content or "{}"
            if text == "{}":
                raise ProviderError(
                    "OpenAI returned an empty JSON response.",
                    code=ProviderErrorCode.INVALID_RESPONSE,
                    retryable=True,
                )
            parsed = json.loads(text)
            return GenerateProviderResult(
                provider_name=self.provider_name,
                model_name=self._model_name,
                title=str(parsed.get("title", "Untitled")),
                style=str(parsed.get("style", "")),
                lyrics=str(parsed.get("lyrics", "")),
                explanation=str(parsed.get("explanation", "")),
            )
        except json.JSONDecodeError as exc:
            raise ProviderError(
                f"OpenAI returned invalid JSON: {exc}",
                code=ProviderErrorCode.INVALID_RESPONSE,
                retryable=True,
            ) from exc
        except ProviderError:
            raise
        except Exception as exc:  # noqa: BLE001
            code, retryable = classify_exception(exc)
            raise ProviderError(
                f"OpenAI request failed: {exc}",
                code=code,
                retryable=retryable,
            ) from exc

    def extend_lyrics(
        self, current_lyrics: str, topic: str, style: str, language: str
    ) -> ExtendProviderResult:
        system_instruction, user_prompt = build_extend_messages(
            current_lyrics, topic, style, language
        )
        try:
            response = self._client.chat.completions.create(
                model=self._model_name,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt},
                ],
            )
            text = (response.choices[0].message.content or "").strip()
            return ExtendProviderResult(
                provider_name=self.provider_name,
                model_name=self._model_name,
                added_lyrics=text,
            )
        except ProviderError:
            raise
        except Exception as exc:  # noqa: BLE001
            code, retryable = classify_exception(exc)
            raise ProviderError(
                f"OpenAI extend failed: {exc}",
                code=code,
                retryable=retryable,
            ) from exc
