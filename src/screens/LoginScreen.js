import React, { useId, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import AppTextInput from '../components/AppTextInput';
import ErrorBanner from '../components/ErrorBanner';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginLogo() {
  const gradientId = `loginShield${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View style={styles.logoBox}>
      <Svg width={56} height={56} viewBox="0 0 56 56" accessibilityLabel="DeepFake Detector AI logo">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#5B4BE8" />
            <Stop offset="1" stopColor="#7C3AED" />
          </LinearGradient>
        </Defs>
        <Path
          d="M28 5
             C36.5 5 43.2 8.4 46.4 11.6
             C48.6 13.6 50 16 50 19.2
             V32.2
             C50 40.4 40.6 47.8 28 52
             C15.4 47.8 6 40.4 6 32.2
             V19.2
             C6 16 7.4 13.6 9.6 11.6
             C12.8 8.4 19.5 5 28 5 Z"
          fill={`url(#${gradientId})`}
          stroke="#FFFFFF"
          strokeWidth="1.8"
        />
        <Path
          d="M13 29.5 H19.2 L23 24.2 L28 36.5 L33.2 22.5 L38 29.5 H43"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.logoBadge}>
        <Svg width={8} height={8} viewBox="0 0 8 8">
          <Path
            d="M1.4 4.1 L3.1 5.8 L6.6 2.2"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
}

export default function LoginScreen({ navigation, route }) {
  const { height: screenH } = useWindowDimensions();
  const { showToast } = useToast();
  const { login, getErrorMessage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      next.email = 'Enter a valid email address';
    }
    if (!password || password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (loading) return;
    setBanner('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      showToast('All required fields must be filled.', 'error');
    }
    if (!validate()) return;
    if (!EMAIL_RE.test(trimmedEmail)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Enter a valid email address' }));
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail.toLowerCase(), password);
      showToast('User logged in successfully', 'success');
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']} contentStyle={styles.content}>
      <View style={styles.column}>
        <View style={[styles.hero, { marginTop: screenH * 0.09 }]}>
          <LoginLogo />
          <Text style={styles.brand}>DeepFake Detector AI</Text>
          <Text style={styles.tagline}>Check if a video is real</Text>
        </View>

        {route?.params?.notice ? (
          <View style={styles.successBanner} accessibilityRole="alert">
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <Text style={styles.successText}>{route.params.notice}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <ErrorBanner message={banner} />

          <AppTextInput
            label="Email"
            icon="mail-outline"
            iconColor="#94A3B8"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (fieldErrors.email) {
                setFieldErrors((e) => ({ ...e, email: undefined }));
              }
            }}
            error={fieldErrors.email}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            placeholder="kashish@example.com"
            appearance="signup"
            labelStyle={styles.fieldLabel}
            fieldStyle={styles.field}
            inputStyle={styles.fieldText}
            focusedStyle={styles.fieldGlow}
          />

          <AppTextInput
            label="Password"
            icon="lock-closed-outline"
            iconColor="#94A3B8"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password) {
                setFieldErrors((e) => ({ ...e, password: undefined }));
              }
            }}
            error={fieldErrors.password}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            placeholder="Your password"
            appearance="signup"
            containerStyle={styles.passwordField}
            labelStyle={styles.fieldLabel}
            fieldStyle={styles.field}
            inputStyle={styles.fieldText}
            focusedStyle={styles.fieldGlow}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
            disabled={loading}
          >
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>

          <PrimaryButton
            title="Sign in"
            onPress={onSubmit}
            loading={loading}
            disabled={loading}
            style={styles.signIn}
            contentStyle={styles.signInFill}
            labelStyle={styles.signInText}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Signup')}
            style={styles.linkRow}
            disabled={loading}
          >
            <Text style={styles.linkMuted}>Don't have an account?</Text>
            <Text style={styles.link}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 24,
  },
  column: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
  },
  logoBox: {
    width: 56,
    height: 56,
  },
  logoBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#0F1A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 14,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  tagline: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
    padding: 16,
  },
  successText: {
    flex: 1,
    color: '#22C55E',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  card: {
    marginTop: 28,
    width: '100%',
    backgroundColor: '#182447',
    borderWidth: 1,
    borderColor: '#2B3B68',
    borderRadius: 20,
    padding: 22,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 22,
    color: '#94A3B8',
    fontSize: 13,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    height: 50,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#1E2B52',
    borderColor: '#2B3B68',
  },
  fieldText: {
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 0,
  },
  fieldGlow: Platform.OS === 'web'
    ? { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)' }
    : {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 4,
      },
  passwordField: {
    marginBottom: 10,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgot: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
  },
  signIn: {
    marginTop: 18,
    borderRadius: 12,
  },
  signInFill: {
    height: 50,
    minHeight: 50,
    borderRadius: 12,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  linkRow: {
    alignItems: 'center',
    marginTop: 36,
  },
  linkMuted: {
    color: '#94A3B8',
    fontSize: 13,
  },
  link: {
    marginTop: 4,
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
  },
});
