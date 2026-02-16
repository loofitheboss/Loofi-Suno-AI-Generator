from pathlib import Path

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes.health import router as health_router
from app.api.routes.song import router as song_router


app = FastAPI(title="Loofi Suno AI Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(song_router)


project_root = Path(__file__).resolve().parents[2]
dist_dir = project_root / "dist"

if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=dist_dir / "assets"), name="assets")

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
        return FileResponse(dist_dir / "index.html")
