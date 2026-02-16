import React, { useRef, useCallback } from 'react';
import type { SunoPack } from '@/types';
import TagToolbar from './TagToolbar';

interface LaunchpadViewProps {
  songData: SunoPack;
  onSongDataChange: (data: SunoPack) => void;
  onExtendLyrics: () => void;
  isExtending: boolean;
  onReset: () => void;
}

const CopyButton: React.FC<{
  text: string;
  label: string;
  variant?: 'fuchsia' | 'cyan' | 'default';
  compact?: boolean;
}> = ({ text, label, variant = 'default', compact = false }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const baseStyles = compact
    ? 'px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all'
    : 'w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-md';

  const variantStyles = copied
    ? 'bg-green-600 text-white'
    : variant === 'fuchsia'
      ? 'bg-fuchsia-900/20 text-fuchsia-300 border border-fuchsia-500/30 hover:bg-fuchsia-900/40'
      : variant === 'cyan'
        ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/40'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700';

  return (
    <button onClick={handleCopy} className={`${baseStyles} ${variantStyles}`}>
      {copied ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
      {copied ? 'COPIED!' : label}
    </button>
  );
};

const LaunchpadView: React.FC<LaunchpadViewProps> = ({
  songData,
  onSongDataChange,
  onExtendLyrics,
  isExtending,
  onReset,
}) => {
  const lyricsRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTag = useCallback(
    (tag: string) => {
      if (!lyricsRef.current) return;

      const textarea = lyricsRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = songData.lyrics || '';
      const before = text.substring(0, start);
      const after = text.substring(end);

      const insertion = `\n${tag}\n`;
      const newText = before + insertion + after;

      onSongDataChange({ ...songData, lyrics: newText });

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + insertion.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [songData, onSongDataChange],
  );

  const openSuno = () => window.open('https://suno.com/create', '_blank');

  return (
    <div className="h-full flex flex-col lg:flex-row animate-fade-in-up">
      {/* LEFT COLUMN: TITLE, STYLE & STRATEGY */}
      <div className="lg:w-1/3 bg-slate-900/50 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col gap-5 overflow-y-auto">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Project Title
            </h3>
            <CopyButton text={songData.title || ''} label="Copy Title" variant="default" compact />
          </div>
          <input
            type="text"
            aria-label="Project Title"
            value={songData.title || ''}
            onChange={(e) => onSongDataChange({ ...songData, title: e.target.value })}
            className="w-full bg-transparent text-2xl font-bold text-white border-none p-0 focus:ring-0 placeholder-slate-600"
            placeholder="Untitled Song"
          />
        </div>

        {/* Style Prompt */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Style Prompt
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {(songData.style || '').length} chars
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 shadow-inner group relative">
            <textarea
              aria-label="Style Prompt"
              value={songData.style || ''}
              onChange={(e) => onSongDataChange({ ...songData, style: e.target.value })}
              className="w-full bg-transparent text-sm text-fuchsia-100 font-mono leading-relaxed resize-none border-none focus:ring-0 min-h-[80px]"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
          </div>

          <CopyButton text={songData.style || ''} label="Copy Style" variant="fuchsia" />
        </div>

        {/* Strategy Note */}
        <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50 flex-grow">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            Strategy Note
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed italic">
            &quot;{songData.explanation || ''}&quot;
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 space-y-3">
          <div className="p-3 bg-fuchsia-900/10 border border-fuchsia-500/20 rounded-lg text-xs text-fuchsia-300 leading-relaxed">
            <strong>Tip:</strong> Paste Style into &quot;Style of Music&quot; and Lyrics into
            &quot;Lyrics&quot; in Custom Mode on Suno.
          </div>

          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="flex-1 py-3 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              New Song
            </button>
            <button
              onClick={openSuno}
              className="flex-[2] py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-2 hover:from-fuchsia-500 hover:to-purple-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Launch Suno.com
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LYRICS EDITOR */}
      <div className="lg:w-2/3 flex flex-col bg-slate-950 h-full min-h-[400px] lg:min-h-0">
        {/* Editor Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Lyrics Editor</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExtendLyrics}
              disabled={isExtending}
              className="px-3 py-1.5 text-xs font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-900/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isExtending ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              )}
              Extend
            </button>
            <CopyButton text={songData.lyrics || ''} label="Copy Lyrics" variant="cyan" compact />
          </div>
        </div>

        {/* Lyrics Textarea */}
        <div className="flex-grow relative">
          <textarea
            ref={lyricsRef}
            aria-label="Lyrics Editor"
            value={songData.lyrics || ''}
            onChange={(e) => onSongDataChange({ ...songData, lyrics: e.target.value })}
            className="w-full h-full bg-slate-950 p-6 sm:p-8 text-slate-300 font-mono text-sm sm:text-base leading-relaxed resize-none focus:outline-none focus:bg-slate-900/30 transition-colors"
            spellCheck={false}
            placeholder="Write your lyrics here..."
          />
        </div>

        {/* Tag Injector Toolbar */}
        <TagToolbar onInsertTag={handleInsertTag} />
      </div>
    </div>
  );
};

export default LaunchpadView;
