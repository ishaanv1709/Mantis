"""Groq client wrappers: chat (llama-3.3-70b), ASR (whisper-large-v3), vision."""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

from .config import settings

logger = logging.getLogger("mantis.groq")

try:
    from groq import Groq, AsyncGroq  # type: ignore

    _GROQ_IMPORTED = True
except Exception:  # pragma: no cover
    Groq = None  # type: ignore
    AsyncGroq = None  # type: ignore
    _GROQ_IMPORTED = False


class GroqService:
    def __init__(self) -> None:
        self._async: Optional[Any] = None
        self._sync: Optional[Any] = None

    @property
    def enabled(self) -> bool:
        return _GROQ_IMPORTED and settings.groq_enabled

    def _aclient(self):
        if self._async is None and self.enabled:
            self._async = AsyncGroq(api_key=settings.GROQ_API_KEY)
        return self._async

    def _sclient(self):
        if self._sync is None and self.enabled:
            self._sync = Groq(api_key=settings.GROQ_API_KEY)
        return self._sync

    async def chat(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: int = 1024,
        json_mode: bool = False,
    ) -> str:
        if not self.enabled:
            return ""
        client = self._aclient()
        kwargs: dict[str, Any] = {
            "model": settings.GROQ_LLM_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        resp = await client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content or ""

    async def chat_json(self, messages: list[dict], temperature: float = 0.1) -> dict:
        raw = await self.chat(messages, temperature=temperature, json_mode=True)
        if not raw:
            return {}
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("Groq returned non-JSON: %s", raw[:200])
            return {}

    def transcribe(self, audio_bytes: bytes, filename: str = "audio.webm", language: Optional[str] = None) -> str:
        if not self.enabled:
            return ""
        client = self._sclient()
        kwargs: dict[str, Any] = {
            "file": (filename, audio_bytes),
            "model": settings.GROQ_ASR_MODEL,
        }
        if language:
            kwargs["language"] = language
        resp = client.audio.transcriptions.create(**kwargs)
        return getattr(resp, "text", "") or ""

    async def vision_describe(self, image_data_url: str, prompt: str) -> str:
        if not self.enabled:
            return ""
        client = self._aclient()
        resp = await client.chat.completions.create(
            model=settings.GROQ_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                }
            ],
            temperature=0.2,
            max_tokens=512,
        )
        return resp.choices[0].message.content or ""


groq_service = GroqService()
