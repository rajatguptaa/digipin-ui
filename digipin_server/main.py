"""
FastAPI backend for DIGIPIN AI features.

The structure mirrors the TravelBuddy AI server by exposing both agent-powered
and deterministic geo endpoints that the React app can consume.
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# Ensure package path is available (repo root / digipin_agent/src)
ROOT_DIR = Path(__file__).resolve().parent.parent
AGENT_SRC = ROOT_DIR / "digipin_agent" / "src"
if str(AGENT_SRC) not in sys.path:
    sys.path.insert(0, str(AGENT_SRC))

try:
    from digipin_agent import (
        DigiPinValidationError,
        GeminiDigipinAgent,
        decode_digipin,
        encode_coordinates,
        get_distance_summary,
        nearest_pin,
    )

    AGENT_IMPORT_ERROR: Optional[Exception] = None
except Exception as exc:  # pragma: no cover - defensive
    AGENT_IMPORT_ERROR = exc
    DigiPinValidationError = Exception  # type: ignore
    GeminiDigipinAgent = None  # type: ignore
    decode_digipin = encode_coordinates = get_distance_summary = nearest_pin = None  # type: ignore

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)
logger = logging.getLogger("digipin-server")

app = FastAPI(
    title="DIGIPIN AI API",
    description="AI-assisted geo utilities built with Gemini function calling",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class EncodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class DecodeRequest(BaseModel):
    pin: str = Field(..., min_length=6)


class DistanceRequest(BaseModel):
    start_pin: str
    end_pin: str


class NearestRequest(BaseModel):
    reference_pin: str
    candidates: List[str]

    @field_validator("candidates")
    @classmethod
    def ensure_candidates(cls, value: List[str]) -> List[str]:
        if not value:
            raise ValueError("Provide at least one candidate DIGIPIN")
        return value



class EncodeResponse(BaseModel):
    pin: str


class DecodeResponse(BaseModel):
    latitude: float
    longitude: float


class DistanceResponse(BaseModel):
    distance_meters: float
    start_pin: str
    end_pin: str


class NearestResponse(BaseModel):
    nearest: str


class AgentPrompt(BaseModel):
    message: str = Field(..., min_length=1)
    context: Optional[Dict[str, Any]] = None


def _initialise_agent() -> Optional[GeminiDigipinAgent]:
    if GeminiDigipinAgent is None:
        logger.warning("GeminiDigipinAgent import failed: %s", AGENT_IMPORT_ERROR)
        return None
    try:
        return GeminiDigipinAgent()
    except ValueError as exc:
        logger.warning("GeminiDigipinAgent not configured: %s", exc)
        return None
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Unexpected error initialising agent: %s", exc)
        return None


agent_instance = _initialise_agent()


@app.get("/health")
async def health() -> Dict[str, Any]:
    """Simple health check."""
    return {
        "status": "ok",
        "agent_ready": agent_instance is not None,
    }


@app.post("/api/digipin/encode", response_model=EncodeResponse)
async def api_encode(payload: EncodeRequest) -> EncodeResponse:
    try:
        pin = encode_coordinates(payload.latitude, payload.longitude)
        return EncodeResponse(pin=pin)
    except DigiPinValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/digipin/decode", response_model=DecodeResponse)
async def api_decode(payload: DecodeRequest) -> DecodeResponse:
    try:
        decoded = decode_digipin(payload.pin)
        return DecodeResponse(**decoded.model_dump())
    except DigiPinValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/digipin/distance", response_model=DistanceResponse)
async def api_distance(payload: DistanceRequest) -> Dict[str, Any]:
    try:
        # get_distance_summary returns a dict, we can let Pydantic validate it or wrap it
        result = get_distance_summary(payload.start_pin, payload.end_pin)
        return result
    except DigiPinValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/digipin/nearest", response_model=NearestResponse)
async def api_nearest(payload: NearestRequest) -> NearestResponse:
    try:
        closest = nearest_pin(payload.reference_pin, payload.candidates)
        return NearestResponse(nearest=closest)
    except DigiPinValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/agent/respond")
async def api_agent_respond(prompt: AgentPrompt) -> Dict[str, Any]:
    if agent_instance is None:
        raise HTTPException(
            status_code=503,
            detail="GeminiDigipinAgent not initialised. Set GEMINI_API_KEY to enable AI responses.",
        )

    result = await agent_instance.respond(prompt.message, prompt.context)
    return result


def main() -> None:  # pragma: no cover - manual entrypoint
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8080")),
        reload=os.getenv("DEBUG", "false").lower() == "true",
    )


if __name__ == "__main__":  # pragma: no cover
    main()
