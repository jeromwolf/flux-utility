import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolDefinition } from '@/types/tools';

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon];

  return (
    <Link
      href={tool.href}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6',
        'transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        'hover:-translate-y-0.5'
      )}
    >
      {tool.isNew && (
        <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          NEW
        </span>
      )}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        {IconComponent && <IconComponent className="h-6 w-6" />}
      </div>
      <div>
        <h3 className="font-semibold text-card-foreground">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
      </div>
      <span className="inline-flex items-center text-xs font-medium text-muted-foreground">
        {tool.category}
      </span>
    </Link>
  );
}
