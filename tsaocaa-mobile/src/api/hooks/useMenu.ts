import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useMenuCategories = () =>
  useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/menu/categories');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useMenuItemsByCategory = (categoryId: number) =>
  useQuery({
    queryKey: ['menu', 'category', categoryId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/menu/categories/${categoryId}/items`);
      return data;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });

export const useMenuItem = (itemId: number) =>
  useQuery({
    queryKey: ['menu', 'item', itemId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/menu/items/${itemId}`);
      return data;
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });

export const useFeaturedItems = () =>
  useQuery({
    queryKey: ['menu', 'featured'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/menu/items/featured');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

export const useSeasonalItems = () =>
  useQuery({
    queryKey: ['menu', 'seasonal'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/menu/items/seasonal');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

export const useMenuSearch = (query: string) =>
  useQuery({
    queryKey: ['menu', 'search', query],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/menu/search', { params: { q: query } });
      return data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
  });
