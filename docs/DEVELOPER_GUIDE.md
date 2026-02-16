# Developer Guide

This guide explains how to develop, run, and release the Loofi Suno AI Generator.

## Stack Overview

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: FastAPI (Python)
- LLM providers: Gemini, OpenAI, or auto-fallback routing
- Container: Docker multi-stage build
- CI/CD: GitHub Actions for container publish and release notes

## Repository Structure

```text
.
├── src/                      # Frontend app
├── server/                   # FastAPI backend
│   └── app/
│       ├── api/routes/       # HTTP routes
│       ├── models/           # Pydantic schemas
│       ├── providers/        # Gemini/OpenAI adapters and router
│       ├── services/         # Prompt construction and orchestration
│       └── core/             # App settings
├── docs/                     # Project documentation
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/        # CI/CD workflows
```

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- At least one provider key (Gemini or OpenAI)

### Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Create backend env file:

```bash
cp .env.example server/.env
```

3. Install Python dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
```

4. Run backend:

```bash
npm run dev:server
```

5. Run frontend:

```bash
npm run dev:client
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

## Environment Variables

Configured in `server/.env`:

- `GEMINI_API_KEY`: Gemini API key (optional if OpenAI key present)
- `OPENAI_API_KEY`: OpenAI API key (optional if Gemini key present)
- `DEFAULT_LLM_PROVIDER`: `auto`, `gemini`, or `openai`
- `AUTO_PROVIDER_ORDER`: fallback order, e.g. `gemini,openai`
- `GEMINI_MODEL`: default Gemini model
- `OPENAI_MODEL`: default OpenAI model

## Backend API

- `GET /api/health`
- `GET /api/song/providers`
- `POST /api/song/generate`
- `POST /api/song/extend`

See `docs/API_REFERENCE.md` for request/response contracts.

## Provider Routing Logic

- If request provider is `gemini` or `openai`, backend uses only that provider.
- If request provider is `auto`, backend uses `AUTO_PROVIDER_ORDER` and falls back if one provider fails.
- Backend returns `providerUsed` and `modelUsed` in responses.

## Frontend Notes

- Frontend talks to backend via `src/services/songApiService.ts`.
- Vite dev proxy routes `/api` to backend (`vite.config.ts`).
- API keys are never stored in browser local storage.

## Build and Packaging

## Tests

Run backend tests locally:

```bash
pip install -r server/requirements-dev.txt
PYTHONPATH=server pytest server/tests -q
```

### Frontend build

```bash
npm run build
```

### Docker local run

```bash
docker compose up --build
```

App becomes available at `http://localhost:8000`.

## CI/CD Workflows

### Container publish

Workflow: `.github/workflows/docker-image.yml`

- PR to `main`: build validation only
- Push to `main`: build and publish GHCR image
- Tag `v*`: build and publish versioned GHCR image
- Platforms: `linux/amd64`, `linux/arm64`

### Release notes

Workflow: `.github/workflows/release-notes.yml`

- Trigger: push tag matching `v*`
- Creates GitHub Release with auto notes and GHCR pull commands

## Release Process

1. Ensure `main` is green.
2. Create and push tag:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

3. Confirm workflows completed:
- Docker image published to GHCR
- GitHub Release created

## Troubleshooting for Developers

- `No providers configured`: check `server/.env` keys and restart backend.
- Frontend cannot reach API in dev: verify backend running on port 8000.
- Docker app starts but generation fails: check environment variables in container (`docker compose logs`).
- Workflow fails to push package: verify repo package permissions and GHCR visibility settings.
