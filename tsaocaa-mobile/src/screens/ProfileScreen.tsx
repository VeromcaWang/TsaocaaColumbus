import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Colors, Typography, Shadows } from '../constants/colors';

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
        <View style={styles.guestAvatarCircle}>
          <Feather name="user" size={48} color={Colors.textMuted} />
        </View>
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
        <View style={styles.avatarCircle}>
          <Feather name="user" size={36} color={Colors.primary} />
        </View>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <>
            <Text style={styles.displayName}>{profile?.displayName || 'TsaoCaa Member'}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
          </>
        )}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('GameMain')}>
          <Feather name="tag" size={22} color={Colors.primary} style={{ marginRight: 14 }} />
          <Text style={styles.menuItemLabel}>My Coupons</Text>
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Feather name="log-out" size={22} color={Colors.error} style={{ marginRight: 14 }} />
          <Text style={[styles.menuItemLabel, { color: Colors.error }]}>Log Out</Text>
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  guestContainer: {
    flex: 1, backgroundColor: Colors.background, justifyContent: 'center',
    alignItems: 'center', padding: 32,
  },
  guestAvatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceWarm, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 28, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8,
    fontFamily: Typography.semiBold,
  },
  guestSubtitle: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32,
    fontFamily: Typography.regular,
  },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16,
    paddingHorizontal: 40, marginBottom: 12, width: '100%', alignItems: 'center',
  },
  loginBtnText: {
    color: Colors.textOnDark, fontWeight: '600', fontSize: 17,
    fontFamily: Typography.semiBold,
  },
  signupBtn: {
    backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 16,
    paddingHorizontal: 40, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.textPrimary,
  },
  signupBtnText: {
    color: Colors.textPrimary, fontWeight: '500', fontSize: 17,
    fontFamily: Typography.medium,
  },
  header: {
    backgroundColor: Colors.background, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 26, fontWeight: '600', color: Colors.textPrimary,
    fontFamily: Typography.semiBold,
  },
  profileCard: {
    margin: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 24,
    alignItems: 'center', ...Shadows.card,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceWarm, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  displayName: {
    fontSize: 22, fontWeight: '600', color: Colors.textPrimary,
    fontFamily: Typography.semiBold,
  },
  email: {
    fontSize: 15, color: Colors.textMuted, marginTop: 4,
    fontFamily: Typography.regular,
  },
  menuSection: {
    margin: 16, backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden',
    ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 18,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  menuItemLabel: {
    flex: 1, fontSize: 16, fontWeight: '500', color: Colors.textPrimary,
    fontFamily: Typography.medium,
  },
});
