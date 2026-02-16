import React, { useState, useCallback, useEffect } from 'react';
import type { SunoSettings, SunoPack, ToastMessage, ProviderStatus } from '@/types';
import * as songApiService from '@/services/songApiService';
import Header from '@/components/Header';
import InputView from '@/components/InputView';
import LaunchpadView from '@/components/LaunchpadView';
import Toast from '@/components/Toast';

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
  // --- State ---
  const [view, setView] = useState<'input' | 'launchpad'>('input');
  const [settings, setSettings] = useState<SunoSettings>(DEFAULT_SETTINGS);
  const [songData, setSongData] = useState<SunoPack | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  let toastCounter = React.useRef(0);

  // --- Toast Helpers ---
  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  // --- Generate ---
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
      const pack = await songApiService.generateSunoPack(settings);
      setSongData(pack);
      setView('launchpad');
      addToast('Song pack generated successfully!', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Generation failed. Check your API key.';
      addToast(msg, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [settings, providerStatus, addToast]);

  // --- Extend Lyrics ---
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

  // --- Reset ---
  const handleReset = useCallback(() => {
    if (!confirm('Start over? Unsaved lyrics will be lost.')) return;
    setView('input');
    setSongData(null);
    setSettings({ ...DEFAULT_SETTINGS, topic: settings.topic });
  }, [settings.topic]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        providerStatus={providerStatus}
        onRefreshProviders={loadProviderStatus}
      />

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        <div className="h-full overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          {view === 'input' && (
            <InputView
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}

          {view === 'launchpad' && songData && (
            <LaunchpadView
              songData={songData}
              onSongDataChange={setSongData}
              onExtendLyrics={handleExtendLyrics}
              isExtending={isExtending}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
};

export default App;
