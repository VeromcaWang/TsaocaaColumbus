import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/colors';

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
          <Text style={styles.placeholderEmoji}>📢</Text>
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
            <Text style={styles.imageEmoji}>📢</Text>
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
    fontWeight: '800',
    color: Colors.primary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
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
  imageEmoji: {
    fontSize: 48,
  },
  textContent: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  placeholder: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
