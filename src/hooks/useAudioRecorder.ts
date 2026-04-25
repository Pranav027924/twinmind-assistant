'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  hasEverStarted: boolean;
  start: () => Promise<void>;
  stop: () => void;
  flush: () => Promise<void>;
}

export function useAudioRecorder(
  onChunkReady: (blob: Blob) => void,
  intervalMs: number
): UseAudioRecorderReturn {
  const [hasEverStarted, setHasEverStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onChunkReadyRef = useRef(onChunkReady);
  useEffect(() => {
    onChunkReadyRef.current = onChunkReady;
  }, [onChunkReady]);

  const getMimeType = useCallback(() => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  }, []);

  const startRecorder = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = getMimeType();
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorderRef.current = recorder;
    recorder.start();
  }, [getMimeType]);

  const flushCurrentChunk = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state !== 'recording') {
        resolve();
        return;
      }
      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          onChunkReadyRef.current(blob);
        }
        if (streamRef.current && streamRef.current.active) {
          startRecorder();
        }
        resolve();
      };
      recorder.stop();
    });
  }, [startRecorder]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;
      setIsRecording(true);
      setHasEverStarted(true);
      startRecorder();
      intervalRef.current = setInterval(() => {
        flushCurrentChunk();
      }, intervalMs);
    } catch (err) {
      console.error('Failed to access microphone:', err);
      throw err;
    }
  }, [startRecorder, flushCurrentChunk, intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          onChunkReadyRef.current(blob);
        }
      };
      recorder.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  const flush = useCallback(async () => {
    await flushCurrentChunk();
  }, [flushCurrentChunk]);

  return { isRecording, hasEverStarted, start, stop, flush };
}
