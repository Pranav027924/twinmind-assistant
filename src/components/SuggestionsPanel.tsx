'use client';

import { useEffect, useRef } from 'react';
import type { Suggestion, SuggestionBatch } from '@/types';
import SuggestionCard from './SuggestionCard';

interface SuggestionsPanelProps {
  batches: SuggestionBatch[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
  onRefresh: () => void;
  isRecording: boolean;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SuggestionsPanel({
  batches,
  isLoading,
  onSuggestionClick,
  onRefresh,
  isRecording,
}: SuggestionsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [batches.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
          Live Suggestions
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading || !isRecording}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            isLoading || !isRecording
              ? 'text-zinc-400 cursor-not-allowed'
              : 'text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          {isLoading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {isLoading && batches.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-zinc-200 p-3">
                <div className="h-3 w-20 bg-zinc-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-zinc-200 rounded mb-1.5" />
                <div className="h-3 w-full bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {batches.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-sm text-center gap-2 py-12">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 12 18.469a3.374 3.374 0 0 0-.914-1.42l-.548-.547Z" />
            </svg>
            <p>Suggestions will appear here while recording</p>
          </div>
        )}

        {batches.map((batch, batchIndex) => (
          <div key={batch.id}>
            {batchIndex > 0 && <div className="border-t border-zinc-100 my-2" />}
            <div className="text-xs text-zinc-400 mb-2 font-mono">{formatTime(batch.timestamp)}</div>
            <div className="space-y-2">
              {batch.suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onClick={onSuggestionClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
