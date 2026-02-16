import React, { useState, useCallback, useEffect } from 'react';
import type {
  SunoSettings,
  SunoPack,
  ToastMessage,
  ProviderStatus,
  HistoryItem,
} from '@/types';
import * as songApiService from '@/services/songApiService';
import Header from '@/components/Header';
import InputView from '@/components/InputView';
import LaunchpadView from '@/components/LaunchpadView';
import Toast from '@/components/Toast';

const HISTORY_STORAGE = 'loofi-suno-history-v1';
const MAX_HISTORY_ITEMS = 12;

const DEFAULT_SETTINGS: SunoSettings = {
  topic: '',
  genre: '',
  mood: '',
  voice: 'Any',
  tempo: '',
  structure: 'Auto',
  language: 'English',
  isInstrumental: false,
  provider: 'auto',
  weirdness: null,
  styleInfluence: null,
};

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'launchpad'>('input');
  const [settings, setSettings] = useState<SunoSettings>(DEFAULT_SETTINGS);
  const [songData, setSongData] = useState<SunoPack | null>(null);
  const [variants, setVariants] = useState<SunoPack[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as HistoryItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = React.useRef(0);

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushHistory = useCallback((pack: SunoPack, sourceSettings: SunoSettings) => {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      settings: { ...sourceSettings },
      pack: { ...pack },
    };

    setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY_ITEMS));
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE, JSON.stringify(history));
  }, [history]);

  const loadProviderStatus = useCallback(async () => {
    try {
      const status = await songApiService.getProviders();
      setProviderStatus(status);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load providers.';
      addToast(msg, 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadProviderStatus();
  }, [loadProviderStatus]);

  const generatePackWithSettings = useCallback(async (targetSettings: SunoSettings): Promise<SunoPack> => {
    if (!targetSettings.topic.trim()) {
      throw new Error('Please enter a song topic.');
    }
    return songApiService.generateSunoPack(targetSettings);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!settings.topic.trim()) {
      addToast('Please enter a song topic.', 'error');
      return;
    }
    if (!providerStatus || providerStatus.configured.length === 0) {
      addToast('No providers configured on backend. Set server API keys first.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const pack = await generatePackWithSettings(settings);
      setSongData(pack);
      setVariants([]);
      setView('launchpad');
      pushHistory(pack, settings);
      addToast('Song pack generated successfully!', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Generation failed. Check your API key.';
      addToast(msg, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [settings, providerStatus, addToast, generatePackWithSettings, pushHistory]);

  const handleGenerateVariants = useCallback(async () => {
    if (!settings.topic.trim()) {
      addToast('Please enter a song topic.', 'error');
      return;
    }
    if (!providerStatus || providerStatus.configured.length === 0) {
      addToast('No providers configured on backend. Set server API keys first.', 'error');
      return;
    }

    setIsGeneratingVariants(true);
    try {
      const generated: SunoPack[] = [];
      for (let i = 0; i < 2; i += 1) {
        const pack = await generatePackWithSettings(settings);
        generated.push(pack);
      }
      setVariants(generated);
      addToast('Generated 2 fresh variants. Pick one from the panel.', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate variants.';
      addToast(msg, 'error');
    } finally {
      setIsGeneratingVariants(false);
    }
  }, [settings, providerStatus, addToast, generatePackWithSettings]);

  const handleSelectVariant = useCallback(
    (pack: SunoPack) => {
      setSongData(pack);
      pushHistory(pack, settings);
      addToast('Variant loaded.', 'info');
    },
    [pushHistory, settings, addToast],
  );

  const handleLoadHistory = useCallback((item: HistoryItem) => {
    setSettings(item.settings);
    setSongData(item.pack);
    setVariants([]);
    setView('launchpad');
  }, []);

  const handleExtendLyrics = useCallback(async () => {
    if (!songData) return;
    setIsExtending(true);
    try {
      const extension = await songApiService.extendSunoLyrics(
        songData.lyrics || '',
        settings.topic,
        songData.style || '',
        settings.language,
        settings.provider,
      );
      if (extension.addedLyrics) {
        setSongData({
          ...songData,
          lyrics: (songData.lyrics || '') + '\n\n' + extension.addedLyrics,
          providerUsed: extension.providerUsed,
          modelUsed: extension.modelUsed,
        });
        addToast('Lyrics extended!', 'success');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to extend lyrics.';
      addToast(msg, 'error');
    } finally {
      setIsExtending(false);
    }
  }, [songData, settings.topic, settings.language, settings.provider, addToast]);

  const handleReset = useCallback(() => {
    if (!confirm('Start over? Unsaved lyrics will be lost.')) return;
    setView('input');
    setSongData(null);
    setVariants([]);
    setSettings({ ...DEFAULT_SETTINGS, topic: settings.topic });
  }, [settings.topic]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        providerStatus={providerStatus}
        onRefreshProviders={loadProviderStatus}
      />

      <main className="flex-grow relative overflow-hidden">
        <div className="h-full overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          {view === 'input' && (
            <InputView
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              history={history}
              onLoadHistory={handleLoadHistory}
            />
          )}

          {view === 'launchpad' && songData && (
            <LaunchpadView
              songData={songData}
              onSongDataChange={setSongData}
              onExtendLyrics={handleExtendLyrics}
              isExtending={isExtending}
              onReset={handleReset}
              onGenerateVariants={handleGenerateVariants}
              isGeneratingVariants={isGeneratingVariants}
              variants={variants}
              onSelectVariant={handleSelectVariant}
            />
          )}
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
};

export default App;
