from app.models.schemas import GenerateRequest


FIDELITY_TOKENS = ["44.1kHz", "Wide Stereo", "Clean Mix"]

STRUCTURE_GUIDE = {
    "Auto": "Choose a structure that best fits the topic and genre.",
    "Standard": "Use: [Intro] -> [Verse] -> [Chorus] -> [Verse 2] -> [Bridge] -> [Chorus] -> [Outro].",
    "Pop": "Use: [Intro] -> [Verse] -> [Pre-Chorus] -> [Chorus] -> [Verse 2] -> [Bridge] -> [Chorus] -> [Outro].",
    "Rap": "Use: [Intro] -> [Hook] -> [Verse] -> [Hook] -> [Verse 2] -> [Outro].",
    "Ambient": "Use a smooth linear flow with sparse sections and mostly atmospheric progression.",
    "Custom": "Create a structure that best matches the concept while keeping section labels explicit.",
}

INSTRUMENT_HINTS = [
    "guitar",
    "piano",
    "drums",
    "bass",
    "synth",
    "violin",
    "cello",
    "sax",
    "trumpet",
    "flute",
    "808",
    "organ",
    "harp",
]

GENRE_INSTRUMENT_FALLBACK = {
    "synthwave": ["Analog Synth", "Gated Drums"],
    "pop": ["Bright Synth", "Punchy Drums"],
    "rock": ["Electric Guitar", "Live Drums"],
    "rap": ["808 Bass", "Trap Hats"],
    "ambient": ["Atmospheric Pads", "Soft Piano"],
    "jazz": ["Upright Bass", "Brush Drums"],
}


def _first_non_empty(*values: str) -> str | None:
    for value in values:
        candidate = (value or "").strip()
        if candidate:
            return candidate
    return None


def _infer_energy(payload: GenerateRequest) -> str:
    tempo = (payload.tempo or "").lower()
    if "slow" in tempo or "70" in tempo or "80" in tempo:
        return "Low Energy"
    if "fast" in tempo or "140" in tempo or "160" in tempo:
        return "High Energy"
    if "120" in tempo or "driving" in tempo:
        return "Driving Energy"
    if (payload.mood or "").lower() in {"calm", "sad", "melancholic", "dreamy"}:
        return "Low Energy"
    return "Balanced Energy"


def _extract_instruments(style_text: str) -> list[str]:
    tokens = [part.strip() for part in style_text.split(",") if part.strip()]
    matches: list[str] = []
    for token in tokens:
        lowered = token.lower()
        if any(hint in lowered for hint in INSTRUMENT_HINTS):
            matches.append(token)
    return matches


def _fallback_instruments(payload: GenerateRequest) -> list[str]:
    genre = (payload.genre or "").strip().lower()
    for key, values in GENRE_INSTRUMENT_FALLBACK.items():
        if key in genre:
            return values
    return ["Core Drums", "Core Bass"]


def _dedupe(tokens: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for token in tokens:
        normalized = token.strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        ordered.append(normalized)
    return ordered


def sanitize_style_prompt(style: str, payload: GenerateRequest) -> str:
    raw_tokens = [part.strip() for part in (style or "").split(",") if part.strip()]
    extracted_instruments = _extract_instruments(style)
    fallback_instruments = _fallback_instruments(payload)
    instruments = (extracted_instruments + fallback_instruments)[:2]

    mood = (
        _first_non_empty(payload.mood, raw_tokens[0] if raw_tokens else "")
        or "Cinematic"
    )
    energy = _infer_energy(payload)
    vocal = (
        "Instrumental Arrangement"
        if payload.isInstrumental
        else _first_non_empty(payload.voice, "Expressive Vocals")
    )
    genre = _first_non_empty(payload.genre, "Genre Fusion")

    leading = [mood, energy, *instruments, vocal or "Expressive Vocals", genre]
    remaining = [
        token
        for token in raw_tokens
        if token.lower() not in {item.lower() for item in leading}
        and token.lower() not in {item.lower() for item in FIDELITY_TOKENS}
    ]

    ordered = _dedupe([*leading, *remaining, *FIDELITY_TOKENS])

    style_prompt = ", ".join(ordered)
    while len(style_prompt) > 200 and remaining:
        remaining.pop()
        ordered = _dedupe([*leading, *remaining, *FIDELITY_TOKENS])
        style_prompt = ", ".join(ordered)

    if len(style_prompt) > 200:
        minimal = _dedupe([*leading[:5], *FIDELITY_TOKENS])
        style_prompt = ", ".join(minimal)

    return style_prompt[:200].rstrip(", ")


def build_generation_messages(payload: GenerateRequest) -> tuple[str, str]:
    weirdness = (
        f"Weirdness: {payload.weirdness}."
        if payload.weirdness is not None
        else "Weirdness: choose automatically based on genre."
    )
    style_influence = (
        f"Style influence: {payload.styleInfluence}."
        if payload.styleInfluence is not None
        else "Style influence: choose automatically based on genre and topic."
    )

    system_instruction = (
        "You are a senior Suno v5 producer and lyricist. "
        "Return ONLY valid JSON with keys: title, style, lyrics, explanation. "
        "All values must be non-empty strings. "
        "The style string must be tag-based and <= 200 characters. "
        "Use top-loaded style ordering: [Mood], [Energy], [2 core instruments], "
        "[Vocal identity], [Genre], then fidelity tokens. "
        "Always include fidelity tokens: 44.1kHz, Wide Stereo, Clean Mix. "
        "If instrumental is true, do not create sung lyrics. Return [Instrumental] and optional arrangement tags. "
        "If non-English language requested, include explicit language tag in lyrics headers when helpful."
    )

    structure_plan = STRUCTURE_GUIDE.get(payload.structure, STRUCTURE_GUIDE["Auto"])

    user_prompt = (
        f"Topic: {payload.topic}\n"
        f"Genre base: {payload.genre or 'Any'}\n"
        f"Mood: {payload.mood or 'Any'}\n"
        f"Voice: {payload.voice}\n"
        f"Tempo: {payload.tempo or 'Any'}\n"
        f"Structure: {payload.structure}\n"
        f"Language: {payload.language}\n"
        f"Instrumental: {payload.isInstrumental}\n"
        f"{weirdness}\n"
        f"{style_influence}\n"
        f"Structure plan: {structure_plan}\n"
        "Write natural, concise sections with Suno metatags like [Intro], [Verse], [Chorus], [Bridge], [Outro]."
    )

    return system_instruction, user_prompt


def build_extend_messages(
    current_lyrics: str, topic: str, style: str, language: str
) -> tuple[str, str]:
    system_instruction = (
        "You extend Suno-ready lyrics. Return plain text only, no markdown fences. "
        "Return only NEW lines with section tags. Do not repeat existing lines."
    )

    user_prompt = (
        "Extend these lyrics with one additional coherent section.\n\n"
        f"Topic: {topic}\n"
        f"Style: {style or 'Any'}\n"
        f"Language: {language}\n\n"
        f"Current lyrics:\n{current_lyrics}"
    )

    return system_instruction, user_prompt
