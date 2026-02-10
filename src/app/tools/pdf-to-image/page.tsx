'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, FileImage } from 'lucide-react';
import type { ExportOptions } from '@/types/pdf';
import { downloadSinglePage, downloadAllAsZip } from '@/lib/pdf/export';
import { usePdfProcessor } from '@/hooks/usePdfProcessor';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PdfUploader } from './_components/PdfUploader';
import { ExportSettings } from './_components/ExportSettings';
import { WatermarkOptions } from './_components/WatermarkOptions';
import { PageGrid } from './_components/PageGrid';
import { DownloadActions } from './_components/DownloadActions';

export default function PdfToImagePage() {
  const { state, canvasesRef, processFile, togglePage, selectAll, deselectAll, reset } =
    usePdfProcessor();

  const [options, setOptions] = useState<ExportOptions>({
    format: 'image/jpeg',
    quality: 0.85,
    scale: 2,
    removeWatermark: true,
  });

  const handleFile = useCallback(
    (file: File) => {
      processFile(file, options);
    },
    [processFile, options]
  );

  const handleDownloadPage = useCallback(
    (pageNumber: number) => {
      const canvas = canvasesRef.current[pageNumber - 1];
      if (canvas) {
        downloadSinglePage(canvas, pageNumber, state.fileName, options.format, options.quality);
      }
    },
    [canvasesRef, state.fileName, options.format, options.quality]
  );

  const handleDownloadAll = useCallback(async () => {
    downloadAllAsZip(canvasesRef.current, state.fileName, options.format, options.quality);
  }, [canvasesRef, state.fileName, options.format, options.quality]);

  const handleDownloadSelected = useCallback(async () => {
    const selectedIndexes = state.pages
      .filter((p) => p.selected)
      .map((p) => p.pageNumber - 1);
    downloadAllAsZip(
      canvasesRef.current,
      state.fileName,
      options.format,
      options.quality,
      selectedIndexes
    );
  }, [canvasesRef, state.pages, state.fileName, options.format, options.quality]);

  const selectedCount = state.pages.filter((p) => p.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileImage className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PDF to Image</h1>
            <p className="text-sm text-muted-foreground">
              PDF를 JPG/PNG로 변환하고 NotebookLM 워터마크를 제거합니다
            </p>
          </div>
        </div>
        {state.status !== 'idle' && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            다시 시작
          </Button>
        )}
      </div>

      {/* Upload state */}
      {state.status === 'idle' && (
        <div className="space-y-4">
          <ExportSettings options={options} onChange={setOptions} />
          <WatermarkOptions
            enabled={options.removeWatermark}
            onChange={(enabled) => setOptions({ ...options, removeWatermark: enabled })}
          />
          <PdfUploader onFile={handleFile} />
        </div>
      )}

      {/* Loading/Rendering state */}
      {(state.status === 'loading' || state.status === 'rendering') && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <ProgressBar
            value={state.progress}
            label={
              state.status === 'loading'
                ? 'PDF 로딩 중...'
                : `페이지 렌더링 중 (${state.currentPage}/${state.totalPages})`
            }
          />
        </div>
      )}

      {/* Error state */}
      {state.status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{state.error}</p>
          <Button variant="secondary" onClick={reset} className="mt-4">
            다시 시도
          </Button>
        </div>
      )}

      {/* Ready state */}
      {state.status === 'ready' && (
        <div className="space-y-6">
          <DownloadActions
            selectedCount={selectedCount}
            totalCount={state.pages.length}
            onDownloadAll={handleDownloadAll}
            onDownloadSelected={handleDownloadSelected}
          />
          <PageGrid
            pages={state.pages}
            onToggle={togglePage}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onDownloadPage={handleDownloadPage}
          />
        </div>
      )}
    </div>
  );
}
