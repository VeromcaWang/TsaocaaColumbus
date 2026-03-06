import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCouponDetail, useRedeemCoupon } from '../api/hooks/useGame';
import { Colors, Typography } from '../constants/colors';

export default function CouponDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { couponId } = route.params;
  const { data: coupon, isLoading, refetch } = useCouponDetail(couponId);
  const redeemMutation = useRedeemCoupon();

  const handleRedeem = () => {
    if (coupon?.status !== 'ACTIVE') return;

    Alert.alert(
      'Redeem Coupon',
      `Show this screen to your barista and tap Redeem to use:\n\n${coupon.name}\n\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          style: 'destructive',
          onPress: async () => {
            try {
              await redeemMutation.mutateAsync(couponId);
              refetch();
              Alert.alert('Redeemed!', 'Your coupon has been redeemed. Enjoy your drink!');
            } catch {
              Alert.alert('Error', 'Could not redeem coupon. Please try again or ask staff for help.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!coupon) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Coupon not found</Text>
      </View>
    );
  }

  const isActive = coupon.status === 'ACTIVE';
  const isRedeemed = coupon.status === 'REDEEMED';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="arrow-left" size={18} color={Colors.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupon</Text>
      </View>

      <View style={styles.couponCard}>
        {/* Status badge */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: isActive ? Colors.success + '20' : Colors.textMuted + '20' }
        ]}>
          <Text style={[
            styles.statusBadgeText,
            { color: isActive ? Colors.success : Colors.textMuted }
          ]}>
            {isActive ? '● Active' : isRedeemed ? '✓ Redeemed' : coupon.status}
          </Text>
        </View>

        {/* Coupon info */}
        <Text style={styles.couponEmoji}>{coupon.iconEmoji || '🎫'}</Text>
        <Text style={styles.couponName}>{coupon.name}</Text>
        {coupon.description && (
          <Text style={styles.couponDescription}>{coupon.description}</Text>
        )}
        {coupon.minPurchase > 0 && (
          <Text style={styles.terms}>Min. purchase: ${coupon.minPurchase.toFixed(2)}</Text>
        )}

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={coupon.couponCode}
            size={180}
            color={Colors.primary}
            backgroundColor={Colors.surface}
          />
          <Text style={styles.couponCode}>{coupon.couponCode}</Text>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Won</Text>
            <Text style={styles.dateValue}>{formatDate(coupon.wonAt)}</Text>
          </View>
          <View style={styles.dateDivider} />
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Expires</Text>
            <Text style={[styles.dateValue, isActive && { color: Colors.error }]}>
              {formatDate(coupon.expiresAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Instruction */}
      {isActive && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            Show this screen to your barista and tap{' '}
            <Text style={{ fontWeight: '600' }}>Redeem</Text> when ready.
          </Text>
        </View>
      )}

      {/* Redeem button */}
      {isActive && (
        <TouchableOpacity
          style={[styles.redeemBtn, redeemMutation.isPending && styles.btnDisabled]}
          onPress={handleRedeem}
          disabled={redeemMutation.isPending}
        >
          {redeemMutation.isPending ? (
            <ActivityIndicator color={Colors.textOnDark} />
          ) : (
            <Text style={styles.redeemBtnText}>REDEEM COUPON</Text>
          )}
        </TouchableOpacity>
      )}

      {isRedeemed && (
        <View style={styles.redeemedBox}>
          <Text style={styles.redeemedText}>This coupon was redeemed on {formatDate(coupon.redeemedAt)}</Text>
        </View>
      )}

      {isActive && (
        <Text style={styles.warningText}>This action cannot be undone</Text>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.textMuted, fontSize: 16, fontFamily: Typography.regular },
  header: {
    backgroundColor: Colors.background, paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { marginRight: 16 },
  backBtnText: {
    color: Colors.primary, fontSize: 17, fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  headerTitle: {
    fontSize: 20, fontWeight: '600', color: Colors.textPrimary,
    fontFamily: Typography.semiBold,
  },
  couponCard: {
    margin: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  statusBadgeText: { fontWeight: '600', fontSize: 14, fontFamily: Typography.semiBold },
  couponEmoji: { fontSize: 56, marginBottom: 8 },
  couponName: {
    fontSize: 24, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8,
    fontFamily: Typography.semiBold,
  },
  couponDescription: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 8,
    fontFamily: Typography.regular,
  },
  terms: { fontSize: 13, color: Colors.textMuted, marginBottom: 24, fontFamily: Typography.regular },
  qrContainer: { alignItems: 'center', padding: 20, backgroundColor: Colors.background, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.divider },
  couponCode: { fontSize: 22, fontFamily: 'monospace', fontWeight: '600', color: Colors.textPrimary, marginTop: 12, letterSpacing: 3 },
  datesRow: { flexDirection: 'row', width: '100%' },
  dateItem: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 4, fontFamily: Typography.regular },
  dateValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, fontFamily: Typography.semiBold },
  dateDivider: { width: 1, backgroundColor: Colors.divider },
  instructionBox: { marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.surfaceWarm, borderRadius: 12, padding: 14 },
  instructionText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, fontFamily: Typography.regular },
  redeemBtn: {
    marginHorizontal: 16, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnDisabled: { opacity: 0.6 },
  redeemBtnText: {
    fontSize: 18, fontWeight: '600', color: Colors.textOnDark,
    fontFamily: Typography.semiBold,
  },
  redeemedBox: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.success + '15', borderRadius: 12, padding: 16, alignItems: 'center' },
  redeemedText: { fontSize: 15, color: Colors.success, fontWeight: '600', textAlign: 'center', fontFamily: Typography.semiBold },
  warningText: { textAlign: 'center', fontSize: 13, color: Colors.textMuted, marginTop: 10, fontFamily: Typography.regular },
});
