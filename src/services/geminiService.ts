import { GoogleGenAI } from '@google/genai';
import type { SunoSettings, SunoPack } from '@/types';

let aiClient: GoogleGenAI | null = null;

export const initClient = (apiKey: string) => {
  aiClient = new GoogleGenAI({ apiKey });
};

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    throw new Error('API key not configured. Please set your Gemini API key.');
  }
  return aiClient;
};

/**
 * Clean JSON string from markdown code fences if present
 */
const cleanJson = (text: string | undefined): string => {
  if (!text) return '{}';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

/**
 * Generate a complete Suno song pack: title, style prompt, lyrics, and explanation.
 */
export const generateSunoPack = async (settings: SunoSettings): Promise<SunoPack> => {
  const ai = getClient();

  const inputContext = `
Topic: "${settings.topic}"
Genre Base: "${settings.genre || 'Any'}"
Mood/Vibe: "${settings.mood || 'Any'}"
Voice: "${settings.voice}"
Tempo: "${settings.tempo || 'Any'}"
Structure: "${settings.structure}"
`;

  const systemInstruction = `You are a professional music producer and lyricist specializing in Suno.ai generation.

TASK 1: Create a "Style Prompt" string optimized for Suno V3/V4.
- Use comma-separated tags. NO sentences.
- Order: Genre, Sub-genre, Vibe, Key Instruments, Tempo, Vocal Quality.
- Example: "Dark Synthwave, slow tempo, 80bpm, female vocals, heavy bass, atmospheric, reverb"
- Keep it under 200 characters for best Suno compatibility.

TASK 2: Write Lyrics.
- Use proper Suno meta-tags: [Verse], [Chorus], [Bridge], [Outro], [Instrumental Break], [Intro], [Pre-Chorus], [Hook].
- If "Instrumental" is requested in Voice, return only [Instrumental] tag or minimal ad-libs.
- Ensure structure matches the requested type (${settings.structure}).
- Write compelling, creative lyrics that match the topic and mood.
- Aim for 2-3 minutes of song content.

TASK 3: Create a catchy, memorable Title.

TASK 4: Write a brief Explanation of the creative choices made.

Output ONLY valid JSON: { "title": string, "style": string, "lyrics": string, "explanation": string }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Generate a complete song package based on:\n${inputContext}`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(cleanJson(response.text)) as SunoPack;
};

/**
 * Extend existing lyrics with a new section (Verse 2, Bridge, Outro, etc.)
 */
export const extendSunoLyrics = async (
  currentLyrics: string,
  topic: string,
  style: string,
): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Extend these song lyrics with a new section (e.g. Verse 2, Bridge, or Outro) that fits the flow.

Current Lyrics:
"${currentLyrics}"

Context:
Topic: ${topic}
Style: ${style}

Return ONLY the new added lines with their [Tags]. Do not repeat existing lyrics. Do not include any explanation or markdown formatting.`,
  });

  return response.text?.trim() || '';
};
