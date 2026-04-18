'use client';

import { HelpCircle, Lightbulb, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Suggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
}

const TYPE_CONFIG: Record<
  Suggestion['type'],
  {
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    cardClass: string;
  }
> = {
  question_to_ask: {
    label: 'Question',
    icon: HelpCircle,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    cardClass: 'hover:border-blue-300 dark:hover:border-blue-800',
  },
  talking_point: {
    label: 'Talking Point',
    icon: Lightbulb,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    cardClass: 'hover:border-emerald-300 dark:hover:border-emerald-800',
  },
  answer: {
    label: 'Answer',
    icon: ArrowRight,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    cardClass: 'hover:border-violet-300 dark:hover:border-violet-800',
  },
  fact_check: {
    label: 'Fact Check',
    icon: CheckCircle,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    cardClass: 'hover:border-amber-300 dark:hover:border-amber-800',
  },
  clarification: {
    label: 'Clarification',
    icon: Info,
    badgeClass: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    cardClass: 'hover:border-cyan-300 dark:hover:border-cyan-800',
  },
};

export default function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const config = TYPE_CONFIG[suggestion.type] || TYPE_CONFIG.talking_point;
  const Icon = config.icon;

  return (
    <Card
      size="sm"
      className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${config.cardClass}`}
      onClick={() => onClick(suggestion)}
    >
      <CardContent className="space-y-1.5">
        <Badge variant="secondary" className={`text-[10px] gap-1 ${config.badgeClass}`}>
          <Icon className="size-3" />
          {config.label}
        </Badge>
        <h3 className="text-sm font-semibold leading-snug">{suggestion.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.preview}</p>
      </CardContent>
    </Card>
  );
}
