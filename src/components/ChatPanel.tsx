'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isResponding: boolean;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-zinc-100 px-1 rounded text-xs">$1</code>')
    .replace(/^- (.*)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*)/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n/g, '<br />');
}

export default function ChatPanel({ messages, onSendMessage, isResponding }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Chat</h2>
        {isResponding && (
          <span className="text-xs text-indigo-600 animate-pulse">Responding...</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-sm text-center gap-2 py-12">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Click a suggestion or type a question</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              <div
                className={`text-sm leading-relaxed ${msg.role === 'assistant' ? 'chat-markdown' : ''}`}
                dangerouslySetInnerHTML={{
                  __html: msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content.replace(/\n/g, '<br />'),
                }}
              />
              <div
                className={`text-xs mt-1.5 ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-zinc-400'
                }`}
              >
                {formatTime(msg.timestamp)}
                {msg.isStreaming && <span className="ml-1 animate-pulse">●</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the conversation..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isResponding}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
