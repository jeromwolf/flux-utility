'use client';

import { FileUpload } from '@/components/ui/FileUpload';

interface PdfUploaderProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function PdfUploader({ onFile, disabled }: PdfUploaderProps) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      <FileUpload
        accept=".pdf"
        maxSize={100 * 1024 * 1024}
        onFile={onFile}
        label="PDF 파일을 드래그하거나 클릭하여 업로드"
        description="PDF 파일 (최대 100MB)"
      />
    </div>
  );
}
