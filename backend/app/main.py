from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

# Fail fast at startup if required settings (e.g. ANTHROPIC_API_KEY) are missing,
# rather than surfacing a confusing error on the first photo upload.
get_settings()

app = FastAPI(title="Calorie Tracker API")

app.add_middleware(
    CORSMiddleware,
    # Vite's dev port drifts (5173, 5174, ...) when the default is taken, so match
    # any localhost port rather than hardcoding one. In normal dev usage this isn't
    # even exercised, since Vite's server.proxy forwards /api same-origin — this is
    # for direct/non-proxied requests (e.g. hitting :8000 or the Swagger UI).
    allow_origin_regex=r"http://localhost:\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
