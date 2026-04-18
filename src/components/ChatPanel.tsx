'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isResponding: boolean;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.*)/gm, '<h4 class="font-semibold text-sm mt-2 mb-1">$1</h4>')
    .replace(/^## (.*)/gm, '<h3 class="font-semibold text-sm mt-2 mb-1">$1</h3>')
    .replace(/^- (.*)/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/^(\d+)\. (.*)/gm, '<li class="ml-4 list-decimal text-sm">$2</li>')
    .replace(/\n/g, '<br />');
}

export default function ChatPanel({ messages, onSendMessage, isResponding }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageContent = messages[messages.length - 1]?.content;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, lastMessageContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isResponding) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Chat
        </h2>
        {isResponding && (
          <span className="text-xs text-primary animate-pulse font-medium">Responding...</span>
        )}
      </div>
      <Separator />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center gap-3 py-12">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="size-5 text-muted-foreground/60" />
            </div>
            <p>Click a suggestion or type a question</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              )}
            >
              {msg.role === 'assistant' ? (
                <div
                  className="leading-relaxed chat-markdown"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || '') }}
                />
              ) : (
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              )}
              <div
                className={cn(
                  'text-[11px] mt-1.5 tabular-nums',
                  msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                )}
              >
                {formatTime(msg.timestamp)}
                {msg.isStreaming && <span className="ml-1.5 animate-pulse">●</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the conversation..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="default" disabled={!input.trim() || isResponding}>
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
