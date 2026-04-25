'use client';

import { useEffect } from 'react';

interface ShortcutHandlers {
  onToggleRecording?: () => void;
  onFocusChat?: () => void;
  onRefresh?: () => void;
  onCloseModal?: () => void;
}

/**
 * Global keyboard shortcuts:
 *   Space  → toggle recording (when not typing in an input)
 *   /      → focus the chat input
 *   R      → manual refresh suggestions
 *   Esc    → close modal
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        target?.isContentEditable === true;

      if (e.key === 'Escape') {
        handlers.onCloseModal?.();
        return;
      }

      if (isTyping) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlers.onToggleRecording?.();
      } else if (e.key === '/') {
        e.preventDefault();
        handlers.onFocusChat?.();
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.onRefresh?.();
      }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [handlers]);
}
