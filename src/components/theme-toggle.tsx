'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="opacity-0" />;
  }

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={cycle} />}>
        {theme === 'light' && <Sun className="size-4" />}
        {theme === 'dark' && <Moon className="size-4" />}
        {theme === 'system' && <Monitor className="size-4" />}
        <span className="sr-only">Toggle theme ({label})</span>
      </TooltipTrigger>
      <TooltipContent>Theme: {label}</TooltipContent>
    </Tooltip>
  );
}
