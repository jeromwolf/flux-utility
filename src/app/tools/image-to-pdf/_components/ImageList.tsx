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
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{images.length}개 이미지</p>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* Number badge */}
            <span className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white">
              {index + 1}
            </span>

            {/* Controls overlay */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onMoveUp(img.id)}
                disabled={index === 0}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white transition-colors hover:bg-black/80',
                  index === 0 && 'pointer-events-none opacity-30'
                )}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onMoveDown(img.id)}
                disabled={index === images.length - 1}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white transition-colors hover:bg-black/80',
                  index === images.length - 1 && 'pointer-events-none opacity-30'
                )}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onRemove(img.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/80 text-white transition-colors hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Image preview */}
            <div className="aspect-[4/3] bg-muted">
              <img
                src={img.previewUrl}
                alt={`이미지 ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>

            {/* File info */}
            <div className="border-t border-border px-2.5 py-1.5">
              <p className="truncate text-xs font-medium">{img.file.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {img.width}x{img.height} · {(img.file.size / 1024).toFixed(0)}KB
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
