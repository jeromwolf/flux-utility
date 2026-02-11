'use client';

import { Pencil, Highlighter, Type, Eraser, Undo2, Redo2, Square, Circle, MoveRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnnotationTool } from '@/lib/pdf/pdf-annotator';

interface ToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const TOOLS: { tool: AnnotationTool; icon: typeof Pencil; label: string }[] = [
  { tool: 'pen', icon: Pencil, label: '펜' },
  { tool: 'highlight', icon: Highlighter, label: '형광펜' },
  { tool: 'line', icon: Minus, label: '직선' },
  { tool: 'arrow', icon: MoveRight, label: '화살표' },
  { tool: 'rect', icon: Square, label: '사각형' },
  { tool: 'circle', icon: Circle, label: '원' },
  { tool: 'text', icon: Type, label: '텍스트' },
  { tool: 'eraser', icon: Eraser, label: '지우개' },
];

const PRESET_COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308'];

const WIDTHS: { value: number; size: number; label: string }[] = [
  { value: 4, size: 8, label: '가늘게' },
  { value: 8, size: 14, label: '보통' },
  { value: 16, size: 20, label: '굵게' },
];

const FONT_SIZES: { value: number; label: string }[] = [
  { value: 24, label: 'S' },
  { value: 36, label: 'M' },
  { value: 48, label: 'L' },
];

export function Toolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fontSize,
  onFontSizeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-20 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Tool buttons */}
        {TOOLS.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            title={label}
            onClick={() => onToolChange(tool)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              activeTool === tool
                ? 'border border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Color presets */}
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => onColorChange(c)}
            className={cn(
              'h-5 w-5 rounded-full transition-shadow',
              color === c && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{ backgroundColor: c }}
          />
        ))}

        {/* Custom color picker */}
        <label
          className={cn(
            'relative flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border',
            !PRESET_COLORS.includes(color) && 'ring-2 ring-primary ring-offset-2'
          )}
          style={{ backgroundColor: color }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Width / Font Size */}
        {activeTool !== 'text' ? (
          <>
            {WIDTHS.map(({ value, size, label }) => (
              <button
                key={value}
                title={label}
                onClick={() => onStrokeWidthChange(value)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                  strokeWidth === value
                    ? 'border border-primary bg-primary/10'
                    : 'hover:bg-muted'
                )}
              >
                <span
                  className="rounded-full bg-foreground"
                  style={{ width: size, height: size }}
                />
              </button>
            ))}
          </>
        ) : (
          <>
            {FONT_SIZES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onFontSizeChange(value)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  fontSize === value
                    ? 'border border-primary bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {label}
              </button>
            ))}
          </>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Undo / Redo */}
        <button
          title="실행 취소"
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            canUndo
              ? 'text-muted-foreground hover:bg-muted'
              : 'pointer-events-none opacity-30'
          )}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          title="다시 실행"
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            canRedo
              ? 'text-muted-foreground hover:bg-muted'
              : 'pointer-events-none opacity-30'
          )}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
