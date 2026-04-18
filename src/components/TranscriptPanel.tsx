'use client';

import { useEffect, useRef } from 'react';
import { Mic, Square, AudioLines } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

function AudioWaveform() {
  return (
    <div className="flex items-center gap-[3px] h-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="wave-bar opacity-80"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
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
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chunks]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <AudioLines className="size-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Transcript
          </h2>
        </div>
        <AnimatePresence>
          {isTranscribing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1 rounded-full bg-primary typing-dot"
                  />
                ))}
              </div>
              <span className="text-[11px] text-primary font-medium">Transcribing</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Separator />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {chunks.length === 0 && !isRecording && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="size-16 rounded-2xl bg-muted/80 flex items-center justify-center"
            >
              <Mic className="size-6 text-muted-foreground/50" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No transcript yet</p>
              <p className="text-xs text-muted-foreground/60">
                Click the mic button below to start recording
              </p>
            </div>
          </div>
        )}

        {chunks.length === 0 && isRecording && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <AudioWaveform />
            <p className="text-sm text-muted-foreground">Listening for speech...</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {chunks.map((chunk, index) => (
            <motion.div
              key={chunk.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index === chunks.length - 1 ? 0.05 : 0 }}
              className="group py-2.5 first:pt-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums shrink-0">
                  {formatTime(chunk.timestamp)}
                </span>
                <div className="h-px flex-1 bg-border/50 group-hover:bg-border transition-colors mt-1" />
              </div>
              <p className="text-[13px] leading-relaxed text-foreground/90 mt-1 pl-0.5">
                {chunk.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Separator />
      <div className="flex items-center justify-center py-4 px-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onToggleRecording}
                disabled={!hasApiKey}
                variant={isRecording ? 'destructive' : 'default'}
                className={`rounded-full size-14 shadow-lg transition-all duration-300 ${
                  isRecording
                    ? 'mic-pulse shadow-destructive/20'
                    : hasApiKey
                      ? 'glow-primary hover:shadow-xl hover:scale-105'
                      : ''
                }`}
              />
            }
          >
            {isRecording ? (
              <Square className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {!hasApiKey ? 'Set API key first' : isRecording ? 'Stop recording' : 'Start recording'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
