import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../constants/colors';

interface Announcement {
  id: number;
  title: string;
  body?: string;
  imageUrl?: string;
  maxLines?: number;
}

interface StoreHighlightSectionProps {
  announcement: Announcement | null;
  onPress: (announcement: Announcement) => void;
}

export default function StoreHighlightSection({ announcement, onPress }: StoreHighlightSectionProps) {
  if (!announcement) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Store Highlight</Text>
        <View style={styles.placeholder}>
          <Feather name="bell" size={36} color={Colors.textMuted} />
          <Text style={styles.placeholderText}>New releases coming soon!</Text>
        </View>
      </View>
    );
  }

  const maxLines = announcement.maxLines ?? 3;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Store Highlight</Text>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => onPress(announcement)}
      >
        {announcement.imageUrl ? (
          <Image
            source={{ uri: announcement.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Feather name="bell" size={48} color={Colors.textMuted} />
          </View>
        )}
        <View style={styles.textContent}>
          <Text style={styles.title}>{announcement.title}</Text>
          {announcement.body && (
            <Text style={styles.body} numberOfLines={maxLines}>
              {announcement.body}
            </Text>
          )}
        </View>
      </TouchableOpacity>
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
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...Shadows.card,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    fontFamily: Typography.semiBold,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: Typography.regular,
  },
  placeholder: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 8,
    fontFamily: Typography.medium,
  },
});
