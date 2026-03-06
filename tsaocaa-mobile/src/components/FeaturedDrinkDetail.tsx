import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/colors';

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
          <Feather name="coffee" size={64} color={Colors.textMuted} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 }}>
            <Feather name="zap" size={14} color={Colors.textMuted} />
            <Text style={styles.calories}>{item.calories} cal</Text>
          </View>
        )}

        <View style={styles.ctaBox}>
          <Feather name="map-pin" size={20} color={Colors.textOnDark} style={{ marginRight: 10, marginTop: 2 }} />
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
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
    fontFamily: Typography.semiBold,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Typography.semiBold,
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
    fontWeight: '500',
    fontFamily: Typography.medium,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: Typography.regular,
  },
  calories: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: Typography.regular,
  },
  ctaBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  ctaText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textOnDark,
    lineHeight: 22,
    opacity: 0.85,
    fontFamily: Typography.regular,
  },
});
