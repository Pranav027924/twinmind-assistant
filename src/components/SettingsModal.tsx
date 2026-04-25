'use client';

import { useState } from 'react';
import { RotateCcw, Key, SlidersHorizontal, FileText, Briefcase } from 'lucide-react';
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
import type { AppSettings, MeetingType } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'sales_call', label: 'Sales call' },
  { value: 'pitch', label: 'Investor pitch' },
  { value: 'sprint_planning', label: 'Sprint planning' },
  { value: 'interview', label: 'Interview / hiring' },
  { value: 'one_on_one', label: '1:1 / check-in' },
  { value: 'brainstorm', label: 'Brainstorm' },
  { value: 'support', label: 'Support call' },
  { value: 'generic', label: 'Generic meeting' },
];

export default function SettingsModal(props: SettingsModalProps) {
  // When closed, the Dialog still renders but we re-mount the form on each
  // open by keying on the settings snapshot. This avoids effect-driven syncing
  // and ensures the draft starts fresh whenever the user opens the modal.
  return (
    <SettingsModalForm
      key={props.open ? `o-${props.settings.groqApiKey.length}-${props.settings.meetingType}` : 'closed'}
      {...props}
    />
  );
}

function SettingsModalForm({ open, settings, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
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
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your Groq API key, meeting context, prompts, and context windows.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-2 pr-1">
          {/* API Key */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="size-3.5 text-primary" />
              API Key
            </div>
            <div className="space-y-1.5">
              <Input
                id="api-key"
                type="password"
                value={draft.groqApiKey}
                onChange={(e) => update('groqApiKey', e.target.value)}
                placeholder="gsk_..."
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Get your free key at{' '}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-2"
                >
                  console.groq.com
                </a>
              </p>
            </div>
          </div>

          {/* Meeting Context */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="size-3.5 text-primary" />
              Meeting Context
            </div>
            <p className="text-[11px] text-muted-foreground">
              Telling the copilot what kind of meeting this is and your role dramatically
              improves suggestion quality.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="meeting-type" className="text-[11px] text-muted-foreground">
                  Meeting type
                </Label>
                <select
                  id="meeting-type"
                  value={draft.meetingType}
                  onChange={(e) => update('meetingType', e.target.value as MeetingType)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {MEETING_TYPES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-role" className="text-[11px] text-muted-foreground">
                  Your role in this meeting
                </Label>
                <Input
                  id="user-role"
                  type="text"
                  value={draft.userRole}
                  onChange={(e) => update('userRole', e.target.value)}
                  placeholder="e.g. Founder pitching, Hiring manager, AE"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-goal" className="text-[11px] text-muted-foreground">
                Goal for this meeting (one line, optional)
              </Label>
              <Input
                id="meeting-goal"
                type="text"
                value={draft.meetingGoal}
                onChange={(e) => update('meetingGoal', e.target.value)}
                placeholder="e.g. Close a $200K deal, decide on Q2 roadmap"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Parameters */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="size-3.5 text-primary" />
              Parameters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="suggestion-ctx" className="text-[11px] text-muted-foreground">
                  Suggestion context
                </Label>
                <Input
                  id="suggestion-ctx"
                  type="number"
                  min={1}
                  max={50}
                  value={draft.suggestionContextChunks}
                  onChange={(e) => update('suggestionContextChunks', parseInt(e.target.value) || 6)}
                  className="h-8 text-sm"
                />
                <p className="text-[10px] text-muted-foreground/60">chunks (~30s each)</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="answer-ctx" className="text-[11px] text-muted-foreground">
                  Answer context
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
                  className="h-8 text-sm"
                />
                <p className="text-[10px] text-muted-foreground/60">0 = full transcript</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="refresh-int" className="text-[11px] text-muted-foreground">
                  Refresh interval
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
                  className="h-8 text-sm"
                />
                <p className="text-[10px] text-muted-foreground/60">seconds</p>
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="size-3.5 text-primary" />
                Prompts
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPrompts}
                className="gap-1.5 text-[11px] h-7"
              >
                <RotateCcw className="size-3" />
                Reset defaults
              </Button>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label htmlFor="suggestion-prompt" className="text-[11px] text-muted-foreground">
                Live Suggestion Prompt
              </Label>
              <textarea
                id="suggestion-prompt"
                value={draft.suggestionPrompt}
                onChange={(e) => update('suggestionPrompt', e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="answer-prompt" className="text-[11px] text-muted-foreground">
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
              <Label htmlFor="chat-prompt" className="text-[11px] text-muted-foreground">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
