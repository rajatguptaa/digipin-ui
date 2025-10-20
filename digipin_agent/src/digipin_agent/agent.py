"""Gemini powered DIGIPIN agent, modeled after travelbuddy travel agent."""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Iterable, Optional

try:
    import google.generativeai as genai
    from google.generativeai.types import HarmBlockThreshold, HarmCategory
except ImportError as exc:  # pragma: no cover - optional dependency
    genai = None  # type: ignore
    _import_error = exc  # type: ignore
else:
    _import_error = None

from .geo import (
    DigiPinValidationError,
    decode_digipin,
    encode_coordinates,
    get_distance_summary,
    is_valid_digipin,
    nearest_pin,
)

logger = logging.getLogger(__name__)

SYSTEM_INTRO = (
    "You are DigiPin Navigator, an assistant that specialises in India's DIGIPIN grid system. "
    "You can explain how to encode and decode DIGIPINs, validate codes, compare multiple pins, "
    "and summarise geo insights. Use the provided tools to guarantee factual geo computations."
)


def _normalise_model_name(name: str) -> str:
    """Ensure the Gemini model name uses the full models/... path."""
    if not name:
        return "models/gemini-1.5-flash"
    if name.startswith("models/"):
        return name
    return f"models/{name}"


class GeminiDigipinAgent:
    """Thin wrapper around Gemini with function calling for DIGIPIN workflows."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "models/gemini-1.5-flash"):
        if genai is None:
            raise ImportError(
                "google-generativeai is required for GeminiDigipinAgent. "
                f"Original import error: {_import_error}"
            )

        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

        configured_model = os.getenv("GEMINI_MODEL") or model_name
        normalised_model = _normalise_model_name(configured_model)

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(
            model_name=normalised_model,
            system_instruction=SYSTEM_INTRO,
            generation_config={
                "temperature": 0.5,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 4096,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            },
            tools=[genai.protos.Tool(function_declarations=self._build_function_declarations())],
        )

    def _build_function_declarations(self) -> Iterable[genai.protos.FunctionDeclaration]:
        number_schema = genai.protos.Schema(type=genai.protos.Type.NUMBER)
        string_schema = genai.protos.Schema(type=genai.protos.Type.STRING)
        array_of_strings = genai.protos.Schema(
            type=genai.protos.Type.ARRAY,
            items=string_schema,
            description="List of DIGIPIN codes",
        )

        return [
            genai.protos.FunctionDeclaration(
                name="validate_digipin",
                description="Validate a DIGIPIN code and return status plus hints",
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={"pin": string_schema},
                    required=["pin"],
                ),
            ),
            genai.protos.FunctionDeclaration(
                name="decode_digipin",
                description="Convert DIGIPIN to latitude, longitude and bounding box",
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={"pin": string_schema},
                    required=["pin"],
                ),
            ),
            genai.protos.FunctionDeclaration(
                name="encode_coordinates",
                description="Encode latitude & longitude into a DIGIPIN code",
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "latitude": number_schema,
                        "longitude": number_schema,
                    },
                    required=["latitude", "longitude"],
                ),
            ),
            genai.protos.FunctionDeclaration(
                name="distance_between",
                description="Calculate aerial distance between two DIGIPIN points",
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "start_pin": string_schema,
                        "end_pin": string_schema,
                    },
                    required=["start_pin", "end_pin"],
                ),
            ),
            genai.protos.FunctionDeclaration(
                name="nearest_digipin",
                description="Find nearest DIGIPIN from a candidate list relative to reference pin",
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "reference_pin": string_schema,
                        "candidates": array_of_strings,
                    },
                    required=["reference_pin", "candidates"],
                ),
            ),
        ]

    async def respond(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Handle a natural language prompt and return structured response."""
        chat = self.model.start_chat()

        payload = message if context is None else json.dumps({"message": message, "context": context})
        response = await self._send_message_with_functions(chat, payload)

        text_response = self._extract_text(response) or "I'm sorry, I could not generate a response."
        return {
            "message": message,
            "response": text_response,
        }

    async def _send_message_with_functions(self, chat, prompt: str):
        response = chat.send_message(prompt)
        while True:
            parts = getattr(response, "parts", None)
            if not parts:
                break
            function_call = next(
                (getattr(part, "function_call", None) for part in parts if getattr(part, "function_call", None)),
                None,
            )
            if not function_call:
                break

            result = await self._execute_function_call(function_call)
            function_response = genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name=function_call.name,
                    response={"result": result},
                )
            )
            response = chat.send_message([function_response])
        return response

    @staticmethod
    def _extract_text(response) -> str:
        """Robustly gather text from Gemini response parts."""
        if response is None:
            return ""

        # Try structured candidates first to avoid ValueError when parts are function calls
        texts: list[str] = []
        for candidate in getattr(response, "candidates", []) or []:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            for part in getattr(content, "parts", []) or []:
                part_text = getattr(part, "text", None)
                if part_text:
                    texts.append(part_text)

        if texts:
            return "\n".join(texts).strip()

        # Fallback to response.text (may raise ValueError if function_call only)
        try:
            text_attr = getattr(response, "text", "")
        except ValueError:
            return ""
        return (text_attr or "").strip()

    async def _execute_function_call(self, function_call) -> Dict[str, Any]:
        name = function_call.name
        args = dict(function_call.args)

        try:
            if name == "validate_digipin":
                pin = args.get("pin", "")
                valid = is_valid_digipin(pin)
                return {
                    "pin": pin,
                    "is_valid": valid,
                    "message": "Valid DIGIPIN." if valid else "DIGIPIN is invalid or outside coverage.",
                }

            if name == "decode_digipin":
                decoded = decode_digipin(args["pin"])
                return decoded.model_dump()

            if name == "encode_coordinates":
                pin = encode_coordinates(float(args["latitude"]), float(args["longitude"]))
                return {"pin": pin}

            if name == "distance_between":
                summary = get_distance_summary(args["start_pin"], args["end_pin"])
                return summary

            if name == "nearest_digipin":
                reference = args["reference_pin"]
                candidates = args.get("candidates") or []
                if isinstance(candidates, (list, tuple)):
                    candidate_list = list(candidates)
                else:
                    candidate_list = [c.strip() for c in str(candidates).split(",") if c.strip()]
                closest = nearest_pin(reference, candidate_list)
                return {"nearest": closest}

        except DigiPinValidationError as exc:
            logger.warning("DIGIPIN validation error: %s", exc)
            return {"error": str(exc)}
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Failed executing %s: %s", name, exc)
            return {"error": f"{name} failed: {exc}"}

        return {"error": f"Unknown function: {name}"}
