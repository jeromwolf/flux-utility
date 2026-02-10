export type { PDFDocumentProxy as PDFDocument } from 'pdfjs-dist';

async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  return pdfjsLib;
}

export async function loadPdf(file: File) {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf;
}

export async function renderPage(
  pdf: Awaited<ReturnType<typeof loadPdf>>,
  pageNumber: number,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function renderAllPages(
  pdf: Awaited<ReturnType<typeof loadPdf>>,
  scale: number = 2,
  onProgress?: (current: number, total: number) => void
): Promise<HTMLCanvasElement[]> {
  const total = pdf.numPages;
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 1; i <= total; i++) {
    const canvas = await renderPage(pdf, i, scale);
    canvases.push(canvas);
    onProgress?.(i, total);
  }

  return canvases;
}
