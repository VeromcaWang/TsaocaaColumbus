import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated, user, clearAuth, setUser } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/auth/profile');
      return data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile && isAuthenticated) {
      // Sync profile data into auth store
    }
  }, [profile]);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => clearAuth() },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestEmoji}>👤</Text>
        <Text style={styles.guestTitle}>Sign In</Text>
        <Text style={styles.guestSubtitle}>
          Create an account to play Lucky Spin and save coupons!
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signupBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.avatar}>👤</Text>
        {isLoading ? (
          <ActivityIndicator color={Colors.accent} />
        ) : (
          <>
            <Text style={styles.displayName}>{profile?.displayName || 'TsaoCaa Member'}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
          </>
        )}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('GameMain')}>
          <Text style={styles.menuItemEmoji}>🎮</Text>
          <Text style={styles.menuItemLabel}>My Coupons</Text>
          <Text style={styles.menuItemChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuItemEmoji}>🚪</Text>
          <Text style={[styles.menuItemLabel, { color: Colors.error }]}>Log Out</Text>
          <Text style={styles.menuItemChevron}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  guestContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 },
  guestEmoji: { fontSize: 64, marginBottom: 16 },
  guestTitle: { fontSize: 28, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
  guestSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 12, width: '100%', alignItems: 'center' },
  loginBtnText: { color: Colors.textOnDark, fontWeight: '800', fontSize: 17 },
  signupBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  signupBtnText: { color: Colors.textOnDark, fontWeight: '700', fontSize: 17 },
  header: { backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textOnDark },
  profileCard: { margin: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  avatar: { fontSize: 64, marginBottom: 12 },
  displayName: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  email: { fontSize: 15, color: Colors.textMuted, marginTop: 4 },
  menuSection: { margin: 16, backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuItemEmoji: { fontSize: 24, marginRight: 14 },
  menuItemLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  menuItemChevron: { fontSize: 22, color: Colors.textMuted },
});
