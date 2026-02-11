export type RecordingState = 'idle' | 'recording' | 'stopped';

export class LectureRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private animationId: number = 0;
  private audioStream: MediaStream | null = null;

  // External state - updated by the page component
  private pdfImage: CanvasImageSource | null = null;
  private pdfWidth: number = 0;
  private pdfHeight: number = 0;
  private annotationCanvas: HTMLCanvasElement | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Update the current frame data. Called by the page component
   * whenever the PDF page changes or annotations update.
   */
  updateFrame(
    pdfImage: CanvasImageSource,
    pdfWidth: number,
    pdfHeight: number,
    annotationCanvas: HTMLCanvasElement
  ): void {
    this.pdfImage = pdfImage;
    this.pdfWidth = pdfWidth;
    this.pdfHeight = pdfHeight;
    this.annotationCanvas = annotationCanvas;
  }

  /**
   * Start recording. Requests mic permission and begins MediaRecorder.
   */
  async start(): Promise<void> {
    this.chunks = [];

    // Get video stream from canvas at 30fps
    const videoStream = this.canvas.captureStream(30);

    // Get audio stream from mic
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      // If mic denied, record without audio
      this.audioStream = null;
    }

    // Combine streams
    const combinedStream = new MediaStream();
    videoStream
      .getVideoTracks()
      .forEach((track) => combinedStream.addTrack(track));
    if (this.audioStream) {
      this.audioStream
        .getAudioTracks()
        .forEach((track) => combinedStream.addTrack(track));
    }

    // Create MediaRecorder
    // Try VP9+Opus first, fall back to VP8+Opus, then default
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let mimeType = '';
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) {
        mimeType = mt;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: 5_000_000, // 5 Mbps
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    // Start the render loop
    this.startRenderLoop();

    // Start recording - collect chunks every 1 second
    this.mediaRecorder.start(1000);
  }

  /**
   * Stop recording and return the recorded video as a Blob.
   */
  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(new Blob(this.chunks, { type: 'video/webm' }));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.stopRenderLoop();
        this.stopAudioStream();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    this.stopRenderLoop();
    this.stopAudioStream();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  /**
   * Get the recording canvas element (for debugging or preview).
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Check if currently recording.
   */
  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  private startRenderLoop(): void {
    const render = () => {
      this.renderFrame();
      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  }

  private stopRenderLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  private stopAudioStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
  }

  private renderFrame(): void {
    const ctx = this.ctx;
    const W = 1920;
    const H = 1080;
    const PADDING = 40;

    // 1. Dark navy background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    if (!this.pdfImage || !this.pdfWidth || !this.pdfHeight) return;

    // 2. Calculate centered placement with padding
    const maxW = W - PADDING * 2;
    const maxH = H - PADDING * 2;
    const scale = Math.min(maxW / this.pdfWidth, maxH / this.pdfHeight);
    const drawW = this.pdfWidth * scale;
    const drawH = this.pdfHeight * scale;
    const offsetX = (W - drawW) / 2;
    const offsetY = (H - drawH) / 2;

    // 3. Draw PDF page
    ctx.drawImage(this.pdfImage, offsetX, offsetY, drawW, drawH);

    // 4. Draw annotation canvas on top (scaled to same position)
    if (this.annotationCanvas) {
      ctx.drawImage(this.annotationCanvas, offsetX, offsetY, drawW, drawH);
    }
  }
}
