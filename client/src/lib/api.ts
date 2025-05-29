import { QueryClient } from "@tanstack/react-query";

export interface UtmParam {
  key: string;
  value: string;
}

export interface LinkPreview {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateShortUrlRequest {
  originalUrl: string;
  customCode?: string;
  expiresAt?: string;
  preview?: LinkPreview;
  utmParams?: UtmParam[];
}

export interface CreateShortUrlResponse {
  shortUrl: string;
  expiresAt?: string;
}

export interface AnalyticsResponse {
  shortCode: string;
  originalUrl: string;
  expiresAt?: string;
  totalClicks: number;
  recentClicks: Array<{
    id: string;
    url_id: string;
    ip_address: string;
    user_agent: string;
    referrer: string | null;
    clicked_at: string;
  }>;
}

export interface PreviewResponse {
  shortCode: string;
  originalUrl: string;
  preview: LinkPreview | null;
}

export interface ErrorResponse {
  error: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export const api = {
  shortUrls: {
    create: (data: CreateShortUrlRequest) =>
      fetchApi<CreateShortUrlResponse>("/api/shorten", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getAnalytics: (shortCode: string) =>
      fetchApi<AnalyticsResponse>(`/api/analytics/${shortCode}`),

    getPreview: (shortCode: string) =>
      fetchApi<PreviewResponse>(`/api/preview/${shortCode}`),
  },
};
