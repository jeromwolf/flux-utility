'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CropRect } from '@/lib/image/image-editor';

interface CropOverlayProps {
  imageWidth: number;   // display width of the image
  imageHeight: number;  // display height of the image
  naturalWidth: number;  // actual image pixel width
  naturalHeight: number; // actual image pixel height
  onCropChange: (crop: CropRect | null) => void;
  active: boolean;
}

export function CropOverlay({
  imageWidth,
  imageHeight,
  naturalWidth,
  naturalHeight,
  onCropChange,
  active,
}: CropOverlayProps) {
  // Crop in DISPLAY coordinates
  const [crop, setCrop] = useState({ x: 0, y: 0, width: imageWidth, height: imageHeight });
  const isDragging = useRef(false);
  const dragType = useRef<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Reset crop when image dimensions change
  useEffect(() => {
    setCrop({ x: 0, y: 0, width: imageWidth, height: imageHeight });
    onCropChange(null);
  }, [imageWidth, imageHeight]);

  // Convert display crop to natural pixel crop
  const toNaturalCrop = useCallback((c: typeof crop): CropRect => {
    const scaleX = naturalWidth / imageWidth;
    const scaleY = naturalHeight / imageHeight;
    return {
      x: Math.round(c.x * scaleX),
      y: Math.round(c.y * scaleY),
      width: Math.round(c.width * scaleX),
      height: Math.round(c.height * scaleY),
    };
  }, [imageWidth, imageHeight, naturalWidth, naturalHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: typeof dragType.current) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragType.current = type;
    dragStart.current = { x: e.clientX, y: e.clientY };
    cropStart.current = { ...crop };
  }, [crop]);

  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !dragType.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const s = cropStart.current;
      const MIN_SIZE = 20;

      let newCrop = { ...s };

      if (dragType.current === 'move') {
        newCrop.x = Math.max(0, Math.min(imageWidth - s.width, s.x + dx));
        newCrop.y = Math.max(0, Math.min(imageHeight - s.height, s.y + dy));
      } else if (dragType.current === 'se') {
        newCrop.width = Math.max(MIN_SIZE, Math.min(imageWidth - s.x, s.width + dx));
        newCrop.height = Math.max(MIN_SIZE, Math.min(imageHeight - s.y, s.height + dy));
      } else if (dragType.current === 'sw') {
        const newX = Math.max(0, s.x + dx);
        newCrop.x = newX;
        newCrop.width = Math.max(MIN_SIZE, s.width - (newX - s.x));
        newCrop.height = Math.max(MIN_SIZE, Math.min(imageHeight - s.y, s.height + dy));
      } else if (dragType.current === 'ne') {
        newCrop.width = Math.max(MIN_SIZE, Math.min(imageWidth - s.x, s.width + dx));
        const newY = Math.max(0, s.y + dy);
        newCrop.y = newY;
        newCrop.height = Math.max(MIN_SIZE, s.height - (newY - s.y));
      } else if (dragType.current === 'nw') {
        const newX = Math.max(0, s.x + dx);
        const newY = Math.max(0, s.y + dy);
        newCrop.x = newX;
        newCrop.y = newY;
        newCrop.width = Math.max(MIN_SIZE, s.width - (newX - s.x));
        newCrop.height = Math.max(MIN_SIZE, s.height - (newY - s.y));
      }

      setCrop(newCrop);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        dragType.current = null;
        // Emit crop in natural coordinates
        onCropChange(toNaturalCrop(crop));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [active, crop, imageWidth, imageHeight, toNaturalCrop, onCropChange]);

  if (!active) return null;

  // Corner handle component
  const Handle = ({ position, className }: { position: 'nw' | 'ne' | 'sw' | 'se'; className: string }) => (
    <div
      onMouseDown={(e) => handleMouseDown(e, position)}
      className={`absolute h-4 w-4 rounded-full border-2 border-white bg-primary shadow-md ${className}`}
      style={{ cursor: `${position}-resize` }}
    />
  );

  return (
    <div className="absolute inset-0" style={{ zIndex: 20 }}>
      {/* Dark overlay outside crop area */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Crop area (clear) */}
      <div
        style={{
          position: 'absolute',
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          cursor: 'move',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Clear the dark overlay in the crop area */}
        <div className="absolute inset-0 bg-white/0 ring-2 ring-white"
          style={{
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`,
          }}
        />

        {/* Grid lines (rule of thirds) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
        </div>

        {/* Corner handles */}
        <Handle position="nw" className="-left-2 -top-2" />
        <Handle position="ne" className="-right-2 -top-2" />
        <Handle position="sw" className="-left-2 -bottom-2" />
        <Handle position="se" className="-right-2 -bottom-2" />
      </div>
    </div>
  );
}
