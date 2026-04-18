'use client';

import { useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TranscriptChunk } from '@/types';

interface TranscriptPanelProps {
  chunks: TranscriptChunk[];
  isRecording: boolean;
  isTranscribing: boolean;
  onToggleRecording: () => void;
  hasApiKey: boolean;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Transcript
        </h2>
        {isTranscribing && (
          <span className="text-xs text-primary animate-pulse font-medium">Transcribing...</span>
        )}
      </div>
      <Separator />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chunks.length === 0 && !isRecording && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center gap-3 py-12">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Mic className="size-5 text-muted-foreground/60" />
            </div>
            <p>Click the mic button to start recording</p>
          </div>
        )}
        {chunks.length === 0 && isRecording && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3 py-12">
            <div className="size-3 rounded-full bg-red-500 animate-pulse" />
            <p>Listening...</p>
          </div>
        )}
        {chunks.map((chunk) => (
          <div key={chunk.id}>
            <span className="text-[11px] text-muted-foreground/70 font-mono tabular-nums">
              {formatTime(chunk.timestamp)}
            </span>
            <p className="text-sm leading-relaxed text-foreground mt-0.5">{chunk.text}</p>
          </div>
        ))}
      </div>

      <Separator />
      <div className="flex items-center justify-center py-4">
        <Button
          onClick={onToggleRecording}
          disabled={!hasApiKey}
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          className={`rounded-full size-14 ${isRecording ? 'mic-pulse' : ''}`}
          title={!hasApiKey ? 'Set API key first' : isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <Square className="size-5" /> : <Mic className="size-5" />}
        </Button>
      </div>
    </div>
  );
}
