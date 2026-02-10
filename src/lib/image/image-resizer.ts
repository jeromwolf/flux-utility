export type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface ResizeOptions {
  width: number;
  height: number;
  format: OutputFormat;
  quality: number; // 0.1-1.0
}

/**
 * Resizes an image file to the specified dimensions and format
 */
export function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };

    img.onload = () => {
      try {
        // Create canvas with target dimensions
        const canvas = document.createElement('canvas');
        canvas.width = options.width;
        canvas.height = options.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'));
          return;
        }

        // Enable smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, options.width, options.height);

        // Convert to desired format
        const mimeType = `image/${options.format}`;

        // Get data URL for preview
        const dataUrl = canvas.toDataURL(mimeType, options.quality);

        // Convert to blob for download
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지를 변환할 수 없습니다.'));
              return;
            }
            resolve({ blob, dataUrl });
          },
          mimeType,
          options.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Gets the original dimensions of an image file
 */
export function getImageInfo(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    reader.readAsDataURL(file);
  });
}
