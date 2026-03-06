import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStoreInfo } from '../api/hooks/useStore';
import { Colors, Typography } from '../constants/colors';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StoreScreen() {
  const { data: store, isLoading } = useStoreInfo();

  const openDirections = () => {
    const addr = encodeURIComponent('4740 Reed Rd Suite 107, Columbus, OH 43220');
    const url = Platform.OS === 'ios'
      ? `maps://?address=${addr}`
      : `https://maps.google.com/?q=${addr}`;
    Linking.openURL(url);
  };

  const callStore = () => Linking.openURL(`tel:${store?.phone?.replace(/\D/g, '')}`);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visit Us</Text>
        {store?.isOpenNow !== undefined && (
          <View style={[styles.statusBadge, { backgroundColor: store.isOpenNow ? Colors.success : Colors.error }]}>
            <Text style={styles.statusText}>{store.isOpenNow ? '● Open Now' : '● Closed'}</Text>
          </View>
        )}
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Feather name="map" size={40} color={Colors.textMuted} />
        <Text style={styles.mapText}>4740 Reed Rd, Suite 107{'\n'}Columbus, OH 43220</Text>
        <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="navigation" size={16} color={Colors.textOnDark} />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <TouchableOpacity style={styles.contactRow} onPress={callStore}>
          <Feather name="phone" size={20} color={Colors.primary} style={{ marginRight: 14 }} />
          <Text style={[styles.contactValue, { color: Colors.primary }]}>{store?.phone}</Text>
        </TouchableOpacity>
        {store?.instagramUrl && (
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL(store.instagramUrl)}
          >
            <Feather name="instagram" size={20} color={Colors.primary} style={{ marginRight: 14 }} />
            <Text style={[styles.contactValue, { color: Colors.primary }]}>@tsaocaacolumbus</Text>
          </TouchableOpacity>
        )}
        {store?.tiktokUrl && (
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL(store.tiktokUrl)}
          >
            <Feather name="music" size={20} color={Colors.primary} style={{ marginRight: 14 }} />
            <Text style={[styles.contactValue, { color: Colors.primary }]}>@tsaocaacolumbus</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours</Text>
        {store?.weeklyHours?.map((h: any) => {
          const isToday = h.dayName === store.todayHours?.dayName;
          return (
            <View key={h.dayOfWeek} style={[styles.hoursRow, isToday && styles.hoursRowToday]}>
              <Text style={[styles.hoursDay, isToday && styles.hoursDayToday]}>
                {isToday ? '▶ ' : ''}{h.dayName}
              </Text>
              <Text style={[styles.hoursTime, isToday && styles.hoursTimeToday]}>
                {h.isClosed ? 'Closed' : `${formatTime(h.openTime)} – ${formatTime(h.closeTime)}`}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return m === '00' ? `${h12} ${ampm}` : `${h12}:${m} ${ampm}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.background, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 26, fontWeight: '600', color: Colors.textPrimary,
    fontFamily: Typography.semiBold,
  },
  statusBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: {
    color: Colors.textOnDark, fontWeight: '600', fontSize: 13,
    fontFamily: Typography.semiBold,
  },
  mapPlaceholder: {
    height: 200, backgroundColor: Colors.surfaceWarm, justifyContent: 'center',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  mapText: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22,
    fontFamily: Typography.regular,
  },
  directionsBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 14,
  },
  directionsBtnText: {
    color: Colors.textOnDark, fontWeight: '600', fontSize: 15,
    fontFamily: Typography.semiBold,
  },
  section: { margin: 16 },
  sectionTitle: {
    fontSize: 20, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12,
    fontFamily: Typography.semiBold, letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  contactValue: {
    fontSize: 16, fontWeight: '500',
    fontFamily: Typography.medium,
  },
  hoursRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  hoursRowToday: { backgroundColor: Colors.accentLight + '30', borderRadius: 8, paddingHorizontal: 8 },
  hoursDay: {
    fontSize: 15, color: Colors.textSecondary,
    fontFamily: Typography.regular,
  },
  hoursDayToday: { fontWeight: '600', color: Colors.textPrimary, fontFamily: Typography.semiBold },
  hoursTime: {
    fontSize: 15, color: Colors.textMuted,
    fontFamily: Typography.regular,
  },
  hoursTimeToday: { fontWeight: '600', color: Colors.primary, fontFamily: Typography.semiBold },
});
