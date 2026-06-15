"""Central configuration loaded from environment."""
from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_LLM_MODEL: str = os.getenv("GROQ_LLM_MODEL", "llama-3.3-70b-versatile")
    GROQ_ASR_MODEL: str = os.getenv("GROQ_ASR_MODEL", "whisper-large-v3")
    GROQ_VISION_MODEL: str = os.getenv(
        "GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct"
    )

    MOSS_PROJECT_ID: str = os.getenv("MOSS_PROJECT_ID", "")
    MOSS_PROJECT_KEY: str = os.getenv("MOSS_PROJECT_KEY", "")

    PORT: int = int(os.getenv("PORT", "8000"))
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if o.strip()
    ]

    @staticmethod
    def _real(value: str) -> bool:
        """True only if the env var is set to a real value (not blank/placeholder)."""
        return bool(value) and "your_" not in value and "_here" not in value

    @property
    def moss_enabled(self) -> bool:
        return self._real(self.MOSS_PROJECT_ID) and self._real(self.MOSS_PROJECT_KEY)

    @property
    def groq_enabled(self) -> bool:
        return self._real(self.GROQ_API_KEY)


settings = Settings()
