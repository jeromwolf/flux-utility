'use client';

import { useReducer, useCallback, useRef } from 'react';
import type { PdfPage, ExportOptions, ProcessingState } from '@/types/pdf';
import { loadPdf, renderAllPages } from '@/lib/pdf/pdf-renderer';
import type { PDFDocument } from '@/lib/pdf/pdf-renderer';
import { removeWatermark } from '@/lib/pdf/watermark-remover';
import { canvasToDataUrl } from '@/lib/pdf/export';

type PdfAction =
  | { type: 'LOAD_START'; fileName: string }
  | { type: 'LOAD_COMPLETE'; totalPages: number }
  | { type: 'RENDER_PROGRESS'; current: number; total: number }
  | { type: 'RENDER_COMPLETE'; pages: PdfPage[] }
  | { type: 'TOGGLE_PAGE'; pageNumber: number }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'EXPORT_START' }
  | { type: 'EXPORT_COMPLETE' }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

const initialState: ProcessingState = {
  status: 'idle',
  progress: 0,
  currentPage: 0,
  totalPages: 0,
  error: null,
  pages: [],
  fileName: '',
};

function reducer(state: ProcessingState, action: PdfAction): ProcessingState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...initialState, status: 'loading', fileName: action.fileName };
    case 'LOAD_COMPLETE':
      return { ...state, status: 'rendering', totalPages: action.totalPages };
    case 'RENDER_PROGRESS':
      return {
        ...state,
        currentPage: action.current,
        progress: Math.round((action.current / action.total) * 100),
      };
    case 'RENDER_COMPLETE':
      return { ...state, status: 'ready', progress: 100, pages: action.pages };
    case 'TOGGLE_PAGE':
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.pageNumber === action.pageNumber ? { ...p, selected: !p.selected } : p
        ),
      };
    case 'SELECT_ALL':
      return { ...state, pages: state.pages.map((p) => ({ ...p, selected: true })) };
    case 'DESELECT_ALL':
      return { ...state, pages: state.pages.map((p) => ({ ...p, selected: false })) };
    case 'EXPORT_START':
      return { ...state, status: 'exporting' };
    case 'EXPORT_COMPLETE':
      return { ...state, status: 'ready' };
    case 'ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function usePdfProcessor() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasesRef = useRef<HTMLCanvasElement[]>([]);
  const pdfRef = useRef<PDFDocument | null>(null);

  const processFile = useCallback(async (file: File, options: ExportOptions) => {
    try {
      dispatch({ type: 'LOAD_START', fileName: file.name });

      const pdf = await loadPdf(file);
      pdfRef.current = pdf;
      dispatch({ type: 'LOAD_COMPLETE', totalPages: pdf.numPages });

      const canvases = await renderAllPages(pdf, options.scale, (current, total) => {
        dispatch({ type: 'RENDER_PROGRESS', current, total });
      });

      if (options.removeWatermark) {
        canvases.forEach((canvas) => removeWatermark(canvas, options.scale));
      }

      canvasesRef.current = canvases;

      const pages: PdfPage[] = canvases.map((canvas, i) => ({
        pageNumber: i + 1,
        dataUrl: canvasToDataUrl(canvas, options.format, options.quality),
        width: canvas.width,
        height: canvas.height,
        selected: true,
      }));

      dispatch({ type: 'RENDER_COMPLETE', pages });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF 처리 중 오류가 발생했습니다.';
      dispatch({ type: 'ERROR', error: message });
    }
  }, []);

  const togglePage = useCallback((pageNumber: number) => {
    dispatch({ type: 'TOGGLE_PAGE', pageNumber });
  }, []);

  const selectAll = useCallback(() => dispatch({ type: 'SELECT_ALL' }), []);
  const deselectAll = useCallback(() => dispatch({ type: 'DESELECT_ALL' }), []);

  const reset = useCallback(() => {
    canvasesRef.current = [];
    pdfRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    canvasesRef,
    processFile,
    togglePage,
    selectAll,
    deselectAll,
    reset,
    dispatch,
  };
}
