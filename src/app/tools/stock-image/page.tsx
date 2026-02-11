'use client';

import { useState, useCallback } from 'react';
import { ImageIcon, Film, Search as SearchIcon } from 'lucide-react';
import { searchImages, searchVideos } from '@/lib/pixabay/api';
import type { PixabayImage, PixabayVideo, ImageType, Orientation, VideoType, OrderBy } from '@/lib/pixabay/types';
import { CATEGORIES } from '@/lib/pixabay/types';
import { SearchBar } from './_components/SearchBar';
import { ImageGrid } from './_components/ImageGrid';
import { VideoGrid } from './_components/VideoGrid';
import { Pagination } from './_components/Pagination';
import { FilterSelect } from './_components/FilterSelect';

type Tab = 'image' | 'video';

const IMAGE_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'photo', label: '사진' },
  { value: 'illustration', label: '일러스트' },
  { value: 'vector', label: '벡터' },
];

const ORIENTATION_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'horizontal', label: '가로' },
  { value: 'vertical', label: '세로' },
];

const VIDEO_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'film', label: '실사' },
  { value: 'animation', label: '애니메이션' },
];

const ORDER_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: '전체 카테고리' },
  ...CATEGORIES.map(c => ({ value: c, label: c })),
];

const PER_PAGE = 24;

export default function StockImagePage() {
  const [tab, setTab] = useState<Tab>('image');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image state
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [imageTotalHits, setImageTotalHits] = useState(0);
  const [imageQuery, setImageQuery] = useState('');
  const [imagePage, setImagePage] = useState(1);
  const [imageType, setImageType] = useState<ImageType>('all');
  const [orientation, setOrientation] = useState<Orientation>('all');
  const [imageCategory, setImageCategory] = useState('');
  const [imageOrder, setImageOrder] = useState<OrderBy>('popular');

  // Video state
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [videoTotalHits, setVideoTotalHits] = useState(0);
  const [videoQuery, setVideoQuery] = useState('');
  const [videoPage, setVideoPage] = useState(1);
  const [videoType, setVideoType] = useState<VideoType>('all');
  const [videoCategory, setVideoCategory] = useState('');
  const [videoOrder, setVideoOrder] = useState<OrderBy>('popular');

  // Image search
  const handleImageSearch = useCallback(async (query: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    setImageQuery(query);
    setImagePage(page);

    try {
      const data = await searchImages({
        q: query,
        page,
        per_page: PER_PAGE,
        image_type: imageType,
        orientation,
        category: imageCategory as any,
        order: imageOrder,
      });
      setImages(data.hits);
      setImageTotalHits(data.totalHits);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [imageType, orientation, imageCategory, imageOrder]);

  // Video search
  const handleVideoSearch = useCallback(async (query: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    setVideoQuery(query);
    setVideoPage(page);

    try {
      const data = await searchVideos({
        q: query,
        page,
        per_page: PER_PAGE,
        video_type: videoType,
        category: videoCategory as any,
        order: videoOrder,
      });
      setVideos(data.hits);
      setVideoTotalHits(data.totalHits);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [videoType, videoCategory, videoOrder]);

  const handleImagePageChange = (page: number) => {
    handleImageSearch(imageQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoPageChange = (page: number) => {
    handleVideoSearch(videoQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SearchIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">무료 이미지/동영상</h1>
          <p className="text-sm text-muted-foreground">
            Pixabay에서 무료 이미지와 동영상을 검색하고 다운로드합니다
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border bg-card p-1 w-fit">
        <button
          onClick={() => setTab('image')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'image'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          이미지
        </button>
        <button
          onClick={() => setTab('video')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'video'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Film className="h-4 w-4" />
          동영상
        </button>
      </div>

      {/* Image Tab */}
      {tab === 'image' && (
        <div className="space-y-4">
          <SearchBar
            onSearch={(q) => handleImageSearch(q, 1)}
            placeholder="이미지 검색... (예: 자연, 도시, 비즈니스)"
            isLoading={isLoading}
          >
            <FilterSelect label="이미지 타입" value={imageType} options={IMAGE_TYPE_OPTIONS} onChange={(v) => setImageType(v as ImageType)} />
            <FilterSelect label="방향" value={orientation} options={ORIENTATION_OPTIONS} onChange={(v) => setOrientation(v as Orientation)} />
            <FilterSelect label="카테고리" value={imageCategory} options={CATEGORY_OPTIONS} onChange={setImageCategory} />
            <FilterSelect label="정렬" value={imageOrder} options={ORDER_OPTIONS} onChange={(v) => setImageOrder(v as OrderBy)} />
          </SearchBar>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {images.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                &quot;{imageQuery}&quot; 검색 결과: {imageTotalHits.toLocaleString()}개
              </p>
              <ImageGrid images={images} />
              <Pagination
                currentPage={imagePage}
                totalHits={imageTotalHits}
                perPage={PER_PAGE}
                onPageChange={handleImagePageChange}
              />
            </>
          )}

          {!isLoading && images.length === 0 && imageQuery && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}

          {!imageQuery && images.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-2">
              <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">검색어를 입력하여 무료 이미지를 찾아보세요</p>
              <p className="text-xs text-muted-foreground/70">Pixabay 제공 · 상업적 사용 가능 · 저작권 무료</p>
            </div>
          )}
        </div>
      )}

      {/* Video Tab */}
      {tab === 'video' && (
        <div className="space-y-4">
          <SearchBar
            onSearch={(q) => handleVideoSearch(q, 1)}
            placeholder="동영상 검색... (예: 자연, 도시, 배경)"
            isLoading={isLoading}
          >
            <FilterSelect label="동영상 타입" value={videoType} options={VIDEO_TYPE_OPTIONS} onChange={(v) => setVideoType(v as VideoType)} />
            <FilterSelect label="카테고리" value={videoCategory} options={CATEGORY_OPTIONS} onChange={setVideoCategory} />
            <FilterSelect label="정렬" value={videoOrder} options={ORDER_OPTIONS} onChange={(v) => setVideoOrder(v as OrderBy)} />
          </SearchBar>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {videos.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                &quot;{videoQuery}&quot; 검색 결과: {videoTotalHits.toLocaleString()}개
              </p>
              <VideoGrid videos={videos} />
              <Pagination
                currentPage={videoPage}
                totalHits={videoTotalHits}
                perPage={PER_PAGE}
                onPageChange={handleVideoPageChange}
              />
            </>
          )}

          {!isLoading && videos.length === 0 && videoQuery && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}

          {!videoQuery && videos.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-2">
              <Film className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">검색어를 입력하여 무료 동영상을 찾아보세요</p>
              <p className="text-xs text-muted-foreground/70">Pixabay 제공 · 상업적 사용 가능 · 저작권 무료</p>
            </div>
          )}
        </div>
      )}

      {/* Pixabay attribution */}
      <div className="text-center">
        <a
          href="https://pixabay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground"
        >
          Powered by Pixabay
        </a>
      </div>
    </div>
  );
}
