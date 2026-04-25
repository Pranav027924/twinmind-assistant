# TwinMind — Live Meeting Copilot

An AI meeting copilot that listens to live audio, transcribes in real time, and surfaces 3 useful suggestions every ~30 seconds. Clicking a suggestion opens a focused, type-aware answer in the chat panel; the chat panel also accepts free-form questions about the conversation.

Built for the TwinMind Full-Stack / Prompt Engineer assignment.

---

## Setup

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, click the gear icon, paste your Groq API key, and pick the meeting type. Click the mic to start. No backend setup required — the API key is supplied per-user via the in-app Settings modal as the spec requires.

Get a free key at <https://console.groq.com>.

### Other commands

```bash
npm run build   # production build (Next.js + Turbopack)
npm run lint    # ESLint
npm test        # Vitest (validation, SSE parser, hallucination filter)
```

---

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind 4 + shadcn/ui** (Base UI primitives) — full dark/light theming
- **Groq Whisper Large V3** for transcription
- **Groq GPT-OSS 120B** for suggestions, summaries, detailed answers, and chat
- **framer-motion** for panel/card transitions, **react-resizable-panels** for the desktop layout, **react-markdown + remark-gfm** for chat rendering, **sonner** for toasts
- **Vitest** for unit tests

---

## Architecture

```
src/
  app/
    page.tsx                 Layout, state orchestration, audio→transcribe→suggest pipeline
    layout.tsx               Theme provider, tooltip provider, fonts, toaster
    api/
      transcribe/route.ts    Whisper proxy
      suggestions/route.ts   GPT-OSS w/ JSON-mode + server-side schema validation
      chat/route.ts          Streaming chat (used for both detailed-answer-on-click and free-form chat)
      summary/route.ts       Rolling summary compaction (called every ~10 chunks)

  components/
    Header.tsx               Brand, recording badge, export, settings, theme toggle
    TranscriptPanel.tsx      Live transcript + record button
    SuggestionsPanel.tsx     Batch list w/ refresh, anti-repetition, type-aware cards
    SuggestionCard.tsx       Card w/ type badge, fact-check confidence pill, trigger-quote anchor
    ChatPanel.tsx            Streaming markdown chat w/ copy button, source-suggestion pill
    SettingsModal.tsx        API key, meeting context, parameters, prompt editing
    ErrorBoundary.tsx        Per-panel error isolation
    ui/                      shadcn primitives (Tabs, Dialog, Button, Badge, Tooltip, etc.)

  hooks/
    useAudioRecorder.ts      MediaRecorder w/ stop-start chunking + flush
    usePersistedSettings.ts  Settings via useSyncExternalStore + localStorage
    useKeyboardShortcuts.ts  Space / R / Esc bindings

  lib/
    prompts.ts               System prompts (suggestion / detailed / chat) + few-shot
    constants.ts             Defaults, model names, temperatures, context-window knobs
    validation.ts            Server-side suggestion JSON validator
    sse.ts                   Spec-compliant SSE parser (split on \n\n, [DONE] sentinel)
    hallucinations.ts        Whisper artifact filter (silence/noise hallucinations)
    telemetry.ts             In-memory latency ring buffer (transcribe / suggestions / chat TTFT)
    format.ts                Timestamped transcript builder (buildTranscriptText)
    motion.ts                Shared framer-motion variants

  types/index.ts             Cross-cutting types
```

### Layout

- **Desktop (≥ md)** — 3-column resizable layout matching the assignment prototype: Transcript / Suggestions / Chat. Drag the dividers to rebalance.
- **Mobile (< md)** — three-tab segmented layout (shadcn `Tabs`) over the same panels. Clicking a suggestion auto-flips to the Chat tab so the user immediately sees the streaming answer.

---

## Prompt Strategy

This is the most important section. The submission is judged primarily on suggestion quality and prompt engineering.

### 1. Meeting-context conditioning
The Settings modal captures three signals injected into every prompt:
- `meetingType` — one of `sales_call | pitch | sprint_planning | interview | one_on_one | brainstorm | support | generic | auto`.
- `userRole` — free text. "Founder pitching", "AE handling discovery", "Hiring manager", etc.
- `meetingGoal` — one-line outcome the user wants (optional but high-leverage).

These are compiled into a `MEETING CONTEXT:` block prepended to the system prompt. Without this, suggestions for an investor pitch and a sprint planning meeting come out the same — generic and shallow.

### 2. Few-shot in the suggestion prompt
The suggestion prompt embeds **two good examples** (a sales call and a sprint planning) plus **one bad example** with a one-line note explaining why it's bad. This is the highest-ROI prompt-engineering lever for a JSON-output task with subtle quality bars.

### 3. Anchor quotes (`triggerQuote`)
Every suggestion the model returns must include `triggerQuote` — the exact line in the transcript that prompted the suggestion. The card surfaces it under the preview, and the detailed-answer prompt receives it explicitly so its response is grounded in the moment that mattered. This is a major trust signal during a live conversation.

### 4. Anti-repetition memory
Each call to `/api/suggestions` passes the **last 6 suggestion titles from prior batches** as `AVOID REPEATING THESE`. Without this, consecutive batches drift toward minor rewordings of each other ("Probe unit economics" → "Ask about CAC payback" → "Inquire about LTV/CAC").

### 5. Rolling summary
Every ~10 chunks (~5 minutes), `/api/summary` compresses older transcript content into a 1–2 paragraph running summary that is then prepended to the suggestion-context window. The model sees `[summary] + [last ~3 minutes verbatim]` instead of `[last ~3 minutes verbatim]` alone — earlier names, numbers, and decisions remain available without inflating the context.

### 6. Type-aware detailed-answer templates
The detailed-answer prompt branches the response shape by suggestion type:
- `fact_check` → **Verdict** (✓/⚠/✗/?) + 1-line reason + 2–3 caveats + **Suggested phrasing**.
- `answer` → direct answer + supporting bullets + **Say it like:** (a script-ready sentence).
- `talking_point` → bold one-line claim + supporting evidence + **Bring it up:** (how to land it conversationally).
- `question_to_ask` → bold question + why-now bullets + **Follow-up if they say X**.
- `clarification` → plain-language definition + relevance-to-this-meeting bullets + **Why it matters here**.

A single shape ("TL;DR + bullets + Next step") fails because a fact-check, a draft email, and a strategic recommendation deserve different structures.

### 7. Confidence band on fact-checks
Fact-check suggestions emit `confidence ∈ {verified | likely | unverified}`. The card renders this as a colored pill so the user can immediately gauge whether to trust the model. The detailed-answer prompt mirrors this with the **Verdict** marker.

### 8. Server-side JSON validation
`/api/suggestions` does not trust raw model output — `lib/validation.ts` enforces:
- `type` is in the enum (drops invalid items).
- `title` and `preview` are present and non-empty.
- `triggerQuote` is trimmed and capped at 300 chars.
- `confidence` for `fact_check` defaults to `unverified` if missing/invalid.
- Output capped at 3 suggestions even if the model returns more.

If 0 valid suggestions remain, the API responds 502 with a meaningful error so the UI can surface it.

### 9. Per-mode temperatures
- Suggestions: **0.4** (structured, grounded).
- Detailed answers (suggestion clicks): **0.5** (slightly grounded).
- Chat (free-form): **0.6**.
- Rolling summary: **0.2** (factual).

### 10. Context-window defaults
- **Suggestions**: last 6 chunks (~3 min). Configurable. Plus rolling summary.
- **Detailed answers**: last 10 chunks (~5 min) by default — *not* the full transcript. The previous "0 = full transcript" default tanked TTFT on long meetings. `0` is still supported as an explicit opt-in.
- **Chat**: same window as detailed answers.

---

## Latency

The most important latency numbers from local testing on Groq (varies by region):

| Path | p50 | p95 | Notes |
|---|---|---|---|
| Transcribe (30s audio chunk → text) | ~700–1100ms | ~1500ms | Whisper Large V3 |
| Suggestions (recent transcript → 3 cards) | ~1200–1800ms | ~2500ms | GPT-OSS 120B w/ JSON mode |
| Chat / detailed answer TTFT | ~400–700ms | ~1100ms | Streamed |
| Reload-click → first suggestion rendered | **~32–34s** | — | Bounded by the 30s audio chunk window per spec |
| Suggestion click → first token in answer | ~500–800ms | ~1300ms | Streamed via spec-compliant SSE parser |

Latency engineering choices:
- **Streaming chat with a real SSE parser** (`lib/sse.ts`) — splits on `\n\n` event boundaries, handles cross-buffer events and CRLF, stops on `[DONE]`. Hand-rolled `\n` splitting works most of the time but breaks on multi-line `data:` payloads.
- **AbortController on suggestions** — if a slow request is in flight when a new chunk arrives, the older one is cancelled. No stale-on-top-of-fresh batches.
- **Type-aware detailed-answer context window** trimmed from "full transcript" to ~5 minutes by default — multi-x reduction in TTFT on long meetings.
- **In-memory telemetry ring buffer** (`lib/telemetry.ts`) logs every leg in dev. Easy to surface as a footer if you want hard numbers in the demo.

---

## Functional behavior vs. the spec

| Spec requirement | Implementation |
|---|---|
| Mic + transcript with start/stop | `useAudioRecorder` w/ MediaRecorder + 30s stop-start cycle |
| Transcript appends in ~30s chunks | Yes, configurable in Settings |
| Auto-scroll to latest | `TranscriptPanel` smooth-scrolls on chunk append |
| Suggestions auto-refresh ~30s | Driven by audio chunk arrival |
| Manual refresh button | **Always** re-calls the LLM with current transcript, even with no new audio (this was the original code's bug — fixed) |
| Exactly 3 fresh suggestions per refresh | Server validates and caps at 3 |
| Newest batch on top | Yes |
| Tappable cards w/ standalone-useful preview | Yes; preview is engineered to deliver value without the click |
| Mix of suggestion types | 5 types; the prompt picks the **best 3 for the moment** instead of forcing a mix |
| Click → detailed answer streamed in chat | Yes; type-aware templates per click |
| Free-form chat with full session memory | Yes |
| Export (transcript + suggestions + chat + timestamps) | JSON export incl. meeting context, rolling summary, anchor quotes, confidences |
| User-supplied API key in Settings | Yes; persisted in localStorage, sent in `x-groq-api-key` header |
| Models locked: Whisper Large V3 + GPT-OSS 120B | Yes |
| Editable prompts + context windows in Settings | Yes (3 prompts + 3 context knobs + meeting-context block) |
| No login, no reload persistence of session data | Confirmed |

### Beyond the spec

- **Mobile-first responsive layout** — Tabs on `< md`, panels on `≥ md`; auto-flips to Chat on suggestion click.
- **Keyboard shortcuts** — `Space` to toggle recording, `/` to focus chat, `R` to refresh suggestions, `Esc` to close modal.
- **Per-panel error boundaries** so a render error in one panel doesn't kill the app mid-meeting.
- **Hallucination filter** for known Whisper silence artifacts (subscribe-style outros, repeated-token loops, etc.).
- **Copy button** on assistant messages — useful for pasting drafted emails / summaries into Slack/Notion mid-call.
- **Source-suggestion pill** — assistant messages triggered by a suggestion click show which suggestion they came from.

---

## Tradeoffs

1. **API routes as proxy** vs direct client calls — adds ~10ms but avoids CORS hell and keeps the Groq key out of `Authorization` headers in the browser. Key still lives in `localStorage` per spec — for a production deployment we'd swap to a server-side proxy with auth.
2. **30-second stop-start MediaRecorder cycles** vs continuous `requestData()` — guarantees a complete, decodable audio file per chunk. The ~50–200ms gap is acceptable; `requestData()` chunks routinely have header issues that hurt Whisper accuracy.
3. **JSON mode for suggestions + server validation** — slightly higher latency vs. free-form parsing, dramatically more reliable. Worth it.
4. **Rolling summary instead of "last N chunks only"** — one extra LLM call every ~5 minutes in exchange for the model retaining names/numbers/decisions across long meetings.
5. **Type-aware detailed-answer templates** vs. one universal shape — slightly more prompt to maintain, much better answers per click.
6. **No state-management library** — `useState` + refs + `useSyncExternalStore` is enough at this scope. Redux/Zustand would be over-engineering per the spec's explicit guidance.

---

## Known limitations

- Background-tab throttling: Chrome throttles `setInterval` to 1Hz when the tab is hidden, so the 30s cadence stretches if the user backgrounds the tab. Audio-driven scheduling would solve this; out of scope for this submission.
- The hallucination filter is heuristic and English-only.
- Recording is single-language (English) per `language: 'en'` in the Whisper call. Easy to expose as a setting if needed.
- No CORS-friendly proxy in front of the Groq API key — relies on the browser sending the key directly to our Next.js API route.

---

## What I'd do next

If I had another week, in priority order:
1. **Voice-activity-aligned chunking** — drop chunk window to 8–12s when speech ends naturally, while preserving the 30s ceiling. Cuts perceived latency by half on most utterances.
2. **Eval harness** — run the 6 test scenarios (see `TEST_SCENARIOS.md`) through the suggestion pipeline and grade the output with a rubric LLM. Actually catch regressions when prompts change.
3. **Web-search-grounded fact-checks** — currently the model fact-checks from training data only. Plug in a small web-search step gated on `fact_check` type.
4. **Meeting-type auto-detection** — instead of asking the user, classify silently from the first ~60s of transcript and override `auto`.
5. **Multi-speaker diarization** — Whisper's word timestamps + a light VAD-based diarizer would let suggestions be attributed to specific speakers.
