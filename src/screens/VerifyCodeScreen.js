import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { forgotPassword, verifyResetCode } from '../api/auth';
import ErrorBanner from '../components/ErrorBanner';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

const EMPTY = ['', '', '', '', '', ''];

function countdownLabel(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `Resend code in ${minutes}:${rest}`;
}

export default function VerifyCodeScreen({ navigation, route }) {
  const { getErrorMessage } = useAuth();
  const email = route?.params?.email || '';
  const inputs = useRef([]);
  const digitsRef = useRef(EMPTY);
  const [digits, setDigits] = useState(EMPTY);
  const [focused, setFocused] = useState(0);
  const [banner, setBanner] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    digitsRef.current = digits;
  }, [digits]);

  useEffect(() => {
    const id = setTimeout(() => inputs.current[0]?.focus(), 250);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;

    function onPaste(event) {
      const activeId = document.activeElement?.id || '';
      if (!activeId.startsWith('otp-')) return;
      const text = event.clipboardData?.getData('text') || '';
      const cleaned = text.replace(/\D/g, '');
      if (cleaned.length < 2) return;
      event.preventDefault();
      fillFrom(Number(activeId.slice(4)) || 0, cleaned);
    }

    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  function fillFrom(index, cleaned) {
    setBanner('');
    const next = [...digitsRef.current];
    if (cleaned.length >= 6) {
      cleaned.slice(0, 6).split('').forEach((ch, offset) => {
        next[offset] = ch;
      });
      setDigits(next);
      inputs.current[5]?.focus();
      return;
    }
    cleaned.split('').forEach((ch, offset) => {
      if (index + offset < 6) next[index + offset] = ch;
    });
    setDigits(next);
    inputs.current[Math.min(index + cleaned.length, 5)]?.focus();
  }

  function onChange(index, raw) {
    const cleaned = String(raw || '').replace(/\D/g, '');
    setBanner('');
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }
    const current = digitsRef.current[index];
    const typedOver = Boolean(current) && cleaned.length === 2 && cleaned.startsWith(current);
    if (cleaned.length === 1 || typedOver) {
      const ch = cleaned[cleaned.length - 1];
      setDigits((prev) => {
        const next = [...prev];
        next[index] = ch;
        return next;
      });
      if (index < 5) inputs.current[index + 1]?.focus();
      return;
    }
    fillFrom(index, cleaned);
  }

  function onKeyPress(index, event) {
    if (event.nativeEvent.key !== 'Backspace') return;
    if (digitsRef.current[index]) return;
    if (index === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      next[index - 1] = '';
      return next;
    });
    inputs.current[index - 1]?.focus();
  }

  const code = digits.join('');

  async function onVerify() {
    if (loading || code.length !== 6) return;
    setBanner('');
    setInfo('');
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      navigation.navigate('ResetPassword', { email, code });
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (seconds > 0 || resending || loading) return;
    setBanner('');
    setInfo('');
    setResending(true);
    try {
      await forgotPassword(email);
      setDigits(['', '', '', '', '', '']);
      setSeconds(30);
      setInfo('A new code has been sent. The old code no longer works.');
      inputs.current[0]?.focus();
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setResending(false);
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
          disabled={loading || resending}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to your registered phone number, or to your email if no phone number is saved.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={banner} />
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <View style={styles.boxes}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(node) => {
                  inputs.current[index] = node;
                }}
                nativeID={`otp-${index}`}
                value={digit}
                onChangeText={(text) => onChange(index, text)}
                onKeyPress={(event) => onKeyPress(index, event)}
                onFocus={() => setFocused(index)}
                onBlur={() => setFocused((current) => (current === index ? -1 : current))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                inputMode="numeric"
                maxLength={6}
                selectTextOnFocus
                caretHidden={false}
                style={[
                  styles.box,
                  focused === index && !banner && styles.boxFocused,
                  banner ? styles.boxError : null,
                ]}
              />
            ))}
          </View>

          <PrimaryButton
            title="Verify"
            onPress={onVerify}
            loading={loading}
            disabled={code.length !== 6 || loading}
            style={styles.button}
            contentStyle={styles.buttonFill}
            labelStyle={styles.buttonText}
          />

          <View style={styles.resendBlock}>
            <Text style={styles.resendMuted}>Didn't get the code?</Text>
            {seconds > 0 ? (
              <Text style={styles.resendWait}>{countdownLabel(seconds)}</Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={onResend}
                disabled={resending || loading}
              >
                <Text style={styles.resendLink}>Resend code</Text>
              </Pressable>
            )}
          </View>
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
  info: {
    color: '#22C55E',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  box: {
    width: 48,
    height: 56,
    flexShrink: 1,
    borderRadius: 12,
    backgroundColor: '#1E2B52',
    borderWidth: 1,
    borderColor: '#2B3B68',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  boxFocused: {
    borderColor: '#3B82F6',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)' }
      : {
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.45,
          shadowRadius: 8,
          elevation: 4,
        }),
  },
  boxError: {
    borderColor: '#F87171',
  },
  button: {
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
  resendBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  resendMuted: {
    color: '#94A3B8',
    fontSize: 13,
  },
  resendWait: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  resendLink: {
    marginTop: 4,
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
  },
});
