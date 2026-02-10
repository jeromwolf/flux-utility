'use client';

import { ArrowUp, ArrowDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageFile } from '@/lib/image/image-to-pdf';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function ImageList({ images, onRemove, onMoveUp, onMoveDown }: ImageListProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{images.length}개 이미지</p>
      <div className="space-y-2">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            <img
              src={img.previewUrl}
              alt={`이미지 ${index + 1}`}
              className="h-12 w-16 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{img.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {img.width} x {img.height}px &middot; {(img.file.size / 1024).toFixed(0)}KB
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onMoveUp(img.id)}
                disabled={index === 0}
                className={cn(
                  'rounded-lg p-1.5 transition-colors hover:bg-muted',
                  index === 0 && 'pointer-events-none opacity-30'
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onMoveDown(img.id)}
                disabled={index === images.length - 1}
                className={cn(
                  'rounded-lg p-1.5 transition-colors hover:bg-muted',
                  index === images.length - 1 && 'pointer-events-none opacity-30'
                )}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRemove(img.id)}
                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
