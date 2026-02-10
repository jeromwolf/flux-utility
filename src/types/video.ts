export interface SceneChange {
  id: string;
  timestamp: number; // seconds
  thumbnailUrl: string;
  confidence: number; // 0-100
}

export type Sensitivity = 'low' | 'medium' | 'high';

export interface DetectionOptions {
  sensitivity: Sensitivity;
}

// Sensitivity presets: threshold = minimum pixel difference % to trigger scene change
// sampleInterval = seconds between frame samples
export const SENSITIVITY_PRESETS: Record<Sensitivity, { threshold: number; sampleInterval: number }> = {
  high: { threshold: 8, sampleInterval: 0.3 },
  medium: { threshold: 15, sampleInterval: 0.5 },
  low: { threshold: 25, sampleInterval: 1.0 },
};
