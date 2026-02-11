'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageIcon, RotateCcw, Download, Crop, SlidersHorizontal, Sparkles } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  loadImage,
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const imageContainerRef = useRef<HTMLDivElement>(null);
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
      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
      setActiveFilter(FILTER_PRESETS[0]);
      setCropRect(null);
      setActiveTab('adjust');
    } catch (err) {
      alert(err instanceof Error ? err.message : '이미지를 불러올 수 없습니다.');
    }
  }, []);

  // ------------------------------------------------------------------
  // Preview generation
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!image) return;

    // Apply adjustments + filter
    const canvas = applyAdjustments(image, adjustments, activeFilter);
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
  }, [image, adjustments, activeFilter]);

  // Track display size for crop overlay
  useEffect(() => {
    if (!imageContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const img = entry.target.querySelector('img');
        if (img) {
          setDisplaySize({ width: img.clientWidth, height: img.clientHeight });
        }
      }
    });
    observer.observe(imageContainerRef.current);
    return () => observer.disconnect();
  }, [previewUrl]);

  // ------------------------------------------------------------------
  // Save
  // ------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    if (!image) return;
    setIsSaving(true);

    try {
      let result = applyAdjustments(image, adjustments, activeFilter);

      if (cropRect) {
        result = applyCrop(result, cropRect);
      }

      const blob = await exportImage(result, 'image/jpeg', 0.92);
      saveAs(blob, `${fileName || 'edited'}.jpg`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [image, adjustments, activeFilter, cropRect, fileName]);

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------

  const reset = useCallback(() => {
    setImage(null);
    setPreviewUrl(null);
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
      {image && previewUrl && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* Preview area */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div ref={imageContainerRef} className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[65vh] w-auto rounded-lg"
                draggable={false}
              />
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
                    // Also update adjustments to match the filter
                    if (preset.id === 'original') {
                      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
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
