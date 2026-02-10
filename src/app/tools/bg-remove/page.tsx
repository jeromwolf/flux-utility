'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Eraser, RotateCcw } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { BgRemoveSettings } from './_components/BgRemoveSettings';
import {
  getCanvasFromFile,
  removeBackground,
  pickColorFromCanvas,
  canvasToBlob,
  type RemoveOptions,
} from '@/lib/image/background-remover';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'uploaded' | 'processing' | 'done';

export default function BgRemovePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [targetColor, setTargetColor] = useState<[number, number, number]>([255, 255, 255]);
  const [tolerance, setTolerance] = useState(30);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const originalImgRef = useRef<HTMLImageElement>(null);

  // Handle file upload
  const handleFile = useCallback(async (file: File) => {
    try {
      setImageFile(file);
      setStatus('uploaded');

      // Load image into canvas
      const canvas = await getCanvasFromFile(file);
      setOriginalCanvas(canvas);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('이미지를 불러오는데 실패했습니다.');
      reset();
    }
  }, []);

  // Handle color picking from original image
  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!originalCanvas || !originalImgRef.current) return;

      const img = originalImgRef.current;
      const rect = img.getBoundingClientRect();

      // Calculate click position relative to image
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Scale to actual canvas size
      const scaleX = originalCanvas.width / rect.width;
      const scaleY = originalCanvas.height / rect.height;
      const canvasX = Math.floor(x * scaleX);
      const canvasY = Math.floor(y * scaleY);

      // Pick color
      const color = pickColorFromCanvas(originalCanvas, canvasX, canvasY);
      setTargetColor(color);
    },
    [originalCanvas]
  );

  // Handle background removal
  const handleRemoveBackground = useCallback(async () => {
    if (!originalCanvas) return;

    try {
      setStatus('processing');

      // Clone original canvas
      const workCanvas = document.createElement('canvas');
      workCanvas.width = originalCanvas.width;
      workCanvas.height = originalCanvas.height;
      const ctx = workCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      ctx.drawImage(originalCanvas, 0, 0);

      // Remove background
      const options: RemoveOptions = { targetColor, tolerance };
      const result = removeBackground(workCanvas, options);
      setResultCanvas(result);

      // Create result preview URL
      const blob = await canvasToBlob(result);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      setStatus('done');
    } catch (error) {
      console.error('Failed to remove background:', error);
      alert('배경 제거에 실패했습니다.');
      setStatus('uploaded');
    }
  }, [originalCanvas, targetColor, tolerance]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!resultCanvas || !imageFile) return;

    try {
      const blob = await canvasToBlob(resultCanvas);
      const fileName = imageFile.name.replace(/\.[^/.]+$/, '') + '-nobg.png';
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to download:', error);
      alert('다운로드에 실패했습니다.');
    }
  }, [resultCanvas, imageFile]);

  // Reset to initial state
  const reset = useCallback(() => {
    setStatus('idle');
    setImageFile(null);
    setOriginalCanvas(null);
    setResultCanvas(null);
    setTargetColor([255, 255, 255]);
    setTolerance(30);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPreviewUrl(null);
    setResultUrl(null);
  }, [previewUrl, resultUrl]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Eraser className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">배경 제거</h1>
            <p className="text-sm text-muted-foreground">
              이미지 배경을 투명하게 만듭니다
            </p>
          </div>
        </div>
        {status !== 'idle' && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            다시 시작
          </Button>
        )}
      </div>

      {/* Idle: Upload */}
      {status === 'idle' && (
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          maxSize={20 * 1024 * 1024}
          onFile={handleFile}
          label="이미지를 드래그하거나 클릭하여 업로드"
          description="JPG, PNG, WebP (최대 20MB)"
        />
      )}

      {/* Uploaded/Processing/Done: Settings + Preview */}
      {(status === 'uploaded' || status === 'processing' || status === 'done') && (
        <div className="space-y-6">
          {/* Settings + Actions */}
          <div className="space-y-4">
            <BgRemoveSettings
              targetColor={targetColor}
              tolerance={tolerance}
              onToleranceChange={setTolerance}
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleRemoveBackground}
                disabled={status === 'processing'}
              >
                {status === 'processing' ? '처리 중...' : '배경 제거'}
              </Button>
              {status === 'done' && (
                <Button variant="secondary" onClick={handleDownload}>
                  PNG 다운로드
                </Button>
              )}
            </div>
          </div>

          {/* Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">원본</h3>
              <div className="rounded-xl border border-border bg-card p-4 overflow-hidden">
                {previewUrl && (
                  <img
                    ref={originalImgRef}
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-auto cursor-crosshair"
                    onClick={handleImageClick}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                이미지를 클릭하여 제거할 색상을 선택하세요
              </p>
            </div>

            {/* Result Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">결과</h3>
              <div
                className={cn(
                  'rounded-xl border border-border p-4 overflow-hidden',
                  'bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]',
                  'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)]'
                )}
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                {resultUrl ? (
                  <img src={resultUrl} alt="Result" className="w-full h-auto" />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    배경 제거 버튼을 클릭하세요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
