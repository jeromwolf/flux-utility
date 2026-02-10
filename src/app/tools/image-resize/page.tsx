'use client';

import { useState, useCallback } from 'react';
import { Scaling, RotateCcw, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { ResizeSettings } from './_components/ResizeSettings';
import { resizeImage, getImageInfo, type OutputFormat } from '@/lib/image/image-resizer';

type Status = 'idle' | 'uploaded' | 'done';

export default function ImageResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(0.85);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (uploadedFile: File) => {
    try {
      setError(null);
      setFile(uploadedFile);

      // Get image dimensions
      const info = await getImageInfo(uploadedFile);
      setOriginalWidth(info.width);
      setOriginalHeight(info.height);
      setTargetWidth(info.width);
      setTargetHeight(info.height);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(uploadedFile);

      setStatus('uploaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지를 로드할 수 없습니다.');
    }
  }, []);

  const handleResize = useCallback(async () => {
    if (!file) return;

    try {
      setError(null);
      const { blob, dataUrl } = await resizeImage(file, {
        width: targetWidth,
        height: targetHeight,
        format,
        quality,
      });

      setResultBlob(blob);
      setResultUrl(dataUrl);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지를 리사이즈할 수 없습니다.');
    }
  }, [file, targetWidth, targetHeight, format, quality]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;

    const filename = `resized-${targetWidth}x${targetHeight}.${format}`;
    saveAs(resultBlob, filename);
  }, [resultBlob, targetWidth, targetHeight, format]);

  const handleReset = useCallback(() => {
    setFile(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setStatus('idle');
    setError(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scaling className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">이미지 리사이즈</h1>
            <p className="text-sm text-muted-foreground">이미지 크기를 변경합니다</p>
          </div>
        </div>
        {status !== 'idle' && (
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            다시 시작
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Idle State - File Upload */}
      {status === 'idle' && (
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          maxSize={20 * 1024 * 1024}
          onFile={handleFile}
          label="이미지를 드래그하거나 클릭하여 업로드"
          description="JPG, PNG, WebP (최대 20MB)"
        />
      )}

      {/* Uploaded State - Show Preview and Settings */}
      {status === 'uploaded' && (
        <div className="space-y-6">
          {/* Original Image Preview */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">원본 이미지</h3>
              <span className="text-sm text-muted-foreground">
                {originalWidth} x {originalHeight}
              </span>
            </div>
            {previewUrl && (
              <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-4">
                <img
                  src={previewUrl}
                  alt="Original"
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Resize Settings */}
          <ResizeSettings
            targetWidth={targetWidth}
            targetHeight={targetHeight}
            lockAspectRatio={lockAspectRatio}
            originalWidth={originalWidth}
            originalHeight={originalHeight}
            format={format}
            quality={quality}
            onWidthChange={setTargetWidth}
            onHeightChange={setTargetHeight}
            onLockChange={setLockAspectRatio}
            onFormatChange={setFormat}
            onQualityChange={setQuality}
          />

          {/* Action Button */}
          <Button variant="primary" size="lg" onClick={handleResize} className="w-full">
            리사이즈
          </Button>
        </div>
      )}

      {/* Done State - Show Result */}
      {status === 'done' && (
        <div className="space-y-6">
          {/* Result Image Preview */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">리사이즈된 이미지</h3>
              <span className="text-sm text-muted-foreground">
                {targetWidth} x {targetHeight}
              </span>
            </div>
            {resultUrl && (
              <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-4">
                <img
                  src={resultUrl}
                  alt="Resized"
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Download Button */}
          <Button variant="primary" size="lg" onClick={handleDownload} className="w-full">
            <Download className="h-4 w-4" />
            다운로드
          </Button>

          {/* Back to Settings */}
          <Button variant="secondary" size="lg" onClick={() => setStatus('uploaded')} className="w-full">
            설정으로 돌아가기
          </Button>
        </div>
      )}
    </div>
  );
}
