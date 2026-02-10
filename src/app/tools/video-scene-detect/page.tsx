'use client';

import { useState, useCallback, useRef } from 'react';
import { ScanSearch, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { VideoDropzone } from './_components/VideoDropzone';
import { DetectionSettings } from './_components/DetectionSettings';
import { VideoPreview } from './_components/VideoPreview';
import { SceneTimeline } from './_components/SceneTimeline';
import {
  detectSceneChanges,
} from '@/lib/video/scene-detector';
import type { SceneChange, DetectionOptions } from '@/types/video';

type Status = 'idle' | 'analyzing' | 'done' | 'error';

export default function VideoSceneDetectPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [scenes, setScenes] = useState<SceneChange[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<DetectionOptions>({
    sensitivity: 'medium',
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // Clean up previous video URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    // Create new video URL
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStatus('analyzing');
    setProgress(0);
    setError(null);
    setScenes([]);

    try {
      const detectedScenes = await detectSceneChanges(file, options, (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });
      setScenes(detectedScenes);
      setStatus('done');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '장면 분석 중 오류가 발생했습니다.'
      );
      setStatus('error');
    }
  }, [videoUrl, options]);

  const handleSeek = useCallback((timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      // Scroll video into view
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  const reset = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    // Revoke all scene thumbnail URLs
    scenes.forEach((scene) => {
      if (scene.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(scene.thumbnailUrl);
      }
    });
    setVideoUrl(null);
    setScenes([]);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, [videoUrl, scenes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ScanSearch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Video Scene Detect</h1>
            <p className="text-sm text-muted-foreground">
              동영상에서 장면 전환 시점을 감지합니다
            </p>
          </div>
        </div>
        {status !== 'idle' && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* Detection Settings */}
      <DetectionSettings options={options} onChange={setOptions} />

      {/* Video Upload */}
      {(status === 'idle' || status === 'done') && (
        <VideoDropzone onFile={handleFile} disabled={false} />
      )}

      {/* Progress */}
      {status === 'analyzing' && (
        <div className="rounded-xl border border-border bg-card p-8">
          <ProgressBar value={progress} label="장면 분석 중..." />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Video Preview */}
      {videoUrl && status === 'done' && (
        <VideoPreview ref={videoRef} src={videoUrl} />
      )}

      {/* Scene Timeline */}
      {status === 'done' && scenes.length > 0 && (
        <SceneTimeline scenes={scenes} onSeek={handleSeek} />
      )}
    </div>
  );
}
