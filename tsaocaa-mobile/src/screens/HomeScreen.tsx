import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useFeaturedItems } from '../api/hooks/useMenu';
import { useAnnouncements } from '../api/hooks/useStore';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: featured, isLoading: featLoading } = useFeaturedItems();
  const { data: announcements } = useAnnouncements();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>朝茶</Text>
        <Text style={styles.logoEn}>TsaoCaa Columbus</Text>
        <Text style={styles.tagline}>Tea Pilgrimage · 茶道巡礼</Text>
      </View>

      {/* Announcement Banner */}
      {announcements && announcements.length > 0 && (
        <View style={styles.announcementCard}>
          <Text style={styles.announcementEmoji}>📢</Text>
          <View style={styles.announcementContent}>
            <Text style={styles.announcementTitle}>{announcements[0].title}</Text>
            {announcements[0].body && (
              <Text style={styles.announcementBody} numberOfLines={2}>
                {announcements[0].body}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.quickBtnEmoji}>📋</Text>
          <Text style={styles.quickBtnLabel}>View Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate('Store')}
        >
          <Text style={styles.quickBtnEmoji}>📍</Text>
          <Text style={styles.quickBtnLabel}>Store Hours</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => Linking.openURL('tel:6146741996')}
        >
          <Text style={styles.quickBtnEmoji}>📞</Text>
          <Text style={styles.quickBtnLabel}>Call Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, styles.gameBtn]}
          onPress={() => navigation.navigate('Game')}
        >
          <Text style={styles.quickBtnEmoji}>🎮</Text>
          <Text style={styles.quickBtnLabel}>Lucky Spin</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Drinks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Drinks</Text>
        {featLoading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featured?.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.drinkCard}
                onPress={() => navigation.navigate('Menu', {
                  screen: 'DrinkDetail',
                  params: { itemId: item.id },
                })}
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.drinkImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.drinkImage, styles.drinkImagePlaceholder]}>
                    <Text style={styles.drinkImageEmoji}>🧋</Text>
                  </View>
                )}
                <Text style={styles.drinkName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.drinkPrice}>${item.basePrice?.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Brand Story */}
      <View style={styles.brandSection}>
        <Text style={styles.brandTitle}>朝茶 · The Pilgrimage</Text>
        <Text style={styles.brandBody}>
          TsaoCaa (朝茶) means "morning tea" — a daily ritual of mindfulness, quality,
          and connection. We bring the ancient Chinese tea pilgrimage tradition to Columbus,
          Ohio. Every cup is a journey.
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: { fontSize: 52, color: Colors.accentLight, letterSpacing: 8 },
  logoEn: { fontSize: 20, color: Colors.textOnDark, fontWeight: '700', marginTop: 4 },
  tagline: { fontSize: 13, color: Colors.accent, marginTop: 6, letterSpacing: 2 },

  announcementCard: {
    flexDirection: 'row',
    backgroundColor: Colors.accentLight,
    margin: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  announcementEmoji: { fontSize: 24, marginRight: 10, marginTop: 2 },
  announcementContent: { flex: 1 },
  announcementTitle: { fontWeight: '700', fontSize: 14, color: Colors.primary },
  announcementBody: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  quickBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 40) / 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.accent,
  },
  quickBtnEmoji: { fontSize: 28 },
  quickBtnLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: 6 },

  section: { paddingTop: 8, paddingBottom: 8 },
  sectionTitle: {
    fontSize: 20, fontWeight: '800', color: Colors.primary,
    paddingHorizontal: 16, marginBottom: 12,
  },
  horizontalScroll: { paddingLeft: 16 },
  drinkCard: {
    width: 150, marginRight: 12, backgroundColor: Colors.surface,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  drinkImage: { width: 150, height: 130 },
  drinkImagePlaceholder: { backgroundColor: Colors.surfaceWarm, justifyContent: 'center', alignItems: 'center' },
  drinkImageEmoji: { fontSize: 48 },
  drinkName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, padding: 10, paddingBottom: 4 },
  drinkPrice: { fontSize: 14, fontWeight: '700', color: Colors.accent, paddingHorizontal: 10, paddingBottom: 10 },

  brandSection: {
    margin: 16, padding: 20, backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  brandTitle: { fontSize: 18, fontWeight: '800', color: Colors.accentLight, marginBottom: 10 },
  brandBody: { fontSize: 14, color: Colors.textOnDark, lineHeight: 22, opacity: 0.9 },
});
