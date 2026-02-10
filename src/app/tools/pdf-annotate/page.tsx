'use client';

import { useState, useCallback, useRef } from 'react';
import { PenTool, RotateCcw } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { loadPdf, renderPage } from '@/lib/pdf/pdf-renderer';
import type { PDFDocument } from '@/lib/pdf/pdf-renderer';
import type { Annotation, AnnotationTool } from '@/lib/pdf/pdf-annotator';
import { exportAnnotatedPdf } from '@/lib/pdf/pdf-annotator';
import { Toolbar } from './_components/Toolbar';
import { AnnotationCanvas } from './_components/AnnotationCanvas';
import { PageNavigator } from './_components/PageNavigator';

type Status = 'idle' | 'loading' | 'ready' | 'saving';

export default function PdfAnnotatePage() {
  // Status
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // PDF state
  const pdfRef = useRef<PDFDocument | null>(null);
  const pdfCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const [pageDataUrls, setPageDataUrls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);

  // Annotation state (1-indexed by page number)
  const [annotations, setAnnotations] = useState<Map<number, Annotation[]>>(
    new Map()
  );
  const [undoStacks, setUndoStacks] = useState<
    Map<number, Annotation[][]>
  >(new Map());
  const [redoStacks, setRedoStacks] = useState<
    Map<number, Annotation[][]>
  >(new Map());

  // Tool state
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fontSize, setFontSize] = useState(24);

  // ------------------------------------------------------------------
  // File handling
  // ------------------------------------------------------------------

  const handleFile = useCallback(async (file: File) => {
    try {
      setError(null);
      setStatus('loading');
      setProgress(0);

      const pdf = await loadPdf(file);
      pdfRef.current = pdf;

      const total = pdf.numPages;
      setNumPages(total);

      const canvases: HTMLCanvasElement[] = [];
      const dataUrls: string[] = [];

      for (let i = 1; i <= total; i++) {
        const canvas = await renderPage(pdf, i, 2);
        canvases.push(canvas);
        dataUrls.push(canvas.toDataURL('image/png'));
        setProgress(Math.round((i / total) * 100));
      }

      pdfCanvasesRef.current = canvases;
      setPageDataUrls(dataUrls);
      setCurrentPage(1);
      setAnnotations(new Map());
      setUndoStacks(new Map());
      setRedoStacks(new Map());
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF를 불러올 수 없습니다.');
      setStatus('idle');
    }
  }, []);

  // ------------------------------------------------------------------
  // Annotation management
  // ------------------------------------------------------------------

  const currentAnnotations = annotations.get(currentPage) ?? [];
  const currentUndoStack = undoStacks.get(currentPage) ?? [];
  const currentRedoStack = redoStacks.get(currentPage) ?? [];

  const handleAddAnnotation = useCallback(
    (annotation: Annotation) => {
      setAnnotations((prev) => {
        const next = new Map(prev);
        const pageAnns = [...(next.get(currentPage) ?? []), annotation];
        next.set(currentPage, pageAnns);
        return next;
      });

      // Push current state to undo stack
      setUndoStacks((prev) => {
        const next = new Map(prev);
        const stack = [...(next.get(currentPage) ?? [])];
        stack.push(annotations.get(currentPage) ?? []);
        next.set(currentPage, stack);
        return next;
      });

      // Clear redo stack
      setRedoStacks((prev) => {
        const next = new Map(prev);
        next.set(currentPage, []);
        return next;
      });
    },
    [annotations, currentPage]
  );

  const handleUndo = useCallback(() => {
    const stack = undoStacks.get(currentPage) ?? [];
    if (stack.length === 0) return;

    const previousState = stack[stack.length - 1];
    const newStack = stack.slice(0, -1);

    // Push current to redo
    setRedoStacks((prev) => {
      const next = new Map(prev);
      const redoStack = [...(next.get(currentPage) ?? [])];
      redoStack.push(annotations.get(currentPage) ?? []);
      next.set(currentPage, redoStack);
      return next;
    });

    setUndoStacks((prev) => {
      const next = new Map(prev);
      next.set(currentPage, newStack);
      return next;
    });

    setAnnotations((prev) => {
      const next = new Map(prev);
      next.set(currentPage, previousState);
      return next;
    });
  }, [annotations, currentPage, undoStacks]);

  const handleRedo = useCallback(() => {
    const stack = redoStacks.get(currentPage) ?? [];
    if (stack.length === 0) return;

    const nextState = stack[stack.length - 1];
    const newStack = stack.slice(0, -1);

    // Push current to undo
    setUndoStacks((prev) => {
      const next = new Map(prev);
      const undoStack = [...(next.get(currentPage) ?? [])];
      undoStack.push(annotations.get(currentPage) ?? []);
      next.set(currentPage, undoStack);
      return next;
    });

    setRedoStacks((prev) => {
      const next = new Map(prev);
      next.set(currentPage, newStack);
      return next;
    });

    setAnnotations((prev) => {
      const next = new Map(prev);
      next.set(currentPage, nextState);
      return next;
    });
  }, [annotations, currentPage, redoStacks]);

  // ------------------------------------------------------------------
  // Save
  // ------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    try {
      setStatus('saving');
      setProgress(0);

      const blob = await exportAnnotatedPdf(
        pdfCanvasesRef.current,
        annotations,
        (current, total) => setProgress(Math.round((current / total) * 100))
      );

      saveAs(blob, 'annotated.pdf');
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
      setStatus('ready');
    }
  }, [annotations]);

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------

  const reset = useCallback(() => {
    pdfRef.current = null;
    pdfCanvasesRef.current = [];
    setPageDataUrls([]);
    setCurrentPage(1);
    setNumPages(0);
    setAnnotations(new Map());
    setUndoStacks(new Map());
    setRedoStacks(new Map());
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PenTool className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PDF 강의 도구</h1>
            <p className="text-sm text-muted-foreground">
              PDF 위에 그림과 메모를 추가합니다
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

      {/* Idle state: file upload */}
      {status === 'idle' && (
        <FileUpload
          accept=".pdf"
          onFile={handleFile}
          label="PDF 파일을 드래그하거나 클릭하여 업로드"
          description="PDF 파일 (최대 100MB)"
        />
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <ProgressBar value={progress} label="PDF 로딩 중..." />
        </div>
      )}

      {/* Saving state */}
      {status === 'saving' && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <ProgressBar value={progress} label="PDF 저장 중..." />
        </div>
      )}

      {/* Ready state: toolbar + canvas + navigator */}
      {(status === 'ready' || status === 'saving') && pageDataUrls.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <Toolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            color={color}
            onColorChange={setColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            canUndo={currentUndoStack.length > 0}
            canRedo={currentRedoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {/* PDF View with annotation overlay */}
          <div className="flex justify-center">
            <div className="relative inline-block">
              <img
                src={pageDataUrls[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="max-h-[70vh] w-auto rounded-xl border border-border"
                draggable={false}
              />
              <AnnotationCanvas
                width={pdfCanvasesRef.current[currentPage - 1]?.width ?? 0}
                height={pdfCanvasesRef.current[currentPage - 1]?.height ?? 0}
                activeTool={activeTool}
                color={color}
                strokeWidth={strokeWidth}
                fontSize={fontSize}
                annotations={currentAnnotations}
                onAddAnnotation={handleAddAnnotation}
              />
            </div>
          </div>

          {/* Page Navigator */}
          <PageNavigator
            currentPage={currentPage}
            totalPages={numPages}
            onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNextPage={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            onSave={handleSave}
            isSaving={status === 'saving'}
          />
        </div>
      )}
    </div>
  );
}
