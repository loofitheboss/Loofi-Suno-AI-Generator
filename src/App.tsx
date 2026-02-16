import React, { useState, useCallback, useEffect } from 'react';
import type { SunoSettings, SunoPack, ToastMessage } from '@/types';
import * as geminiService from '@/services/geminiService';
import Header from '@/components/Header';
import InputView from '@/components/InputView';
import LaunchpadView from '@/components/LaunchpadView';
import ApiKeyModal from '@/components/ApiKeyModal';
import Toast from '@/components/Toast';

const API_KEY_STORAGE = 'loofi-suno-gemini-key';

const DEFAULT_SETTINGS: SunoSettings = {
  topic: '',
  genre: '',
  mood: '',
  voice: 'Any',
  tempo: '',
  structure: 'Auto',
};

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'input' | 'launchpad'>('input');
  const [settings, setSettings] = useState<SunoSettings>(DEFAULT_SETTINGS);
  const [songData, setSongData] = useState<SunoPack | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  // API Key
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  let toastCounter = React.useRef(0);

  // Init Gemini client when API key changes
  useEffect(() => {
    if (apiKey) {
      geminiService.initClient(apiKey);
    }
  }, [apiKey]);

  // Show API key modal on mount if no key
  useEffect(() => {
    if (!apiKey) {
      setShowApiKeyModal(true);
    }
  }, [apiKey]);

  // --- Toast Helpers ---
  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- API Key ---
  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  }, []);

  // --- Generate ---
  const handleGenerate = useCallback(async () => {
    if (!settings.topic.trim()) {
      addToast('Please enter a song topic.', 'error');
      return;
    }
    if (!apiKey) {
      addToast('Please set your Gemini API key first.', 'error');
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const pack = await geminiService.generateSunoPack(settings);
      setSongData(pack);
      setView('launchpad');
      addToast('Song pack generated successfully!', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Generation failed. Check your API key.';
      addToast(msg, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [settings, apiKey, addToast]);

  // --- Extend Lyrics ---
  const handleExtendLyrics = useCallback(async () => {
    if (!songData || !apiKey) return;
    setIsExtending(true);
    try {
      const newLines = await geminiService.extendSunoLyrics(
        songData.lyrics || '',
        settings.topic,
        songData.style || '',
      );
      if (newLines) {
        setSongData({ ...songData, lyrics: (songData.lyrics || '') + '\n\n' + newLines });
        addToast('Lyrics extended!', 'success');
      }
    } catch {
      addToast('Failed to extend lyrics.', 'error');
    } finally {
      setIsExtending(false);
    }
  }, [songData, settings.topic, apiKey, addToast]);

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
        onOpenApiKey={() => setShowApiKeyModal(true)}
        hasApiKey={!!apiKey}
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

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />

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
