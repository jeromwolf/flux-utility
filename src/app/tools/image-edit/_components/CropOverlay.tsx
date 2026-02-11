'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CropRect } from '@/lib/image/image-editor';

interface CropOverlayProps {
  imageWidth: number;
  imageHeight: number;
  naturalWidth: number;
  naturalHeight: number;
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
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cropRef = useRef(crop);
  const isDragging = useRef(false);
  const dragType = useRef<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Keep ref in sync with state
  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  // Reset crop when image dimensions change
  useEffect(() => {
    if (imageWidth > 0 && imageHeight > 0) {
      const newCrop = { x: 0, y: 0, width: imageWidth, height: imageHeight };
      setCrop(newCrop);
      cropRef.current = newCrop;
      onCropChange(null);
    }
  }, [imageWidth, imageHeight, onCropChange]);

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

  const handleStart = useCallback((clientX: number, clientY: number, type: typeof dragType.current) => {
    isDragging.current = true;
    dragType.current = type;
    dragStart.current = { x: clientX, y: clientY };
    cropStart.current = { ...cropRef.current };
  }, []);

  useEffect(() => {
    if (!active) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current || !dragType.current) return;

      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      const s = cropStart.current;
      const MIN_SIZE = 20;

      const newCrop = { ...s };

      if (dragType.current === 'move') {
        newCrop.x = Math.max(0, Math.min(imageWidth - s.width, s.x + dx));
        newCrop.y = Math.max(0, Math.min(imageHeight - s.height, s.y + dy));
      } else if (dragType.current === 'se') {
        newCrop.width = Math.max(MIN_SIZE, Math.min(imageWidth - s.x, s.width + dx));
        newCrop.height = Math.max(MIN_SIZE, Math.min(imageHeight - s.y, s.height + dy));
      } else if (dragType.current === 'sw') {
        const newW = Math.max(MIN_SIZE, s.width - dx);
        const newX = s.x + s.width - newW;
        newCrop.x = Math.max(0, newX);
        newCrop.width = newW;
        newCrop.height = Math.max(MIN_SIZE, Math.min(imageHeight - s.y, s.height + dy));
      } else if (dragType.current === 'ne') {
        newCrop.width = Math.max(MIN_SIZE, Math.min(imageWidth - s.x, s.width + dx));
        const newH = Math.max(MIN_SIZE, s.height - dy);
        const newY = s.y + s.height - newH;
        newCrop.y = Math.max(0, newY);
        newCrop.height = newH;
      } else if (dragType.current === 'nw') {
        const newW = Math.max(MIN_SIZE, s.width - dx);
        const newX = s.x + s.width - newW;
        const newH = Math.max(MIN_SIZE, s.height - dy);
        const newY = s.y + s.height - newH;
        newCrop.x = Math.max(0, newX);
        newCrop.y = Math.max(0, newY);
        newCrop.width = newW;
        newCrop.height = newH;
      }

      setCrop(newCrop);
      cropRef.current = newCrop;
    };

    const handleEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        dragType.current = null;
        onCropChange(toNaturalCrop(cropRef.current));
      }
    };

    // Mouse events
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    // Touch events
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [active, imageWidth, imageHeight, toNaturalCrop, onCropChange]);

  if (!active || imageWidth <= 0 || imageHeight <= 0) return null;

  const handleMouseDown = (e: React.MouseEvent, type: typeof dragType.current) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientX, e.clientY, type);
  };

  const handleTouchStart = (e: React.TouchEvent, type: typeof dragType.current) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY, type);
    }
  };

  const Handle = ({ position, className }: { position: 'nw' | 'ne' | 'sw' | 'se'; className: string }) => (
    <div
      onMouseDown={(e) => handleMouseDown(e, position)}
      onTouchStart={(e) => handleTouchStart(e, position)}
      className={`absolute h-4 w-4 rounded-full border-2 border-white bg-primary shadow-md ${className}`}
      style={{ cursor: `${position}-resize` }}
    />
  );

  return (
    <div className="absolute inset-0" style={{ zIndex: 20, touchAction: 'none' }}>
      {/* Crop area with box-shadow mask (single layer - no double overlay) */}
      <div
        style={{
          position: 'absolute',
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          cursor: 'move',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onTouchStart={(e) => handleTouchStart(e, 'move')}
      >
        {/* White border */}
        <div className="absolute inset-0 ring-2 ring-white pointer-events-none" />

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
