'use client';

import type { Suggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
}

const TYPE_CONFIG: Record<Suggestion['type'], { label: string; color: string; bg: string; icon: string }> = {
  question_to_ask: {
    label: 'Question',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: '?',
  },
  talking_point: {
    label: 'Talking Point',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: '💡',
  },
  answer: {
    label: 'Answer',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    icon: '→',
  },
  fact_check: {
    label: 'Fact Check',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: '✓',
  },
  clarification: {
    label: 'Clarification',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
    icon: 'i',
  },
};

export default function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const config = TYPE_CONFIG[suggestion.type] || TYPE_CONFIG.talking_point;

  return (
    <button
      onClick={() => onClick(suggestion)}
      className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${config.bg}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${config.color}`}>
          {config.icon} {config.label}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">{suggestion.title}</h3>
      <p className="text-xs text-zinc-600 leading-relaxed">{suggestion.preview}</p>
    </button>
  );
}
