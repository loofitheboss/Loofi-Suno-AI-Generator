import type {
  ExtendResponse,
  ProviderStatus,
  SunoPack,
  SunoSettings,
} from '@/types';

const API_BASE = '/api/song';

const parseError = async (response: Response): Promise<Error> => {
  try {
    const data = await response.json();
    const detail = typeof data?.detail === 'string' ? data.detail : 'Request failed.';
    return new Error(detail);
  } catch {
    return new Error('Request failed.');
  }
};

export const getProviders = async (): Promise<ProviderStatus> => {
  const response = await fetch(`${API_BASE}/providers`);
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as ProviderStatus;
};

export const generateSunoPack = async (settings: SunoSettings): Promise<SunoPack> => {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as SunoPack;
};

export const extendSunoLyrics = async (
  currentLyrics: string,
  topic: string,
  style: string,
  language: string,
  provider: SunoSettings['provider'],
): Promise<ExtendResponse> => {
  const response = await fetch(`${API_BASE}/extend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentLyrics,
      topic,
      style,
      language,
      provider,
    }),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as ExtendResponse;
};
