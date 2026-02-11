'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  children?: React.ReactNode; // Filter elements
}

export function SearchBar({ onSearch, placeholder = '검색어 입력...', isLoading, children }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? '검색 중...' : '검색'}
        </Button>
      </form>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
