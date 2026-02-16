import React from 'react';
import type { ProviderStatus } from '@/types';

interface HeaderProps {
  providerStatus: ProviderStatus | null;
  onRefreshProviders: () => void;
}

const Header: React.FC<HeaderProps> = ({ providerStatus, onRefreshProviders }) => {
  const configured = providerStatus?.configured.filter((item) => item !== 'auto') || [];
  const hasConfiguredProviders = configured.length > 0;

  return (
    <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl border border-fuchsia-500/30 bg-slate-950/70 p-1 shadow-lg shadow-fuchsia-900/20 overflow-hidden">
          <img
            src="/logo.png"
            alt="Loofi Suno logo"
            className="h-full w-full object-cover rounded-lg"
          />
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

      <div className="flex items-center gap-3">
        <div
          className={`px-3 py-2 rounded-lg text-xs border ${
            hasConfiguredProviders
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-900/20 border-amber-500/30 text-amber-300'
          }`}
        >
          {hasConfiguredProviders
            ? `Providers: ${configured.join(', ')} | Default: ${providerStatus?.defaultProvider}`
            : 'No LLM providers configured on backend'}
        </div>

        <button
          onClick={onRefreshProviders}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>
    </header>
  );
};

export default Header;
