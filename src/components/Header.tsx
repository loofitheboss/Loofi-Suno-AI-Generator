import React from 'react';

interface HeaderProps {
  onOpenApiKey: () => void;
  hasApiKey: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenApiKey, hasApiKey }) => {
  return (
    <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-fuchsia-900/30 rounded-xl border border-fuchsia-500/30 shadow-lg shadow-fuchsia-900/20">
          <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            Suno Song Studio
            <span className="text-[10px] bg-fuchsia-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              AI
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-wide">
            by Loofi
          </p>
        </div>
      </div>

      <button
        onClick={onOpenApiKey}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
          hasApiKey
            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            : 'bg-fuchsia-900/20 border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-900/30 animate-pulse'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        {hasApiKey ? 'API Key Set' : 'Set API Key'}
      </button>
    </header>
  );
};

export default Header;
