# DIGIPIN Server

FastAPI backend that mirrors the TravelBuddy AI server conventions while
serving DIGIPIN-specific operations.

## Quick start

```bash
cd digipin_agent
uv venv && source .venv/bin/activate
uv pip install -e .

cd ../digipin_server
uv pip install -r requirements.txt
GEMINI_API_KEY=your-key uvicorn main:app --reload
```

The API exposes:

- `POST /api/digipin/encode` – encode latitude/longitude into DIGIPIN
- `POST /api/digipin/decode` – decode a DIGIPIN to coordinates + bounds
- `POST /api/digipin/distance` – haversine distance between two DIGIPINs
- `POST /api/digipin/nearest` – find closest candidate DIGIPIN
- `POST /api/agent/respond` – free-form Gemini powered assistant that uses the above tools

Docs available at `http://localhost:8080/api/docs`.
