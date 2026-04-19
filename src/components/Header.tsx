'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Download, Settings, Radio, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  onOpenSettings: () => void;
  onExport: () => void;
  hasApiKey: boolean;
  isRecording: boolean;
}

export default function Header({ onOpenSettings, onExport, hasApiKey, isRecording }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-2.5 border-b bg-background/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <Image
          src="https://framerusercontent.com/images/2d6Z9rsGpWIVujaD9PH1CioRheY.png?scale-down-to=512"
          alt="TwinMind"
          width={36}
          height={36}
          unoptimized
          className="size-9 rounded-xl object-cover shadow-sm"
        />
        <div>
          <h1 className="text-base font-semibold tracking-tight gradient-text">TwinMind</h1>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-red-500" />
              </span>
              <span className="text-xs font-medium text-red-600 dark:text-red-400">Recording</span>
            </motion.div>
          ) : !hasApiKey ? (
            <motion.div
              key="no-key"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700 text-[11px]">
                Set API key in Settings
              </Badge>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <Radio className="size-3 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Ready</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="sm" onClick={onExport} className="gap-1.5" />}>
            <Download className="size-3.5" />
            <span className="hidden sm:inline text-xs">Export</span>
          </TooltipTrigger>
          <TooltipContent>Export session as JSON</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={
            <Link href="/docs">
              <Button variant="ghost" size="icon">
                <BookOpen className="size-4" />
                <span className="sr-only">Documentation</span>
              </Button>
            </Link>
          }>
          </TooltipTrigger>
          <TooltipContent>Documentation</TooltipContent>
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
