'use client';

import { useState } from 'react';
import { Download, Eye, Heart, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PixabayImage } from '@/lib/pixabay/types';
import { downloadFile } from '@/lib/pixabay/api';

interface ImageGridProps {
  images: PixabayImage[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const [selected, setSelected] = useState<PixabayImage | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (image: PixabayImage) => {
    setDownloading(true);
    try {
      const ext = image.type === 'vector/svg' ? 'svg' : 'jpg';
      await downloadFile(image.largeImageURL, `pixabay-${image.id}.${ext}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '다운로드 실패');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card cursor-pointer"
            onClick={() => setSelected(image)}
          >
            <img
              src={image.webformatURL}
              alt={image.tags}
              className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="truncate text-xs text-white">{image.tags}</p>
                <div className="flex items-center gap-2 text-[10px] text-white/70">
                  <span className="flex items-center gap-0.5">
                    <Heart className="h-3 w-3" /> {image.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" /> {image.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div
            className="relative max-h-[90vh] max-w-4xl w-full overflow-auto rounded-2xl bg-card p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selected.userImageURL && (
                  <img src={selected.userImageURL} alt={selected.user} className="h-8 w-8 rounded-full" />
                )}
                <span className="text-sm font-medium">{selected.user}</span>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <img
              src={selected.largeImageURL}
              alt={selected.tags}
              className="w-full rounded-lg"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{selected.tags}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{selected.imageWidth} x {selected.imageHeight}</span>
                  <span><Heart className="inline h-3 w-3" /> {selected.likes}</span>
                  <span><Download className="inline h-3 w-3" /> {selected.downloads.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={selected.pageURL} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    Pixabay
                  </Button>
                </a>
                <Button size="sm" onClick={() => handleDownload(selected)} disabled={downloading}>
                  <Download className="h-4 w-4" />
                  {downloading ? '다운로드 중...' : '다운로드'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
