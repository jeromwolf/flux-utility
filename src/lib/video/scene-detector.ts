import { SENSITIVITY_PRESETS, type DetectionOptions, type SceneChange } from '@/types/video';

export async function detectSceneChanges(
  file: File,
  options: DetectionOptions,
  onProgress?: (current: number, total: number) => void
): Promise<SceneChange[]> {
  const preset = SENSITIVITY_PRESETS[options.sensitivity];
  const { threshold, sampleInterval } = preset;

  // Create video element
  const video = document.createElement('video');
  const videoUrl = URL.createObjectURL(file);
  video.src = videoUrl;
  video.preload = 'metadata';

  // Wait for video metadata to load
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video'));
  });

  const duration = video.duration;

  // Handle edge case: very short videos
  if (duration < sampleInterval) {
    URL.revokeObjectURL(videoUrl);
    return [{
      id: '0',
      timestamp: 0,
      thumbnailUrl: await captureFrame(video, 0, 320),
      confidence: 100,
    }];
  }

  // Create comparison canvas (160x120 for fast pixel comparison)
  const comparisonCanvas = document.createElement('canvas');
  comparisonCanvas.width = 160;
  comparisonCanvas.height = 120;
  const comparisonCtx = comparisonCanvas.getContext('2d', { willReadFrequently: true });

  if (!comparisonCtx) {
    URL.revokeObjectURL(videoUrl);
    throw new Error('Failed to create canvas context');
  }

  const sceneChanges: SceneChange[] = [];
  let previousImageData: ImageData | null = null;
  let lastSceneTime = -Infinity;
  let sceneId = 0;

  // Always capture first frame as a scene change
  const firstThumbnail = await captureFrame(video, 0, 320);
  sceneChanges.push({
    id: String(sceneId++),
    timestamp: 0,
    thumbnailUrl: firstThumbnail,
    confidence: 100,
  });

  // Seek to 0 and get first frame data
  await seekToTime(video, 0);
  comparisonCtx.drawImage(video, 0, 0, 160, 120);
  previousImageData = comparisonCtx.getImageData(0, 0, 160, 120);
  lastSceneTime = 0;

  // Loop through video at sample intervals
  for (let time = sampleInterval; time <= duration; time += sampleInterval) {
    // Ensure we don't exceed duration
    const seekTime = Math.min(time, duration);

    // Report progress
    if (onProgress) {
      onProgress(seekTime, duration);
    }

    // Seek to time and wait for seek to complete
    await seekToTime(video, seekTime);

    // Draw frame to comparison canvas
    comparisonCtx.drawImage(video, 0, 0, 160, 120);
    const currentImageData = comparisonCtx.getImageData(0, 0, 160, 120);

    // Calculate difference with previous frame
    if (previousImageData) {
      const difference = calculateFrameDifference(previousImageData, currentImageData);

      // Check if difference exceeds threshold and at least 1 second since last scene
      if (difference >= threshold && (seekTime - lastSceneTime) >= 1.0) {
        // Capture thumbnail at higher resolution
        const thumbnailUrl = await captureFrame(video, seekTime, 320);

        sceneChanges.push({
          id: String(sceneId++),
          timestamp: seekTime,
          thumbnailUrl,
          confidence: Math.min(100, Math.round(difference)),
        });

        lastSceneTime = seekTime;
      }
    }

    previousImageData = currentImageData;
  }

  // Clean up
  URL.revokeObjectURL(videoUrl);

  // Report completion
  if (onProgress) {
    onProgress(duration, duration);
  }

  return sceneChanges;
}

async function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

async function captureFrame(
  video: HTMLVideoElement,
  time: number,
  width: number
): Promise<string> {
  // Seek to the time if not already there
  if (Math.abs(video.currentTime - time) > 0.01) {
    await seekToTime(video, time);
  }

  // Calculate proportional height
  const aspectRatio = video.videoHeight / video.videoWidth;
  const height = Math.round(width * aspectRatio);

  // Create thumbnail canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create thumbnail canvas context');
  }

  // Draw frame
  ctx.drawImage(video, 0, 0, width, height);

  // Convert to data URL
  return canvas.toDataURL('image/jpeg', 0.8);
}

function calculateFrameDifference(
  imageData1: ImageData,
  imageData2: ImageData
): number {
  const data1 = imageData1.data;
  const data2 = imageData2.data;
  const totalPixels = imageData1.width * imageData1.height;

  let totalDifference = 0;

  // Compare each pixel's RGB values
  for (let i = 0; i < data1.length; i += 4) {
    const rDiff = Math.abs(data1[i] - data2[i]);
    const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
    const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);

    totalDifference += rDiff + gDiff + bDiff;
  }

  // Calculate percentage difference
  // Maximum possible difference per pixel is 255 * 3 (RGB)
  const maxPossibleDifference = totalPixels * 255 * 3;
  const percentageDifference = (totalDifference / maxPossibleDifference) * 100;

  return percentageDifference;
}

export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
