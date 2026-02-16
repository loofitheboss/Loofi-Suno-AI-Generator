export interface SunoSettings {
  topic: string;
  genre: string;
  mood: string;
  voice: string;
  tempo: string;
  structure: 'Auto' | 'Standard' | 'Pop' | 'Rap' | 'Ambient' | 'Custom';
}

export interface SunoPack {
  title: string;
  style: string;
  lyrics: string;
  explanation: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
