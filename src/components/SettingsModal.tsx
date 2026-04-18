'use client';

import { useState, useEffect } from 'react';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const update = (key: keyof AppSettings, value: string | number) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const resetPrompts = () => {
    setDraft((prev) => ({
      ...prev,
      suggestionPrompt: DEFAULT_SETTINGS.suggestionPrompt,
      detailedAnswerPrompt: DEFAULT_SETTINGS.detailedAnswerPrompt,
      chatPrompt: DEFAULT_SETTINGS.chatPrompt,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Groq API Key</label>
            <input
              type="password"
              value={draft.groqApiKey}
              onChange={(e) => update('groqApiKey', e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-zinc-400 mt-1">
              Get your key at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                console.groq.com
              </a>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Suggestion context (chunks)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={draft.suggestionContextChunks}
                onChange={(e) => update('suggestionContextChunks', parseInt(e.target.value) || 6)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-zinc-400 mt-0.5">How many 30s chunks to use</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Answer context (chunks)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.detailedAnswerContextChunks}
                onChange={(e) => update('detailedAnswerContextChunks', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-zinc-400 mt-0.5">0 = full transcript</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Refresh interval (sec)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={draft.refreshIntervalSeconds}
                onChange={(e) => update('refreshIntervalSeconds', parseInt(e.target.value) || 30)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700">Prompts</h3>
            <button
              onClick={resetPrompts}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Reset to defaults
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Live Suggestion Prompt
            </label>
            <textarea
              value={draft.suggestionPrompt}
              onChange={(e) => update('suggestionPrompt', e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Detailed Answer Prompt (on click)
            </label>
            <textarea
              value={draft.detailedAnswerPrompt}
              onChange={(e) => update('detailedAnswerPrompt', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Chat Prompt</label>
            <textarea
              value={draft.chatPrompt}
              onChange={(e) => update('chatPrompt', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
