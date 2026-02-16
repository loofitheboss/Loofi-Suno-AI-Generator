export type LlmProvider = 'auto' | 'gemini' | 'openai';

export interface SunoSettings {
  topic: string;
  genre: string;
  mood: string;
  voice: string;
  tempo: string;
  structure: 'Auto' | 'Standard' | 'Pop' | 'Rap' | 'Ambient' | 'Custom';
  language: string;
  isInstrumental: boolean;
  provider: LlmProvider;
  weirdness?: number | null;
  styleInfluence?: number | null;
}

export interface SunoPack {
  title: string;
  style: string;
  lyrics: string;
  explanation: string;
  providerUsed?: LlmProvider;
  modelUsed?: string;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  settings: SunoSettings;
  pack: SunoPack;
}

export interface ExtendResponse {
  addedLyrics: string;
  providerUsed: LlmProvider;
  modelUsed: string;
}

export interface ProviderStatus {
  configured: LlmProvider[];
  defaultProvider: LlmProvider;
  autoOrder: LlmProvider[];
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
