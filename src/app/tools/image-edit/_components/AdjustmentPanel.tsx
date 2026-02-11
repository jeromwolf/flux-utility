'use client';

import type { Adjustments } from '@/lib/image/image-editor';

interface AdjustmentPanelProps {
  adjustments: Adjustments;
  onChange: (adjustments: Adjustments) => void;
  onReset: () => void;
}

const SLIDERS: { key: keyof Adjustments; label: string; min: number; max: number; defaultVal: number }[] = [
  { key: 'brightness', label: '밝기', min: 0, max: 200, defaultVal: 100 },
  { key: 'contrast', label: '대비', min: 0, max: 200, defaultVal: 100 },
  { key: 'saturation', label: '채도', min: 0, max: 200, defaultVal: 100 },
  { key: 'temperature', label: '색온도', min: -100, max: 100, defaultVal: 0 },
  { key: 'vignette', label: '비네팅', min: 0, max: 100, defaultVal: 0 },
];

export function AdjustmentPanel({ adjustments, onChange, onReset }: AdjustmentPanelProps) {
  const hasChanges = SLIDERS.some(s => adjustments[s.key] !== s.defaultVal);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">조정</h3>
        {hasChanges && (
          <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground">
            초기화
          </button>
        )}
      </div>
      {SLIDERS.map(({ key, label, min, max, defaultVal }) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">{label}</label>
            <span className="text-xs font-mono text-muted-foreground">
              {key === 'temperature'
                ? (adjustments[key] > 0 ? `+${adjustments[key]}` : adjustments[key])
                : adjustments[key]}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={adjustments[key]}
            onChange={(e) => onChange({ ...adjustments, [key]: Number(e.target.value) })}
            className="w-full accent-primary h-1.5 cursor-pointer"
          />
        </div>
      ))}
    </div>
  );
}
