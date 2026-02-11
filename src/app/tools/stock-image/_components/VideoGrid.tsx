'use client';

import { useState, useRef } from 'react';
import { Download, Eye, Heart, X, ExternalLink, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PixabayVideo } from '@/lib/pixabay/types';
import { downloadFile } from '@/lib/pixabay/api';

interface VideoGridProps {
  videos: PixabayVideo[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [selected, setSelected] = useState<PixabayVideo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = async (video: PixabayVideo) => {
    setDownloading(true);
    try {
      // Download the largest available size
      const url = video.videos.large?.url || video.videos.medium?.url || video.videos.small.url;
      await downloadFile(url, `pixabay-${video.id}.mp4`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '다운로드 실패');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {videos.map((video) => {
          const thumbnail = video.videos.small?.thumbnail || video.videos.tiny?.thumbnail || '';
          return (
            <div
              key={video.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card cursor-pointer"
              onClick={() => setSelected(video)}
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={video.tags}
                  className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-10 w-10 text-white/90" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="truncate text-xs text-white">{video.tags}</p>
                </div>
              </div>
              {/* Duration badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </div>
            </div>
          );
        })}
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

            <video
              ref={videoRef}
              src={selected.videos.medium?.url || selected.videos.small?.url}
              controls
              autoPlay
              className="w-full rounded-lg"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{selected.tags}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><Clock className="inline h-3 w-3" /> {formatDuration(selected.duration)}</span>
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
