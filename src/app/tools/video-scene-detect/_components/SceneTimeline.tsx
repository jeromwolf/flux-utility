'use client';

import type { SceneChange } from '@/types/video';
import { formatTimestamp } from '@/lib/video/scene-detector';
import { cn } from '@/lib/utils';

interface SceneTimelineProps {
  scenes: SceneChange[];
  onSeek: (timestamp: number) => void;
}

export function SceneTimeline({ scenes, onSeek }: SceneTimelineProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{scenes.length}개 장면 전환 감지됨</p>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            onClick={() => onSeek(scene.timestamp)}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:ring-2 hover:ring-primary/50',
              'cursor-pointer text-left'
            )}
          >
            {/* Number badge */}
            <span className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white">
              {index + 1}
            </span>

            {/* Timestamp badge */}
            <span className="absolute top-2 right-2 z-10 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
              {formatTimestamp(scene.timestamp)}
            </span>

            {/* Thumbnail */}
            <div className="aspect-[16/9] bg-muted">
              <img
                src={scene.thumbnailUrl}
                alt={`장면 ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="border-t border-border px-2.5 py-1.5">
              <p className="truncate text-xs font-medium">장면 {index + 1}</p>
              <p className="text-[10px] text-muted-foreground">
                신뢰도: {scene.confidence}%
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
