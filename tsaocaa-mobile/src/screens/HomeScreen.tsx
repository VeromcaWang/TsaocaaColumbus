import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFeaturedItems } from '../api/hooks/useMenu';
import { useAnnouncements } from '../api/hooks/useStore';
import { Colors, Typography, Shadows } from '../constants/colors';
import BottomSheet from '../components/BottomSheet';
import StoreHighlightSection from '../components/StoreHighlightSection';
import FeaturedDrinksSection from '../components/FeaturedDrinksSection';
import OurStorySection from '../components/OurStorySection';
import StoreHighlightDetail from '../components/StoreHighlightDetail';
import FeaturedDrinkDetail from '../components/FeaturedDrinkDetail';

const { width } = Dimensions.get('window');

type SheetContent =
  | { type: 'highlight'; data: any }
  | { type: 'drink'; data: any }
  | null;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: featured, isLoading: featLoading } = useFeaturedItems();
  const { data: announcements } = useAnnouncements();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetContent, setSheetContent] = useState<SheetContent>(null);

  const openHighlightDetail = (announcement: any) => {
    setSheetContent({ type: 'highlight', data: announcement });
    setSheetVisible(true);
  };

  const openDrinkDetail = (item: any) => {
    setSheetContent({ type: 'drink', data: item });
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSheetContent(null);
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>朝茶</Text>
          <Text style={styles.logoEn}>TsaoCaa Columbus</Text>
          <Text style={styles.tagline}>Tea Pilgrimage · 茶道巡礼</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Menu')}
          >
            <Feather name="book-open" size={24} color={Colors.primary} />
            <Text style={styles.quickBtnLabel}>View Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Store')}
          >
            <Feather name="clock" size={24} color={Colors.primary} />
            <Text style={styles.quickBtnLabel}>Store Hours</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => Linking.openURL('tel:6146741996')}
          >
            <Feather name="phone" size={24} color={Colors.primary} />
            <Text style={styles.quickBtnLabel}>Call Us</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, styles.gameBtn]}
            onPress={() => navigation.navigate('Game')}
          >
            <Feather name="gift" size={24} color={Colors.textOnDark} />
            <Text style={[styles.quickBtnLabel, { color: Colors.textOnDark }]}>Lucky Spin</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Store Highlight */}
        <StoreHighlightSection
          announcement={announcements?.[0] ?? null}
          onPress={openHighlightDetail}
        />

        {/* Section 2: Featured Drinks */}
        <FeaturedDrinksSection
          items={featured ?? []}
          isLoading={featLoading}
          onItemPress={openDrinkDetail}
        />

        {/* Section 3: Our Story */}
        <OurStorySection />

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet visible={sheetVisible} onClose={closeSheet}>
        {sheetContent?.type === 'highlight' && (
          <StoreHighlightDetail announcement={sheetContent.data} />
        )}
        {sheetContent?.type === 'drink' && (
          <FeaturedDrinkDetail item={sheetContent.data} />
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: { fontSize: 52, color: Colors.primary, letterSpacing: 10 },
  logoEn: {
    fontSize: 20, color: Colors.textPrimary, fontWeight: '600',
    fontFamily: Typography.semiBold, marginTop: 4,
  },
  tagline: {
    fontSize: 13, color: Colors.textSecondary, marginTop: 6,
    letterSpacing: 2, fontFamily: Typography.regular,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
    marginTop: 16,
  },
  quickBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 40) / 2,
    ...Shadows.card,
  },
  gameBtn: {
    backgroundColor: Colors.primary,
  },
  quickBtnLabel: {
    fontSize: 13, fontWeight: '500', color: Colors.textPrimary,
    fontFamily: Typography.medium, marginTop: 8,
  },
});
