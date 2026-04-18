'use client';

import { useEffect, useRef } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [batches.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Live Suggestions
          </h2>
          {batches.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              ({batches.length})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || !isRecording}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Updating' : 'Refresh'}
        </Button>
      </div>
      <Separator />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        <AnimatePresence>
          {isLoading && batches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-card p-3.5 space-y-2.5">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {batches.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="size-16 rounded-2xl bg-muted/80 flex items-center justify-center"
            >
              <Sparkles className="size-6 text-muted-foreground/50" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No suggestions yet</p>
              <p className="text-xs text-muted-foreground/60">
                Suggestions appear automatically while recording
              </p>
            </div>
          </div>
        )}

        {batches.map((batch, batchIndex) => (
          <motion.div
            key={batch.id}
            initial={batchIndex === 0 ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {batchIndex > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] text-muted-foreground/40 font-mono tabular-nums">
                  {formatTime(batch.timestamp)}
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>
            )}
            {batchIndex === 0 && batches.length > 1 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-primary/60 font-semibold uppercase tracking-wider">Latest</span>
                <span className="text-[10px] text-muted-foreground/40 font-mono tabular-nums">
                  {formatTime(batch.timestamp)}
                </span>
              </div>
            )}
            {batchIndex === 0 && batches.length === 1 && (
              <div className="text-[10px] text-muted-foreground/40 mb-2 font-mono tabular-nums">
                {formatTime(batch.timestamp)}
              </div>
            )}
            <div className="space-y-2.5">
              {batch.suggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onClick={onSuggestionClick}
                  index={batchIndex === 0 ? i : 0}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
