export interface PdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  selected: boolean;
}

export interface ExportOptions {
  format: 'image/jpeg' | 'image/png';
  quality: number;
  scale: number;
  removeWatermark: boolean;
}

export type ProcessingStatus = 'idle' | 'loading' | 'rendering' | 'processing' | 'ready' | 'exporting' | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  progress: number;
  currentPage: number;
  totalPages: number;
  error: string | null;
  pages: PdfPage[];
  fileName: string;
}
