import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useAnalytics = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'analytics', params],
    queryFn: () => api.getAnalytics(params),
    enabled: !!params,
  });
};
