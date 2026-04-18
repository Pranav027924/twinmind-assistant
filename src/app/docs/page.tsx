'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, ChevronRight, Mic, Lightbulb, MessageSquare,
  Settings, ArrowLeft, Layers, AudioLines,
  Sparkles, Code2, Palette, Globe, Zap,
  GitBranch, Moon, Sun, Monitor,
  HelpCircle, CheckCircle2, Info, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const CHAPTERS = [
  { id: 'overview', title: 'Overview', icon: BookOpen },
  { id: 'problem', title: 'Problem Statement', icon: Lightbulb },
  { id: 'requirements', title: 'Requirements', icon: CheckCircle2 },
  { id: 'architecture', title: 'Architecture', icon: Layers },
  { id: 'audio-pipeline', title: 'Audio Pipeline', icon: AudioLines },
  { id: 'suggestions-engine', title: 'Suggestions Engine', icon: Sparkles },
  { id: 'chat-system', title: 'Chat System', icon: MessageSquare },
  { id: 'ui-design', title: 'UI / UX Design', icon: Palette },
  { id: 'config-export', title: 'Settings & Export', icon: Settings },
  { id: 'tech-stack', title: 'Tech Stack', icon: Code2 },
  { id: 'tradeoffs', title: 'Tradeoffs', icon: GitBranch },
];

function DiagramBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm font-medium', className)}>
      {children}
    </div>
  );
}

function DiagramArrow({ direction = 'down', label }: { direction?: 'down' | 'right'; label?: string }) {
  if (direction === 'right') {
    return (
      <div className="flex items-center gap-1 px-2 text-muted-foreground">
        <div className="h-px w-6 bg-muted-foreground/40" />
        {label && <span className="text-[10px] whitespace-nowrap">{label}</span>}
        <ChevronRight className="size-3" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-0.5 py-1 text-muted-foreground">
      {label && <span className="text-[10px]">{label}</span>}
      <div className="w-px h-4 bg-muted-foreground/40" />
      <ChevronRight className="size-3 rotate-90" />
    </div>
  );
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="rounded-xl border bg-muted/50 overflow-hidden my-4">
      {title && (
        <div className="px-4 py-2 border-b bg-muted/80 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground/80">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionHeading({ id, icon: Icon, title, chapter }: {
  id: string;
  icon: React.ElementType;
  title: string;
  chapter: number;
}) {
  return (
    <div id={id} className="scroll-mt-24 pt-12 first:pt-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-10 rounded-xl gradient-bg text-white shadow-sm">
          <Icon className="size-5" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-primary uppercase tracking-widest">Chapter {chapter}</span>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="size-3.5" />
                Back to App
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <span className="font-semibold text-sm">Documentation</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar / Table of Contents */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto border-r py-6 px-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-2">
            Table of Contents
          </p>
          <nav className="space-y-0.5">
            {CHAPTERS.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <a
                  key={ch.id}
                  href={`#${ch.id}`}
                  onClick={() => setActiveSection(ch.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                    activeSection === ch.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{ch.title}</span>
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground/50">{i + 1}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl px-6 lg:px-12 py-8 lg:py-12">

          {/* ============================================ */}
          {/* CHAPTER 1: OVERVIEW */}
          {/* ============================================ */}
          <SectionHeading id="overview" icon={BookOpen} title="Overview" chapter={1} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              <strong className="text-foreground">TwinMind</strong> is an AI-powered, real-time meeting copilot that listens
              to live audio from the user&apos;s microphone, transcribes speech in ~30-second chunks, and continuously
              surfaces <strong className="text-foreground">3 actionable suggestions</strong> based on what is being discussed.
            </p>
            <p>
              The application is a single-page web app with a three-column layout: <strong className="text-foreground">Transcript</strong> on
              the left, <strong className="text-foreground">Live Suggestions</strong> in the center,
              and <strong className="text-foreground">Chat</strong> on the right. Clicking any suggestion opens a detailed,
              streamed AI response in the chat panel. Users can also type free-form questions.
            </p>

            <div className="grid grid-cols-3 gap-3 my-8">
              <Card size="sm">
                <CardContent className="flex flex-col items-center text-center gap-2 py-4">
                  <Mic className="size-6 text-primary" />
                  <p className="text-xs font-semibold">Transcript</p>
                  <p className="text-[11px] text-muted-foreground">Live speech-to-text via Whisper</p>
                </CardContent>
              </Card>
              <Card size="sm">
                <CardContent className="flex flex-col items-center text-center gap-2 py-4">
                  <Sparkles className="size-6 text-primary" />
                  <p className="text-xs font-semibold">Suggestions</p>
                  <p className="text-[11px] text-muted-foreground">3 context-aware cards per batch</p>
                </CardContent>
              </Card>
              <Card size="sm">
                <CardContent className="flex flex-col items-center text-center gap-2 py-4">
                  <MessageSquare className="size-6 text-primary" />
                  <p className="text-xs font-semibold">Chat</p>
                  <p className="text-[11px] text-muted-foreground">Streaming detailed answers</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-start gap-3 py-3">
                <Zap className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs">
                  <strong>Key principle:</strong> Every suggestion preview delivers standalone value even without clicking.
                  The detailed answer on click goes deeper with full context.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 2: PROBLEM STATEMENT */}
          {/* ============================================ */}
          <SectionHeading id="problem" icon={Lightbulb} title="Problem Statement" chapter={2} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              In live meetings, participants face a constant information challenge: they need to stay engaged in conversation
              while simultaneously processing complex information, recalling facts, formulating questions, and identifying
              follow-up actions. <strong className="text-foreground">The cognitive load of doing all of this in real time is enormous.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <Card size="sm" className="border-destructive/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-destructive">Problems</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-destructive">1.</span> Missing important follow-up questions in the moment</li>
                    <li className="flex gap-2"><span className="text-destructive">2.</span> Unable to fact-check claims made during discussion</li>
                    <li className="flex gap-2"><span className="text-destructive">3.</span> Forgetting to raise relevant talking points</li>
                    <li className="flex gap-2"><span className="text-destructive">4.</span> Losing track of what was said earlier</li>
                    <li className="flex gap-2"><span className="text-destructive">5.</span> No searchable record of the conversation</li>
                  </ul>
                </CardContent>
              </Card>
              <Card size="sm" className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">TwinMind Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary">1.</span> AI generates smart follow-up questions automatically</li>
                    <li className="flex gap-2"><span className="text-primary">2.</span> Fact-checks surface when claims are detected</li>
                    <li className="flex gap-2"><span className="text-primary">3.</span> Talking points suggest new angles and data</li>
                    <li className="flex gap-2"><span className="text-primary">4.</span> Full searchable transcript with timestamps</li>
                    <li className="flex gap-2"><span className="text-primary">5.</span> One-click export of entire session</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* User Flow Diagram */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">User Flow</p>
            <div className="rounded-xl border bg-card p-6 space-y-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox>Paste API Key</DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox>Click Mic</DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox>Speak</DiagramBox>
                <DiagramArrow direction="right" label="30s" />
                <DiagramBox>Transcript Appears</DiagramBox>
              </div>
              <DiagramArrow label="auto-triggers" />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox>3 Suggestions Generated</DiagramBox>
                <DiagramArrow direction="right" label="click" />
                <DiagramBox>Detailed Answer Streams in Chat</DiagramBox>
              </div>
              <DiagramArrow label="repeat every 30s" />
              <div className="flex items-center justify-center gap-2">
                <DiagramBox>New Batch Appears at Top</DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox className="border-primary/50">Export Session as JSON</DiagramBox>
              </div>
            </div>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 3: REQUIREMENTS */}
          {/* ============================================ */}
          <SectionHeading id="requirements" icon={CheckCircle2} title="Requirements" chapter={3} />

          <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h3 className="text-base font-semibold mb-3">Functional Requirements</h3>
              <div className="grid gap-3">
                {[
                  { area: 'Mic + Transcript', items: ['Start/stop mic button', 'Transcript appends in ~30s chunks', 'Auto-scrolls to latest'] },
                  { area: 'Live Suggestions', items: ['Auto-refresh every ~30s', 'Manual refresh button', 'Exactly 3 suggestions per batch', 'New batch at top, old below', 'Tappable cards with useful preview'] },
                  { area: 'Chat', items: ['Clicking suggestion returns detailed answer', 'Users can type questions directly', 'One continuous chat per session', 'Streaming responses'] },
                  { area: 'Export', items: ['Full session export: transcript + suggestions + chat', 'JSON format with timestamps'] },
                ].map((group) => (
                  <Card key={group.area} size="sm">
                    <CardContent className="flex gap-4">
                      <Badge variant="secondary" className="shrink-0 h-fit mt-0.5">{group.area}</Badge>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3 text-primary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-3">Technical Requirements</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Transcription', value: 'Groq Whisper Large V3' },
                  { label: 'LLM', value: 'Groq GPT-OSS 120B' },
                  { label: 'API Key', value: 'User-provided, never hardcoded' },
                  { label: 'Deployment', value: 'Vercel (public URL)' },
                  { label: 'Settings', value: 'Editable prompts & context windows' },
                  { label: 'Persistence', value: 'Session only (no login needed)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
                    <span className="ml-auto text-xs font-mono text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-3">Suggestion Types</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { type: 'Question', icon: HelpCircle, desc: 'Follow-up to ask', color: 'text-blue-600 dark:text-blue-400' },
                  { type: 'Talking Point', icon: Lightbulb, desc: 'New angle / insight', color: 'text-emerald-600 dark:text-emerald-400' },
                  { type: 'Answer', icon: ArrowRight, desc: 'Direct answer', color: 'text-violet-600 dark:text-violet-400' },
                  { type: 'Fact Check', icon: CheckCircle2, desc: 'Verify a claim', color: 'text-amber-600 dark:text-amber-400' },
                  { type: 'Clarification', icon: Info, desc: 'Explain term', color: 'text-cyan-600 dark:text-cyan-400' },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.type} size="sm">
                      <CardContent className="flex flex-col items-center text-center gap-1.5 py-3">
                        <Icon className={cn('size-5', s.color)} />
                        <p className="text-xs font-semibold">{s.type}</p>
                        <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 4: ARCHITECTURE */}
          {/* ============================================ */}
          <SectionHeading id="architecture" icon={Layers} title="Architecture" chapter={4} />

          <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <p>
              The application follows a <strong className="text-foreground">client-heavy architecture</strong> where
              the browser handles audio capture, state management, and rendering. Next.js API routes act as thin proxies
              to the Groq API, forwarding the user-supplied API key per request without storing it server-side.
            </p>

            {/* Architecture Diagram */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">System Architecture</p>
            <div className="rounded-xl border bg-card p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-3 text-center">
                  <Badge variant="outline" className="text-[10px]">Browser (Client)</Badge>
                </div>
                <DiagramBox className="border-blue-300 dark:border-blue-700">
                  <Mic className="size-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  MediaRecorder API<br />
                  <span className="text-[10px] text-muted-foreground">30s audio chunks</span>
                </DiagramBox>
                <DiagramBox className="border-emerald-300 dark:border-emerald-700">
                  <Sparkles className="size-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                  React State<br />
                  <span className="text-[10px] text-muted-foreground">chunks, batches, messages</span>
                </DiagramBox>
                <DiagramBox className="border-violet-300 dark:border-violet-700">
                  <Palette className="size-4 mx-auto mb-1 text-violet-600 dark:text-violet-400" />
                  UI Components<br />
                  <span className="text-[10px] text-muted-foreground">shadcn + framer-motion</span>
                </DiagramBox>
              </div>

              <div className="flex justify-center gap-8 my-2 text-muted-foreground">
                <div className="flex flex-col items-center text-[10px]">
                  <div className="w-px h-4 bg-muted-foreground/40" />
                  <span>FormData</span>
                  <ChevronRight className="size-3 rotate-90" />
                </div>
                <div className="flex flex-col items-center text-[10px]">
                  <div className="w-px h-4 bg-muted-foreground/40" />
                  <span>JSON</span>
                  <ChevronRight className="size-3 rotate-90" />
                </div>
                <div className="flex flex-col items-center text-[10px]">
                  <div className="w-px h-4 bg-muted-foreground/40" />
                  <span>SSE Stream</span>
                  <ChevronRight className="size-3 rotate-90" />
                </div>
              </div>

              <div className="text-center my-2">
                <Badge variant="outline" className="text-[10px]">Next.js API Routes (Server)</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 my-4">
                <DiagramBox>/api/transcribe<br /><span className="text-[10px] text-muted-foreground">Proxy to Whisper</span></DiagramBox>
                <DiagramBox>/api/suggestions<br /><span className="text-[10px] text-muted-foreground">JSON response</span></DiagramBox>
                <DiagramBox>/api/chat<br /><span className="text-[10px] text-muted-foreground">SSE stream passthrough</span></DiagramBox>
              </div>

              <DiagramArrow label="Bearer token forwarded" />

              <div className="text-center mt-2">
                <DiagramBox className="border-primary/50 inline-block mx-auto">
                  <Globe className="size-4 mx-auto mb-1 text-primary" />
                  Groq Cloud API<br />
                  <span className="text-[10px] text-muted-foreground">Whisper V3 + GPT-OSS 120B</span>
                </DiagramBox>
              </div>
            </div>

            {/* File Structure */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-8 mb-3">File Structure</p>
            <CodeBlock title="Project Layout" code={`src/
├── app/
│   ├── page.tsx              ← Main orchestrator (state, data flow)
│   ├── layout.tsx            ← Providers (Theme, Tooltip, Sonner)
│   ├── globals.css           ← Design tokens, animations, prose styles
│   ├── docs/page.tsx         ← This documentation page
│   └── api/
│       ├── transcribe/       ← POST: audio blob → Whisper → text
│       ├── suggestions/      ← POST: transcript → GPT-OSS → 3 suggestions
│       └── chat/             ← POST: messages → GPT-OSS → SSE stream
├── components/
│   ├── Header.tsx            ← Nav bar, recording indicator, theme toggle
│   ├── TranscriptPanel.tsx   ← Mic button, waveform, live transcript
│   ├── SuggestionsPanel.tsx  ← Suggestion batches with refresh
│   ├── SuggestionCard.tsx    ← Individual card with type badge
│   ├── ChatPanel.tsx         ← Chat bubbles, markdown, typing indicator
│   ├── SettingsModal.tsx     ← API key, prompts, parameters
│   ├── theme-provider.tsx    ← next-themes wrapper
│   ├── theme-toggle.tsx      ← Light/Dark/System toggle
│   └── ui/                   ← shadcn/ui primitives
├── hooks/
│   └── useAudioRecorder.ts   ← MediaRecorder hook with chunking
├── lib/
│   ├── prompts.ts            ← Default system prompts (3 prompts)
│   ├── constants.ts          ← Model names, defaults, API base URL
│   └── utils.ts              ← cn() utility
└── types/
    └── index.ts              ← TypeScript interfaces`} />
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 5: AUDIO PIPELINE */}
          {/* ============================================ */}
          <SectionHeading id="audio-pipeline" icon={AudioLines} title="Audio Pipeline" chapter={5} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              Audio capture uses the <strong className="text-foreground">MediaRecorder API</strong> wrapped in a
              custom <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">useAudioRecorder</code> hook.
              The hook manages the full lifecycle: microphone access, recording, periodic chunking, and cleanup.
            </p>

            {/* Audio Pipeline Diagram */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Audio Pipeline</p>
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox className="border-blue-300 dark:border-blue-700">
                  <Mic className="size-4 mx-auto mb-1" />
                  getUserMedia()
                </DiagramBox>
                <DiagramArrow direction="right" label="stream" />
                <DiagramBox>
                  MediaRecorder<br />
                  <span className="text-[10px] text-muted-foreground">webm/opus</span>
                </DiagramBox>
                <DiagramArrow direction="right" label="30s interval" />
                <DiagramBox>
                  stop() + collect<br />
                  <span className="text-[10px] text-muted-foreground">Blob assembly</span>
                </DiagramBox>
              </div>
              <DiagramArrow label="onChunkReady(blob)" />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox>
                  /api/transcribe<br />
                  <span className="text-[10px] text-muted-foreground">FormData upload</span>
                </DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox className="border-primary/50">
                  Groq Whisper V3<br />
                  <span className="text-[10px] text-muted-foreground">response_format: text</span>
                </DiagramBox>
                <DiagramArrow direction="right" label="text" />
                <DiagramBox>
                  TranscriptChunk<br />
                  <span className="text-[10px] text-muted-foreground">id + text + timestamp</span>
                </DiagramBox>
              </div>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">How Chunking Works</h3>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal pl-5">
              <li><strong className="text-foreground">Start:</strong> <code className="bg-muted px-1 rounded font-mono">getUserMedia()</code> requests mic access with echo cancellation and noise suppression enabled.</li>
              <li><strong className="text-foreground">Record:</strong> A new <code className="bg-muted px-1 rounded font-mono">MediaRecorder</code> starts. Audio data accumulates in a chunks array via <code className="bg-muted px-1 rounded font-mono">ondataavailable</code>.</li>
              <li><strong className="text-foreground">Flush (every 30s):</strong> A <code className="bg-muted px-1 rounded font-mono">setInterval</code> calls <code className="bg-muted px-1 rounded font-mono">flushCurrentChunk()</code>, which stops the recorder, assembles chunks into a single Blob, fires the callback, then immediately starts a new recorder on the same stream.</li>
              <li><strong className="text-foreground">Manual Refresh:</strong> The refresh button in the suggestions panel calls <code className="bg-muted px-1 rounded font-mono">flush()</code> to force an early chunk.</li>
              <li><strong className="text-foreground">Stop:</strong> Clears the interval, stops the recorder, stops all media tracks, and fires the final chunk callback.</li>
            </ol>

            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 mt-4">
              <CardContent className="flex items-start gap-3 py-3">
                <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Why stop/start instead of requestData()?</strong> Calling <code className="bg-muted px-1 rounded font-mono">requestData()</code> on a running
                  recorder may produce chunks without proper audio headers, causing Whisper transcription to fail.
                  The stop/start approach creates a valid, self-contained audio file each time with only a ~5ms gap.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 6: SUGGESTIONS ENGINE */}
          {/* ============================================ */}
          <SectionHeading id="suggestions-engine" icon={Sparkles} title="Suggestions Engine" chapter={6} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              The suggestions engine is the core intelligence of TwinMind. Every ~30 seconds, after a new transcript chunk arrives,
              the engine sends a context window of recent transcript to GPT-OSS 120B with a carefully crafted system prompt
              that instructs the model to produce exactly 3 diverse, context-appropriate suggestions.
            </p>

            {/* Suggestions Flow */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Generation Flow</p>
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox>New Transcript Chunk</DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox>
                  Slice last N chunks<br />
                  <span className="text-[10px] text-muted-foreground">default: 6 (~3 min)</span>
                </DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox className="border-primary/50">
                  GPT-OSS 120B<br />
                  <span className="text-[10px] text-muted-foreground">JSON response mode</span>
                </DiagramBox>
              </div>
              <DiagramArrow label="parse JSON" />
              <div className="flex items-center justify-center gap-2">
                <DiagramBox>
                  SuggestionBatch<br />
                  <span className="text-[10px] text-muted-foreground">3 cards prepended to list</span>
                </DiagramBox>
              </div>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Prompt Strategy</h3>
            <p>
              The system prompt defines 5 suggestion types and includes <strong className="text-foreground">decision rules</strong> that
              tell the model when to choose each type:
            </p>
            <div className="grid gap-2 mt-3">
              {[
                { rule: 'Someone just asked a question', action: 'Include an "answer" suggestion' },
                { rule: 'A specific fact or claim was stated', action: 'Include a "fact_check" suggestion' },
                { rule: 'A technical term or acronym was used', action: 'Include a "clarification" suggestion' },
                { rule: 'Conversation is exploratory/decision-oriented', action: 'Include a "question_to_ask" suggestion' },
                { rule: 'Discussion could benefit from a new angle', action: 'Include a "talking_point" suggestion' },
              ].map((r) => (
                <div key={r.rule} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-xs">
                  <span className="text-muted-foreground flex-1"><strong className="text-foreground">If:</strong> {r.rule}</span>
                  <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                  <span className="text-primary flex-1"><strong>Then:</strong> {r.action}</span>
                </div>
              ))}
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Context Window Strategy</h3>
            <p>
              The <strong className="text-foreground">suggestion context window</strong> is intentionally limited
              (default: last 6 chunks = ~3 minutes). This is a deliberate tradeoff:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5 mt-2">
              <li>Too little context: suggestions are shallow and miss the conversational thread</li>
              <li>Too much context: suggestions become generic and respond to earlier, no-longer-relevant topics</li>
              <li>~3 minutes is the sweet spot: enough to understand the current topic while keeping suggestions focused on what&apos;s happening <em>now</em></li>
            </ul>

            <Card className="border-primary/20 bg-primary/5 mt-4">
              <CardContent className="flex items-start gap-3 py-3">
                <Zap className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">JSON response mode</strong> is critical. Using{' '}
                  <code className="bg-muted px-1 rounded font-mono">response_format: {"{"} type: &quot;json_object&quot; {"}"}</code>{' '}
                  ensures the model always returns valid, parseable JSON instead of free-form text that might include explanatory preamble.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 7: CHAT SYSTEM */}
          {/* ============================================ */}
          <SectionHeading id="chat-system" icon={MessageSquare} title="Chat System" chapter={7} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              The chat system supports two entry points: <strong className="text-foreground">clicking a suggestion card</strong> and
              {' '}<strong className="text-foreground">typing a free-form question</strong>. Both trigger a streaming response
              from GPT-OSS 120B using Server-Sent Events (SSE).
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Streaming Architecture</h3>
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox>User clicks card<br /><span className="text-[10px] text-muted-foreground">or types question</span></DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox>/api/chat<br /><span className="text-[10px] text-muted-foreground">stream: true</span></DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox className="border-primary/50">Groq SSE</DiagramBox>
              </div>
              <DiagramArrow label="response.body passthrough" />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <DiagramBox>ReadableStream<br /><span className="text-[10px] text-muted-foreground">reader.read() loop</span></DiagramBox>
                <DiagramArrow direction="right" label="delta tokens" />
                <DiagramBox>
                  setState per delta<br />
                  <span className="text-[10px] text-muted-foreground">progressive rendering</span>
                </DiagramBox>
                <DiagramArrow direction="right" />
                <DiagramBox>
                  ReactMarkdown<br />
                  <span className="text-[10px] text-muted-foreground">+ remark-gfm</span>
                </DiagramBox>
              </div>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Two Chat Modes</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card size="sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Suggestion Click</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>Uses <strong className="text-foreground">detailedAnswerPrompt</strong> as system prompt</p>
                  <p>Sends suggestion type, title, and preview as user message</p>
                  <p>Full transcript context (or configurable chunk limit)</p>
                  <p>Optimized for structured, scannable output</p>
                </CardContent>
              </Card>
              <Card size="sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Free-form Question</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>Uses <strong className="text-foreground">chatPrompt</strong> as system prompt</p>
                  <p>Includes full conversation history (multi-turn)</p>
                  <p>Full transcript appended to system prompt</p>
                  <p>Optimized for conversational Q&A</p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Markdown Rendering</h3>
            <p>
              Assistant messages are rendered with <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">react-markdown</code>{' '}
              + <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">remark-gfm</code>, which properly
              handles: headings, bold/italic, code blocks, inline code, bullet/numbered lists, tables (GFM),
              blockquotes, links, and horizontal rules. All styled via the{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">.prose-chat</code> CSS class
              with full dark mode support.
            </p>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 8: UI/UX DESIGN */}
          {/* ============================================ */}
          <SectionHeading id="ui-design" icon={Palette} title="UI / UX Design" chapter={8} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              The UI is built with <strong className="text-foreground">shadcn/ui</strong> components on top of Tailwind CSS v4.
              Every element uses the design token system for consistent theming across light and dark modes.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Layout</h3>
            <p>
              Three resizable panels using <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">react-resizable-panels</code>{' '}
              wrapped in shadcn&apos;s <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">ResizablePanelGroup</code>.
              Default split: 28% / 36% / 36% with visible drag handles. Min sizes prevent panels from collapsing.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Theme System</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { mode: 'Light', icon: Sun, desc: 'Clean white surfaces with indigo accents' },
                { mode: 'Dark', icon: Moon, desc: 'Deep navy-black with blue tints in surfaces' },
                { mode: 'System', icon: Monitor, desc: 'Follows OS preference automatically' },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <Card key={t.mode} size="sm">
                    <CardContent className="flex flex-col items-center text-center gap-2 py-4">
                      <Icon className="size-5 text-primary" />
                      <p className="text-xs font-semibold">{t.mode}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Micro-Animations</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Staggered card entrance (framer-motion)',
                'Transcript chunk fade-in + slide-up',
                'Typing indicator bouncing dots',
                'Recording pulse animation on mic button',
                'Audio waveform bars while listening',
                'AnimatePresence for status transitions',
                'Gradient border glow on suggestion hover',
                'Animated gradient text in logo',
                'Smooth scroll on new content',
                'Auto-resize textarea in chat input',
              ].map((anim) => (
                <div key={anim} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground">
                  <Zap className="size-3 text-primary shrink-0" />
                  {anim}
                </div>
              ))}
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Color System</h3>
            <p>
              Colors use the <strong className="text-foreground">oklch</strong> color space for perceptually uniform
              gradients. The dark theme isn&apos;t a simple inversion -- it uses deep navy backgrounds with subtle
              blue tints (hue 264) in card and border surfaces for a premium feel.
            </p>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 9: SETTINGS & EXPORT */}
          {/* ============================================ */}
          <SectionHeading id="config-export" icon={Settings} title="Settings & Export" chapter={9} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <h3 className="text-base font-semibold mb-2">Settings</h3>
            <p>
              All configuration is accessible from the settings dialog (gear icon in header). Settings
              persist in <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code> across
              page reloads but are not synced across devices.
            </p>

            <div className="grid gap-2 mt-3">
              {[
                { setting: 'Groq API Key', desc: 'Required. Passed per-request in headers, never stored server-side.', default: '(empty)' },
                { setting: 'Suggestion Context', desc: 'Number of 30s chunks to include when generating suggestions.', default: '6 chunks (~3 min)' },
                { setting: 'Answer Context', desc: 'Chunks for detailed answers. 0 = full transcript.', default: '0 (full)' },
                { setting: 'Refresh Interval', desc: 'Seconds between automatic audio chunk flushes.', default: '30 seconds' },
                { setting: 'Suggestion Prompt', desc: 'System prompt for generating live suggestions.', default: 'See prompts.ts' },
                { setting: 'Detailed Answer Prompt', desc: 'System prompt for suggestion click responses.', default: 'See prompts.ts' },
                { setting: 'Chat Prompt', desc: 'System prompt for free-form chat questions.', default: 'See prompts.ts' },
              ].map((s) => (
                <div key={s.setting} className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{s.setting}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{s.default}</Badge>
                </div>
              ))}
            </div>

            <h3 className="text-base font-semibold mt-8 mb-2">Export</h3>
            <p>
              The export button downloads a JSON file containing the complete session with timestamps for every entry:
            </p>
            <CodeBlock title="Export Format" code={`{
  "exportedAt": "2026-04-19T...",
  "transcript": [
    { "text": "...", "timestamp": "..." }
  ],
  "suggestions": [
    {
      "timestamp": "...",
      "suggestions": [
        { "type": "question_to_ask", "title": "...", "preview": "..." },
        { "type": "fact_check", "title": "...", "preview": "..." },
        { "type": "talking_point", "title": "...", "preview": "..." }
      ]
    }
  ],
  "chat": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ]
}`} />
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 10: TECH STACK */}
          {/* ============================================ */}
          <SectionHeading id="tech-stack" icon={Code2} title="Tech Stack" chapter={10} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <div className="grid grid-cols-2 gap-3">
              {[
                { category: 'Framework', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript'] },
                { category: 'Styling', items: ['Tailwind CSS v4', 'shadcn/ui (base-nova)', 'CSS oklch color system'] },
                { category: 'UI Library', items: ['framer-motion (animations)', 'lucide-react (icons)', 'react-resizable-panels'] },
                { category: 'AI / APIs', items: ['Groq Whisper Large V3', 'Groq GPT-OSS 120B', 'Server-Sent Events (SSE)'] },
                { category: 'Markdown', items: ['react-markdown', 'remark-gfm (tables, etc.)', 'Custom prose-chat CSS'] },
                { category: 'Utilities', items: ['next-themes (dark mode)', 'sonner (toasts)', 'class-variance-authority'] },
              ].map((group) => (
                <Card key={group.category} size="sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-primary uppercase tracking-wider">{group.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="size-1 rounded-full bg-primary/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-10" />

          {/* ============================================ */}
          {/* CHAPTER 11: TRADEOFFS */}
          {/* ============================================ */}
          <SectionHeading id="tradeoffs" icon={GitBranch} title="Tradeoffs" chapter={11} />

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <div className="space-y-3">
              {[
                {
                  decision: 'API routes as proxy vs. direct client-to-Groq calls',
                  pro: 'Avoids CORS issues, keeps architecture clean, easy to add logging/rate limiting later',
                  con: 'Adds ~10ms latency per request',
                  chosen: 'Proxy',
                },
                {
                  decision: 'Stop/start recorder vs. requestData() on running recorder',
                  pro: 'Creates valid, self-contained audio files that Whisper reliably transcribes',
                  con: '~5ms gap between chunks',
                  chosen: 'Stop/start',
                },
                {
                  decision: 'Limited context window for suggestions vs. full transcript',
                  pro: 'Produces more focused, timely suggestions. Faster API response.',
                  con: 'May miss relevant earlier context',
                  chosen: 'Limited (6 chunks)',
                },
                {
                  decision: 'React useState vs. state management library (Redux, Zustand)',
                  pro: 'Sufficient for this scope, no extra dependency, simpler mental model',
                  con: 'Would need refactor for much larger state',
                  chosen: 'useState + useCallback',
                },
                {
                  decision: 'JSON response format vs. free-form text for suggestions',
                  pro: 'Guaranteed parseable output, no regex extraction needed',
                  con: 'Slightly constrains model creativity',
                  chosen: 'JSON mode',
                },
                {
                  decision: 'Client-side localStorage for settings vs. server database',
                  pro: 'Zero auth needed, instant access, API key never touches server storage',
                  con: 'Settings don\'t sync across devices',
                  chosen: 'localStorage',
                },
              ].map((t, i) => (
                <Card key={i} size="sm">
                  <CardContent className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">{t.decision}</p>
                    <div className="grid grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Pro: </span>
                        <span className="text-muted-foreground">{t.pro}</span>
                      </div>
                      <div>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Con: </span>
                        <span className="text-muted-foreground">{t.con}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-[10px]">{t.chosen}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Built with Next.js, shadcn/ui, Groq, and framer-motion.
            </p>
            <Link href="/">
              <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                <ArrowLeft className="size-3" />
                Back to App
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
