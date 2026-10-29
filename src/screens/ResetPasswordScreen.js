import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { resetPassword } from '../api/auth';
import AppTextInput from '../components/AppTextInput';
import ErrorBanner from '../components/ErrorBanner';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength } from './SignupScreen';

const CODE_ERRORS = new Set([
  'Invalid code',
  'Code expired. Please request a new code.',
]);

export default function ResetPasswordScreen({ navigation, route }) {
  const { getErrorMessage } = useAuth();
  const email = route?.params?.email || '';
  const code = route?.params?.code || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  function validate() {
    const next = {};
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (password.length < 8 || password.length > 72 || !hasLetter || !hasNumber) {
      next.password = 'Use 8–72 characters with at least one letter and one number';
    }
    if (password !== confirm) {
      next.confirm = 'Passwords do not match';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (loading) return;
    setBanner('');
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(email, code, password, confirm);
      navigation.navigate('Login', { notice: 'Password changed. Please log in.' });
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

        <Text style={styles.title}>Set new password</Text>
        <Text style={styles.subtitle}>
          Use 8–72 characters with at least one letter and one number.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={banner} />
          {CODE_ERRORS.has(banner) ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('ForgotPassword', { email })}
              style={styles.requestLink}
            >
              <Text style={styles.link}>Request a new code</Text>
            </Pressable>
          ) : null}

          <AppTextInput
            label="New password"
            icon="lock-closed-outline"
            iconColor="#94A3B8"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (fieldErrors.password) {
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }
            }}
            error={fieldErrors.password}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder="Your password"
            appearance="signup"
            labelStyle={styles.fieldLabel}
            fieldStyle={styles.field}
            inputStyle={styles.fieldText}
            focusedStyle={styles.fieldGlow}
          />

          {password.length > 0 ? (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTrack}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(strength.level / 3) * 100}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
                {strength.level < 3 ? ' · Add a symbol to make it stronger' : ''}
              </Text>
            </View>
          ) : null}

          <AppTextInput
            label="Confirm password"
            icon="lock-closed-outline"
            iconColor="#94A3B8"
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              if (fieldErrors.confirm) {
                setFieldErrors((current) => ({ ...current, confirm: undefined }));
              }
            }}
            error={fieldErrors.confirm}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder="Repeat password"
            appearance="signup"
            labelStyle={styles.fieldLabel}
            fieldStyle={styles.field}
            inputStyle={styles.fieldText}
            focusedStyle={styles.fieldGlow}
          />

          <PrimaryButton
            title="Reset password"
            onPress={onSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonFill}
            labelStyle={styles.buttonText}
          />
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
    lineHeight: 18,
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
  requestLink: {
    alignSelf: 'flex-start',
    marginTop: -8,
    marginBottom: 12,
  },
  link: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
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
  strengthWrap: {
    marginTop: -8,
    marginBottom: 16,
  },
  strengthTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#2B3B68',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  strengthLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
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
});
