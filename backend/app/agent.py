"""
Agentic diagnostic orchestrator
--------------------------------
Implements the diagnostic reasoning loop from the architecture:

  Triage  -> classify intent, extract symptoms, choose metadata filters
  Retrieve-> specialist Moss queries (symptom / procedure / error_code / spec)
  Reason  -> Groq (llama-3.3-70b) forms a grounded hypothesis, asks a clarifying
             question when confidence is low, or concludes with cited steps
  Score   -> DIY repair confidence + safety warning from warning/severity chunks

The loop is stateful across turns via the `history` passed from the API layer.
Falls back to a deterministic, retrieval-only answer when Groq is unavailable.
"""
from __future__ import annotations

import json
from typing import Any, Optional

from .groq_service import groq_service
from .moss_service import moss_service, RetrievedChunk

TRIAGE_SYSTEM = """You are the triage unit of an expert repair technician AI.
Given a user's message about a product problem, output JSON with:
{
  "intent": "diagnose" | "howto" | "spec" | "smalltalk",
  "symptoms": ["short symptom phrases"],
  "error_code": "code if any, else empty",
  "search_queries": ["2-4 focused retrieval queries for the manual"],
  "language": "ISO code of the user's language, e.g. en, es, hi"
}
Only output JSON."""

ANSWER_SYSTEM = """You are Mantis, an expert repair technician for a specific product.
You diagnose problems like a real technician: investigate, eliminate causes, and
guide the user with clear, safe, step-by-step help. You MUST ground every claim in
the provided CONTEXT chunks from the official manual. Never invent part names,
voltages, error codes, or steps that are not supported by the context.

Behave like a technician, not a search engine:
- If you need more information to narrow the cause, ask ONE focused clarifying question.
- Otherwise give the most probable cause and the corrective steps.
- Rate DIY difficulty 1-10 and flag safety risk for high-voltage / complex disassembly.
- Reply in the user's language.
- Never use em dashes. Use commas, periods, or parentheses instead.

Return STRICT JSON:
{
  "reply": "conversational answer (use \\n and numbered steps where helpful)",
  "needs_clarification": true|false,
  "clarifying_question": "the question if needs_clarification else empty",
  "probable_cause": "short phrase or empty",
  "difficulty": 1-10,
  "difficulty_label": "Easy|Moderate|Advanced|Requires Professional",
  "safety_warning": "warning text if risky, else empty",
  "spare_parts": [{"name": "...", "reason": "..."}],
  "citations": [{"source": "...", "page": "...", "quote": "<=120 chars"}],
  "resolved_guess": true|false
}
Only output JSON."""


def _format_context(chunks: list[RetrievedChunk]) -> str:
    lines = []
    for i, c in enumerate(chunks, 1):
        lines.append(
            f"[{i}] (type={c.chunk_type}, source={c.source}, page={c.page})\n{c.text}"
        )
    return "\n\n".join(lines) if lines else "(no manual content found)"


async def triage(message: str) -> dict:
    if not groq_service.enabled:
        return {
            "intent": "diagnose",
            "symptoms": [message[:80]],
            "error_code": "",
            "search_queries": [message],
            "language": "en",
        }
    data = await groq_service.chat_json(
        [
            {"role": "system", "content": TRIAGE_SYSTEM},
            {"role": "user", "content": message},
        ]
    )
    data.setdefault("search_queries", [message])
    data.setdefault("symptoms", [])
    data.setdefault("language", "en")
    data.setdefault("error_code", "")
    data.setdefault("intent", "diagnose")
    return data


async def retrieve(product_id: str, triage_data: dict) -> list[RetrievedChunk]:
    """Run specialist, metadata-filtered queries and merge unique chunks."""
    seen: dict[str, RetrievedChunk] = {}

    async def collect(query: str, chunk_type: Optional[str], top_k: int, extra=None):
        for c in await moss_service.query(
            product_id, query, top_k=top_k, chunk_type=chunk_type, extra_filter=extra
        ):
            if c.id not in seen or c.score > seen[c.id].score:
                seen[c.id] = c

    queries = triage_data.get("search_queries") or []
    # Broad pass
    for q in queries[:3]:
        await collect(q, None, 5)
    # Specialist passes
    if triage_data.get("error_code"):
        await collect(triage_data["error_code"], "error_code", 3)
    for sym in (triage_data.get("symptoms") or [])[:2]:
        await collect(sym, "procedure", 3)
        await collect(sym, "warning", 2)

    ranked = sorted(seen.values(), key=lambda c: c.score, reverse=True)
    return ranked[:8]


def _fallback_answer(message: str, chunks: list[RetrievedChunk]) -> dict:
    if not chunks:
        return {
            "reply": "I couldn't find this in the product manual yet. Could you describe "
            "the symptom in more detail (when it happens, any sounds, lights, or error codes)?",
            "needs_clarification": True,
            "clarifying_question": "When did the issue start, and are there any warning lights or error codes?",
            "probable_cause": "",
            "difficulty": 0,
            "difficulty_label": "",
            "safety_warning": "",
            "spare_parts": [],
            "citations": [],
            "resolved_guess": False,
        }
    has_warning = any(c.chunk_type == "warning" for c in chunks)
    body = "\n\n".join(f"From {c.source} (p.{c.page}): {c.text}" for c in chunks[:3])
    return {
        "reply": f"Here's what the official manual says that's most relevant:\n\n{body}",
        "needs_clarification": False,
        "clarifying_question": "",
        "probable_cause": chunks[0].metadata.get("related_symptom", ""),
        "difficulty": 6 if has_warning else 3,
        "difficulty_label": "Advanced" if has_warning else "Moderate",
        "safety_warning": "This task may involve safety risks, proceed carefully or consult a professional."
        if has_warning
        else "",
        "spare_parts": [],
        "citations": [{"source": c.source, "page": c.page, "quote": c.text[:120]} for c in chunks[:3]],
        "resolved_guess": False,
    }


async def diagnose(
    product_id: str,
    product_name: str,
    message: str,
    history: list[dict] | None = None,
) -> dict:
    history = history or []
    triage_data = await triage(message)
    chunks = await retrieve(product_id, triage_data)

    if not groq_service.enabled:
        result = _fallback_answer(message, chunks)
        result["_retrieval"] = [c.as_dict() for c in chunks]
        result["_triage"] = triage_data
        return result

    context = _format_context(chunks)
    convo = [{"role": "system", "content": ANSWER_SYSTEM.replace("a specific product", product_name)}]
    for h in history[-6:]:
        convo.append({"role": h["role"], "content": h["content"]})
    convo.append(
        {
            "role": "user",
            "content": f"PRODUCT: {product_name}\nUSER LANGUAGE: {triage_data.get('language','en')}\n\n"
            f"CONTEXT FROM MANUAL:\n{context}\n\nUSER MESSAGE: {message}",
        }
    )

    data = await groq_service.chat_json(convo, temperature=0.3)
    if not data or "reply" not in data:
        data = _fallback_answer(message, chunks)

    # Ensure citations exist if we retrieved anything
    if chunks and not data.get("citations"):
        data["citations"] = [
            {"source": c.source, "page": c.page, "quote": c.text[:120]} for c in chunks[:3]
        ]
    data["_retrieval"] = [c.as_dict() for c in chunks]
    data["_triage"] = triage_data
    return data


async def autocomplete(product_id: str, partial: str) -> list[str]:
    """Smart symptom autocomplete: fast Moss query over troubleshooting chunks."""
    if len(partial.strip()) < 3:
        return []
    suggestions: list[str] = []
    seen: set[str] = set()
    for ctype in ("procedure", "faq", None):
        for c in await moss_service.query(product_id, partial, top_k=4, chunk_type=ctype, alpha=0.4):
            first = c.text.strip().split(". ")[0][:90]
            key = first.lower()
            if first and key not in seen:
                seen.add(key)
                suggestions.append(first)
        if len(suggestions) >= 6:
            break
    return suggestions[:6]
