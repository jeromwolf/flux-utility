import QRCode from 'qrcode';

export interface QrOptions {
  text: string;
  size: number; // 256, 512, 1024
  foreground: string; // hex color, default '#000000'
  background: string; // hex color, default '#ffffff'
  errorCorrection: 'L' | 'M' | 'Q' | 'H'; // default 'M'
}

export async function generateQrDataUrl(options: QrOptions): Promise<string> {
  return QRCode.toDataURL(options.text, {
    width: options.size,
    margin: 2,
    color: {
      dark: options.foreground,
      light: options.background,
    },
    errorCorrectionLevel: options.errorCorrection,
  });
}

export async function generateQrBlob(options: QrOptions): Promise<Blob> {
  const dataUrl = await generateQrDataUrl(options);
  const res = await fetch(dataUrl);
  return res.blob();
}
