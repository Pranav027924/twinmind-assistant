'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, MessageSquare, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/50 typing-dot"
        />
      ))}
    </div>
  );
}

const StreamingText = memo(function StreamingText({ content }: { content: string }) {
  return (
    <div className="prose-chat text-foreground whitespace-pre-wrap">{content}</div>
  );
});

const RenderedMarkdown = memo(function RenderedMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-chat text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
});

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const isEmptyStreaming = msg.isStreaming && !msg.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div className={cn(
        'shrink-0 size-7 rounded-lg flex items-center justify-center mt-0.5',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div className={cn('max-w-[82%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border rounded-bl-md'
          )}
        >
          {isUser ? (
            <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
          ) : isEmptyStreaming ? (
            <TypingIndicator />
          ) : msg.isStreaming ? (
            <StreamingText content={msg.content} />
          ) : (
            <RenderedMarkdown content={msg.content} />
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 px-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span className="text-[10px] text-muted-foreground/50 tabular-nums font-mono">
            {formatTime(msg.timestamp)}
          </span>
          {msg.isStreaming && msg.content && (
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPanel({ messages, onSendMessage, isResponding }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);

  const lastMsg = messages[messages.length - 1];

  const scrollToBottom = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, lastMsg?.content, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isResponding) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
        <div className="flex items-center gap-2">
          <MessageSquare className="size-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Chat
          </h2>
          {messages.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              ({messages.filter((m) => m.role === 'user').length})
            </span>
          )}
        </div>
        <AnimatePresence>
          {isResponding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1 rounded-full bg-primary typing-dot" />
                ))}
              </div>
              <span className="text-[11px] text-primary font-medium">Responding</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Separator />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="size-16 rounded-2xl bg-muted/80 flex items-center justify-center"
            >
              <MessageSquare className="size-6 text-muted-foreground/50" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Start a conversation</p>
              <p className="text-xs text-muted-foreground/60">
                Click a suggestion or ask a question about the meeting
              </p>
            </div>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
      </div>

      <Separator />
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-2 items-end rounded-xl border bg-card p-1.5 focus-within:ring-2 focus-within:ring-ring/50 transition-shadow">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the conversation..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none min-h-[36px] max-h-[120px]"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isResponding}
            className="rounded-lg shrink-0 size-8 transition-all duration-200"
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
