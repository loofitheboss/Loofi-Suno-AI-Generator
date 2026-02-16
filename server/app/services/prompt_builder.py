from app.models.schemas import GenerateRequest


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
        "The style string must be tag-based and <= 200 characters. "
        "Use top-loaded style ordering: [Mood], [Energy], [2 core instruments], "
        "[Vocal identity], [Genre], then fidelity tokens. "
        "Always include fidelity tokens: 44.1kHz, Wide Stereo, Clean Mix. "
        "If instrumental is true, do not create sung lyrics. Return [Instrumental] and optional arrangement tags. "
        "If non-English language requested, include explicit language tag in lyrics headers when helpful."
    )

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
