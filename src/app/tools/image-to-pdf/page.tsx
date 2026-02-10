'use client';

import { useState, useCallback } from 'react';
import { FileUp, Download, RotateCcw, Plus } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ImageDropzone } from './_components/ImageDropzone';
import { ImageList } from './_components/ImageList';
import { PdfSettings } from './_components/PdfSettings';
import {
  generatePdf,
  getImageDimensions,
  type ImageFile,
  type PdfOptions,
} from '@/lib/image/image-to-pdf';

type Status = 'idle' | 'generating' | 'done' | 'error';

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<PdfOptions>({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 10,
    quality: 0.85,
  });
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addImages = useCallback(async (files: File[]) => {
    const newImages: ImageFile[] = [];
    for (const file of files) {
      try {
        const { width, height } = await getImageDimensions(file);
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          width,
          height,
        });
      } catch {
        // skip invalid images
      }
    }
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const moveUp = useCallback((id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (images.length === 0) return;
    setStatus('generating');
    setProgress(0);
    setError(null);

    try {
      const blob = await generatePdf(images, options, (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });
      saveAs(blob, 'images-combined.pdf');
      setStatus('done');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.'
      );
      setStatus('error');
    }
  }, [images, options]);

  const reset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, [images]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Image to PDF</h1>
            <p className="text-sm text-muted-foreground">
              이미지를 하나의 PDF 파일로 합칩니다
            </p>
          </div>
        </div>
        {images.length > 0 && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* Settings */}
      <PdfSettings options={options} onChange={setOptions} />

      {/* Image upload */}
      <ImageDropzone onFiles={addImages} disabled={status === 'generating'} />

      {/* Image list */}
      {images.length > 0 && (
        <>
          <ImageList
            images={images}
            onRemove={removeImage}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
          />

          {/* Add more button */}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
            <Plus className="h-4 w-4" />
            이미지 추가
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addImages(Array.from(e.target.files));
                e.target.value = '';
              }}
            />
          </label>
        </>
      )}

      {/* Progress */}
      {status === 'generating' && (
        <div className="rounded-xl border border-border bg-card p-8">
          <ProgressBar value={progress} label="PDF 생성 중..." />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Done */}
      {status === 'done' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950">
          <p className="text-green-600 dark:text-green-400">PDF가 다운로드되었습니다!</p>
        </div>
      )}

      {/* Generate button */}
      {images.length > 0 && status !== 'generating' && (
        <Button onClick={handleGenerate} size="lg">
          <Download className="h-5 w-5" />
          PDF 생성 및 다운로드 ({images.length}개 이미지)
        </Button>
      )}
    </div>
  );
}
