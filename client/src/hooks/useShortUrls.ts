import { useMutation, useQuery } from '@tanstack/react-query';
import { api, CreateShortUrlRequest, AnalyticsResponse, PreviewResponse } from '@/lib/api';

export function useCreateShortUrl() {
  return useMutation({
    mutationFn: (data: CreateShortUrlRequest) => api.shortUrls.create(data),
  });
}

export function useGetAnalytics(shortCode: string) {
  return useQuery<AnalyticsResponse>({
    queryKey: ['analytics', shortCode],
    queryFn: () => api.shortUrls.getAnalytics(shortCode),
    enabled: !!shortCode,
  });
}

export function useGetPreview(shortCode: string) {
  return useQuery<PreviewResponse>({
    queryKey: ['preview', shortCode],
    queryFn: () => api.shortUrls.getPreview(shortCode),
    enabled: !!shortCode,
  });
} 