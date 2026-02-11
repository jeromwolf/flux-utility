'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ImageIcon, RotateCcw, Download, Crop, SlidersHorizontal, Sparkles } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  loadImage,
  buildFilterString,
  applyAdjustments,
  applyCrop,
  exportImage,
  DEFAULT_ADJUSTMENTS,
  FILTER_PRESETS,
} from '@/lib/image/image-editor';
import type { Adjustments, CropRect, FilterPreset } from '@/lib/image/image-editor';
import { AdjustmentPanel } from './_components/AdjustmentPanel';
import { FilterPanel } from './_components/FilterPanel';
import { CropOverlay } from './_components/CropOverlay';

type Tab = 'adjust' | 'filter' | 'crop';

export default function ImageEditPage() {
  // Image state
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [originalFormat, setOriginalFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Edit state
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [activeFilter, setActiveFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('adjust');
  const [isSaving, setIsSaving] = useState(false);

  // ------------------------------------------------------------------
  // File handling
  // ------------------------------------------------------------------

  const handleFile = useCallback(async (file: File) => {
    try {
      const img = await loadImage(file);
      setImage(img);
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      setOriginalFormat(file.type === 'image/png' ? 'image/png' : 'image/jpeg');

      // Generate display URL once (img.src was revoked in loadImage, so draw to canvas)
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = img.naturalWidth;
      previewCanvas.height = img.naturalHeight;
      previewCanvas.getContext('2d')!.drawImage(img, 0, 0);
      setImageUrl(previewCanvas.toDataURL('image/jpeg', 0.9));

      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
      setActiveFilter(FILTER_PRESETS[0]);
      setCropRect(null);
      setActiveTab('adjust');
    } catch (err) {
      alert(err instanceof Error ? err.message : '이미지를 불러올 수 없습니다.');
    }
  }, []);

  // ------------------------------------------------------------------
  // CSS filter for live preview (no canvas needed per frame!)
  // ------------------------------------------------------------------

  const previewFilter = useMemo(() => {
    const adj: Adjustments = { ...adjustments };
    if (activeFilter.id !== 'original' && activeFilter.adjustments) {
      Object.assign(adj, activeFilter.adjustments);
    }
    return buildFilterString(adj);
  }, [adjustments, activeFilter]);

  const mergedVignette = useMemo(() => {
    if (activeFilter.id !== 'original' && activeFilter.adjustments?.vignette !== undefined) {
      return activeFilter.adjustments.vignette;
    }
    return adjustments.vignette;
  }, [adjustments.vignette, activeFilter]);

  // Track display size for crop overlay (observe the img element directly)
  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;
    const observer = new ResizeObserver(() => {
      setDisplaySize({ width: imgEl.clientWidth, height: imgEl.clientHeight });
    });
    observer.observe(imgEl);
    return () => observer.disconnect();
  }, [imageUrl]);

  // ------------------------------------------------------------------
  // Save (full-res canvas rendering only on save)
  // ------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    if (!image) return;
    setIsSaving(true);

    try {
      const adj: Adjustments = { ...adjustments };
      if (activeFilter.id !== 'original' && activeFilter.adjustments) {
        Object.assign(adj, activeFilter.adjustments);
      }
      let result = applyAdjustments(image, { ...DEFAULT_ADJUSTMENTS, ...adj }, activeFilter);

      if (cropRect) {
        result = applyCrop(result, cropRect);
      }

      const ext = originalFormat === 'image/png' ? 'png' : 'jpg';
      const blob = await exportImage(result, originalFormat, 0.92);
      saveAs(blob, `${fileName || 'edited'}.${ext}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [image, adjustments, activeFilter, cropRect, fileName, originalFormat]);

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------

  const reset = useCallback(() => {
    setImage(null);
    setImageUrl(null);
    setFileName('');
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setActiveFilter(FILTER_PRESETS[0]);
    setCropRect(null);
  }, []);

  // ------------------------------------------------------------------
  // Tabs
  // ------------------------------------------------------------------

  const TABS: { id: Tab; label: string; icon: typeof SlidersHorizontal }[] = [
    { id: 'adjust', label: '조정', icon: SlidersHorizontal },
    { id: 'filter', label: '필터', icon: Sparkles },
    { id: 'crop', label: '크롭', icon: Crop },
  ];

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">이미지 편집기</h1>
            <p className="text-sm text-muted-foreground">
              밝기, 대비, 채도 조정과 필터, 크롭 기능
            </p>
          </div>
        </div>
        {image && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* Idle state: file upload */}
      {!image && (
        <FileUpload
          accept="image/*"
          onFile={handleFile}
          label="이미지 파일을 드래그하거나 클릭하여 업로드"
          description="JPG, PNG, WebP (최대 50MB)"
        />
      )}

      {/* Editor */}
      {image && imageUrl && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* Preview area */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div ref={imageContainerRef} className="flex justify-center">
              <div className="relative inline-block">
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-[65vh] w-auto rounded-lg"
                  draggable={false}
                  style={{ filter: previewFilter }}
                />
                {/* Vignette overlay */}
                {mergedVignette > 0 && (
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${mergedVignette / 100}) 100%)`,
                    }}
                  />
                )}
                {/* Filter color overlay */}
                {activeFilter.overlay && (
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      backgroundColor: activeFilter.overlay.color,
                      opacity: activeFilter.overlay.opacity,
                      mixBlendMode: activeFilter.overlay.blendMode as React.CSSProperties['mixBlendMode'],
                    }}
                  />
                )}
                <CropOverlay
                  imageWidth={displaySize.width}
                  imageHeight={displaySize.height}
                  naturalWidth={image.naturalWidth}
                  naturalHeight={image.naturalHeight}
                  onCropChange={setCropRect}
                  active={activeTab === 'crop'}
                />
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Tab buttons */}
            <div className="flex rounded-xl border border-border bg-card p-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl border border-border bg-card p-4">
              {activeTab === 'adjust' && (
                <AdjustmentPanel
                  adjustments={adjustments}
                  onChange={setAdjustments}
                  onReset={() => setAdjustments({ ...DEFAULT_ADJUSTMENTS })}
                />
              )}
              {activeTab === 'filter' && (
                <FilterPanel
                  image={image}
                  activeFilter={activeFilter.id}
                  onFilterChange={(preset) => {
                    setActiveFilter(preset);
                    if (preset.id === 'original') {
                      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
                    } else if (preset.adjustments) {
                      setAdjustments(prev => ({ ...prev, ...preset.adjustments }));
                    }
                  }}
                />
              )}
              {activeTab === 'crop' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">크롭</h3>
                  <p className="text-xs text-muted-foreground">
                    이미지 위에서 드래그하여 자를 영역을 선택하세요.
                    모서리 핸들을 드래그하여 크기를 조정할 수 있습니다.
                  </p>
                  {cropRect && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>크기: {cropRect.width} x {cropRect.height}px</p>
                      <button
                        onClick={() => setCropRect(null)}
                        className="text-primary hover:underline"
                      >
                        크롭 해제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save button */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Download className="h-4 w-4" />
              {isSaving ? '저장 중...' : '이미지 저장'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
