'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ open, settings, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  const update = (key: keyof AppSettings, value: string | number) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const resetPrompts = () => {
    setDraft((prev) => ({
      ...prev,
      suggestionPrompt: DEFAULT_SETTINGS.suggestionPrompt,
      detailedAnswerPrompt: DEFAULT_SETTINGS.detailedAnswerPrompt,
      chatPrompt: DEFAULT_SETTINGS.chatPrompt,
    }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Groq API key, prompts, and context windows.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
          <div className="space-y-2">
            <Label htmlFor="api-key">Groq API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={draft.groqApiKey}
              onChange={(e) => update('groqApiKey', e.target.value)}
              placeholder="gsk_..."
            />
            <p className="text-xs text-muted-foreground">
              Get your key at{' '}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                console.groq.com
              </a>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="suggestion-ctx" className="text-xs">
                Suggestion context (chunks)
              </Label>
              <Input
                id="suggestion-ctx"
                type="number"
                min={1}
                max={50}
                value={draft.suggestionContextChunks}
                onChange={(e) => update('suggestionContextChunks', parseInt(e.target.value) || 6)}
              />
              <p className="text-[11px] text-muted-foreground">How many 30s chunks</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="answer-ctx" className="text-xs">
                Answer context (chunks)
              </Label>
              <Input
                id="answer-ctx"
                type="number"
                min={0}
                max={100}
                value={draft.detailedAnswerContextChunks}
                onChange={(e) =>
                  update('detailedAnswerContextChunks', parseInt(e.target.value) || 0)
                }
              />
              <p className="text-[11px] text-muted-foreground">0 = full transcript</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refresh-int" className="text-xs">
                Refresh interval (sec)
              </Label>
              <Input
                id="refresh-int"
                type="number"
                min={10}
                max={120}
                value={draft.refreshIntervalSeconds}
                onChange={(e) =>
                  update('refreshIntervalSeconds', parseInt(e.target.value) || 30)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-sm">Prompts</Label>
            <Button variant="ghost" size="sm" onClick={resetPrompts} className="gap-1.5 text-xs">
              <RotateCcw className="size-3" />
              Reset to defaults
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="suggestion-prompt" className="text-xs">
              Live Suggestion Prompt
            </Label>
            <textarea
              id="suggestion-prompt"
              value={draft.suggestionPrompt}
              onChange={(e) => update('suggestionPrompt', e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="answer-prompt" className="text-xs">
              Detailed Answer Prompt (on click)
            </Label>
            <textarea
              id="answer-prompt"
              value={draft.detailedAnswerPrompt}
              onChange={(e) => update('detailedAnswerPrompt', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chat-prompt" className="text-xs">
              Chat Prompt
            </Label>
            <textarea
              id="chat-prompt"
              value={draft.chatPrompt}
              onChange={(e) => update('chatPrompt', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
