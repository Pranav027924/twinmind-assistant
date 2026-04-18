'use client';

interface HeaderProps {
  onOpenSettings: () => void;
  onExport: () => void;
  hasApiKey: boolean;
}

export default function Header({ onOpenSettings, onExport, hasApiKey }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">TwinMind</h1>
        {!hasApiKey && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            Set API key in Settings
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          Export
        </button>
        <button
          onClick={onOpenSettings}
          className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>
    </header>
  );
}
