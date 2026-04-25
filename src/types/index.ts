export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: number;
}

export type SuggestionType =
  | 'question_to_ask'
  | 'talking_point'
  | 'answer'
  | 'fact_check'
  | 'clarification';

export type FactCheckConfidence = 'verified' | 'likely' | 'unverified';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  preview: string;
  triggerQuote?: string;
  confidence?: FactCheckConfidence;
}

export interface SuggestionBatch {
  id: string;
  suggestions: Suggestion[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  // Track which suggestion (if any) triggered this assistant message
  sourceSuggestion?: {
    type: SuggestionType;
    title: string;
    triggerQuote?: string;
  };
}

export type MeetingType =
  | 'auto'
  | 'sales_call'
  | 'pitch'
  | 'sprint_planning'
  | 'interview'
  | 'one_on_one'
  | 'brainstorm'
  | 'support'
  | 'generic';

export interface AppSettings {
  groqApiKey: string;
  suggestionPrompt: string;
  detailedAnswerPrompt: string;
  chatPrompt: string;
  suggestionContextChunks: number;
  detailedAnswerContextChunks: number;
  refreshIntervalSeconds: number;
  meetingType: MeetingType;
  userRole: string;
  meetingGoal: string;
}

export interface LatencySample {
  label: 'transcribe' | 'suggestions' | 'chat_ttft' | 'chat_total';
  durationMs: number;
  timestamp: number;
}
