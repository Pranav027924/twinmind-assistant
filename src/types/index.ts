export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  type: 'question_to_ask' | 'talking_point' | 'answer' | 'fact_check' | 'clarification';
  title: string;
  preview: string;
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
}

export interface AppSettings {
  groqApiKey: string;
  suggestionPrompt: string;
  detailedAnswerPrompt: string;
  chatPrompt: string;
  suggestionContextChunks: number;
  detailedAnswerContextChunks: number;
  refreshIntervalSeconds: number;
}
