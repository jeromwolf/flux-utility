'use client';

import { useState, useEffect, useRef } from 'react';
import { Circle, Square, Download, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecordingControlsProps {
  isRecording: boolean;
  recordedBlob: Blob | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownload: () => void;
}

export function RecordingControls({
  isRecording,
  recordedBlob,
  onStartRecording,
  onStopRecording,
  onDownload,
}: RecordingControlsProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      {/* Mic icon */}
      <Mic className="h-4 w-4 text-muted-foreground" />

      {!isRecording && !recordedBlob && (
        <Button onClick={onStartRecording} size="sm" variant="secondary">
          <Circle className="h-3 w-3 fill-red-500 text-red-500" />
          녹화 시작
        </Button>
      )}

      {isRecording && (
        <>
          {/* Blinking red dot */}
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="min-w-[3.5rem] text-sm font-mono font-medium text-red-500">
            {formatTime(elapsed)}
          </span>
          <Button onClick={onStopRecording} size="sm" variant="secondary">
            <Square className="h-3 w-3 fill-current" />
            녹화 중지
          </Button>
        </>
      )}

      {!isRecording && recordedBlob && (
        <>
          <span className="text-sm text-muted-foreground">
            녹화 완료 ({formatTime(elapsed)})
          </span>
          <Button onClick={onDownload} size="sm">
            <Download className="h-4 w-4" />
            WebM 다운로드
          </Button>
          <Button onClick={onStartRecording} size="sm" variant="ghost">
            <Circle className="h-3 w-3 fill-red-500 text-red-500" />
            다시 녹화
          </Button>
        </>
      )}
    </div>
  );
}
