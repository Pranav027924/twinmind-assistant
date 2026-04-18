# TwinMind - Live Meeting Suggestions

An AI-powered meeting copilot that listens to live audio, transcribes in real time, and surfaces actionable suggestions based on what is being discussed.

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4
- **Transcription**: Groq Whisper Large V3
- **LLM**: Groq GPT-OSS 120B (OpenAI open-weight model)
- **Deployment**: Vercel

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste your Groq API key in Settings.

Get a free API key at [console.groq.com](https://console.groq.com).

## Architecture

```
src/
  app/
    page.tsx              # Main 3-column layout + state orchestration
    api/
      transcribe/         # Proxies audio to Groq Whisper
      suggestions/        # Generates 3 suggestions per batch
      chat/               # Streams detailed answers and chat
  components/
    TranscriptPanel.tsx   # Mic button + live transcript
    SuggestionsPanel.tsx  # Suggestion batches with refresh
    SuggestionCard.tsx    # Individual suggestion card
    ChatPanel.tsx         # Chat with streaming responses
    SettingsModal.tsx     # API key + prompt editing
    Header.tsx            # Navigation bar
  hooks/
    useAudioRecorder.ts   # MediaRecorder-based audio chunking
  lib/
    prompts.ts            # Default system prompts
    constants.ts          # Model names, defaults
  types/
    index.ts              # TypeScript interfaces
```

## Prompt Strategy

### Live Suggestions
The suggestion prompt instructs the model to analyze conversation flow and produce a **mix of 5 suggestion types**:

| Type | When it's used |
|------|---------------|
| `question_to_ask` | Conversation is exploratory or a follow-up would help |
| `talking_point` | A new angle, data point, or counterpoint would add value |
| `answer` | Someone just asked a question |
| `fact_check` | A specific claim, number, or name was mentioned |
| `clarification` | A technical term, acronym, or ambiguous statement came up |

The prompt includes **decision rules** that tell the model when to pick each type, so the mix adapts to what's happening in the conversation. Each suggestion's preview text is designed to deliver standalone value without clicking.

### Context Windows
- **Suggestions**: Last 6 chunks (~3 minutes) by default. Focused context produces more relevant suggestions than sending the entire transcript.
- **Detailed answers**: Full transcript. When a user clicks for detail, they want comprehensive, grounded information.
- **Chat**: Full transcript. Enables referencing anything discussed.

All context windows are configurable in Settings.

### Detailed Answers
Uses a separate prompt optimized for structured, scannable output (bullets, bold, headers). Tailored based on suggestion type — fact-checks include confidence levels, answers include takeaways, talking points include supporting evidence.

## Tradeoffs

1. **API routes as proxy** vs direct client calls: Added ~10ms latency but avoids CORS issues and keeps the architecture clean. The API key is passed per-request in headers, never stored server-side.

2. **Stop/start recording** every 30s vs continuous with `requestData()`: Stop/start creates a valid audio file each time. The ~5ms gap between sessions is negligible. `requestData()` chunks may lack proper headers for Whisper.

3. **No state management library**: React useState + useCallback is sufficient for this scope. Adding Redux or Zustand would be over-engineering.

4. **JSON response format** for suggestions: Using `response_format: { type: "json_object" }` ensures reliable parsing vs hoping for valid JSON in free-form output.

5. **Client-side settings in localStorage**: API key persists across reloads for UX. Session data (transcript, suggestions, chat) is ephemeral as specified.
