"""
Moss retrieval service
----------------------
Single shared Moss index ("mantis-kb") with every chunk tagged by product_id in
metadata. Queries scope to a product via a {product_id $eq ...} filter, plus
optional chunk_type filters. This fits Moss's free-tier index limit (one index,
unlimited products) and is the recommended metadata-scoping pattern.

Degrades gracefully to an in-memory keyword fallback (keyed by product_id) when
Moss is unavailable or rate-limited, so the app always responds.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

from .config import settings

logger = logging.getLogger("mantis.moss")

SHARED_INDEX = "mantis-kb"

try:
    from moss import MossClient, DocumentInfo, QueryOptions, MutationOptions  # type: ignore

    _MOSS_IMPORTED = True
except Exception:  # pragma: no cover
    MossClient = None  # type: ignore
    DocumentInfo = dict  # type: ignore
    QueryOptions = None  # type: ignore
    MutationOptions = None  # type: ignore
    _MOSS_IMPORTED = False


class RetrievedChunk:
    __slots__ = ("id", "text", "score", "chunk_type", "source", "page", "metadata")

    def __init__(self, id, text, score, chunk_type, source, page, metadata):
        self.id = id
        self.text = text
        self.score = score
        self.chunk_type = chunk_type
        self.source = source
        self.page = page
        self.metadata = metadata or {}

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "text": self.text,
            "score": round(self.score, 3),
            "chunk_type": self.chunk_type,
            "source": self.source,
            "page": self.page,
        }


class MossService:
    def __init__(self) -> None:
        self._client: Optional[Any] = None
        self._loaded = False
        # Fallback store: product_id -> list[dict]
        self._fallback: dict[str, list[dict]] = {}

    @property
    def enabled(self) -> bool:
        return _MOSS_IMPORTED and settings.moss_enabled

    def _ensure_client(self):
        if self._client is None and self.enabled:
            self._client = MossClient(settings.MOSS_PROJECT_ID, settings.MOSS_PROJECT_KEY)
        return self._client

    async def cleanup_legacy_indexes(self) -> None:
        """Delete stale per-product indexes from older runs to free the quota."""
        if not self.enabled:
            return
        client = self._ensure_client()
        try:
            indexes = await client.list_indexes()
        except Exception:
            return
        for idx in indexes:
            name = getattr(idx, "name", None) or (idx.get("name") if isinstance(idx, dict) else None)
            if name and name != SHARED_INDEX:
                try:
                    await client.delete_index(name)
                    logger.info("Deleted legacy index %s", name)
                except Exception:
                    pass

    # ---- Ingestion -------------------------------------------------------

    async def upsert_product_docs(self, product_id: str, docs: list[dict]) -> dict:
        """docs: [{id, text, metadata}] (metadata must include product_id)."""
        # Always keep a fallback copy so retrieval works even if Moss is down.
        self._fallback[product_id] = docs

        if not self.enabled:
            return {"index": SHARED_INDEX, "doc_count": len(docs), "backend": "fallback"}

        client = self._ensure_client()
        moss_docs = [
            DocumentInfo(id=d["id"], text=d["text"], metadata=d.get("metadata", {}))
            for d in docs
        ]
        try:
            try:
                await client.get_index(SHARED_INDEX)
                await client.add_docs(SHARED_INDEX, moss_docs, MutationOptions(upsert=True))
            except Exception:
                await client.create_index(SHARED_INDEX, moss_docs)
            self._loaded = False
            return {"index": SHARED_INDEX, "doc_count": len(docs), "backend": "moss"}
        except Exception as e:  # noqa: BLE001, rate limit, quota, network
            logger.warning("Moss ingest failed (%s); kept in fallback store", e)
            return {"index": SHARED_INDEX, "doc_count": len(docs), "backend": "fallback"}

    # ---- Loading ---------------------------------------------------------

    async def ensure_loaded(self) -> None:
        if not self.enabled or self._loaded:
            return
        client = self._ensure_client()
        try:
            await client.load_index(SHARED_INDEX)
            self._loaded = True
        except Exception as e:  # noqa: BLE001
            logger.warning("Could not load %s: %s", SHARED_INDEX, e)

    # ---- Querying --------------------------------------------------------

    async def query(
        self,
        product_id: str,
        text: str,
        top_k: int = 5,
        alpha: float = 0.6,
        chunk_type: Optional[str] = None,
        extra_filter: Optional[dict] = None,
    ) -> list[RetrievedChunk]:
        if not self.enabled:
            return self._fallback_query(product_id, text, top_k, chunk_type)

        await self.ensure_loaded()
        client = self._ensure_client()

        # product_id == "__all__" (or empty) searches across every product's docs.
        conditions = []
        if product_id and product_id != "__all__":
            conditions.append({"field": "product_id", "condition": {"$eq": product_id}})
        if chunk_type:
            conditions.append({"field": "chunk_type", "condition": {"$eq": chunk_type}})
        if extra_filter:
            for field, value in extra_filter.items():
                conditions.append({"field": field, "condition": {"$eq": str(value)}})
        filt = {"$and": conditions} if conditions else None

        try:
            result = await client.query(SHARED_INDEX, text, QueryOptions(top_k=top_k, alpha=alpha, filter=filt))
        except Exception as e:  # noqa: BLE001
            logger.warning("Moss query failed (%s); using fallback", e)
            return self._fallback_query(product_id, text, top_k, chunk_type)

        chunks = []
        for d in result.docs:
            md = getattr(d, "metadata", None) or {}
            chunks.append(
                RetrievedChunk(
                    id=d.id,
                    text=d.text,
                    score=float(getattr(d, "score", 0.0)),
                    chunk_type=md.get("chunk_type", "general"),
                    source=md.get("source", "manual"),
                    page=md.get("page", "?"),
                    metadata=md,
                )
            )
        if not chunks:
            # filter may have excluded everything if index lacks this product yet
            return self._fallback_query(product_id, text, top_k, chunk_type)
        return chunks

    def _fallback_query(self, product_id, text, top_k, chunk_type) -> list[RetrievedChunk]:
        if not product_id or product_id == "__all__":
            docs = [d for lst in self._fallback.values() for d in lst]
        else:
            docs = self._fallback.get(product_id, [])
        terms = {t for t in text.lower().split() if len(t) > 2}
        scored = []
        for d in docs:
            md = d.get("metadata", {})
            if chunk_type and md.get("chunk_type") != chunk_type:
                continue
            body = d["text"].lower()
            overlap = sum(1 for t in terms if t in body)
            if overlap:
                scored.append((overlap / max(len(terms), 1), d, md))
        scored.sort(key=lambda x: x[0], reverse=True)
        out = []
        for score, d, md in scored[:top_k]:
            out.append(
                RetrievedChunk(
                    id=d["id"],
                    text=d["text"],
                    score=score,
                    chunk_type=md.get("chunk_type", "general"),
                    source=md.get("source", "manual"),
                    page=md.get("page", "?"),
                    metadata=md,
                )
            )
        return out


moss_service = MossService()
