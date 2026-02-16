# User Guide

This guide is for end users who want to generate songs and lyrics for Suno.

## What This App Does

The app creates a complete Suno-ready package:

- Song title
- Style prompt
- Structured lyrics with Suno tags
- Short strategy note

You can edit results, extend lyrics, and copy content directly into Suno custom mode.

## Before You Start

- The app owner must configure backend provider keys (Gemini and/or OpenAI).
- If no providers are configured, generation will not run.

## Quick Start

1. Open the app.
2. Enter your song topic in the main text area.
3. Optional: open manual settings to choose provider, language, genre, mood, voice, tempo, structure.
4. Click **Generate Song Pack**.
5. Review and edit title, style prompt, and lyrics.
6. Copy style and lyrics into Suno custom mode.

## Main Controls

- `Provider`: `auto`, `gemini`, or `openai`
  - `auto` picks available provider and can fall back automatically.
- `Language`: sets the lyric language preference.
- `Instrumental mode`: avoids lead vocal lyrics and favors instrumental structure.
- `Structure`: influences song section layout.
- `Weirdness`: controls experimental variance.
- `Style Influence`: controls how strictly generated output follows your tags.

## Recommended Workflow with Suno

1. Generate package in this app.
2. Copy **Style Prompt** to Suno “Style of Music”.
3. Copy **Lyrics** to Suno “Lyrics”.
4. In Suno, adjust any final controls and generate.
5. If needed, return and click **Extend** for new lyrical sections.

## Provider Tips

- Use `auto` for reliability.
- If you prefer a specific model behavior, choose `gemini` or `openai` manually.
- Check the output note in the app to see which provider/model was used.

## Common Issues

- "No providers configured on backend": ask the project admin to set keys in `server/.env`.
- Generation failed with provider error: switch provider to `auto` or the other provider.
- Lyrics quality mismatch: refine topic/mood/genre or run generate again.
- Output language drift: explicitly set language and include language hints in topic.

## Privacy and Keys

- API keys are server-side only.
- End users do not enter or store API keys in the browser.
