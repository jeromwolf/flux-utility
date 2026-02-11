'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { FilterPreset } from '@/lib/image/image-editor';
import { FILTER_PRESETS, generateFilterPreview } from '@/lib/image/image-editor';

interface FilterPanelProps {
  image: HTMLImageElement | null;
  activeFilter: string;
  onFilterChange: (preset: FilterPreset) => void;
}

export function FilterPanel({ image, activeFilter, onFilterChange }: FilterPanelProps) {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const generatedForRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!image || image === generatedForRef.current) return;
    generatedForRef.current = image;

    const map = new Map<string, string>();
    for (const preset of FILTER_PRESETS) {
      const canvas = generateFilterPreview(image, preset, 80);
      map.set(preset.id, canvas.toDataURL('image/jpeg', 0.7));
    }
    setPreviews(map);
  }, [image]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">필터</h3>
      <div className="grid grid-cols-5 gap-2">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onFilterChange(preset)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors',
              activeFilter === preset.id
                ? 'bg-primary/10 ring-2 ring-primary'
                : 'hover:bg-muted'
            )}
          >
            {previews.get(preset.id) ? (
              <img
                src={previews.get(preset.id)}
                alt={preset.name}
                className="h-14 w-14 rounded-md object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-md bg-muted animate-pulse" />
            )}
            <span className="text-[10px] text-muted-foreground">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
