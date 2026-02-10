'use client';

import type { PdfOptions, PageSize, Orientation } from '@/lib/image/image-to-pdf';
import { cn } from '@/lib/utils';

interface PdfSettingsProps {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
}

const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
  { value: 'fit', label: '이미지 맞춤' },
];

const ORIENTATION_OPTIONS: { value: Orientation; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 'portrait', label: '세로' },
  { value: 'landscape', label: '가로' },
];

export function PdfSettings({ options, onChange }: PdfSettingsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">PDF 설정</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Page Size */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">페이지 크기</label>
          <div className="flex gap-1.5">
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...options, pageSize: opt.value })}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                  options.pageSize === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">방향</label>
          <div className="flex gap-1.5">
            {ORIENTATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...options, orientation: opt.value })}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                  options.orientation === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">
            여백 <span className="font-medium text-foreground">{options.margin}mm</span>
          </label>
          <input
            type="range"
            min={0}
            max={30}
            value={options.margin}
            onChange={(e) => onChange({ ...options, margin: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* Quality */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">
            품질{' '}
            <span className="font-medium text-foreground">
              {Math.round(options.quality * 100)}%
            </span>
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
      </div>
    </div>
  );
}
