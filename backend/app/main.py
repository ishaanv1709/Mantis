"""Mantis AI backend, Moss + LangGraph-style agent + Groq."""
from __future__ import annotations

import base64
import json
import logging
from typing import AsyncGenerator, Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .config import settings
from .agent import diagnose, autocomplete
from .groq_service import groq_service
from .moss_service import moss_service
from .ingestion import parse_pdf_bytes, build_documents, build_documents_from_text
from .seed import seed_demo_products

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Mantis AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup():
    try:
        await moss_service.cleanup_legacy_indexes()
        await seed_demo_products()
    except Exception as e:  # noqa: BLE001
        logging.warning("Demo seeding skipped: %s", e)


@app.get("/")
async def root():
    return {
        "status": "Mantis AI backend running",
        "moss_enabled": moss_service.enabled,
        "groq_enabled": groq_service.enabled,
        "llm_model": settings.GROQ_LLM_MODEL,
        "asr_model": settings.GROQ_ASR_MODEL,
    }


# ---- Chat (SSE streaming) -----------------------------------------------

class Msg(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    product_id: str
    product_name: str = "this product"
    history: list[Msg] = []


@app.post("/api/chat")
async def chat(req: ChatRequest):
    async def gen() -> AsyncGenerator[str, None]:
        yield f"data: {json.dumps({'type': 'status', 'message': 'Investigating the manual...'})}\n\n"
        result = await diagnose(
            req.product_id,
            req.product_name,
            req.message,
            [m.model_dump() for m in req.history],
        )
        payload = {
            "type": "answer",
            "reply": result.get("reply", ""),
            "needs_clarification": result.get("needs_clarification", False),
            "clarifying_question": result.get("clarifying_question", ""),
            "probable_cause": result.get("probable_cause", ""),
            "difficulty": result.get("difficulty", 0),
            "difficulty_label": result.get("difficulty_label", ""),
            "safety_warning": result.get("safety_warning", ""),
            "spare_parts": result.get("spare_parts", []),
            "citations": result.get("citations", []),
            "resolved_guess": result.get("resolved_guess", False),
            "retrieval": result.get("_retrieval", []),
        }
        yield f"data: {json.dumps(payload)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


# ---- Autocomplete --------------------------------------------------------

class AutocompleteRequest(BaseModel):
    product_id: str
    partial: str


@app.post("/api/autocomplete")
async def autocomplete_route(req: AutocompleteRequest):
    return {"suggestions": await autocomplete(req.product_id, req.partial)}


# ---- Transcription (Whisper) --------------------------------------------

@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...), language: Optional[str] = Form(None)):
    if not groq_service.enabled:
        raise HTTPException(503, "ASR unavailable: set GROQ_API_KEY")
    data = await file.read()
    text = groq_service.transcribe(data, filename=file.filename or "audio.webm", language=language)
    return {"text": text}


# ---- Vision (image troubleshooting) -------------------------------------

class VisionRequest(BaseModel):
    image_data_url: str
    product_name: str = "the product"
    note: str = ""


@app.post("/api/vision")
async def vision(req: VisionRequest):
    if not groq_service.enabled:
        raise HTTPException(503, "Vision unavailable: set GROQ_API_KEY")
    prompt = (
        f"You are a repair technician looking at a photo related to {req.product_name}. "
        f"Describe what you see (error screens, warning lights, damaged parts, model/serial labels). "
        f"Extract any visible error codes or model numbers. {req.note}"
    )
    desc = await groq_service.vision_describe(req.image_data_url, prompt)
    return {"description": desc}


# ---- Manual ingestion ----------------------------------------------------

@app.post("/api/upload_manual")
async def upload_manual(
    file: UploadFile = File(...),
    product_id: str = Form(...),
    model_variant: str = Form(""),
):
    data = await file.read()
    name = file.filename or "manual.pdf"
    if name.lower().endswith(".pdf"):
        pages = parse_pdf_bytes(data)
        docs = build_documents(product_id, name, pages, model_variant)
    else:
        docs = build_documents_from_text(product_id, name, data.decode("utf-8", errors="ignore"))
    if not docs:
        raise HTTPException(422, "No text extracted from file")
    res = await moss_service.upsert_product_docs(product_id, docs)
    return {"filename": name, "chunks": len(docs), **res}


class IngestTextRequest(BaseModel):
    product_id: str
    source: str = "notes"
    text: str


@app.post("/api/ingest_text")
async def ingest_text(req: IngestTextRequest):
    docs = build_documents_from_text(req.product_id, req.source, req.text)
    res = await moss_service.upsert_product_docs(req.product_id, docs)
    return {"chunks": len(docs), **res}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
