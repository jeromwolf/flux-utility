'use client';

import { cn } from '@/lib/utils';

interface BgRemoveSettingsProps {
  targetColor: [number, number, number];
  tolerance: number;
  onToleranceChange: (value: number) => void;
}

export function BgRemoveSettings({
  targetColor,
  tolerance,
  onToleranceChange,
}: BgRemoveSettingsProps) {
  const [r, g, b] = targetColor;
  const colorStyle = { backgroundColor: `rgb(${r}, ${g}, ${b})` };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">배경 제거 설정</h3>

        {/* Target Color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">제거할 색상</span>
            <div
              className="h-6 w-6 rounded border border-border"
              style={colorStyle}
              title={`RGB(${r}, ${g}, ${b})`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            원본 이미지를 클릭하여 색상을 선택하세요
          </p>
        </div>

        {/* Tolerance Slider */}
        <div className="space-y-2 mt-4">
          <label className="text-sm text-foreground">
            허용 범위 {tolerance}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={tolerance}
            onChange={(e) => onToleranceChange(Number(e.target.value))}
            className={cn(
              'w-full h-2 rounded-lg appearance-none cursor-pointer',
              'bg-muted',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary',
              '[&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-0'
            )}
          />
          <p className="text-xs text-muted-foreground">
            값이 클수록 더 많은 영역이 제거됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
