'use client';

import { useEffect, useRef } from 'react';
import { RefreshCw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Live Suggestions
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || !isRecording}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Updating...' : 'Refresh'}
        </Button>
      </div>
      <Separator />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {isLoading && batches.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-3 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        )}

        {batches.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center gap-3 py-12">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Lightbulb className="size-5 text-muted-foreground/60" />
            </div>
            <p>Suggestions will appear here while recording</p>
          </div>
        )}

        {batches.map((batch, batchIndex) => (
          <div key={batch.id}>
            {batchIndex > 0 && <Separator className="my-3" />}
            <div className="text-[11px] text-muted-foreground/70 mb-2 font-mono tabular-nums">
              {formatTime(batch.timestamp)}
            </div>
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
