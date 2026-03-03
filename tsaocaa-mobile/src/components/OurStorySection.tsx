import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function OurStorySection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Our Story</Text>
      <View style={styles.card}>
        <Text style={styles.title}>朝茶 · The Pilgrimage</Text>
        <Text style={styles.body}>
          TsaoCaa (朝茶) means "morning tea" — a daily ritual of mindfulness, quality,
          and connection. We bring the ancient Chinese tea pilgrimage tradition to Columbus,
          Ohio. Every cup is a journey.
        </Text>
      </View>
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
    padding: 20,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accentLight,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: Colors.textOnDark,
    lineHeight: 22,
    opacity: 0.9,
  },
});
