import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { Colors, Typography, Shadows } from '../constants/colors';

// Replace with your actual Cognito pool and client IDs from SAM deploy outputs
const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_POOL_ID || 'us-east-2_XXXXXXXXX';
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX';

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);

    const authDetails = new AuthenticationDetails({
      Username: email.trim().toLowerCase(),
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email.trim().toLowerCase(),
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        try {
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          // Fetch our user profile (creates record if first login)
          const { data: profile } = await apiClient.get('/api/v1/auth/profile', {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          await setUser({
            id: profile.id,
            email: profile.email,
            displayName: profile.displayName,
          }, idToken, refreshToken);

          navigation.goBack();
        } catch (e) {
          Alert.alert('Error', 'Login succeeded but failed to load profile. Please try again.');
        }
        setIsLoading(false);
      },
      onFailure: (err) => {
        setIsLoading(false);
        const msg = err.code === 'NotAuthorizedException'
          ? 'Incorrect email or password.'
          : err.code === 'UserNotConfirmedException'
          ? 'Please verify your email address first.'
          : err.message || 'Login failed. Please try again.';
        Alert.alert('Login failed', msg);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.logo}>朝茶</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to your TsaoCaa account</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <Text style={styles.loginBtnText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createLink}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.createLinkText}>
              Don't have an account? <Text style={{ color: Colors.primary }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  logo: { fontSize: 56, color: Colors.primary, letterSpacing: 10, textAlign: 'center', marginBottom: 4 },
  title: {
    fontSize: 28, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: 6,
    fontFamily: Typography.semiBold,
  },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 36,
    fontFamily: Typography.regular,
  },
  form: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    ...Shadows.cardElevated,
  },
  label: {
    fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 6, marginTop: 12,
    fontFamily: Typography.medium,
  },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: Colors.textPrimary,
    backgroundColor: Colors.background, fontFamily: Typography.regular,
  },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: {
    color: Colors.textOnDark, fontWeight: '600', fontSize: 17,
    fontFamily: Typography.semiBold,
  },
  createLink: { alignItems: 'center', paddingVertical: 8 },
  createLinkText: { fontSize: 15, color: Colors.textSecondary, fontFamily: Typography.regular },
});
