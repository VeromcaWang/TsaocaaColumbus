import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/colors';

interface FeaturedDrinkDetailProps {
  item: {
    name: string;
    description?: string;
    imageUrl?: string;
    basePrice?: number;
    tags?: string[];
    calories?: number;
    categoryName?: string;
  };
}

export default function FeaturedDrinkDetail({ item }: FeaturedDrinkDetailProps) {
  return (
    <View style={styles.container}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderEmoji}>🧋</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.basePrice != null && (
            <Text style={styles.price}>${item.basePrice.toFixed(2)}</Text>
          )}
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {item.calories != null && (
          <Text style={styles.calories}>🔥 {item.calories} cal</Text>
        )}

        <View style={styles.ctaBox}>
          <Text style={styles.ctaEmoji}>📍</Text>
          <Text style={styles.ctaText}>
            Visit us at 4740 Reed Rd, Suite 107, Columbus, OH to order your drink!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.accent,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  calories: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  ctaBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'flex-start',
  },
  ctaEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  ctaText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textOnDark,
    lineHeight: 22,
    opacity: 0.9,
  },
});
