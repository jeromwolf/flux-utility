interface WatermarkRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getWatermarkRegion(
  canvasWidth: number,
  canvasHeight: number,
  scale: number
): WatermarkRegion {
  // NotebookLM watermark "Made with NotebookLM" at bottom-right
  // Reference: x from (width-115) to (width-5), y from (height-30) to (height-5)
  // We use generous margins to handle slight positional variations
  const x = canvasWidth - Math.ceil(130 * scale);
  const y = canvasHeight - Math.ceil(38 * scale);
  const width = Math.ceil(128 * scale);
  const height = Math.ceil(36 * scale);

  return { x, y, width, height };
}

function calculateColorVariance(imageData: ImageData): number {
  const data = imageData.data;
  const pixelCount = data.length / 4;
  if (pixelCount === 0) return 0;

  let sumR = 0, sumG = 0, sumB = 0;

  for (let i = 0; i < data.length; i += 4) {
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
  }

  const avgR = sumR / pixelCount;
  const avgG = sumG / pixelCount;
  const avgB = sumB / pixelCount;

  let variance = 0;
  for (let i = 0; i < data.length; i += 4) {
    variance += (data[i] - avgR) ** 2;
    variance += (data[i + 1] - avgG) ** 2;
    variance += (data[i + 2] - avgB) ** 2;
  }

  return variance / (pixelCount * 3);
}

export interface WatermarkDetectionResult {
  detected: boolean;
  confidence: number;
  region: WatermarkRegion;
}

export function detectWatermark(
  canvas: HTMLCanvasElement,
  scale: number
): WatermarkDetectionResult {
  const ctx = canvas.getContext('2d')!;
  const region = getWatermarkRegion(canvas.width, canvas.height, scale);

  const wmData = ctx.getImageData(region.x, region.y, region.width, region.height);

  const sampleHeight = Math.min(Math.ceil(10 * scale), region.y);
  const bgData = ctx.getImageData(
    region.x,
    region.y - sampleHeight,
    region.width,
    sampleHeight
  );

  const wmVariance = calculateColorVariance(wmData);
  const bgVariance = calculateColorVariance(bgData);

  const detected = wmVariance > bgVariance * 1.5;
  const confidence = Math.min(wmVariance / Math.max(bgVariance, 1), 1);

  return { detected, confidence, region };
}

export function removeWatermark(
  canvas: HTMLCanvasElement,
  scale: number
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const region = getWatermarkRegion(canvas.width, canvas.height, scale);

  // Sample from multiple rows above the watermark for better color accuracy
  const sampleOffset = Math.ceil(5 * scale);

  for (let x = region.x; x < region.x + region.width; x++) {
    // Average colors from several sample points above the watermark
    const samples = 3;
    let r = 0, g = 0, b = 0;
    for (let s = 0; s < samples; s++) {
      const sampleY = Math.max(0, region.y - sampleOffset - s * Math.ceil(2 * scale));
      const data = ctx.getImageData(x, sampleY, 1, 1).data;
      r += data[0];
      g += data[1];
      b += data[2];
    }
    r = Math.round(r / samples);
    g = Math.round(g / samples);
    b = Math.round(b / samples);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, region.y, 1, region.height);
  }

  return canvas;
}

export function removeWatermarkFromAll(
  canvases: HTMLCanvasElement[],
  scale: number,
  onProgress?: (current: number, total: number) => void
): HTMLCanvasElement[] {
  const total = canvases.length;

  return canvases.map((canvas, i) => {
    const result = removeWatermark(canvas, scale);
    onProgress?.(i + 1, total);
    return result;
  });
}
