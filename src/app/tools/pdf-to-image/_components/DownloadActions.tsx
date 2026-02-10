'use client';

import { Download, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DownloadActionsProps {
  selectedCount: number;
  totalCount: number;
  onDownloadAll: () => void;
  onDownloadSelected: () => void;
  disabled?: boolean;
}

export function DownloadActions({
  selectedCount,
  totalCount,
  onDownloadAll,
  onDownloadSelected,
  disabled,
}: DownloadActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onDownloadAll}
        disabled={disabled || totalCount === 0}
        size="lg"
      >
        <FileArchive className="h-5 w-5" />
        전체 다운로드 (ZIP)
      </Button>
      {selectedCount < totalCount && selectedCount > 0 && (
        <Button
          variant="secondary"
          onClick={onDownloadSelected}
          disabled={disabled}
          size="lg"
        >
          <Download className="h-5 w-5" />
          선택 다운로드 ({selectedCount}개)
        </Button>
      )}
    </div>
  );
}
