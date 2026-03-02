import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useGameConfig = () =>
  useQuery({
    queryKey: ['game', 'config'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/game/config');
      return data;
    },
    staleTime: 30 * 60 * 1000, // Config changes infrequently
  });

export const usePlayGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gameType: string = 'SPIN_WHEEL') => {
      const { data } = await apiClient.post('/api/v1/game/play', { gameType });
      return data;
    },
    onSuccess: () => {
      // Refresh coupon book after a play
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useUserCoupons = () =>
  useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/coupons');
      return data;
    },
    staleTime: 0, // Always fresh
  });

export const useCouponDetail = (couponId: number) =>
  useQuery({
    queryKey: ['coupons', couponId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/coupons/${couponId}`);
      return data;
    },
    enabled: !!couponId,
  });

export const useRedeemCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (couponId: number) => {
      const { data } = await apiClient.post(`/api/v1/coupons/${couponId}/redeem`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useReplaceCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      existingCouponId,
      couponTypeId,
    }: {
      existingCouponId: number;
      couponTypeId: number;
    }) => {
      const { data } = await apiClient.post('/api/v1/coupons/replace', {
        existingCouponId,
        couponTypeId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};
