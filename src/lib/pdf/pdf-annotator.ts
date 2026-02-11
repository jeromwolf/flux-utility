import { jsPDF } from 'jspdf';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnnotationTool = 'pen' | 'highlight' | 'text' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'line' | 'laser';

export interface PenStroke {
  tool: 'pen';
  points: [number, number][];
  color: string;
  width: number;
}

export interface HighlightStroke {
  tool: 'highlight';
  points: [number, number][];
  color: string;
  width: number;
}

export interface TextAnnotation {
  tool: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export interface EraserStroke {
  tool: 'eraser';
  points: [number, number][];
  width: number;
}

export interface RectAnnotation {
  tool: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  lineWidth: number;
}

export interface CircleAnnotation {
  tool: 'circle';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  lineWidth: number;
}

export interface ArrowAnnotation {
  tool: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
}

export interface LineAnnotation {
  tool: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
}

export type Annotation =
  | PenStroke
  | HighlightStroke
  | TextAnnotation
  | EraserStroke
  | RectAnnotation
  | CircleAnnotation
  | ArrowAnnotation
  | LineAnnotation;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function drawPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][]
): void {
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }

  // Single-point strokes: draw a tiny dot so they are visible
  if (points.length === 1) {
    ctx.lineTo(points[0][0] + 0.1, points[0][1] + 0.1);
  }

  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Draw a single annotation
// ---------------------------------------------------------------------------

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation
): void {
  ctx.save();

  if (annotation.tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawPath(ctx, annotation.points);
  }

  if (annotation.tool === 'highlight') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.3;
    drawPath(ctx, annotation.points);
  }

  if (annotation.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = annotation.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawPath(ctx, annotation.points);
  }

  if (annotation.tool === 'text') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = annotation.color;
    ctx.font = `${annotation.fontSize}px sans-serif`;
    ctx.fillText(annotation.text, annotation.x, annotation.y);
  }

  if (annotation.tool === 'rect') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
  }

  if (annotation.tool === 'circle') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.lineWidth;
    ctx.beginPath();
    ctx.ellipse(annotation.cx, annotation.cy, Math.abs(annotation.rx), Math.abs(annotation.ry), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (annotation.tool === 'arrow') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = annotation.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw line
    ctx.beginPath();
    ctx.moveTo(annotation.startX, annotation.startY);
    ctx.lineTo(annotation.endX, annotation.endY);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(annotation.endY - annotation.startY, annotation.endX - annotation.startX);
    const headLen = annotation.lineWidth * 4;
    ctx.beginPath();
    ctx.moveTo(annotation.endX, annotation.endY);
    ctx.lineTo(
      annotation.endX - headLen * Math.cos(angle - Math.PI / 6),
      annotation.endY - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      annotation.endX - headLen * Math.cos(angle + Math.PI / 6),
      annotation.endY - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }

  if (annotation.tool === 'line') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(annotation.startX, annotation.startY);
    ctx.lineTo(annotation.endX, annotation.endY);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Draw all annotations onto a canvas (clears first)
// ---------------------------------------------------------------------------

export function drawAllAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[]
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  annotations.forEach((a) => drawStroke(ctx, a));
}

// ---------------------------------------------------------------------------
// Composite a rendered PDF page with its annotations
// ---------------------------------------------------------------------------

export function compositePageWithAnnotations(
  pdfCanvas: HTMLCanvasElement,
  annotations: Annotation[]
): HTMLCanvasElement {
  const composite = document.createElement('canvas');
  composite.width = pdfCanvas.width;
  composite.height = pdfCanvas.height;

  const ctx = composite.getContext('2d')!;

  // Draw the original PDF page
  ctx.drawImage(pdfCanvas, 0, 0);

  // Draw annotations on a separate layer so eraser only removes annotation
  // ink, not the underlying PDF content.
  const annotationLayer = document.createElement('canvas');
  annotationLayer.width = pdfCanvas.width;
  annotationLayer.height = pdfCanvas.height;
  const aCtx = annotationLayer.getContext('2d')!;
  drawAllAnnotations(aCtx, annotations);

  // Merge annotation layer onto the composite
  ctx.drawImage(annotationLayer, 0, 0);

  return composite;
}

// ---------------------------------------------------------------------------
// Export all annotated pages as a single PDF
// ---------------------------------------------------------------------------

export async function exportAnnotatedPdf(
  pdfCanvases: HTMLCanvasElement[],
  allAnnotations: Map<number, Annotation[]>,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const total = pdfCanvases.length;
  let doc: jsPDF | null = null;

  for (let i = 0; i < total; i++) {
    const pdfCanvas = pdfCanvases[i];
    // Annotations are stored 1-indexed (page numbers)
    const pageAnnotations = allAnnotations.get(i + 1) ?? [];

    const compositeCanvas = compositePageWithAnnotations(
      pdfCanvas,
      pageAnnotations
    );

    const isLandscape = compositeCanvas.width > compositeCanvas.height;
    const orientation: 'portrait' | 'landscape' = isLandscape
      ? 'landscape'
      : 'portrait';

    if (i === 0) {
      doc = new jsPDF({
        orientation,
        unit: 'px',
        format: [compositeCanvas.width, compositeCanvas.height],
      });
    } else {
      doc!.addPage(
        [compositeCanvas.width, compositeCanvas.height],
        orientation
      );
    }

    const dataUrl = compositeCanvas.toDataURL('image/jpeg', 0.92);
    doc!.addImage(
      dataUrl,
      'JPEG',
      0,
      0,
      compositeCanvas.width,
      compositeCanvas.height
    );

    onProgress?.(i + 1, total);
  }

  return doc!.output('blob');
}
