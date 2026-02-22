import logging
import os
from pathlib import Path
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes.health import router as health_router
from app.api.routes.song import router as song_router
from app.core.logging import setup_logging


setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Loofi Suno AI Generator API", version="1.0.0")

configured_origins = os.getenv("SUNO_CORS_ORIGINS", "").strip()
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.3:5173",
]
allowed_origins = [
    origin.strip() for origin in configured_origins.split(",") if origin.strip()
] or default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(song_router)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or uuid4().hex
    request.state.request_id = request_id
    start = perf_counter()
    response = await call_next(request)
    duration_ms = (perf_counter() - start) * 1000
    response.headers["x-request-id"] = request_id
    logger.info(
        "request_complete",
        extra={
            "event": "request_complete",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": round(duration_ms, 2),
        },
    )
    return response


project_root = Path(__file__).resolve().parents[2]
dist_dir = project_root / "dist"

if dist_dir.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=dist_dir / "assets"),
        name="assets",
    )

    @app.get("/")
    def serve_index() -> FileResponse:
        return FileResponse(dist_dir / "index.html")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str) -> FileResponse:
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = dist_dir / full_path
        if candidate.exists() and candidate.is_file():
            return FileResponse(candidate)
        root_candidate = project_root / full_path
        if root_candidate.exists() and root_candidate.is_file():
            return FileResponse(root_candidate)
        return FileResponse(dist_dir / "index.html")
