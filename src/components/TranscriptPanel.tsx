'use client';

import { useEffect, useRef } from 'react';
import type { TranscriptChunk } from '@/types';

interface TranscriptPanelProps {
  chunks: TranscriptChunk[];
  isRecording: boolean;
  isTranscribing: boolean;
  onToggleRecording: () => void;
  hasApiKey: boolean;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TranscriptPanel({
  chunks,
  isRecording,
  isTranscribing,
  onToggleRecording,
  hasApiKey,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chunks]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Transcript</h2>
        {isTranscribing && (
          <span className="text-xs text-indigo-600 animate-pulse">Transcribing...</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chunks.length === 0 && !isRecording && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-sm text-center gap-2 py-12">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <p>Click the mic button to start recording</p>
          </div>
        )}
        {chunks.length === 0 && isRecording && (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm animate-pulse">
            Listening...
          </div>
        )}
        {chunks.map((chunk) => (
          <div key={chunk.id} className="group">
            <span className="text-xs text-zinc-400 font-mono">{formatTime(chunk.timestamp)}</span>
            <p className="text-sm text-zinc-800 leading-relaxed mt-0.5">{chunk.text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center py-4 border-t border-zinc-200">
        <button
          onClick={onToggleRecording}
          disabled={!hasApiKey}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            !hasApiKey
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              : isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 mic-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
          }`}
          title={!hasApiKey ? 'Set API key first' : isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
