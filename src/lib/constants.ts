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
  // Suggestion context: last ~3 minutes of conversation (6 × 30s) is the sweet
  // spot — enough recent context to be relevant, focused enough to avoid
  // dilution. We additionally inject a rolling summary of older content.
  suggestionContextChunks: 6,
  // Detailed answer context: 10 chunks (~5 minutes). Previously 0 (=full
  // transcript) which destroyed time-to-first-token on long meetings.
  // 0 still means "full transcript" if the user opts in.
  detailedAnswerContextChunks: 10,
  refreshIntervalSeconds: 30,
  meetingType: 'auto',
  userRole: '',
  meetingGoal: '',
};

export const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
export const WHISPER_MODEL = 'whisper-large-v3';
export const LLM_MODEL = 'openai/gpt-oss-120b';

// Per-mode temperatures — structured outputs and fact-checks want lower
// variance, free-form chat wants a touch more.
export const TEMPERATURE_SUGGESTIONS = 0.4;
export const TEMPERATURE_DETAILED = 0.5;
export const TEMPERATURE_CHAT = 0.6;

// How many recent suggestion titles to pass forward as "AVOID REPEATING".
export const ANTI_REPETITION_TITLE_COUNT = 6;

// Roll older transcript into a summary every N chunks (~5 min at 30s/chunk).
export const ROLLING_SUMMARY_EVERY_N_CHUNKS = 10;

// ============================================
// Voice activity detection (client-side gate before Whisper).
// Whisper-Large-v3 is well known to hallucinate boilerplate ("thanks for
// watching", "subscribe", repeated phrases) on near-silent input. The
// strongest mitigation is to never send silent chunks to it in the first
// place. We compute RMS over fixed windows and require at least
// MIN_ACTIVE_WINDOWS windows above SPEECH_RMS_THRESHOLD.
// ============================================
export const VAD_SPEECH_RMS_THRESHOLD = 0.012;
export const VAD_WINDOW_MS = 600;
export const VAD_MIN_ACTIVE_WINDOWS = 2;

// ============================================
// Server-side filters on Whisper segments (verbose_json output).
// These match Whisper's own internal defaults — segments outside these
// bounds are usually hallucinations and we drop them.
// ============================================
export const WHISPER_NO_SPEECH_THRESHOLD = 0.55;
export const WHISPER_LOGPROB_THRESHOLD = -0.95;
export const WHISPER_COMPRESSION_THRESHOLD = 2.3;
