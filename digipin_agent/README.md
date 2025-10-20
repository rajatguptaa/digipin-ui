# DIGIPIN Agent

Python toolkit that mirrors the `travel_planner_agent` design and exposes
Gemini function-calling helpers tailored to DIGIPIN use cases.

The package focuses on:

- Validating and parsing DIGIPIN codes
- Encoding latitude/longitude to DIGIPIN
- Geo-distance utilities (haversine based)
- Structured responses that an LLM can call through function calling

This folder is intended to be installed in editable mode while developing the
FastAPI backend:

```bash
cd digipin_agent
uv venv && source .venv/bin/activate
uv pip install -e .
```

Set `GEMINI_API_KEY` in your environment before using the agent runtime.
Optionally customise the Gemini model with `GEMINI_MODEL` (defaults to `models/gemini-1.5-flash`).
