'use client';

import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OutputFormat } from '@/lib/image/image-resizer';

interface ResizeSettingsProps {
  targetWidth: number;
  targetHeight: number;
  lockAspectRatio: boolean;
  originalWidth: number;
  originalHeight: number;
  format: OutputFormat;
  quality: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onLockChange: (locked: boolean) => void;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
}

export function ResizeSettings({
  targetWidth,
  targetHeight,
  lockAspectRatio,
  originalWidth,
  originalHeight,
  format,
  quality,
  onWidthChange,
  onHeightChange,
  onLockChange,
  onFormatChange,
  onQualityChange,
}: ResizeSettingsProps) {
  const handleWidthChange = (value: number) => {
    onWidthChange(value);
    if (lockAspectRatio && originalWidth > 0) {
      const aspectRatio = originalHeight / originalWidth;
      onHeightChange(Math.round(value * aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    onHeightChange(value);
    if (lockAspectRatio && originalHeight > 0) {
      const aspectRatio = originalWidth / originalHeight;
      onWidthChange(Math.round(value * aspectRatio));
    }
  };

  const handlePresetClick = (percentage: number) => {
    const newWidth = Math.round(originalWidth * (percentage / 100));
    const newHeight = Math.round(originalHeight * (percentage / 100));
    onWidthChange(newWidth);
    onHeightChange(newHeight);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">크기 설정</h3>

      {/* Width and Height with Lock */}
      <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
        <div>
          <label className="mb-2 block text-sm font-medium">너비 (px)</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={targetWidth}
            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={() => onLockChange(!lockAspectRatio)}
          className={cn(
            'mb-1 flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
            lockAspectRatio
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-muted'
          )}
          title={lockAspectRatio ? '비율 잠금 해제' : '비율 잠금'}
        >
          {lockAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>

        <div>
          <label className="mb-2 block text-sm font-medium">높이 (px)</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={targetHeight}
            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <label className="mb-2 block text-sm font-medium">프리셋</label>
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePresetClick(percentage)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>

      {/* Format Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium">포맷</label>
        <div className="grid grid-cols-3 gap-2">
          {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(fmt)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                format === fmt
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (only for lossy formats) */}
      {(format === 'jpeg' || format === 'webp') && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">품질</label>
            <span className="text-sm text-muted-foreground">{Math.round(quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={Math.round(quality * 100)}
            onChange={(e) => onQualityChange(parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
