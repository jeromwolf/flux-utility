import { jsPDF } from 'jspdf';

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export type PageSize = 'a4' | 'letter' | 'fit';
export type Orientation = 'portrait' | 'landscape' | 'auto';

export interface PdfOptions {
  pageSize: PageSize;
  orientation: Orientation;
  margin: number; // in mm
  quality: number; // 0.1 to 1.0
}

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
};

function getImageFormat(file: File): string {
  if (file.type === 'image/png') return 'PNG';
  if (file.type === 'image/gif') return 'PNG'; // GIF rendered as PNG via canvas
  return 'JPEG';
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function fileToDataUrl(
  file: File,
  quality: number
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(format, quality);
  return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
}

export async function generatePdf(
  images: ImageFile[],
  options: PdfOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const { pageSize, orientation, margin, quality } = options;
  const total = images.length;

  let doc: jsPDF | null = null;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const { dataUrl, width: imgW, height: imgH } = await fileToDataUrl(image.file, quality);
    const format = getImageFormat(image.file);

    // Determine page orientation for this image
    let pageOrientation: 'portrait' | 'landscape';
    if (orientation === 'auto') {
      pageOrientation = imgW > imgH ? 'landscape' : 'portrait';
    } else {
      pageOrientation = orientation;
    }

    if (pageSize === 'fit') {
      // Page fits exactly to image (convert px to mm at 96 DPI)
      const pxToMm = 25.4 / 96;
      const pageW = imgW * pxToMm + margin * 2;
      const pageH = imgH * pxToMm + margin * 2;

      if (i === 0) {
        doc = new jsPDF({ orientation: pageOrientation, unit: 'mm', format: [pageW, pageH] });
      } else {
        doc!.addPage([pageW, pageH], pageOrientation);
      }
      doc!.addImage(dataUrl, format, margin, margin, imgW * pxToMm, imgH * pxToMm);
    } else {
      // Fixed page size (A4 or Letter)
      const [baseW, baseH] = PAGE_SIZES[pageSize];
      const [pageW, pageH] = pageOrientation === 'landscape' ? [baseH, baseW] : [baseW, baseH];

      if (i === 0) {
        doc = new jsPDF({
          orientation: pageOrientation,
          unit: 'mm',
          format: pageSize === 'a4' ? 'a4' : 'letter',
        });
      } else {
        doc!.addPage(pageSize === 'a4' ? 'a4' : 'letter', pageOrientation);
      }

      // Calculate image dimensions to fit within margins
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;
      const imgRatio = imgW / imgH;
      const availRatio = availW / availH;

      let drawW: number, drawH: number;
      if (imgRatio > availRatio) {
        drawW = availW;
        drawH = availW / imgRatio;
      } else {
        drawH = availH;
        drawW = availH * imgRatio;
      }

      // Center the image on the page
      const x = margin + (availW - drawW) / 2;
      const y = margin + (availH - drawH) / 2;

      doc!.addImage(dataUrl, format, x, y, drawW, drawH);
    }

    onProgress?.(i + 1, total);
  }

  return doc!.output('blob');
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  const result = { width: img.naturalWidth, height: img.naturalHeight };
  URL.revokeObjectURL(img.src);
  return result;
}
