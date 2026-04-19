'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TranscriptChunk, Suggestion, SuggestionBatch, ChatMessage, AppSettings } from '@/types';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { usePersistedSettings } from '@/hooks/usePersistedSettings';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import Header from '@/components/Header';
import TranscriptPanel from '@/components/TranscriptPanel';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import ChatPanel from '@/components/ChatPanel';
import SettingsModal from '@/components/SettingsModal';
import { toast } from 'sonner';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

  const chunksRef = useRef<TranscriptChunk[]>([]);
  const settingsRef = useRef<AppSettings>(settings);

  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const getTranscriptText = useCallback((chunkList: TranscriptChunk[], maxChunks?: number): string => {
    const sliced = maxChunks && maxChunks > 0 ? chunkList.slice(-maxChunks) : chunkList;
    return sliced.map((c) => c.text).join('\n\n');
  }, []);

  const transcribeAudio = useCallback(async (blob: Blob): Promise<string | null> => {
    const s = settingsRef.current;
    if (!s.groqApiKey) return null;

    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'x-groq-api-key': s.groqApiKey },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error('Transcription failed', { description: err.error });
        return null;
      }
      const data = await res.json();
      return data.text || null;
    } catch (err) {
      console.error('Transcription failed:', err);
      toast.error('Transcription failed', { description: 'Network error' });
      return null;
    }
  }, []);

  const generateSuggestions = useCallback(async (allChunks: TranscriptChunk[]) => {
    const s = settingsRef.current;
    if (!s.groqApiKey || allChunks.length === 0) return;

    const transcript = getTranscriptText(allChunks, s.suggestionContextChunks);
    if (!transcript.trim()) return;

    setIsGeneratingSuggestions(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-api-key': s.groqApiKey,
        },
        body: JSON.stringify({
          transcript,
          systemPrompt: s.suggestionPrompt,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        toast.error('Suggestions failed', { description: errText.slice(0, 100) });
        return;
      }

      const data = await res.json();
      const suggestions: Suggestion[] = (data.suggestions || []).map((sg: Omit<Suggestion, 'id'>) => ({
        ...sg,
        id: generateId(),
      }));

      if (suggestions.length > 0) {
        const batch: SuggestionBatch = {
          id: generateId(),
          suggestions,
          timestamp: Date.now(),
        };
        setBatches((prev) => [batch, ...prev]);
      }
    } catch (err) {
      console.error('Suggestions failed:', err);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [getTranscriptText]);

  const handleAudioChunk = useCallback(async (blob: Blob) => {
    setIsTranscribing(true);
    const text = await transcribeAudio(blob);
    setIsTranscribing(false);

    if (text && text.trim()) {
      const newChunk: TranscriptChunk = {
        id: generateId(),
        text: text.trim(),
        timestamp: Date.now(),
      };
      const updatedChunks = [...chunksRef.current, newChunk];
      setChunks(updatedChunks);
      chunksRef.current = updatedChunks;
      generateSuggestions(updatedChunks);
    }
  }, [transcribeAudio, generateSuggestions]);

  const { isRecording, start, stop, flush } = useAudioRecorder(
    handleAudioChunk,
    settings.refreshIntervalSeconds * 1000
  );

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stop();
      toast.info('Recording stopped');
    } else {
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

  const handleManualRefresh = useCallback(async () => {
    if (!isRecording) return;
    await flush();
  }, [isRecording, flush]);

  const streamChatResponse = useCallback(async (
    chatMessages: { role: string; content: string }[],
    systemPrompt: string,
    transcript: string,
    messageId: string,
  ) => {
    const s = settingsRef.current;
    setIsChatResponding(true);

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

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, content: fullContent, isStreaming: true } : m
                )
              );
            }
          } catch {}
        }
      }

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
  }, []);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    const s = settingsRef.current;
    if (!s.groqApiKey) {
      toast.error('API key required', { description: 'Set your Groq API key in Settings.' });
      return;
    }

    const userContent = `${suggestion.title}\n${suggestion.preview}`;
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const maxChunks = s.detailedAnswerContextChunks || undefined;
    const transcript = getTranscriptText(chunksRef.current, maxChunks);

    const apiMessages = [
      {
        role: 'user',
        content: `I clicked on this suggestion during our meeting. Please provide a detailed, helpful response.\n\nSuggestion type: ${suggestion.type}\nTitle: ${suggestion.title}\nPreview: ${suggestion.preview}`,
      },
    ];

    streamChatResponse(apiMessages, s.detailedAnswerPrompt, transcript, assistantId);
  }, [getTranscriptText, streamChatResponse]);

  const handleSendMessage = useCallback((content: string) => {
    const s = settingsRef.current;
    if (!s.groqApiKey) {
      toast.error('API key required', { description: 'Set your Groq API key in Settings.' });
      return;
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg, assistantMsg];
      const apiMessages = updated
        .filter((m) => !m.isStreaming || m.content)
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(0, -1);

      const maxChunks = s.detailedAnswerContextChunks || undefined;
      const transcript = getTranscriptText(chunksRef.current, maxChunks);
      streamChatResponse(apiMessages, s.chatPrompt, transcript, assistantId);

      return updated;
    });
  }, [getTranscriptText, streamChatResponse]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      transcript: chunks.map((c) => ({
        text: c.text,
        timestamp: new Date(c.timestamp).toISOString(),
      })),
      suggestions: batches.map((b) => ({
        timestamp: new Date(b.timestamp).toISOString(),
        suggestions: b.suggestions.map((s) => ({
          type: s.type,
          title: s.title,
          preview: s.preview,
        })),
      })),
      chat: messages.map((m) => ({
        role: m.role,
        content: m.content,
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
  }, [chunks, batches, messages]);

  const handleSettingsSave = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    toast.success('Settings saved');
  }, [setSettings]);

  return (
    <div className="flex flex-col h-dvh bg-background">
      <Header
        onOpenSettings={() => setShowSettings(true)}
        onExport={handleExport}
        hasApiKey={!!settings.groqApiKey}
        isRecording={isRecording}
      />

      <main className="flex-1 overflow-hidden">    
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize="28%" minSize="20%" maxSize="40%">
            <TranscriptPanel
              chunks={chunks}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onToggleRecording={handleToggleRecording}
              hasApiKey={!!settings.groqApiKey}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize="36%" minSize="25%">
            <SuggestionsPanel
              batches={batches}
              isLoading={isGeneratingSuggestions}
              onSuggestionClick={handleSuggestionClick}
              onRefresh={handleManualRefresh}
              isRecording={isRecording}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize="36%" minSize="25%">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isResponding={isChatResponding}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <SettingsModal
        open={showSettings}
        settings={settings}
        onSave={handleSettingsSave}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
