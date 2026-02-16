from app.models.schemas import GenerateRequest
from app.services.prompt_builder import build_generation_messages, sanitize_style_prompt


def test_sanitize_style_prompt_enforces_fidelity_and_length() -> None:
    payload = GenerateRequest(
        topic="Night drive",
        genre="Synthwave",
        mood="Melancholic",
        voice="Female",
        tempo="110 BPM",
    )
    style = sanitize_style_prompt(
        "Synthwave, analog synth, gated drums, giant atmospheric pads, very long extra token, another extra token, another token",
        payload,
    )
    assert "44.1kHz" in style
    assert "Wide Stereo" in style
    assert "Clean Mix" in style
    assert len(style) <= 200


def test_build_generation_messages_contains_structure_plan() -> None:
    payload = GenerateRequest(topic="Rain story", structure="Pop")
    system_instruction, user_prompt = build_generation_messages(payload)
    assert "top-loaded style ordering" in system_instruction
    assert "Structure plan:" in user_prompt
    assert "[Pre-Chorus]" in user_prompt
