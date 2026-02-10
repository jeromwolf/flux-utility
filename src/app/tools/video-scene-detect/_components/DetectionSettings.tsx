'use client';

import type { DetectionOptions, Sensitivity } from '@/types/video';
import { cn } from '@/lib/utils';

interface DetectionSettingsProps {
  options: DetectionOptions;
  onChange: (options: DetectionOptions) => void;
}

const SENSITIVITY_OPTIONS: { value: Sensitivity; label: string; desc: string }[] = [
  { value: 'high', label: '높음', desc: '작은 변화도 감지' },
  { value: 'medium', label: '보통', desc: '일반적인 슬라이드 전환' },
  { value: 'low', label: '낮음', desc: '큰 변화만 감지' },
];

export function DetectionSettings({ options, onChange }: DetectionSettingsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">감지 설정</h3>

      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">감지 민감도</label>
        <div className="grid grid-cols-3 gap-2">
          {SENSITIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...options, sensitivity: opt.value })}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 transition-colors',
                options.sensitivity === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
