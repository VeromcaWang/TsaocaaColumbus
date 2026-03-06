import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../constants/colors';

interface DrinkItem {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice?: number;
  tags?: string[];
}

interface FeaturedDrinksSectionProps {
  items: DrinkItem[];
  isLoading: boolean;
  onItemPress: (item: DrinkItem) => void;
}

export default function FeaturedDrinksSection({ items, isLoading, onItemPress }: FeaturedDrinksSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Featured Drinks</Text>
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => onItemPress(item)}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Feather name="coffee" size={36} color={Colors.textMuted} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {item.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {item.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                {item.basePrice != null && (
                  <Text style={styles.price}>${item.basePrice.toFixed(2)}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontFamily: Typography.semiBold,
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...Shadows.card,
  },
  image: {
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: Typography.semiBold,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    fontFamily: Typography.medium,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: Typography.regular,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Typography.semiBold,
  },
});
