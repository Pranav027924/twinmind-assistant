'use client';

import { Mic, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  onOpenSettings: () => void;
  onExport: () => void;
  hasApiKey: boolean;
}

export default function Header({ onOpenSettings, onExport, hasApiKey }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b bg-background/95 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
          <Mic className="size-4" />
        </div>
        <h1 className="text-base font-semibold tracking-tight">TwinMind</h1>
        {!hasApiKey && (
          <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
            Set API key in Settings
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="sm" onClick={onExport} />}>
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </TooltipTrigger>
          <TooltipContent>Export session</TooltipContent>
        </Tooltip>
        <ThemeToggle />
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={onOpenSettings} />}>
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
