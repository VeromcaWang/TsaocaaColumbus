import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, FlatList, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useMenuCategories, useMenuItemsByCategory, useMenuSearch } from '../api/hooks/useMenu';
import { Colors } from '../constants/colors';

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: catsLoading } = useMenuCategories();
  const { data: items, isLoading: itemsLoading } = useMenuItemsByCategory(
    selectedCategory ?? (categories?.[0]?.id ?? 0)
  );
  const { data: searchResults, isLoading: searchLoading } = useMenuSearch(searchQuery);

  const activeCategory = selectedCategory ?? categories?.[0]?.id;
  const displayItems = searchQuery.length >= 2 ? searchResults : items;
  const isLoading = searchQuery.length >= 2 ? searchLoading : itemsLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search drinks..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category Tabs */}
      {!searchQuery && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {catsLoading ? (
            <ActivityIndicator color={Colors.accent} />
          ) : (
            categories?.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  activeCategory === cat.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[
                  styles.categoryTabText,
                  activeCategory === cat.id && styles.categoryTabTextActive,
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={displayItems}
          numColumns={2}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => navigation.navigate('DrinkDetail', { itemId: item.id })}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                  <Text style={styles.imagePlaceholderEmoji}>🧋</Text>
                </View>
              )}
              {item.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                </View>
              )}
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.basePrice?.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {searchQuery ? 'No drinks found' : 'No items in this category'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textOnDark, marginBottom: 12 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: Colors.textOnDark, fontSize: 15,
  },
  categoryScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  categoryTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  categoryTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryTabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  categoryTabTextActive: { color: Colors.textOnDark },
  grid: { padding: 10 },
  row: { gap: 10 },
  itemCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    overflow: 'hidden', marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  itemImage: { width: '100%', aspectRatio: 1 },
  imagePlaceholder: { backgroundColor: Colors.surfaceWarm, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderEmoji: { fontSize: 52 },
  featuredBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  featuredBadgeText: { fontSize: 11, color: Colors.textOnDark, fontWeight: '700' },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, padding: 10, paddingBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: Colors.accent, paddingHorizontal: 10, paddingBottom: 10 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 16 },
});
