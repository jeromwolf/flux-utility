import { saveAs } from 'file-saver';

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob from canvas'));
      },
      format,
      quality
    );
  });
}

export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality: number = 0.85
): string {
  return canvas.toDataURL(format, quality);
}

export async function downloadSinglePage(
  canvas: HTMLCanvasElement,
  pageNumber: number,
  fileName: string,
  format: string = 'image/jpeg',
  quality: number = 0.85
): Promise<void> {
  const ext = format === 'image/png' ? 'png' : 'jpg';
  const blob = await canvasToBlob(canvas, format, quality);
  const baseName = fileName.replace(/\.pdf$/i, '');
  saveAs(blob, `${baseName}-page-${pageNumber}.${ext}`);
}

export async function downloadAllAsZip(
  canvases: HTMLCanvasElement[],
  fileName: string,
  format: string = 'image/jpeg',
  quality: number = 0.85,
  selectedPages?: number[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const ext = format === 'image/png' ? 'png' : 'jpg';
  const baseName = fileName.replace(/\.pdf$/i, '');

  const pagesToExport = selectedPages
    ? canvases.filter((_, i) => selectedPages.includes(i))
    : canvases;
  const total = pagesToExport.length;

  for (let i = 0; i < pagesToExport.length; i++) {
    const pageNum = selectedPages ? selectedPages[i] + 1 : i + 1;
    const blob = await canvasToBlob(pagesToExport[i], format, quality);
    zip.file(`${baseName}-page-${pageNum}.${ext}`, blob);
    onProgress?.(i + 1, total);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${baseName}-images.zip`);
}
