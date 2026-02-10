'use client';

import type { PdfPage } from '@/types/pdf';
import { PagePreview } from './PagePreview';
import { Button } from '@/components/ui/Button';

interface PageGridProps {
  pages: PdfPage[];
  onToggle: (pageNumber: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownloadPage: (pageNumber: number) => void;
}

export function PageGrid({ pages, onToggle, onSelectAll, onDeselectAll, onDownloadPage }: PageGridProps) {
  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pages.length}개 페이지 중 <span className="font-medium text-foreground">{selectedCount}개</span> 선택됨
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            전체 선택
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            선택 해제
          </Button>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {pages.map((page) => (
          <PagePreview
            key={page.pageNumber}
            page={page}
            onToggle={onToggle}
            onDownload={onDownloadPage}
          />
        ))}
      </div>
    </div>
  );
}
