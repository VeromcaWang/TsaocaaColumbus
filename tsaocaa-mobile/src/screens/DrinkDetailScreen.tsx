import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMenuItem } from '../api/hooks/useMenu';
import { Colors } from '../constants/colors';

export default function DrinkDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const { data: item, isLoading } = useMenuItem(itemId);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent} />
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
            <Text style={styles.imagePlaceholderEmoji}>🧋</Text>
          </View>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        {item.isSeasonal && (
          <View style={styles.seasonalBadge}>
            <Text style={styles.seasonalBadgeText}>🌸 Seasonal</Text>
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
          <Text style={styles.calories}>🔥 {item.calories} cal</Text>
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
          <Text style={styles.ctaEmoji}>📍</Text>
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
  errorText: { color: Colors.textMuted, fontSize: 16 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 300 },
  imagePlaceholder: { backgroundColor: Colors.surfaceWarm, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderEmoji: { fontSize: 80 },
  backBtn: {
    position: 'absolute', top: 50, left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  seasonalBadge: {
    position: 'absolute', top: 50, right: 16,
    backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  seasonalBadgeText: { color: Colors.textOnDark, fontWeight: '700', fontSize: 13 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 26, fontWeight: '800', color: Colors.primary, flex: 1, marginRight: 12 },
  price: { fontSize: 26, fontWeight: '800', color: Colors.accent },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: Colors.surfaceWarm, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 12 },
  calories: { fontSize: 14, color: Colors.textMuted, marginBottom: 20 },
  customizations: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  customizationsTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  customizationsNote: { fontSize: 13, color: Colors.textMuted, marginBottom: 14 },
  customGroup: { marginBottom: 14 },
  customGroupName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  required: { color: Colors.error, fontWeight: '500' },
  customOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.divider },
  customOptionName: { fontSize: 14, color: Colors.textSecondary },
  customOptionPrice: { fontSize: 14, color: Colors.accent, fontWeight: '600' },
  ctaBox: {
    flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'flex-start', marginBottom: 32,
  },
  ctaEmoji: { fontSize: 24, marginRight: 10 },
  ctaText: { flex: 1, fontSize: 14, color: Colors.textOnDark, lineHeight: 22, opacity: 0.9 },
});
