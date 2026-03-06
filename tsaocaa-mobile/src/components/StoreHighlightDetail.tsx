import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/colors';

interface StoreHighlightDetailProps {
  announcement: {
    title: string;
    body?: string;
    imageUrl?: string;
  };
}

export default function StoreHighlightDetail({ announcement }: StoreHighlightDetailProps) {
  return (
    <View style={styles.container}>
      {announcement.imageUrl ? (
        <Image
          source={{ uri: announcement.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Feather name="bell" size={64} color={Colors.textMuted} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{announcement.title}</Text>
        {announcement.body && (
          <Text style={styles.body}>{announcement.body}</Text>
        )}
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
    height: 220,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 14,
    fontFamily: Typography.semiBold,
  },
  body: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontFamily: Typography.regular,
  },
});
