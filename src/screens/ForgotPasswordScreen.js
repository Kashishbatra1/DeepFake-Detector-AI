import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { forgotPassword } from '../api/auth';
import AppTextInput from '../components/AppTextInput';
import ErrorBanner from '../components/ErrorBanner';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation, route }) {
  const { getErrorMessage } = useAuth();
  const [email, setEmail] = useState(route?.params?.email || '');
  const [fieldError, setFieldError] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (loading) return;
    setBanner('');
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setFieldError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(trimmed.toLowerCase());
      navigation.navigate('VerifyCode', { email: trimmed.toLowerCase() });
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.back}
          disabled={loading}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>Enter your email and we will send you a 6-digit code.</Text>

        <View style={styles.card}>
          <ErrorBanner message={banner} />

          <AppTextInput
            label="Email"
            icon="mail-outline"
            iconColor="#94A3B8"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (fieldError) setFieldError('');
            }}
            error={fieldError}
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

          <PrimaryButton
            title="Send code"
            onPress={onSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonFill}
            labelStyle={styles.buttonText}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkBtn}
            disabled={loading}
          >
            <Text style={styles.link}>Back to Sign in</Text>
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
    paddingTop: 8,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'left',
  },
  subtitle: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'left',
  },
  card: {
    marginTop: 22,
    width: '100%',
    backgroundColor: '#182447',
    borderWidth: 1,
    borderColor: '#2B3B68',
    borderRadius: 20,
    padding: 22,
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
  button: {
    marginTop: 6,
    borderRadius: 12,
  },
  buttonFill: {
    height: 50,
    minHeight: 50,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  link: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
  },
});
