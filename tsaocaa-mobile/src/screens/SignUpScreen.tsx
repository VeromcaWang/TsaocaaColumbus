import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { apiClient } from '../api/client';
import { Colors } from '../constants/colors';

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_POOL_ID || 'us-east-2_XXXXXXXXX';
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX';

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

type Step = 'REGISTER' | 'VERIFY';

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<Step>('REGISTER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cognitoUser, setCognitoUser] = useState<any>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);

    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email.trim().toLowerCase() }),
    ];

    userPool.signUp(
      email.trim().toLowerCase(),
      password,
      attributes,
      [],
      (err, result) => {
        setIsLoading(false);
        if (err) {
          Alert.alert('Sign up failed', err.message || 'Please try again.');
          return;
        }
        setCognitoUser(result?.user);
        setStep('VERIFY');
      }
    );
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Enter code', 'Please enter the verification code from your email.');
      return;
    }
    if (!cognitoUser) return;
    setIsLoading(true);

    cognitoUser.confirmRegistration(verificationCode, true, async (err: any) => {
      if (err) {
        setIsLoading(false);
        Alert.alert('Verification failed', err.message || 'Invalid code. Please try again.');
        return;
      }

      // Registration complete — navigate to login
      setIsLoading(false);
      Alert.alert(
        '🎉 Account Created!',
        'Your account is ready. Please log in.',
        [{ text: 'Log In', onPress: () => navigation.navigate('Login') }]
      );
    });
  };

  if (step === 'VERIFY') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>朝茶</Text>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email}. Enter it below to confirm your account.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="123456"
              placeholderTextColor={Colors.textMuted}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.signupBtn, isLoading && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color={Colors.textOnDark} /> : (
                <Text style={styles.signupBtnText}>Confirm Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>朝茶</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join TsaoCaa to play Lucky Spin and save coupons</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name (optional)"
            placeholderTextColor={Colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={styles.label}>Password * (min 8 characters)</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.signupBtn, isLoading && styles.btnDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={Colors.textOnDark} /> : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={{ color: Colors.accent }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  backBtnText: { color: Colors.accent, fontSize: 24, fontWeight: '700' },
  logo: { fontSize: 56, color: Colors.accentLight, letterSpacing: 8, textAlign: 'center', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textOnDark, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 36, lineHeight: 22 },
  form: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  codeInput: { textAlign: 'center', fontSize: 28, letterSpacing: 8, fontWeight: '700' },
  signupBtn: {
    backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  signupBtnText: { color: Colors.textOnDark, fontWeight: '800', fontSize: 17 },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { fontSize: 15, color: Colors.textSecondary },
});
