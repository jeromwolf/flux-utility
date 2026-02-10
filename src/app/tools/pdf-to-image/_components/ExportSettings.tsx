'use client';

import type { ExportOptions } from '@/types/pdf';
import { cn } from '@/lib/utils';

interface ExportSettingsProps {
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
}

export function ExportSettings({ options, onChange }: ExportSettingsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="font-semibold text-sm">내보내기 설정</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Format */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">포맷</label>
          <div className="flex gap-2">
            {(['image/jpeg', 'image/png'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onChange({ ...options, format: fmt })}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  options.format === fmt
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                {fmt === 'image/jpeg' ? 'JPG' : 'PNG'}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">
            품질 <span className="font-medium text-foreground">{Math.round(options.quality * 100)}%</span>
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round(options.quality * 100)}
            onChange={(e) => onChange({ ...options, quality: Number(e.target.value) / 100 })}
            className="w-full accent-primary"
          />
        </div>

        {/* Scale */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">
            해상도 <span className="font-medium text-foreground">{options.scale}x</span>
          </label>
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={options.scale}
            onChange={(e) => onChange({ ...options, scale: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
