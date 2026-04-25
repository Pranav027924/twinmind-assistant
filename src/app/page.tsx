'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Mic, Sparkles, MessageSquare } from 'lucide-react';
import type {
  TranscriptChunk,
  Suggestion,
  SuggestionBatch,
  ChatMessage,
  AppSettings,
} from '@/types';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { usePersistedSettings } from '@/hooks/usePersistedSettings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import TranscriptPanel from '@/components/TranscriptPanel';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import ChatPanel, { type ChatPanelHandle } from '@/components/ChatPanel';
import SettingsModal from '@/components/SettingsModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast } from 'sonner';
import { isLikelyHallucination } from '@/lib/hallucinations';
import { analyzeAudioActivity } from '@/lib/audio';
import { parseSseStream } from '@/lib/sse';
import { buildTranscriptText } from '@/lib/format';
import { recordLatency, timed } from '@/lib/telemetry';
import { ANTI_REPETITION_TITLE_COUNT, ROLLING_SUMMARY_EVERY_N_CHUNKS } from '@/lib/constants';

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function Home() {
  const [settings, setSettings] = usePersistedSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
  const [batches, setBatches] = useState<SuggestionBatch[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isChatResponding, setIsChatResponding] = useState(false);
  const [rollingSummary, setRollingSummary] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'transcript' | 'suggestions' | 'chat'>(
    'transcript'
  );

  const chunksRef = useRef<TranscriptChunk[]>([]);
  const settingsRef = useRef<AppSettings>(settings);
  const batchesRef = useRef<SuggestionBatch[]>([]);
  const summaryRef = useRef<string>('');
  const lastSummaryAtChunkCountRef = useRef<number>(0);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const chatPanelRef = useRef<ChatPanelHandle>(null);

  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);

  useEffect(() => {
    summaryRef.current = rollingSummary;
  }, [rollingSummary]);

  // -------- Audio → transcribe pipeline --------
  const transcribeAudio = useCallback(async (blob: Blob): Promise<string | null> => {
    const s = settingsRef.current;
    if (!s.groqApiKey) return null;

    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    try {
      return await timed('transcribe', async () => {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'x-groq-api-key': s.groqApiKey },
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Transcription failed' }));
          toast.error('Transcription failed', { description: err.error });
          return null;
        }
        const data = await res.json();
        return (data.text as string) || null;
      });
    } catch (err) {
      console.error('Transcription failed:', err);
      toast.error('Transcription failed', { description: 'Network error' });
      return null;
    }
  }, []);

  // Compress older transcript into a rolling summary when chunks pass thresholds.
  const updateRollingSummary = useCallback(async (allChunks: TranscriptChunk[]) => {
    const s = settingsRef.current;
    if (!s.groqApiKey) return;
    if (allChunks.length < ROLLING_SUMMARY_EVERY_N_CHUNKS) return;
    if (allChunks.length - lastSummaryAtChunkCountRef.current < ROLLING_SUMMARY_EVERY_N_CHUNKS) return;

    // Summarize everything that's NOT in the suggestion-context window so we
    // never duplicate. This keeps the summary as "older context only".
    const olderChunks = allChunks.slice(0, Math.max(0, allChunks.length - s.suggestionContextChunks));
    if (olderChunks.length === 0) return;

    try {
      const transcript = buildTranscriptText(olderChunks);
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-api-key': s.groqApiKey,
        },
        body: JSON.stringify({ transcript, prevSummary: summaryRef.current }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.summary) {
        setRollingSummary(data.summary);
        lastSummaryAtChunkCountRef.current = allChunks.length;
      }
    } catch (err) {
      console.error('Summary failed:', err);
    }
  }, []);

  // -------- Suggestion generation --------
  const generateSuggestions = useCallback(async (allChunks: TranscriptChunk[]) => {
    const s = settingsRef.current;
    if (!s.groqApiKey || allChunks.length === 0) return;

    const transcript = buildTranscriptText(allChunks, s.suggestionContextChunks);
    if (!transcript.trim()) return;

    // Cancel any in-flight suggestion request — only the freshest matters.
    suggestionAbortRef.current?.abort();
    const abort = new AbortController();
    suggestionAbortRef.current = abort;

    // Anti-repetition memory: pull recent suggestion titles from prior batches.
    const avoidTitles = batchesRef.current
      .slice(0, 2)
      .flatMap((b) => b.suggestions.map((sg) => sg.title))
      .slice(0, ANTI_REPETITION_TITLE_COUNT);

    setIsGeneratingSuggestions(true);
    try {
      const data = await timed('suggestions', async () => {
        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-groq-api-key': s.groqApiKey,
          },
          signal: abort.signal,
          body: JSON.stringify({
            transcript,
            systemPrompt: s.suggestionPrompt,
            meetingType: s.meetingType,
            userRole: s.userRole,
            meetingGoal: s.meetingGoal,
            rollingSummary: summaryRef.current || undefined,
            avoidTitles,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText.slice(0, 200));
        }
        return res.json();
      });

      if (abort.signal.aborted) return;

      const suggestions: Suggestion[] = (data.suggestions || []).map(
        (sg: Omit<Suggestion, 'id'>) => ({ ...sg, id: newId() })
      );

      if (suggestions.length > 0) {
        const batch: SuggestionBatch = {
          id: newId(),
          suggestions,
          timestamp: Date.now(),
        };
        setBatches((prev) => [batch, ...prev]);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      console.error('Suggestions failed:', err);
      toast.error('Failed to generate suggestions', {
        description: err instanceof Error ? err.message.slice(0, 120) : undefined,
      });
    } finally {
      if (suggestionAbortRef.current === abort) {
        suggestionAbortRef.current = null;
      }
      setIsGeneratingSuggestions(false);
    }
  }, []);

  const handleAudioChunk = useCallback(
    async (blob: Blob) => {
      // Client-side VAD gate. Whisper-Large-v3 hallucinates aggressively on
      // silent / low-energy audio (boilerplate phrases, repeating loops).
      // Skipping the API call entirely is the most reliable mitigation and
      // also saves quota.
      const vad = await analyzeAudioActivity(blob);
      if (!vad.hasSpeech) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(
            '[vad] skipping silent chunk',
            `maxRms=${vad.maxRms.toFixed(4)}`,
            `active=${vad.activeWindows}/${vad.totalWindows}`
          );
        }
        return;
      }

      setIsTranscribing(true);
      const text = await transcribeAudio(blob);
      setIsTranscribing(false);

      if (!text) return;
      const trimmed = text.trim();
      if (isLikelyHallucination(trimmed)) return;

      const newChunk: TranscriptChunk = {
        id: newId(),
        text: trimmed,
        timestamp: Date.now(),
      };
      const updatedChunks = [...chunksRef.current, newChunk];
      setChunks(updatedChunks);
      chunksRef.current = updatedChunks;

      // Fire suggestions and (lazily) refresh rolling summary.
      generateSuggestions(updatedChunks);
      updateRollingSummary(updatedChunks);
    },
    [transcribeAudio, generateSuggestions, updateRollingSummary]
  );

  const { isRecording, hasEverStarted, start, stop, flush } = useAudioRecorder(
    handleAudioChunk,
    settings.refreshIntervalSeconds * 1000
  );

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stop();
      toast.info('Recording stopped');
    } else {
      if (!settingsRef.current.groqApiKey) {
        toast.error('API key required', {
          description: 'Set your Groq API key in Settings first.',
        });
        return;
      }
      try {
        await start();
        toast.success('Recording started');
      } catch {
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access in your browser settings.',
        });
      }
    }
  }, [isRecording, start, stop]);

  /**
   * Manual refresh — spec: "manually updates transcript then suggestions if tapped".
   * We must always re-call /api/suggestions, even if no new audio arrived.
   * If recording, we also flush the in-flight chunk first so the user gets the
   * very latest transcript before the model thinks.
   */
  const handleManualRefresh = useCallback(async () => {
    if (isRecording) {
      await flush();
      // After flush, handleAudioChunk will append + generate suggestions.
      // If no new chunk arrives (silence), we still trigger suggestions:
      setTimeout(() => {
        if (chunksRef.current.length > 0 && !isGeneratingSuggestions) {
          generateSuggestions(chunksRef.current);
        }
      }, 50);
    } else if (chunksRef.current.length > 0) {
      // Not recording but we have a transcript — regenerate from existing context.
      generateSuggestions(chunksRef.current);
    } else {
      toast.info('Nothing to refresh', {
        description: 'Start recording or speak first to build a transcript.',
      });
    }
  }, [isRecording, flush, generateSuggestions, isGeneratingSuggestions]);

  // -------- Chat streaming --------
  const streamChatResponse = useCallback(
    async (
      chatMessages: { role: string; content: string }[],
      systemPrompt: string,
      transcript: string,
      messageId: string,
      isDetailedAnswer: boolean
    ) => {
      const s = settingsRef.current;
      setIsChatResponding(true);
      const t0 = performance.now();
      let firstTokenSeen = false;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-groq-api-key': s.groqApiKey,
          },
          body: JSON.stringify({
            messages: chatMessages,
            systemPrompt,
            transcript,
            meetingType: s.meetingType,
            userRole: s.userRole,
            meetingGoal: s.meetingGoal,
            isDetailedAnswer,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: `Error: ${err.error || 'Failed to get response'}`, isStreaming: false }
                : m
            )
          );
          return;
        }

        if (!res.body) return;

        let fullContent = '';
        await parseSseStream(res.body, (data) => {
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              if (!firstTokenSeen) {
                firstTokenSeen = true;
                recordLatency('chat_ttft', performance.now() - t0);
              }
              fullContent += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, content: fullContent, isStreaming: true } : m
                )
              );
            }
          } catch {
            /* ignore non-json keepalive lines */
          }
        });

        recordLatency('chat_total', performance.now() - t0);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isStreaming: false } : m))
        );
      } catch (err) {
        console.error('Chat stream error:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: 'Error: Failed to connect to the AI service.', isStreaming: false }
              : m
          )
        );
      } finally {
        setIsChatResponding(false);
      }
    },
    []
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      const s = settingsRef.current;
      if (!s.groqApiKey) {
        toast.error('API key required', { description: 'Set your Groq API key in Settings.' });
        return;
      }

      const userContent = `${suggestion.title}\n${suggestion.preview}`;
      const userMsg: ChatMessage = {
        id: newId(),
        role: 'user',
        content: userContent,
        timestamp: Date.now(),
      };

      const assistantId = newId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        sourceSuggestion: {
          type: suggestion.type,
          title: suggestion.title,
          triggerQuote: suggestion.triggerQuote,
        },
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      // On mobile, flip to chat tab so the user sees the answer.
      setActiveTab('chat');

      const maxChunks = s.detailedAnswerContextChunks || undefined;
      const transcript = buildTranscriptText(chunksRef.current, maxChunks);

      // Send the suggestion's anchor quote so the model is grounded in WHY it
      // was triggered, not just what.
      const apiMessages = [
        {
          role: 'user',
          content: `I clicked this suggestion during our meeting. Provide the detailed answer.

Suggestion type: ${suggestion.type}
Title: ${suggestion.title}
Preview: ${suggestion.preview}${
            suggestion.triggerQuote
              ? `\nTriggered by line in transcript: "${suggestion.triggerQuote}"`
              : ''
          }${
            suggestion.confidence
              ? `\nInitial confidence on the underlying claim: ${suggestion.confidence}`
              : ''
          }

Use the type-aware response template for "${suggestion.type}".`,
        },
      ];

      streamChatResponse(apiMessages, s.detailedAnswerPrompt, transcript, assistantId, true);
    },
    [streamChatResponse]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      const s = settingsRef.current;
      if (!s.groqApiKey) {
        toast.error('API key required', { description: 'Set your Groq API key in Settings.' });
        return;
      }

      const userMsg: ChatMessage = {
        id: newId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantId = newId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      // Snapshot history BEFORE we add the new user/assistant pair so the
      // assistant sees the full prior context (without the empty streaming msg).
      setMessages((prev) => {
        const apiHistory = prev
          .filter((m) => !m.isStreaming && m.content)
          .map((m) => ({ role: m.role, content: m.content }));
        const apiMessages = [...apiHistory, { role: 'user', content }];
        const maxChunks = s.detailedAnswerContextChunks || undefined;
        const transcript = buildTranscriptText(chunksRef.current, maxChunks);
        // Fire and forget — we're inside setState updater so we kick the
        // request after the state update.
        queueMicrotask(() =>
          streamChatResponse(apiMessages, s.chatPrompt, transcript, assistantId, false)
        );
        return [...prev, userMsg, assistantMsg];
      });
    },
    [streamChatResponse]
  );

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      meetingContext: {
        meetingType: settings.meetingType,
        userRole: settings.userRole,
        meetingGoal: settings.meetingGoal,
      },
      transcript: chunks.map((c) => ({
        text: c.text,
        timestamp: new Date(c.timestamp).toISOString(),
      })),
      rollingSummary,
      suggestions: batches.map((b) => ({
        timestamp: new Date(b.timestamp).toISOString(),
        suggestions: b.suggestions.map((s) => ({
          type: s.type,
          title: s.title,
          preview: s.preview,
          triggerQuote: s.triggerQuote,
          confidence: s.confidence,
        })),
      })),
      chat: messages.map((m) => ({
        role: m.role,
        content: m.content,
        sourceSuggestion: m.sourceSuggestion,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinmind-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Session exported');
  }, [chunks, batches, messages, rollingSummary, settings.meetingType, settings.userRole, settings.meetingGoal]);

  const handleSettingsSave = useCallback(
    (newSettings: AppSettings) => {
      setSettings(newSettings);
      toast.success('Settings saved');
    },
    [setSettings]
  );

  // -------- Keyboard shortcuts --------
  const shortcutHandlers = useMemo(
    () => ({
      onToggleRecording: handleToggleRecording,
      onFocusChat: () => {
        setActiveTab('chat');
        setTimeout(() => chatPanelRef.current?.focusInput(), 50);
      },
      onRefresh: handleManualRefresh,
      onCloseModal: () => showSettings && setShowSettings(false),
    }),
    [handleToggleRecording, handleManualRefresh, showSettings]
  );
  useKeyboardShortcuts(shortcutHandlers);

  const transcriptPanel = (
    <ErrorBoundary label="Transcript">
      <TranscriptPanel
        chunks={chunks}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        onToggleRecording={handleToggleRecording}
        hasApiKey={!!settings.groqApiKey}
      />
    </ErrorBoundary>
  );

  const suggestionsPanel = (
    <ErrorBoundary label="Suggestions">
      <SuggestionsPanel
        batches={batches}
        isLoading={isGeneratingSuggestions}
        onSuggestionClick={handleSuggestionClick}
        onRefresh={handleManualRefresh}
        isRecording={isRecording}
        hasTranscript={chunks.length > 0}
      />
    </ErrorBoundary>
  );

  const chatPanel = (
    <ErrorBoundary label="Chat">
      <ChatPanel
        ref={chatPanelRef}
        messages={messages}
        onSendMessage={handleSendMessage}
        isResponding={isChatResponding}
      />
    </ErrorBoundary>
  );

  return (
    <div className="flex flex-col h-dvh bg-background">
      <Header
        onOpenSettings={() => setShowSettings(true)}
        onExport={handleExport}
        hasApiKey={!!settings.groqApiKey}
        isRecording={isRecording}
      />

      <main className="flex-1 overflow-hidden">
        {/* DESKTOP: 3-column resizable layout (≥ md). UI/UX preserved. */}
        <div className="hidden md:block h-full">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel
              id="transcript-panel"
              defaultSize="28%"
              minSize="20%"
              maxSize="40%"
            >
              {transcriptPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="suggestions-panel"
              defaultSize="36%"
              minSize="25%"
            >
              {suggestionsPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="chat-panel"
              defaultSize="36%"
              minSize="25%"
            >
              {chatPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* MOBILE: Tabs layout (< md). Sticky tab bar, full-bleed panels. */}
        <div className="md:hidden h-full flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="h-full flex flex-col gap-0"
          >
            <div className="px-3 pt-2 pb-2 border-b bg-background/80 backdrop-blur-md">
              <TabsList className="w-full">
                <TabsTrigger value="transcript" className="flex-1">
                  <Mic className="size-3" />
                  <span>Transcript</span>
                  {chunks.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground/60 ml-0.5">
                      {chunks.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1">
                  <Sparkles className="size-3" />
                  <span>Suggestions</span>
                  {batches.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground/60 ml-0.5">
                      {batches.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">
                  <MessageSquare className="size-3" />
                  <span>Chat</span>
                  {messages.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground/60 ml-0.5">
                      {messages.filter((m) => m.role === 'user').length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="transcript">{transcriptPanel}</TabsContent>
            <TabsContent value="suggestions">{suggestionsPanel}</TabsContent>
            <TabsContent value="chat">{chatPanel}</TabsContent>
          </Tabs>
        </div>
      </main>

      <SettingsModal
        open={showSettings}
        settings={settings}
        onSave={handleSettingsSave}
        onClose={() => setShowSettings(false)}
      />

      {/* hint badge to set API key on first run */}
      {!hasEverStarted && !settings.groqApiKey && !showSettings && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-40">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium shadow-lg hover:opacity-90 transition-opacity"
          >
            Set your Groq API key →
          </button>
        </div>
      )}
    </div>
  );
}
