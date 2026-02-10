'use client';

import { Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatermarkOptionsProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function WatermarkOptions({ enabled, onChange }: WatermarkOptionsProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 transition-all w-full text-left',
        enabled
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30'
      )}
    >
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
        enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
      )}>
        <Eraser className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">NotebookLM 워터마크 제거</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          페이지 우하단의 NotebookLM 로고를 자동으로 감지하고 제거합니다
        </p>
      </div>
      <div className={cn(
        'h-6 w-11 shrink-0 rounded-full transition-colors relative',
        enabled ? 'bg-primary' : 'bg-muted'
      )}>
        <div className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </div>
    </button>
  );
}
