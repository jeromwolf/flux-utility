'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalHits: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalHits, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(Math.min(totalHits, 500) / perPage); // Pixabay limits to 500 results
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </Button>
      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        다음
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
