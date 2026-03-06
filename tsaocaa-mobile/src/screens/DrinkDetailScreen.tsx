import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMenuItem } from '../api/hooks/useMenu';
import { Colors, Typography, Shadows } from '../constants/colors';

export default function DrinkDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const { data: item, isLoading } = useMenuItem(itemId);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Drink not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back button + image */}
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Feather name="coffee" size={64} color={Colors.textMuted} />
          </View>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        {item.isSeasonal && (
          <View style={styles.seasonalBadge}>
            <Text style={styles.seasonalBadgeText}>Seasonal</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Name + Price */}
        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>${item.basePrice?.toFixed(2)}</Text>
        </View>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {/* Calories */}
        {item.calories && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 }}>
            <Feather name="zap" size={14} color={Colors.textMuted} />
            <Text style={styles.calories}>{item.calories} cal</Text>
          </View>
        )}

        {/* Customizations (view-only) */}
        {item.customizationGroups && item.customizationGroups.length > 0 && (
          <View style={styles.customizations}>
            <Text style={styles.customizationsTitle}>Customization Options</Text>
            <Text style={styles.customizationsNote}>
              Available when ordering in-store
            </Text>
            {item.customizationGroups.map((group: any) => (
              <View key={group.id} style={styles.customGroup}>
                <Text style={styles.customGroupName}>
                  {group.name}
                  {group.isRequired && <Text style={styles.required}> *required</Text>}
                </Text>
                {group.options.map((opt: any) => (
                  <View key={opt.id} style={styles.customOption}>
                    <Text style={styles.customOptionName}>{opt.name}</Text>
                    {opt.priceModifier > 0 && (
                      <Text style={styles.customOptionPrice}>+${opt.priceModifier.toFixed(2)}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaBox}>
          <Feather name="map-pin" size={20} color={Colors.textOnDark} style={{ marginRight: 10, marginTop: 2 }} />
          <Text style={styles.ctaText}>
            Visit us at 4740 Reed Rd, Suite 107, Columbus, OH to order your drink!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.textMuted, fontSize: 16, fontFamily: Typography.regular },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 300 },
  imagePlaceholder: { backgroundColor: Colors.surfaceWarm, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: 50, left: 16,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  seasonalBadge: {
    position: 'absolute', top: 50, right: 16,
    backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  seasonalBadgeText: {
    color: Colors.textOnDark, fontWeight: '600', fontSize: 13,
    fontFamily: Typography.semiBold,
  },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: {
    fontSize: 24, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 12,
    fontFamily: Typography.semiBold,
  },
  price: {
    fontSize: 24, fontWeight: '600', color: Colors.primary,
    fontFamily: Typography.semiBold,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: Colors.surfaceWarm, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', fontFamily: Typography.medium },
  description: {
    fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 12,
    fontFamily: Typography.regular,
  },
  calories: { fontSize: 14, color: Colors.textMuted, fontFamily: Typography.regular },
  customizations: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 20,
    ...Shadows.card,
  },
  customizationsTitle: {
    fontSize: 17, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4,
    fontFamily: Typography.semiBold,
  },
  customizationsNote: { fontSize: 13, color: Colors.textMuted, marginBottom: 14, fontFamily: Typography.regular },
  customGroup: { marginBottom: 14 },
  customGroupName: {
    fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8,
    fontFamily: Typography.semiBold,
  },
  required: { color: Colors.error, fontWeight: '500' },
  customOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.divider },
  customOptionName: { fontSize: 14, color: Colors.textSecondary, fontFamily: Typography.regular },
  customOptionPrice: { fontSize: 14, color: Colors.primary, fontWeight: '600', fontFamily: Typography.semiBold },
  ctaBox: {
    flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'flex-start', marginBottom: 32,
  },
  ctaText: {
    flex: 1, fontSize: 14, color: Colors.textOnDark, lineHeight: 22, opacity: 0.9,
    fontFamily: Typography.regular,
  },
});
