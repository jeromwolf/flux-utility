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
    let index = 0;

    const generateNext = () => {
      if (index >= FILTER_PRESETS.length) {
        setPreviews(new Map(map));
        return;
      }
      const preset = FILTER_PRESETS[index];
      const canvas = generateFilterPreview(image, preset, 160);
      map.set(preset.id, canvas.toDataURL('image/jpeg', 0.7));
      index++;
      // Set intermediate previews so they appear one by one
      setPreviews(new Map(map));
      requestAnimationFrame(generateNext);
    };

    requestAnimationFrame(generateNext);
  }, [image]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">필터</h3>
      <div className="grid grid-cols-2 gap-2">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onFilterChange(preset)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors',
              activeFilter === preset.id
                ? 'bg-primary/10 ring-2 ring-primary'
                : 'hover:bg-muted'
            )}
          >
            {previews.get(preset.id) ? (
              <img
                src={previews.get(preset.id)}
                alt={preset.name}
                className="w-full aspect-square rounded-md object-cover"
              />
            ) : (
              <div className="w-full aspect-square rounded-md bg-muted animate-pulse" />
            )}
            <span className="text-xs text-muted-foreground">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
