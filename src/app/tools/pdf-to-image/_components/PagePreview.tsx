'use client';

import { Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PdfPage } from '@/types/pdf';

interface PagePreviewProps {
  page: PdfPage;
  onToggle: (pageNumber: number) => void;
  onDownload: (pageNumber: number) => void;
}

export function PagePreview({ page, onToggle, onDownload }: PagePreviewProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all',
        page.selected
          ? 'border-primary shadow-sm'
          : 'border-border opacity-60'
      )}
    >
      {/* Selection checkbox */}
      <button
        onClick={() => onToggle(page.pageNumber)}
        className="absolute top-2 left-2 z-10"
      >
        <div className={cn(
          'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors',
          page.selected
            ? 'border-primary bg-primary text-white'
            : 'border-white/70 bg-black/20'
        )}>
          {page.selected && <Check className="h-4 w-4" />}
        </div>
      </button>

      {/* Download button */}
      <button
        onClick={() => onDownload(page.pageNumber)}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
      >
        <Download className="h-4 w-4" />
      </button>

      {/* Page image */}
      <div className="aspect-[4/3] bg-muted">
        <img
          src={page.dataUrl}
          alt={`페이지 ${page.pageNumber}`}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Page number */}
      <div className="border-t border-border bg-card px-3 py-2 text-center text-xs text-muted-foreground">
        페이지 {page.pageNumber}
      </div>
    </div>
  );
}
