# API Reference

Base URL:

- Local dev backend: `http://localhost:8000`
- Docker app: `http://localhost:8000`

All endpoints are JSON unless noted.

## GET /api/health

Health check endpoint.

Response:

```json
{
  "status": "ok"
}
```

## GET /api/song/providers

Returns configured providers and routing defaults.

Response example:

```json
{
  "configured": ["gemini", "openai"],
  "defaultProvider": "auto",
  "autoOrder": ["gemini", "openai"]
}
```

## POST /api/song/generate

Generates a complete song package.

Request body:

```json
{
  "topic": "A city at night after the rain",
  "genre": "Synthwave",
  "mood": "Melancholic",
  "voice": "Female",
  "tempo": "110 BPM",
  "structure": "Pop",
  "language": "English",
  "isInstrumental": false,
  "provider": "auto",
  "weirdness": 45,
  "styleInfluence": 70
}
```

Response body:

```json
{
  "title": "Neon Rain",
  "style": "Melancholic, driving, analog synth, gated drums, female vocals, synthwave, 44.1kHz, Wide Stereo, Clean Mix",
  "lyrics": "[Verse]\n...",
  "explanation": "...",
  "providerUsed": "gemini",
  "modelUsed": "gemini-2.0-flash"
}
```

## POST /api/song/extend

Extends existing lyrics with a new section.

Request body:

```json
{
  "currentLyrics": "[Verse]\n...",
  "topic": "A city at night after the rain",
  "style": "Melancholic, synthwave",
  "language": "English",
  "provider": "auto"
}
```

Response body:

```json
{
  "addedLyrics": "[Bridge]\n...",
  "providerUsed": "openai",
  "modelUsed": "gpt-4.1-mini"
}
```

## Error Format

When request fails, backend returns FastAPI error format with `detail`.

Example:

```json
{
  "detail": "No available provider could generate content. gemini: Provider 'gemini' is not configured"
}
```
