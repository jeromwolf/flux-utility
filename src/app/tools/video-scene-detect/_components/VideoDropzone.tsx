'use client';

import { FileUpload } from '@/components/ui/FileUpload';

interface VideoDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function VideoDropzone({ onFile, disabled }: VideoDropzoneProps) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      <FileUpload
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        maxSize={500 * 1024 * 1024}
        onFile={onFile}
        label="동영상을 드래그하거나 클릭하여 업로드"
        description="MP4, WebM, MOV (최대 500MB)"
      />
    </div>
  );
}
