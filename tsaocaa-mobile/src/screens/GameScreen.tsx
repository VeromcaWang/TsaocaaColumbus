import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Alert, Dimensions, Animated, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { useGameConfig, usePlayGame, useUserCoupons } from '../api/hooks/useGame';
import { Colors, Typography, Shadows } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = SCREEN_WIDTH - 48;

export default function GameScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: config, isLoading: configLoading } = useGameConfig();
  const { data: coupons, refetch: refetchCoupons } = useUserCoupons();
  const playMutation = usePlayGame();

  const [isSpinning, setIsSpinning] = useState(false);
  const [resultModal, setResultModal] = useState<any>(null);
  const [replaceModal, setReplaceModal] = useState<any>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const maxSlots = config?.maxCouponsPerWeek ?? 3;
  const activeCoupons = coupons?.filter((c: any) =>
    c.status === 'ACTIVE' || c.status === 'REDEEMED'
  ) ?? [];

  // Countdown to next Monday reset
  const getCountdown = () => {
    const now = new Date();
    const nextMonday = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    const msLeft = nextMonday.getTime() - now.getTime();
    const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const handleSpin = useCallback(async () => {
    if (isSpinning || !isAuthenticated) return;

    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to play Lucky Spin!', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Profile') },
      ]);
      return;
    }

    setIsSpinning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const result = await playMutation.mutateAsync('SPIN_WHEEL');
      const segmentIndex = result.segment?.segmentIndex ?? 0;
      const segments = config?.segments ?? [];
      const totalSegments = segments.length || 8;

      // Calculate final rotation: 5 full spins + land on the correct segment
      const segmentAngle = 360 / totalSegments;
      const targetAngle = segmentIndex * segmentAngle;
      const fullSpins = 5 * 360;
      const finalAngle = currentRotation.current + fullSpins + (360 - targetAngle);

      Animated.timing(spinAnim, {
        toValue: finalAngle,
        duration: 4000,
        useNativeDriver: true,
        // Ease-out deceleration
      }).start(() => {
        currentRotation.current = finalAngle % 360;
        setIsSpinning(false);
        Haptics.notificationAsync(
          result.result === 'WIN'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        );

        if (result.action === 'BOOK_FULL') {
          setReplaceModal(result);
        } else {
          setResultModal(result);
        }
        refetchCoupons();
      });
    } catch (err: any) {
      setIsSpinning(false);
      const msg = err?.response?.data?.message || 'Could not play right now. Try again later.';
      Alert.alert('Oops!', msg);
    }
  }, [isSpinning, isAuthenticated, config, playMutation, spinAnim, refetchCoupons]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const segments = config?.segments ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lucky Spin</Text>
        <Text style={styles.headerSub}>Spin to win coupons!</Text>
      </View>

      {!isAuthenticated && (
        <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Profile')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="lock" size={16} color={Colors.primary} />
            <Text style={styles.loginBannerText}>Sign in to play Lucky Spin</Text>
            <Feather name="arrow-right" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      {/* Wheel Section */}
      <View style={styles.wheelSection}>
        {configLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ height: WHEEL_SIZE }} />
        ) : (
          <View style={styles.wheelContainer}>
            <Animated.View
              style={[
                styles.wheel,
                { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2 },
                { transform: [{ rotate: spin }] },
              ]}
            >
              {segments.map((seg: any, index: number) => {
                const angle = (360 / segments.length) * index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.segment,
                      {
                        transform: [{ rotate: `${angle}deg` }],
                        backgroundColor: seg.wheelColor,
                        width: WHEEL_SIZE / 2,
                        height: 4,
                        position: 'absolute',
                        left: WHEEL_SIZE / 2,
                        top: WHEEL_SIZE / 2 - 2,
                        transformOrigin: 'left center',
                      },
                    ]}
                  />
                );
              })}
              {/* Centered circle */}
              <View style={styles.wheelCenter}>
                <Text style={styles.wheelCenterText}>朝茶</Text>
              </View>
            </Animated.View>

            {/* Pointer */}
            <View style={styles.pointer}>
              <Feather name="chevron-down" size={32} color={Colors.primary} />
            </View>
          </View>
        )}

        {/* Spin button */}
        <TouchableOpacity
          style={[styles.spinBtn, (isSpinning || !isAuthenticated) && styles.spinBtnDisabled]}
          onPress={handleSpin}
          disabled={isSpinning || configLoading}
        >
          {isSpinning ? (
            <ActivityIndicator color={Colors.textOnDark} />
          ) : (
            <Text style={styles.spinBtnText}>SPIN</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.playsInfo}>
          {config ? `${config.maxPlaysPerDay} plays per day` : ''}
        </Text>
      </View>

      {/* Coupon Book */}
      <View style={styles.couponBookSection}>
        <View style={styles.couponBookHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="book" size={18} color={Colors.primary} />
            <Text style={styles.couponBookTitle}>
              My Coupon Book ({activeCoupons.length}/{maxSlots})
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="clock" size={12} color={Colors.textMuted} />
            <Text style={styles.resetCountdown}>Resets in {getCountdown()}</Text>
          </View>
        </View>

        <View style={styles.couponSlots}>
          {Array.from({ length: maxSlots }).map((_, index) => {
            const coupon = activeCoupons[index];
            if (!coupon) {
              return (
                <View key={index} style={styles.emptyCouponSlot}>
                  <Text style={styles.emptyCouponText}>+</Text>
                </View>
              );
            }
            return (
              <TouchableOpacity
                key={coupon.id}
                style={[
                  styles.couponCard,
                  coupon.status === 'REDEEMED' && styles.couponCardRedeemed,
                ]}
                onPress={() => navigation.navigate('CouponDetail', { couponId: coupon.id })}
              >
                <Text style={styles.couponEmoji}>{coupon.iconEmoji}</Text>
                <Text style={styles.couponName} numberOfLines={2}>{coupon.name}</Text>
                <Text style={styles.couponCode}>{coupon.couponCode}</Text>
                {coupon.status === 'REDEEMED' ? (
                  <View style={styles.redeemedBadge}>
                    <Text style={styles.redeemedBadgeText}>Used</Text>
                  </View>
                ) : (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Tap to Redeem</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Result Modal */}
      <Modal visible={!!resultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {resultModal?.result === 'WIN' ? (
              <>
                <Text style={styles.modalEmoji}>{resultModal?.segment?.emoji || '🎉'}</Text>
                <Text style={styles.modalTitle}>YOU WON!</Text>
                <Text style={styles.modalCouponName}>{resultModal?.coupon?.name}</Text>
                <Text style={styles.modalCouponCode}>{resultModal?.coupon?.code}</Text>
                <Text style={styles.modalSaved}>Saved to Coupon Book</Text>
              </>
            ) : (
              <>
                <Text style={styles.modalEmoji}>{resultModal?.segment?.emoji || '😅'}</Text>
                <Text style={styles.modalTitle}>{resultModal?.segment?.label || 'Try Again!'}</Text>
                <Text style={styles.modalSubtitle}>
                  {resultModal?.playsRemainingToday > 0
                    ? `${resultModal.playsRemainingToday} plays remaining today`
                    : 'Come back tomorrow for more plays!'}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setResultModal(null)}
            >
              <Text style={styles.modalBtnText}>
                {resultModal?.result === 'WIN' ? 'View Coupon Book' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Replace Modal */}
      <Modal visible={!!replaceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={styles.modalEmoji}>{replaceModal?.segment?.emoji || '🎉'}</Text>
            <Text style={styles.modalTitle}>YOU WON!</Text>
            <Text style={styles.modalCouponName}>{replaceModal?.newCoupon?.name}</Text>
            <Text style={styles.replaceTitle}>Your Coupon Book is full!</Text>
            <Text style={styles.replaceSubtitle}>Replace a coupon or discard the new one:</Text>

            <ScrollView style={{ width: '100%', maxHeight: 200 }}>
              {replaceModal?.replaceableCoupons?.map((rc: any) => (
                <TouchableOpacity
                  key={rc.id}
                  style={styles.replaceRow}
                  onPress={async () => {
                    try {
                      const { apiClient } = require('../api/client');
                      await apiClient.post('/api/v1/coupons/replace', {
                        existingCouponId: rc.id,
                        couponTypeId: replaceModal.newCoupon.couponTypeId,
                      });
                      refetchCoupons();
                      setReplaceModal(null);
                      Alert.alert('Done!', `${rc.name} was replaced with ${replaceModal.newCoupon.name}`);
                    } catch {
                      Alert.alert('Error', 'Could not replace coupon. Try again.');
                    }
                  }}
                >
                  <Text style={styles.replaceRowEmoji}>{rc.iconEmoji || '🎫'}</Text>
                  <View style={styles.replaceRowInfo}>
                    <Text style={styles.replaceRowName}>{rc.name}</Text>
                    <Text style={styles.replaceRowCode}>{rc.code}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.replaceBtn}>Replace</Text>
                    <Feather name="arrow-right" size={14} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.discardBtn}
              onPress={() => setReplaceModal(null)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="x" size={16} color={Colors.error} />
                <Text style={styles.discardBtnText}>Discard New Coupon</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gameBackground },
  header: {
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16, alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 26, fontWeight: '600', color: Colors.textPrimary,
    fontFamily: Typography.semiBold,
  },
  headerSub: {
    fontSize: 14, color: Colors.textSecondary, marginTop: 4,
    fontFamily: Typography.regular,
  },
  loginBanner: {
    backgroundColor: Colors.primary + '10', borderWidth: 1, borderColor: Colors.primary,
    margin: 16, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  loginBannerText: {
    color: Colors.primary, fontWeight: '600', fontSize: 15,
    fontFamily: Typography.semiBold,
  },
  wheelSection: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 },
  wheelContainer: {
    position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  wheel: {
    backgroundColor: Colors.surfaceWarm,
    borderWidth: 3, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  segment: { position: 'absolute', opacity: 0.8 },
  wheelCenter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, borderWidth: 3, borderColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  wheelCenterText: {
    fontSize: 18, color: Colors.accentLight, fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  pointer: {
    position: 'absolute', top: -14, zIndex: 10,
  },
  spinBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  spinBtnDisabled: { opacity: 0.5 },
  spinBtnText: {
    fontSize: 18, fontWeight: '600', color: Colors.textOnDark,
    fontFamily: Typography.semiBold, letterSpacing: 2,
  },
  playsInfo: {
    fontSize: 13, color: Colors.textMuted, marginTop: 10,
    fontFamily: Typography.regular,
  },
  couponBookSection: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, ...Shadows.card,
  },
  couponBookHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  couponBookTitle: {
    fontSize: 17, fontWeight: '600', color: Colors.primary,
    fontFamily: Typography.semiBold,
  },
  resetCountdown: {
    fontSize: 12, color: Colors.textMuted,
    fontFamily: Typography.regular,
  },
  couponSlots: { flexDirection: 'row', gap: 10 },
  couponCard: {
    flex: 1, backgroundColor: Colors.surfaceWarm, borderRadius: 12, padding: 12,
    alignItems: 'center', ...Shadows.card,
  },
  couponCardRedeemed: { opacity: 0.5 },
  couponEmoji: { fontSize: 28, marginBottom: 6 },
  couponName: {
    fontSize: 12, fontWeight: '600', color: Colors.primary, textAlign: 'center', marginBottom: 4,
    fontFamily: Typography.semiBold,
  },
  couponCode: {
    fontSize: 11, color: Colors.textMuted, fontFamily: 'monospace', marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 11, color: Colors.textOnDark, fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  redeemedBadge: {
    backgroundColor: Colors.success + '30', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  redeemedBadgeText: {
    fontSize: 11, color: Colors.success, fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  emptyCouponSlot: {
    flex: 1, height: 140, backgroundColor: Colors.background, borderRadius: 12, borderWidth: 2,
    borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  emptyCouponText: { fontSize: 32, color: Colors.border },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 28,
    alignItems: 'center', width: '100%', ...Shadows.cardElevated,
  },
  modalEmoji: { fontSize: 64, marginBottom: 8 },
  modalTitle: {
    fontSize: 24, fontWeight: '600', color: Colors.primary, marginBottom: 4,
    fontFamily: Typography.semiBold,
  },
  modalCouponName: {
    fontSize: 18, fontWeight: '600', color: Colors.primary, marginBottom: 4,
    fontFamily: Typography.semiBold,
  },
  modalCouponCode: {
    fontSize: 20, fontFamily: 'monospace', color: Colors.textSecondary,
    fontWeight: '600', marginBottom: 12,
  },
  modalSaved: {
    fontSize: 15, color: Colors.success, fontWeight: '600', marginBottom: 20,
    fontFamily: Typography.semiBold,
  },
  modalSubtitle: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20,
    fontFamily: Typography.regular,
  },
  modalBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 32, width: '100%', alignItems: 'center',
  },
  modalBtnText: {
    color: Colors.textOnDark, fontWeight: '600', fontSize: 17,
    fontFamily: Typography.semiBold,
  },
  replaceTitle: {
    fontSize: 16, fontWeight: '600', color: Colors.primary, marginTop: 12, marginBottom: 4,
    fontFamily: Typography.semiBold,
  },
  replaceSubtitle: {
    fontSize: 13, color: Colors.textMuted, marginBottom: 14, textAlign: 'center',
    fontFamily: Typography.regular,
  },
  replaceRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: Colors.background, borderRadius: 12, marginBottom: 8, width: '100%',
  },
  replaceRowEmoji: { fontSize: 28, marginRight: 12 },
  replaceRowInfo: { flex: 1 },
  replaceRowName: {
    fontSize: 14, fontWeight: '600', color: Colors.primary,
    fontFamily: Typography.semiBold,
  },
  replaceRowCode: {
    fontSize: 12, color: Colors.textMuted,
    fontFamily: Typography.regular,
  },
  replaceBtn: {
    fontSize: 14, color: Colors.primary, fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  discardBtn: { marginTop: 12, padding: 14, alignItems: 'center', width: '100%' },
  discardBtnText: {
    fontSize: 15, color: Colors.error, fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
});
