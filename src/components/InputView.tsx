import React, { useState } from 'react';
import type { SunoSettings } from '@/types';

interface InputViewProps {
  settings: SunoSettings;
  onSettingsChange: (settings: SunoSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const VOICE_OPTIONS = ['Any', 'Male', 'Female', 'Duet', 'Instrumental', 'Choir'];
const STRUCTURE_OPTIONS: SunoSettings['structure'][] = ['Auto', 'Standard', 'Pop', 'Rap', 'Ambient', 'Custom'];

const structureDescriptions: Record<string, string> = {
  Auto: 'AI picks the best structure for your topic',
  Standard: 'Balanced structure optimized for 2-3 min song',
  Pop: 'Verse-Chorus-Verse-Chorus-Bridge-Chorus',
  Rap: 'Intro-Hook-Verse-Hook-Verse-Outro',
  Ambient: 'Linear progression, no distinct chorus',
  Custom: 'Free-form structure, AI decides creatively',
};

const InputView: React.FC<InputViewProps> = ({ settings, onSettingsChange, onGenerate, isGenerating }) => {
  const [showManual, setShowManual] = useState(false);

  const update = (field: keyof SunoSettings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Design Your Hit
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Define the soul of your song. AI handles the structure.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="w-full bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-700/50 space-y-4">
        {/* Topic Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
            Song Topic / Story
          </label>
          <textarea
            value={settings.topic}
            onChange={(e) => update('topic', e.target.value)}
            placeholder="e.g. A cyberpunk detective finding a flower in the rain..."
            rows={3}
            autoFocus
            maxLength={500}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all resize-none leading-relaxed"
          />
          <div className="text-right text-xs text-slate-600">
            {settings.topic.length}/500
          </div>
        </div>

        {/* Manual Settings Toggle */}
        <div className="flex justify-center border-t border-slate-800/50 pt-4">
          <button
            onClick={() => setShowManual(!showManual)}
            className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-fuchsia-400 transition-colors uppercase tracking-widest"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showManual ? 'rotate-180 text-fuchsia-400' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {showManual ? 'Hide Manual Settings' : 'Manual Settings (Optional)'}
          </button>
        </div>

        {/* Manual Settings Panel */}
        {showManual && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-fade-in-up">
            {/* Musical Style */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                Musical Style
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={settings.genre}
                  onChange={(e) => update('genre', e.target.value)}
                  placeholder="Genre (e.g. Synthwave)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                />
                <input
                  type="text"
                  value={settings.mood}
                  onChange={(e) => update('mood', e.target.value)}
                  placeholder="Vibe (e.g. Melancholic)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">Voice</label>
                  <select
                    value={settings.voice}
                    onChange={(e) => update('voice', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">Tempo</label>
                  <input
                    type="text"
                    value={settings.tempo}
                    onChange={(e) => update('tempo', e.target.value)}
                    placeholder="e.g. 120 BPM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Structure */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                Structure
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {STRUCTURE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => update('structure', s)}
                    className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                      settings.structure === s
                        ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-300 shadow-lg shadow-fuchsia-900/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 italic mt-2">
                {structureDescriptions[settings.structure]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!settings.topic.trim() || isGenerating}
        className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-fuchsia-900/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Designing Audio Architecture...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span>Generate Song Pack</span>
          </>
        )}
      </button>
    </div>
  );
};

export default InputView;
