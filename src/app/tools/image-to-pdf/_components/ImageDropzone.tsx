'use client';

import { useCallback, useState, type DragEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageDropzone({ onFiles, disabled }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) =>
        ['image/jpeg', 'image/png', 'image/gif'].includes(f.type)
      );
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <label
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 transition-all',
        disabled && 'pointer-events-none opacity-50',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
          isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <ImagePlus className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="font-medium">이미지를 드래그하거나 클릭하여 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          JPG, PNG, GIF (여러 파일 선택 가능)
        </p>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </label>
  );
}
