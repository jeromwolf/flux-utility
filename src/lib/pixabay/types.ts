export interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayImageResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export interface PixabayVideoSize {
  url: string;
  width: number;
  height: number;
  size: number;
  thumbnail: string;
}

export interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large: PixabayVideoSize;
    medium: PixabayVideoSize;
    small: PixabayVideoSize;
    tiny: PixabayVideoSize;
  };
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayVideoResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
}

export type ImageType = 'all' | 'photo' | 'illustration' | 'vector';
export type Orientation = 'all' | 'horizontal' | 'vertical';
export type VideoType = 'all' | 'film' | 'animation';
export type OrderBy = 'popular' | 'latest';

export const CATEGORIES = [
  'backgrounds', 'fashion', 'nature', 'science', 'education',
  'feelings', 'health', 'people', 'religion', 'places',
  'animals', 'industry', 'computer', 'food', 'sports',
  'transportation', 'travel', 'buildings', 'business', 'music',
] as const;

export type Category = typeof CATEGORIES[number];
