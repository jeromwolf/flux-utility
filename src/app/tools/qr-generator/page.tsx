'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QrSettings } from './_components/QrSettings';
import { generateQrDataUrl, type QrOptions } from '@/lib/qr/qr-generator';
import { saveAs } from 'file-saver';

export default function QrGeneratorPage() {
  const [text, setText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [options, setOptions] = useState({
    size: 512,
    foreground: '#000000',
    background: '#ffffff',
    errorCorrection: 'M' as 'L' | 'M' | 'Q' | 'H',
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR code with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setQrDataUrl(null);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const qrOptions: QrOptions = {
          text: text.trim(),
          size: options.size,
          foreground: options.foreground,
          background: options.background,
          errorCorrection: options.errorCorrection,
        };
        const dataUrl = await generateQrDataUrl(qrOptions);
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('QR 코드 생성 실패:', error);
        setQrDataUrl(null);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [text, options]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    fetch(qrDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        saveAs(blob, `qrcode-${options.size}.png`);
      })
      .catch((error) => {
        console.error('다운로드 실패:', error);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <QrCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">QR코드 생성기</h1>
          <p className="text-sm text-muted-foreground">
            텍스트나 URL을 QR코드로 변환합니다
          </p>
        </div>
      </div>

      {/* Main content - responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Input + Settings */}
        <div className="space-y-4">
          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="텍스트 또는 URL을 입력하세요"
            rows={4}
            className="w-full rounded-xl border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          {/* Settings */}
          <QrSettings
            size={options.size}
            foreground={options.foreground}
            background={options.background}
            errorCorrection={options.errorCorrection}
            onSizeChange={(size) => setOptions({ ...options, size })}
            onForegroundChange={(foreground) =>
              setOptions({ ...options, foreground })
            }
            onBackgroundChange={(background) =>
              setOptions({ ...options, background })
            }
            onErrorCorrectionChange={(errorCorrection) =>
              setOptions({ ...options, errorCorrection })
            }
          />
        </div>

        {/* Right column: Preview + Download */}
        <div className="space-y-4">
          {/* QR Preview */}
          <div className="rounded-xl border border-border bg-white p-8 flex items-center justify-center min-h-[300px]">
            {!text.trim() ? (
              <p className="text-sm text-muted-foreground text-center">
                텍스트를 입력하면 QR코드가 생성됩니다
              </p>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="max-w-full h-auto"
              />
            ) : (
              <p className="text-sm text-muted-foreground">생성 중...</p>
            )}
          </div>

          {/* Download button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="w-full"
          >
            PNG 다운로드
          </Button>
        </div>
      </div>
    </div>
  );
}
