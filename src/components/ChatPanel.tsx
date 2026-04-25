'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Send,
  MessageSquare,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Quote,
  Megaphone,
  Lightbulb,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ChatPanelHandle {
  focusInput: () => void;
}

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
        <span key={i} className="size-1.5 rounded-full bg-muted-foreground/50 typing-dot" />
      ))}
    </div>
  );
}

// -------- Markdown enhancement helpers --------

interface MdNode {
  type?: string;
  value?: string;
  children?: MdNode[];
}

function getMdNodeText(node: MdNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) return node.children.map(getMdNodeText).join('');
  return '';
}

function reactNodesToText(nodes: React.ReactNode): string {
  if (nodes == null || typeof nodes === 'boolean') return '';
  if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes);
  if (Array.isArray(nodes)) return nodes.map(reactNodesToText).join('');
  if (typeof nodes === 'object' && 'props' in nodes) {
    const el = nodes as { props: { children?: React.ReactNode } };
    return reactNodesToText(el.props.children);
  }
  return '';
}

// Bold text that contains a digit gets a stat-chip treatment (mono + filled
// background). Bold names ("Sarah", "Acme Corp") stay as plain emphasis.
function isStatLike(text: string): boolean {
  if (text.length > 32) return false;
  return /\d/.test(text);
}

type TldrVariant = 'good' | 'warn' | 'bad' | 'unknown' | 'info';

function tldrVariant(text: string): TldrVariant {
  // Look at first ~40 chars after the "TL;DR:" prefix.
  const window = text.replace(/^.*?TL;DR:?\s*/i, '').slice(0, 40);
  if (/✓/.test(window)) return 'good';
  if (/⚠/.test(window)) return 'warn';
  if (/✗/.test(window)) return 'bad';
  if (/(^|\s)\?/.test(window)) return 'unknown';
  return 'info';
}

const TLDR_ICON: Record<TldrVariant, React.ElementType> = {
  good: CheckCircle2,
  warn: AlertTriangle,
  bad: XCircle,
  unknown: HelpCircle,
  info: Sparkles,
};

type CalloutVariant =
  | 'verdict-good'
  | 'verdict-warn'
  | 'verdict-bad'
  | 'verdict-unknown'
  | 'speak'
  | 'matters'
  | 'risk'
  | 'action'
  | 'plain';

function calloutVariant(text: string): CalloutVariant {
  const t = text.toLowerCase();
  if (/verdict/.test(t)) {
    if (/✓/.test(text)) return 'verdict-good';
    if (/⚠/.test(text)) return 'verdict-warn';
    if (/✗/.test(text)) return 'verdict-bad';
    return 'verdict-unknown';
  }
  if (/say it like|ask it like/.test(t)) return 'speak';
  if (/why it matters/.test(t)) return 'matters';
  if (/risk|warning/.test(t)) return 'risk';
  if (/action|next step|bring it up|follow-up|inference/.test(t)) return 'action';
  return 'plain';
}

const CALLOUT_ICON: Record<CalloutVariant, React.ElementType> = {
  'verdict-good': CheckCircle2,
  'verdict-warn': AlertTriangle,
  'verdict-bad': XCircle,
  'verdict-unknown': HelpCircle,
  speak: Quote,
  matters: Lightbulb,
  risk: ShieldAlert,
  action: Target,
  plain: Megaphone,
};

const MARKDOWN_COMPONENTS: Components = {
  // Detect the TL;DR paragraph and render as a colored gradient card.
  p({ node, children, ...props }) {
    const text = getMdNodeText(node as MdNode);
    if (/^\s*[*_]*\s*TL;DR/i.test(text)) {
      const variant = tldrVariant(text);
      const Icon = TLDR_ICON[variant];
      return (
        <div className={cn('tldr-card', `tldr-${variant}`)}>
          <span className="tldr-icon">
            <Icon className="size-3.5" strokeWidth={2.4} />
          </span>
          <div className="tldr-body">{children}</div>
        </div>
      );
    }
    return <p {...props}>{children}</p>;
  },
  // Blockquotes become labeled callout boxes.
  blockquote({ node, children }) {
    const text = getMdNodeText(node as MdNode);
    const variant = calloutVariant(text);
    const Icon = CALLOUT_ICON[variant];
    return (
      <div className={cn('callout', `callout-${variant}`)}>
        <span className="callout-icon">
          <Icon className="size-3.5" strokeWidth={2.4} />
        </span>
        <div className="callout-body">{children}</div>
      </div>
    );
  },
  // Bold treatment — emits data-stat for numeric content so CSS can give
  // numbers a chip treatment, while plain bold names get a softer emphasis.
  strong({ children }) {
    const text = reactNodesToText(children);
    if (isStatLike(text)) {
      return <strong data-stat="true">{children}</strong>;
    }
    return <strong>{children}</strong>;
  },
  // Suppress tables — the prompt forbids them but guard against drift.
  table() {
    return null;
  },
  // Disable headers — chat shouldn't have huge h1/h2 in a 90-word answer.
  h1({ children }) {
    return <p className="font-semibold text-foreground">{children}</p>;
  },
  h2({ children }) {
    return <p className="font-semibold text-foreground">{children}</p>;
  },
  h3({ children }) {
    return <p className="font-semibold text-foreground">{children}</p>;
  },
};

const RenderedMarkdown = memo(function RenderedMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-chat text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
});

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  }, [text]);
  return (
    <button
      onClick={handle}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-foreground"
      aria-label="Copy message"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const isEmptyStreaming = msg.isStreaming && !msg.content;
  const canCopy = !isUser && !!msg.content && !msg.isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('group flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'shrink-0 size-7 rounded-lg flex items-center justify-center mt-0.5',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-primary/15 to-primary/5 text-primary'
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div
        className={cn(
          'max-w-[88%] sm:max-w-[82%] space-y-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {!isUser && msg.sourceSuggestion && (
          <div className="text-[10px] text-muted-foreground/70 px-1 italic flex items-center gap-1">
            <Sparkles className="size-2.5" />
            from suggestion:{' '}
            <span className="font-medium not-italic text-foreground/80">
              {msg.sourceSuggestion.title}
            </span>
          </div>
        )}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm relative',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'assistant-bubble rounded-bl-md'
          )}
        >
          {isUser ? (
            <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
          ) : isEmptyStreaming ? (
            <TypingIndicator />
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
          {canCopy && <CopyButton text={msg.content} />}
        </div>
      </div>
    </motion.div>
  );
}

const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>(function ChatPanel(
  { messages, onSendMessage, isResponding },
  ref
) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => textareaRef.current?.focus(),
  }));

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
              className="size-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center"
            >
              <MessageSquare className="size-6 text-primary/60" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Start a conversation</p>
              <p className="text-xs text-muted-foreground/60">
                Click a suggestion or ask a question about the meeting
              </p>
              <p className="text-[10px] text-muted-foreground/40 pt-2">
                Press <kbd className="font-mono px-1 py-0.5 rounded bg-muted">/</kbd> to focus chat
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
});

export default ChatPanel;
