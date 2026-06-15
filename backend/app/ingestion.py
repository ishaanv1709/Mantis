"""
Ingestion pipeline
------------------
PDF / text -> pages -> sentence-aware chunks -> metadata-tagged documents
ready for Moss. Each chunk is tagged with chunk_type (procedure | error_code |
spec | faq | warning | general) and severity heuristics so specialist agents
can filter at query time.
"""
from __future__ import annotations

import re
import uuid
from typing import Optional

try:
    import fitz  # PyMuPDF
except Exception:  # pragma: no cover
    fitz = None

try:
    import nltk
    from nltk.tokenize import sent_tokenize

    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:  # pragma: no cover
        nltk.download("punkt", quiet=True)
    try:
        nltk.data.find("tokenizers/punkt_tab")
    except LookupError:  # pragma: no cover
        try:
            nltk.download("punkt_tab", quiet=True)
        except Exception:
            pass
except Exception:  # pragma: no cover
    def sent_tokenize(text: str) -> list[str]:
        return re.split(r"(?<=[.!?])\s+", text)


WARNING_RE = re.compile(r"\b(warning|caution|danger|hazard|electric shock|high voltage|do not)\b", re.I)
PROCEDURE_RE = re.compile(r"\b(step\s*\d|remove|unscrew|disconnect|replace|reassemble|tighten|insert|press)\b", re.I)
ERROR_RE = re.compile(r"\b(error\s*code|err\s*\d|fault\s*code|e\d{1,3}\b|code\s*[a-z]?\d)\b", re.I)
SPEC_RE = re.compile(r"\b(voltage|capacity|dimensions|weight|rated|specification|model\s*no|wattage|rpm|amp)\b", re.I)
FAQ_RE = re.compile(r"\b(how (do|to)|why does|what is|frequently asked|q:|q\.)\b", re.I)

SYMPTOM_KEYWORDS = {
    "overheating": ["overheat", "too hot", "thermal", "burning smell"],
    "no_power": ["won't turn on", "no power", "dead", "not starting"],
    "noise": ["grinding", "rattling", "noise", "buzzing", "clicking"],
    "leak": ["leak", "dripping", "water on floor"],
    "no_drain": ["won't drain", "not draining", "standing water"],
    "battery": ["battery", "not charging", "drains fast"],
}


def classify_chunk(text: str) -> tuple[str, str]:
    """Return (chunk_type, severity)."""
    if WARNING_RE.search(text):
        return "warning", "high"
    if ERROR_RE.search(text):
        return "error_code", "medium"
    if PROCEDURE_RE.search(text):
        return "procedure", "medium"
    if SPEC_RE.search(text):
        return "spec", "low"
    if FAQ_RE.search(text):
        return "faq", "low"
    return "general", "low"


def related_symptom(text: str) -> Optional[str]:
    low = text.lower()
    for symptom, kws in SYMPTOM_KEYWORDS.items():
        if any(k in low for k in kws):
            return symptom
    return None


def chunk_text(text: str, chunk_size_words: int = 220, overlap_sentences: int = 1) -> list[str]:
    sentences = [s.strip() for s in sent_tokenize(text) if s.strip()]
    if not sentences:
        return []
    chunks: list[str] = []
    i = 0
    while i < len(sentences):
        buf: list[str] = []
        words = 0
        start = i
        while i < len(sentences):
            wc = len(sentences[i].split())
            if buf and words + wc > chunk_size_words:
                break
            buf.append(sentences[i])
            words += wc
            i += 1
        chunks.append(" ".join(buf))
        if i < len(sentences):
            i = max(i - overlap_sentences, start + 1)
    return chunks


def parse_pdf_bytes(data: bytes) -> list[dict]:
    """Return [{page, text}]."""
    if fitz is None:
        raise RuntimeError("PyMuPDF not installed")
    pages = []
    doc = fitz.open(stream=data, filetype="pdf")
    try:
        for n, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()
            if text:
                pages.append({"page": n, "text": text})
    finally:
        doc.close()
    return pages


def build_documents(
    product_id: str,
    source_name: str,
    pages: list[dict],
    model_variant: str = "",
) -> list[dict]:
    docs: list[dict] = []
    for p in pages:
        for idx, chunk in enumerate(chunk_text(p["text"])):
            ctype, severity = classify_chunk(chunk)
            metadata = {
                "product_id": product_id,
                "source": source_name,
                "page": str(p["page"]),
                "chunk_type": ctype,
                "severity": severity,
            }
            if model_variant:
                metadata["model_variant"] = model_variant
            symptom = related_symptom(chunk)
            if symptom:
                metadata["related_symptom"] = symptom
            docs.append(
                {
                    "id": f"{product_id}-{source_name}-p{p['page']}-c{idx}-{uuid.uuid4().hex[:6]}",
                    "text": chunk,
                    "metadata": metadata,
                }
            )
    return docs


def build_documents_from_text(product_id: str, source_name: str, text: str) -> list[dict]:
    return build_documents(product_id, source_name, [{"page": 1, "text": text}])
