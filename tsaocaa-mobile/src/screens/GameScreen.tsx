import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Alert, Dimensions, Animated, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { useGameConfig, usePlayGame, useUserCoupons } from '../api/hooks/useGame';
import { Colors } from '../constants/colors';

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
        <Text style={styles.headerTitle}>🧋 Lucky Spin</Text>
        <Text style={styles.headerSub}>Spin to win coupons!</Text>
      </View>

      {!isAuthenticated && (
        <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.loginBannerText}>🔒 Sign in to play Lucky Spin →</Text>
        </TouchableOpacity>
      )}

      {/* Wheel Section */}
      <View style={styles.wheelSection}>
        {configLoading ? (
          <ActivityIndicator size="large" color={Colors.accent} style={{ height: WHEEL_SIZE }} />
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
              <Text style={styles.pointerEmoji}>▼</Text>
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
            <Text style={styles.spinBtnText}>🎯 SPIN!</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.playsInfo}>
          {config ? `${config.maxPlaysPerDay} plays per day` : ''}
        </Text>
      </View>

      {/* Coupon Book */}
      <View style={styles.couponBookSection}>
        <View style={styles.couponBookHeader}>
          <Text style={styles.couponBookTitle}>
            📖 My Coupon Book ({activeCoupons.length}/{maxSlots})
          </Text>
          <Text style={styles.resetCountdown}>⏰ Resets in {getCountdown()}</Text>
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
                    <Text style={styles.redeemedBadgeText}>✓ Used</Text>
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
                <Text style={styles.modalEmoji}>🎉</Text>
                <Text style={styles.modalTitle}>YOU WON!</Text>
                <Text style={styles.modalCouponName}>{resultModal?.coupon?.name}</Text>
                <Text style={styles.modalCouponCode}>{resultModal?.coupon?.code}</Text>
                <Text style={styles.modalSaved}>Saved to Coupon Book ✅</Text>
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
            <Text style={styles.modalEmoji}>🎉</Text>
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
                  <Text style={styles.replaceBtn}>Replace →</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.discardBtn}
              onPress={() => setReplaceModal(null)}
            >
              <Text style={styles.discardBtnText}>❌ Discard New Coupon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.accentLight },
  headerSub: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  loginBanner: {
    backgroundColor: Colors.accent + '20', borderWidth: 1, borderColor: Colors.accent,
    margin: 16, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  loginBannerText: { color: Colors.accentLight, fontWeight: '700', fontSize: 15 },
  wheelSection: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 },
  wheelContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  wheel: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 4, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  segment: { position: 'absolute', opacity: 0.8 },
  wheelCenter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, borderWidth: 3, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  wheelCenterText: { fontSize: 18, color: Colors.accentLight, fontWeight: '800' },
  pointer: {
    position: 'absolute', top: -12, zIndex: 10,
  },
  pointerEmoji: { fontSize: 32, color: Colors.accent },
  spinBtn: {
    backgroundColor: Colors.accent, borderRadius: 30, paddingVertical: 18, paddingHorizontal: 60,
    shadowColor: Colors.accent, shadowOpacity: 0.6, shadowRadius: 15, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  spinBtnDisabled: { opacity: 0.5 },
  spinBtnText: { fontSize: 22, fontWeight: '900', color: Colors.textOnDark },
  playsInfo: { fontSize: 13, color: Colors.textMuted, marginTop: 10 },
  couponBookSection: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  couponBookHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  couponBookTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary },
  resetCountdown: { fontSize: 12, color: Colors.textMuted },
  couponSlots: { flexDirection: 'row', gap: 10 },
  couponCard: {
    flex: 1, backgroundColor: Colors.surfaceWarm, borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  couponCardRedeemed: { opacity: 0.5 },
  couponEmoji: { fontSize: 28, marginBottom: 6 },
  couponName: { fontSize: 12, fontWeight: '700', color: Colors.primary, textAlign: 'center', marginBottom: 4 },
  couponCode: { fontSize: 11, color: Colors.textMuted, fontFamily: 'monospace', marginBottom: 8 },
  activeBadge: { backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  activeBadgeText: { fontSize: 11, color: Colors.textOnDark, fontWeight: '700' },
  redeemedBadge: { backgroundColor: Colors.success + '30', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  redeemedBadgeText: { fontSize: 11, color: Colors.success, fontWeight: '700' },
  emptyCouponSlot: {
    flex: 1, height: 140, backgroundColor: Colors.background, borderRadius: 14, borderWidth: 2,
    borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  emptyCouponText: { fontSize: 32, color: Colors.border },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: 64, marginBottom: 8 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: Colors.primary, marginBottom: 4 },
  modalCouponName: { fontSize: 18, fontWeight: '700', color: Colors.accent, marginBottom: 4 },
  modalCouponCode: { fontSize: 20, fontFamily: 'monospace', color: Colors.textSecondary, fontWeight: '700', marginBottom: 12 },
  modalSaved: { fontSize: 15, color: Colors.success, fontWeight: '700', marginBottom: 20 },
  modalSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  modalBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.textOnDark, fontWeight: '800', fontSize: 17 },
  replaceTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginTop: 12, marginBottom: 4 },
  replaceSubtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 14, textAlign: 'center' },
  replaceRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: Colors.background, borderRadius: 12, marginBottom: 8, width: '100%' },
  replaceRowEmoji: { fontSize: 28, marginRight: 12 },
  replaceRowInfo: { flex: 1 },
  replaceRowName: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  replaceRowCode: { fontSize: 12, color: Colors.textMuted },
  replaceBtn: { fontSize: 14, color: Colors.accent, fontWeight: '700' },
  discardBtn: { marginTop: 12, padding: 14, alignItems: 'center', width: '100%' },
  discardBtnText: { fontSize: 15, color: Colors.error, fontWeight: '600' },
});
