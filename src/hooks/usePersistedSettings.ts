'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

const STORAGE_KEY = 'twinmind-settings';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('twinmind-settings-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('twinmind-settings-change', callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function getServerSnapshot(): string {
  return '';
}

export function usePersistedSettings(): [AppSettings, (settings: AppSettings) => void] {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const settings = useMemo<AppSettings>(() => {
    if (!stored) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }, [stored]);

  const setSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      window.dispatchEvent(new Event('twinmind-settings-change'));
    } catch {}
  }, []);

  return [settings, setSettings];
}
