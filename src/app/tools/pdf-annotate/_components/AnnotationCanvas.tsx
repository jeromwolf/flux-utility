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
