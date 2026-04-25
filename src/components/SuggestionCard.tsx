'use client';

import { HelpCircle, Lightbulb, ArrowRight, CheckCircle2, Info, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { Suggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
  index: number;
}

const TYPE_CONFIG: Record<
  Suggestion['type'],
  {
    label: string;
    icon: React.ElementType;
    gradient: string;
    badgeClass: string;
    borderAccent: string;
  }
> = {
  question_to_ask: {
    label: 'Question',
    icon: HelpCircle,
    gradient: 'from-blue-500/10 via-transparent to-transparent',
    badgeClass:
      'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    borderAccent: 'group-hover:border-blue-300 dark:group-hover:border-blue-700',
  },
  talking_point: {
    label: 'Talking Point',
    icon: Lightbulb,
    gradient: 'from-emerald-500/10 via-transparent to-transparent',
    badgeClass:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    borderAccent: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-700',
  },
  answer: {
    label: 'Answer',
    icon: ArrowRight,
    gradient: 'from-violet-500/10 via-transparent to-transparent',
    badgeClass:
      'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    borderAccent: 'group-hover:border-violet-300 dark:group-hover:border-violet-700',
  },
  fact_check: {
    label: 'Fact Check',
    icon: CheckCircle2,
    gradient: 'from-amber-500/10 via-transparent to-transparent',
    badgeClass:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    borderAccent: 'group-hover:border-amber-300 dark:group-hover:border-amber-700',
  },
  clarification: {
    label: 'Clarify',
    icon: Info,
    gradient: 'from-cyan-500/10 via-transparent to-transparent',
    badgeClass:
      'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    borderAccent: 'group-hover:border-cyan-300 dark:group-hover:border-cyan-700',
  },
};

const CONFIDENCE_LABEL: Record<NonNullable<Suggestion['confidence']>, { label: string; cls: string }> = {
  verified: {
    label: '✓ verified',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  likely: {
    label: '~ likely',
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  unverified: {
    label: '? unverified',
    cls: 'bg-muted text-muted-foreground border-border',
  },
};

export default function SuggestionCard({ suggestion, onClick, index }: SuggestionCardProps) {
  const config = TYPE_CONFIG[suggestion.type] || TYPE_CONFIG.talking_point;
  const Icon = config.icon;
  const conf =
    suggestion.type === 'fact_check' && suggestion.confidence
      ? CONFIDENCE_LABEL[suggestion.confidence]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <button
        onClick={() => onClick(suggestion)}
        className={`group w-full text-left rounded-xl border bg-card p-3.5 transition-all duration-200
          hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
          active:translate-y-0 active:shadow-md
          suggestion-glow ${config.borderAccent}`}
      >
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
        />
        <div className="relative space-y-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] gap-1 py-0 ${config.badgeClass}`}>
                <Icon className="size-2.5" />
                {config.label}
              </Badge>
              {conf && (
                <Badge variant="outline" className={`text-[10px] py-0 ${conf.cls}`}>
                  {conf.label}
                </Badge>
              )}
            </div>
            <ArrowRight className="size-3 text-muted-foreground/40 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
          <h3 className="text-[13px] font-semibold leading-snug text-foreground">
            {suggestion.title}
          </h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {suggestion.preview}
          </p>
          {suggestion.triggerQuote && (
            <div
              title={`Triggered by: "${suggestion.triggerQuote}"`}
              className="flex items-center gap-1 pt-0.5 text-[10px] text-muted-foreground/60"
            >
              <Quote className="size-2.5 shrink-0" />
              <span className="truncate italic">&ldquo;{suggestion.triggerQuote}&rdquo;</span>
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}
