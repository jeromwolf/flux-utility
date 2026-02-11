import type {
  PixabayImageResponse,
  PixabayVideoResponse,
  ImageType,
  Orientation,
  VideoType,
  OrderBy,
  Category,
} from './types';

interface ImageSearchParams {
  q: string;
  page?: number;
  per_page?: number;
  image_type?: ImageType;
  orientation?: Orientation;
  category?: Category;
  order?: OrderBy;
  editors_choice?: boolean;
}

interface VideoSearchParams {
  q: string;
  page?: number;
  per_page?: number;
  video_type?: VideoType;
  category?: Category;
  order?: OrderBy;
  editors_choice?: boolean;
}

export async function searchImages(params: ImageSearchParams): Promise<PixabayImageResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', params.q);
  searchParams.set('lang', 'ko');
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));
  if (params.image_type && params.image_type !== 'all') searchParams.set('image_type', params.image_type);
  if (params.orientation && params.orientation !== 'all') searchParams.set('orientation', params.orientation);
  if (params.category) searchParams.set('category', params.category);
  if (params.order) searchParams.set('order', params.order);
  if (params.editors_choice) searchParams.set('editors_choice', 'true');

  const res = await fetch(`/api/pixabay/images?${searchParams.toString()}`);
  if (!res.ok) throw new Error('이미지 검색에 실패했습니다.');
  return res.json();
}

export async function searchVideos(params: VideoSearchParams): Promise<PixabayVideoResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', params.q);
  searchParams.set('lang', 'ko');
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));
  if (params.video_type && params.video_type !== 'all') searchParams.set('video_type', params.video_type);
  if (params.category) searchParams.set('category', params.category);
  if (params.order) searchParams.set('order', params.order);
  if (params.editors_choice) searchParams.set('editors_choice', 'true');

  const res = await fetch(`/api/pixabay/videos?${searchParams.toString()}`);
  if (!res.ok) throw new Error('동영상 검색에 실패했습니다.');
  return res.json();
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(`/api/pixabay/download?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('다운로드에 실패했습니다.');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
