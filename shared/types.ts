export interface ShortUrl {
  id: number;
  original_url: string;
  short_code: string;
  expires_at: string | null;
  created_at: string;
}

export interface Click {
  id: number;
  url_id: number;
  ip_address: string;
  user_agent: string;
  referrer: string | null;
  clicked_at: string;
}

export interface LinkPreview {
  id: number;
  url_id: number;
  title: string;
  description: string;
  image_url: string | null;
}

export interface UtmParams {
  id: number;
  url_id: number;
  name: string;
  parameters: Record<string, string>;
  is_default: boolean;
}

export interface CreateShortUrlRequest {
  originalUrl: string;
  customCode?: string;
  expiresAt?: string;
  preview?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
  utmParams?: {
    key: string;
    value: string;
  }[];
}

export interface CreateShortUrlResponse {
  shortUrl: string;
  expiresAt: string | null;
  error?: string;
}

export interface AnalyticsResponse {
  shortCode: string;
  originalUrl: string;
  expiresAt: string | null;
  totalClicks: number;
  recentClicks: Click[];
  error?: string;
}

export interface PreviewResponse {
  shortCode: string;
  originalUrl: string;
  preview: LinkPreview | null;
  error?: string;
}

export interface ErrorResponse {
  error: string;
} 