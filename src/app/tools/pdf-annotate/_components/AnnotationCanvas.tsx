'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Annotation, AnnotationTool } from '@/lib/pdf/pdf-annotator';
import { drawAllAnnotations } from '@/lib/pdf/pdf-annotator';

interface AnnotationCanvasProps {
  width: number;
  height: number;
  activeTool: AnnotationTool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  annotations: Annotation[];
  onAddAnnotation: (annotation: Annotation) => void;
}

const CURSOR_MAP: Record<AnnotationTool, string> = {
  pen: 'crosshair',
  highlight: 'crosshair',
  text: 'text',
  eraser: 'default',
  rect: 'crosshair',
  circle: 'crosshair',
  arrow: 'crosshair',
  line: 'crosshair',
};

export function AnnotationCanvas({
  width,
  height,
  activeTool,
  color,
  strokeWidth,
  fontSize,
  annotations,
  onAddAnnotation,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<[number, number][]>([]);
  const shapeStart = useRef<[number, number] | null>(null);
  const lastPoint = useRef<[number, number]>([0, 0]);

  // Redraw all annotations whenever they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawAllAnnotations(ctx, annotations);
  }, [annotations]);

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      return [x, y];
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getCanvasPoint(e);
      lastPoint.current = point;

      if (activeTool === 'text') {
        const input = prompt('텍스트를 입력하세요:');
        if (input) {
          onAddAnnotation({
            tool: 'text',
            x: point[0],
            y: point[1],
            text: input,
            color,
            fontSize,
          });
        }
        return;
      }

      if (['rect', 'circle', 'arrow', 'line'].includes(activeTool)) {
        isDrawing.current = true;
        shapeStart.current = point;
        canvasRef.current?.setPointerCapture(e.pointerId);
        return;
      }

      isDrawing.current = true;
      currentPoints.current = [point];

      // Capture pointer for smooth drawing outside canvas bounds
      canvasRef.current?.setPointerCapture(e.pointerId);
    },
    [activeTool, color, fontSize, getCanvasPoint, onAddAnnotation]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;

      const point = getCanvasPoint(e);
      lastPoint.current = point;

      // Shape tool preview
      if (['rect', 'circle', 'arrow', 'line'].includes(activeTool) && shapeStart.current) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Redraw existing annotations
        drawAllAnnotations(ctx, annotations);

        const [sx, sy] = shapeStart.current;
        const [ex, ey] = point;

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (activeTool === 'rect') {
          ctx.strokeRect(sx, sy, ex - sx, ey - sy);
        } else if (activeTool === 'circle') {
          const cx = (sx + ex) / 2;
          const cy = (sy + ey) / 2;
          const rx = Math.abs(ex - sx) / 2;
          const ry = Math.abs(ey - sy) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (activeTool === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          // Arrowhead
          const angle = Math.atan2(ey - sy, ex - sx);
          const headLen = strokeWidth * 4;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        } else if (activeTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }

        ctx.restore();
        return;
      }

      currentPoints.current.push(point);

      // Draw real-time preview stroke on the canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw existing annotations then preview on top
      drawAllAnnotations(ctx, annotations);

      ctx.save();
      if (activeTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else if (activeTool === 'highlight') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.3;
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      const pts = currentPoints.current;
      if (pts.length > 0) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();
      }
      ctx.restore();
    },
    [activeTool, annotations, color, getCanvasPoint, strokeWidth]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    // Shape tool finalization
    if (['rect', 'circle', 'arrow', 'line'].includes(activeTool) && shapeStart.current) {
      const [sx, sy] = shapeStart.current;
      const [ex, ey] = lastPoint.current;

      if (activeTool === 'rect') {
        onAddAnnotation({ tool: 'rect', x: sx, y: sy, width: ex - sx, height: ey - sy, color, lineWidth: strokeWidth });
      } else if (activeTool === 'circle') {
        const cx = (sx + ex) / 2;
        const cy = (sy + ey) / 2;
        const rx = Math.abs(ex - sx) / 2;
        const ry = Math.abs(ey - sy) / 2;
        onAddAnnotation({ tool: 'circle', cx, cy, rx, ry, color, lineWidth: strokeWidth });
      } else if (activeTool === 'arrow') {
        onAddAnnotation({ tool: 'arrow', startX: sx, startY: sy, endX: ex, endY: ey, color, lineWidth: strokeWidth });
      } else if (activeTool === 'line') {
        onAddAnnotation({ tool: 'line', startX: sx, startY: sy, endX: ex, endY: ey, color, lineWidth: strokeWidth });
      }

      shapeStart.current = null;
      return;
    }

    const pts = currentPoints.current;
    if (pts.length === 0) return;

    if (activeTool === 'pen') {
      onAddAnnotation({ tool: 'pen', points: pts, color, width: strokeWidth });
    } else if (activeTool === 'highlight') {
      onAddAnnotation({ tool: 'highlight', points: pts, color, width: strokeWidth });
    } else if (activeTool === 'eraser') {
      onAddAnnotation({ tool: 'eraser', points: pts, width: strokeWidth });
    }

    currentPoints.current = [];
  }, [activeTool, color, onAddAnnotation, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
        cursor: CURSOR_MAP[activeTool],
        zIndex: 10,
      }}
    />
  );
}
