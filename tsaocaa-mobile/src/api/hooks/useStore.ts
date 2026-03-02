import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useStoreInfo = () =>
  useQuery({
    queryKey: ['store', 'info'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/store/info');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

export const useAnnouncements = () =>
  useQuery({
    queryKey: ['store', 'announcements'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/store/announcements');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
