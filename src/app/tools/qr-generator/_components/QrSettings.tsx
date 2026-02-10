'use client';

import { cn } from '@/lib/utils';

interface QrSettingsProps {
  size: number;
  foreground: string;
  background: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  onSizeChange: (size: number) => void;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
  onErrorCorrectionChange: (level: 'L' | 'M' | 'Q' | 'H') => void;
}

export function QrSettings({
  size,
  foreground,
  background,
  errorCorrection,
  onSizeChange,
  onForegroundChange,
  onBackgroundChange,
  onErrorCorrectionChange,
}: QrSettingsProps) {
  const sizeOptions = [
    { value: 256, label: '작게' },
    { value: 512, label: '보통' },
    { value: 1024, label: '크게' },
  ];

  const errorCorrectionOptions: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-4">QR 설정</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Size selector */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">크기</label>
          <div className="flex gap-2">
            {sizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSizeChange(option.value)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
                  size === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error correction */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">오류 수정</label>
          <div className="flex gap-2">
            {errorCorrectionOptions.map((level) => (
              <button
                key={level}
                onClick={() => onErrorCorrectionChange(level)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
                  errorCorrection === level
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Foreground color */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">전경색</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={foreground}
              onChange={(e) => onForegroundChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-lg border border-border"
            />
            <span className="text-xs text-muted-foreground">{foreground}</span>
          </div>
        </div>

        {/* Background color */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">배경색</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-lg border border-border"
            />
            <span className="text-xs text-muted-foreground">{background}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
