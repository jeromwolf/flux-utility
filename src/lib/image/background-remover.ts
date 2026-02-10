export interface RemoveOptions {
  targetColor: [number, number, number]; // RGB
  tolerance: number; // 0-100
}

/**
 * Removes background from canvas based on color similarity
 */
export function removeBackground(
  canvas: HTMLCanvasElement,
  options: RemoveOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const [targetR, targetG, targetB] = options.targetColor;
  const maxDistance = Math.sqrt(255 * 255 * 3); // Maximum possible color distance
  const threshold = (options.tolerance / 100) * maxDistance;
  const smoothEdge = threshold * 0.1; // 10% of tolerance for smooth edges

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate Euclidean color distance
    const distance = Math.sqrt(
      Math.pow(r - targetR, 2) +
      Math.pow(g - targetG, 2) +
      Math.pow(b - targetB, 2)
    );

    // Normalize to 0-1 scale
    const normalizedDistance = distance / maxDistance;

    if (distance <= threshold) {
      // Within tolerance - apply transparency with smooth edges
      if (distance >= threshold - smoothEdge) {
        // Near edge - gradual alpha
        const edgeFactor = (threshold - distance) / smoothEdge;
        data[i + 3] = Math.round((1 - edgeFactor) * 255);
      } else {
        // Fully transparent
        data[i + 3] = 0;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Loads an image file into a canvas
 */
export function getCanvasFromFile(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Picks RGB color from canvas at specific coordinates
 */
export function pickColorFromCanvas(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): [number, number, number] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to get canvas context');

  // Ensure coordinates are within bounds
  const clampedX = Math.max(0, Math.min(x, canvas.width - 1));
  const clampedY = Math.max(0, Math.min(y, canvas.height - 1));

  const imageData = ctx.getImageData(clampedX, clampedY, 1, 1);
  return [imageData.data[0], imageData.data[1], imageData.data[2]];
}

/**
 * Converts canvas to PNG blob (supports transparency)
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}
