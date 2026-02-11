// src/lib/image/image-editor.ts

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Adjustments {
  brightness: number; // 0 ~ 200 (100 = default)
  contrast: number;   // 0 ~ 200 (100 = default)
  saturation: number; // 0 ~ 200 (100 = default)
  temperature: number; // -100 ~ 100 (0 = default) - warm/cool
  vignette: number;   // 0 ~ 100 (0 = default)
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  adjustments: Partial<Adjustments>;
  overlay?: { color: string; opacity: number; blendMode: GlobalCompositeOperation };
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  vignette: 0,
};

// ---------------------------------------------------------------------------
// Filter Presets (Instagram-style)
// ---------------------------------------------------------------------------

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: '원본',
    adjustments: {},
  },
  {
    id: 'vivid',
    name: '선명',
    adjustments: { brightness: 105, contrast: 115, saturation: 140 },
  },
  {
    id: 'warm',
    name: '따뜻한',
    adjustments: { brightness: 105, saturation: 110, temperature: 30 },
    overlay: { color: '#ff9933', opacity: 0.1, blendMode: 'multiply' },
  },
  {
    id: 'cool',
    name: '차가운',
    adjustments: { brightness: 105, saturation: 90, temperature: -30 },
    overlay: { color: '#3366ff', opacity: 0.08, blendMode: 'multiply' },
  },
  {
    id: 'mono',
    name: '흑백',
    adjustments: { saturation: 0, contrast: 110 },
  },
  {
    id: 'sepia',
    name: '세피아',
    adjustments: { saturation: 30, brightness: 105, contrast: 95, temperature: 40 },
    overlay: { color: '#704214', opacity: 0.15, blendMode: 'multiply' },
  },
  {
    id: 'fade',
    name: '페이드',
    adjustments: { brightness: 110, contrast: 85, saturation: 80 },
  },
  {
    id: 'dramatic',
    name: '드라마틱',
    adjustments: { brightness: 95, contrast: 140, saturation: 120, vignette: 40 },
  },
  {
    id: 'vintage',
    name: '빈티지',
    adjustments: { brightness: 105, contrast: 90, saturation: 70, temperature: 20 },
    overlay: { color: '#d4a574', opacity: 0.12, blendMode: 'screen' },
  },
  {
    id: 'noir',
    name: '누아르',
    adjustments: { saturation: 0, contrast: 150, brightness: 95, vignette: 60 },
  },
];

// ---------------------------------------------------------------------------
// Core Processing
// ---------------------------------------------------------------------------

/**
 * Load an image file into an HTMLImageElement
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };
    img.src = url;
  });
}

/**
 * Build a CSS filter string from adjustments
 */
export function buildFilterString(adj: Adjustments): string {
  const parts: string[] = [];

  parts.push(`brightness(${adj.brightness / 100})`);
  parts.push(`contrast(${adj.contrast / 100})`);
  parts.push(`saturate(${adj.saturation / 100})`);

  // Temperature: use hue-rotate + sepia trick
  if (adj.temperature > 0) {
    // Warm: slight sepia
    parts.push(`sepia(${adj.temperature / 200})`);
  } else if (adj.temperature < 0) {
    // Cool: hue-rotate towards blue
    parts.push(`hue-rotate(${adj.temperature / 2}deg)`);
  }

  return parts.join(' ');
}

/**
 * Apply adjustments to an image and return a canvas
 */
export function applyAdjustments(
  source: HTMLImageElement | HTMLCanvasElement,
  adjustments: Adjustments,
  filterPreset?: FilterPreset
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const w = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Merge filter preset adjustments with current adjustments
  const merged: Adjustments = { ...adjustments };
  if (filterPreset && filterPreset.id !== 'original') {
    // Filter preset replaces adjustments
    Object.assign(merged, filterPreset.adjustments);
  }

  // Apply CSS filter
  ctx.filter = buildFilterString(merged);
  ctx.drawImage(source, 0, 0, w, h);

  // Reset filter for overlay operations
  ctx.filter = 'none';

  // Apply overlay if preset has one
  if (filterPreset?.overlay) {
    const { color, opacity, blendMode } = filterPreset.overlay;
    ctx.save();
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Apply vignette if > 0
  if (merged.vignette > 0) {
    const gradient = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.3,
      w / 2, h / 2, Math.max(w, h) * 0.7
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(0,0,0,${merged.vignette / 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  return canvas;
}

/**
 * Apply crop to a canvas
 */
export function applyCrop(
  source: HTMLImageElement | HTMLCanvasElement,
  crop: CropRect
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return canvas;
}

/**
 * Export the final edited image as a Blob
 */
export function exportImage(
  canvas: HTMLCanvasElement,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('이미지 내보내기에 실패했습니다.'));
      },
      format,
      quality
    );
  });
}

/**
 * Generate a small preview of the image with a filter applied (for filter panel thumbnails)
 */
export function generateFilterPreview(
  source: HTMLImageElement,
  preset: FilterPreset,
  previewSize: number = 120
): HTMLCanvasElement {
  // Create a small version first for performance
  const small = document.createElement('canvas');
  const aspectRatio = source.naturalWidth / source.naturalHeight;
  if (aspectRatio >= 1) {
    small.width = previewSize;
    small.height = Math.round(previewSize / aspectRatio);
  } else {
    small.height = previewSize;
    small.width = Math.round(previewSize * aspectRatio);
  }
  const sCtx = small.getContext('2d')!;
  sCtx.drawImage(source, 0, 0, small.width, small.height);

  // Apply filter adjustments
  const adj: Adjustments = { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments };
  return applyAdjustments(small, adj, preset);
}
