import json

from google import genai

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
from app.services.prompt_builder import sanitize_style_prompt


def _clean_json(text: str | None) -> str:
    if not text:
        return "{}"
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


class GeminiProvider(BaseLlmProvider):
    provider_name = "gemini"

    def __init__(self, api_key: str, model_name: str):
        self._client = genai.Client(api_key=api_key)
        self._model_name = model_name

    def generate_pack(self, payload: GenerateRequest) -> GenerateProviderResult:
        system_instruction, user_prompt = build_generation_messages(payload)
        for attempt in range(2):
            try:
                response = self._client.models.generate_content(
                    model=self._model_name,
                    contents=user_prompt,
                    config={
                        "system_instruction": system_instruction,
                        "response_mime_type": "application/json",
                    },
                )
                raw_text = response.text
                if not raw_text:
                    raise ProviderError(
                        "Gemini returned an empty response.",
                        code=ProviderErrorCode.INVALID_RESPONSE,
                        retryable=True,
                    )
                parsed = json.loads(_clean_json(raw_text))
                style = sanitize_style_prompt(str(parsed.get("style", "")), payload)
                return GenerateProviderResult(
                    provider_name=self.provider_name,
                    model_name=self._model_name,
                    title=str(parsed.get("title", "Untitled")),
                    style=style,
                    lyrics=str(parsed.get("lyrics", "")),
                    explanation=str(parsed.get("explanation", "")),
                )
            except json.JSONDecodeError as exc:
                if attempt == 0:
                    user_prompt = (
                        user_prompt
                        + "\nIMPORTANT: Previous response had invalid JSON. Return strict JSON object only."
                    )
                    continue
                raise ProviderError(
                    f"Gemini returned invalid JSON: {exc}",
                    code=ProviderErrorCode.INVALID_RESPONSE,
                    retryable=True,
                ) from exc
            except ProviderError as exc:
                if exc.code == ProviderErrorCode.INVALID_RESPONSE and attempt == 0:
                    user_prompt = (
                        user_prompt
                        + "\nIMPORTANT: Previous response was malformed. Return strict JSON object only."
                    )
                    continue
                raise
            except Exception as exc:  # noqa: BLE001
                code, retryable = classify_exception(exc)
                raise ProviderError(
                    f"Gemini request failed: {exc}",
                    code=code,
                    retryable=retryable,
                ) from exc

        raise ProviderError(
            "Gemini request failed after retries.",
            code=ProviderErrorCode.INVALID_RESPONSE,
            retryable=True,
        )

    def extend_lyrics(
        self, current_lyrics: str, topic: str, style: str, language: str
    ) -> ExtendProviderResult:
        system_instruction, user_prompt = build_extend_messages(
            current_lyrics, topic, style, language
        )
        try:
            response = self._client.models.generate_content(
                model=self._model_name,
                contents=user_prompt,
                config={"system_instruction": system_instruction},
            )
            return ExtendProviderResult(
                provider_name=self.provider_name,
                model_name=self._model_name,
                added_lyrics=(response.text or "").strip(),
            )
        except ProviderError:
            raise
        except Exception as exc:  # noqa: BLE001
            code, retryable = classify_exception(exc)
            raise ProviderError(
                f"Gemini extend failed: {exc}",
                code=code,
                retryable=retryable,
            ) from exc
