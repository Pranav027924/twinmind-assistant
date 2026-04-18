import type { AppSettings } from '@/types';
import {
  DEFAULT_SUGGESTION_PROMPT,
  DEFAULT_DETAILED_ANSWER_PROMPT,
  DEFAULT_CHAT_PROMPT,
} from './prompts';

export const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: '',
  suggestionPrompt: DEFAULT_SUGGESTION_PROMPT,
  detailedAnswerPrompt: DEFAULT_DETAILED_ANSWER_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  suggestionContextChunks: 6,
  detailedAnswerContextChunks: 0,
  refreshIntervalSeconds: 30,
};

export const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
export const WHISPER_MODEL = 'whisper-large-v3';
export const LLM_MODEL = 'openai/gpt-oss-120b';
