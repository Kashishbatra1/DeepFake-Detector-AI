import React, { useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CountryPicker, { COUNTRIES } from '../components/CountryPicker';
import AppTextInput from '../components/AppTextInput';
import ErrorBanner from '../components/ErrorBanner';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import {
  isValidEmail,
  nationalDigits,
  phoneError,
  toInternational,
} from '../utils/validators';

const NAME_SEPARATORS = " '-’";
const ERROR = '#F87171';
const PAKISTAN = COUNTRIES[0];

const fieldLabel = {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '600',
};
const fieldBox = {
  height: 50,
  minHeight: 50,
  borderWidth: 1,
  borderRadius: 12,
  backgroundColor: '#1E2B52',
  borderColor: '#2B3B68',
};
const fieldText = {
  color: '#FFFFFF',
  fontSize: 15,
  paddingVertical: 0,
};
const fieldGlow = Platform.OS === 'web'
  ? { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)' }
  : {
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 8,
      elevation: 4,
    };

function nameMessage(value, which) {
  const cleaned = value.trim();
  if (!cleaned) {
    return which === 'first' ? 'Enter your first name' : 'Enter your last name';
  }
  if (cleaned.length < 2 || cleaned.length > 50) {
    return 'Must be 2-50 characters';
  }
  if (!cleaned[0].match(/\p{L}/u) || !cleaned[cleaned.length - 1].match(/\p{L}/u)) {
    return 'Use letters, spaces, hyphens, or apostrophes only';
  }
  let previousWasSeparator = false;
  for (const ch of cleaned) {
    if (/\p{L}/u.test(ch)) {
      previousWasSeparator = false;
      continue;
    }
    if (NAME_SEPARATORS.includes(ch) && !previousWasSeparator) {
      previousWasSeparator = true;
      continue;
    }
    return 'Use letters, spaces, hyphens, or apostrophes only';
  }
  return '';
}

export function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: colors.border };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { level: 1, label: 'Weak', color: colors.danger };
  }
  if (score <= 3) {
    return { level: 2, label: 'Medium', color: colors.warning };
  }
  return { level: 3, label: 'Strong', color: colors.success };
}

export default function SignupScreen({ navigation }) {
  const { signup, getErrorMessage } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(PAKISTAN);
  const [phone, setPhone] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const termsRef = useRef(null);
  const dialRef = useRef(country.dial);
  dialRef.current = country.dial;

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  function clearError(key) {
    setFieldErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }

  function refreshNameError(key, text, which) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const message = nameMessage(text, which);
      if (!message) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: message };
    });
  }

  function scrollToTerms() {
    const node = termsRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.getElementById('signup-terms')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (node?.measureLayout && scrollRef.current) {
      node.measureLayout(
        scrollRef.current,
        (_x, y) => {
          scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
        },
        () => {},
      );
    }
  }

  function collectErrors() {
    const next = {};
    const firstError = nameMessage(firstName, 'first');
    const lastError = nameMessage(lastName, 'last');
    if (firstError) next.firstName = firstError;
    if (lastError) next.lastName = lastError;
    if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    const phoneMessage = phoneError(phone, country.dial, country.iso);
    if (phoneMessage) next.phone = phoneMessage;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (password.length < 8 || password.length > 72 || !hasLetter || !hasNumber) {
      next.password = 'Use 8–72 characters with at least one letter and one number';
    }
    if (password !== confirm) next.confirm = 'Passwords do not match';
    if (!acceptTerms) next.terms = 'Please tick this box to continue';
    return next;
  }

  async function onSubmit() {
    if (loading) return;
    setBanner('');
    const requiredEmpty = !firstName.trim()
      || !lastName.trim()
      || !email.trim()
      || !password
      || !confirm;
    const next = collectErrors();
    setFieldErrors(next);
    if (requiredEmpty) {
      showToast('All required fields must be filled.', 'error');
    }
    if (requiredEmpty || Object.keys(next).length > 0) {
      if (!acceptTerms) scrollToTerms();
      return;
    }

    const international = toInternational(phone, country.dial);
    setLoading(true);
    try {
      await signup({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        ...(international ? { phone: international } : {}),
        password,
        accept_terms: true,
      });
    } catch (err) {
      applyServerFieldErrors(err);
    } finally {
      setLoading(false);
    }
  }

  function applyServerFieldErrors(err) {
    const detail = err?.response?.data?.detail;
    if (!Array.isArray(detail)) {
      setBanner(getErrorMessage(err));
      return;
    }
    const keys = {
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phone: 'phone',
      password: 'password',
      accept_terms: 'terms',
    };
    const next = {};
    const leftovers = [];
    for (const item of detail) {
      const loc = Array.isArray(item?.loc) ? item.loc : [];
      const field = [...loc].reverse().find((part) => part !== 'body' && part !== 'query');
      const message = String(item?.msg || 'Validation error').replace(/^Value error,\s*/i, '');
      if (keys[field]) next[keys[field]] = message;
      else leftovers.push(message);
    }
    if (Object.keys(next).length) {
      setFieldErrors((current) => ({ ...current, ...next }));
      if (next.terms) scrollToTerms();
    }
    if (leftovers.length) setBanner(leftovers.join('\n'));
    else if (!Object.keys(next).length) setBanner(getErrorMessage(err));
  }

  return (
    <ScreenContainer scrollRef={scrollRef} contentStyle={styles.content}>
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Login')}
          style={styles.back}
          disabled={loading}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start checking videos in a minute</Text>

        <ErrorBanner message={banner} />

        <View style={styles.nameRow}>
          <AppTextInput
            containerStyle={styles.nameCol}
            label="First name"
            icon="person-outline"
            iconColor="#94A3B8"
            value={firstName}
            appearance="signup"
            onChangeText={(text) => {
              setFirstName(text);
              refreshNameError('firstName', text, 'first');
            }}
            error={fieldErrors.firstName}
            autoCapitalize="words"
            textContentType="givenName"
            autoComplete="given-name"
            placeholder="Your first name"
            labelStyle={fieldLabel}
            fieldStyle={fieldBox}
            inputStyle={fieldText}
            focusedStyle={fieldGlow}
          />
          <AppTextInput
            containerStyle={styles.nameCol}
            label="Last name"
            value={lastName}
            appearance="signup"
            onChangeText={(text) => {
              setLastName(text);
              refreshNameError('lastName', text, 'last');
            }}
            error={fieldErrors.lastName}
            autoCapitalize="words"
            textContentType="familyName"
            autoComplete="family-name"
            placeholder="Your last name"
            labelStyle={fieldLabel}
            fieldStyle={fieldBox}
            inputStyle={fieldText}
            focusedStyle={fieldGlow}
          />
        </View>

        <AppTextInput
          appearance="signup"
          label="Email"
          icon="mail-outline"
          iconColor="#94A3B8"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError('email');
          }}
          error={fieldErrors.email}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="kashish@example.com"
          labelStyle={fieldLabel}
          fieldStyle={fieldBox}
          inputStyle={fieldText}
          focusedStyle={fieldGlow}
        />

        <View style={styles.phoneWrap}>
          <Text style={styles.phoneLabel}>Phone (optional)</Text>
          <View
            style={[
              styles.phoneRow,
              phoneFocused && !fieldErrors.phone && styles.phoneFocused,
              fieldErrors.phone && styles.phoneError,
            ]}
          >
            <CountryPicker
              country={country}
              disabled={loading}
              onSelect={(next) => {
                setCountry(next);
                clearError('phone');
              }}
            />
            <View style={styles.divider} />
            <TextInput
              value={phone}
              onChangeText={(text) => {
                setPhone(nationalDigits(text, phone, dialRef.current));
                clearError('phone');
              }}
              ref={(node) => {
                if (Platform.OS !== 'web' || !node || node.__otpPaste) return;
                if (typeof node.addEventListener !== 'function') return;
                node.__otpPaste = true;
                node.addEventListener('paste', (event) => {
                  const text = event.clipboardData?.getData('text') ?? '';
                  if (!text) return;
                  event.preventDefault();
                  setPhone(nationalDigits(text, '', dialRef.current));
                  clearError('phone');
                });
              }}
              placeholder={country.iso === 'PK' ? '03XX XXXXXXX' : 'Phone number'}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={24}
              textContentType="telephoneNumber"
              autoComplete="tel"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              style={styles.phoneInput}
            />
          </View>
          {fieldErrors.phone ? (
            <View style={styles.errorRow}>
              <Ionicons name="warning" size={14} color={ERROR} />
              <Text style={styles.errorText}>{fieldErrors.phone}</Text>
            </View>
          ) : null}
        </View>

        <AppTextInput
          appearance="signup"
          label="Password"
          icon="lock-closed-outline"
          iconColor="#94A3B8"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError('password');
          }}
          error={fieldErrors.password}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          placeholder="Your password"
          labelStyle={fieldLabel}
          fieldStyle={fieldBox}
          inputStyle={fieldText}
          focusedStyle={fieldGlow}
        />

        {password.length > 0 ? (
          <View style={styles.strengthWrap}>
            <View style={styles.segments}>
              {[1, 2, 3].map((step) => (
                <View key={step} style={styles.segmentTrack}>
                  <View
                    style={[
                      styles.segmentFill,
                      {
                        width: strength.level >= step ? '100%' : '0%',
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
              {strength.level < 3 ? ' - Add a symbol to make it stronger' : ''}
            </Text>
          </View>
        ) : null}

        <AppTextInput
          appearance="signup"
          label="Confirm password"
          icon="lock-closed-outline"
          iconColor="#94A3B8"
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            clearError('confirm');
          }}
          error={fieldErrors.confirm}
          secureTextEntry
          textContentType="newPassword"
          placeholder="Repeat password"
          labelStyle={fieldLabel}
          fieldStyle={fieldBox}
          inputStyle={fieldText}
          focusedStyle={fieldGlow}
        />

        <View ref={termsRef} nativeID="signup-terms" collapsable={false}>
          <Pressable
            style={styles.termsRow}
            onPress={() => {
              setAcceptTerms((current) => !current);
              clearError('terms');
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptTerms }}
          >
            <View
              style={[
                styles.check,
                acceptTerms && styles.checkOn,
                fieldErrors.terms && !acceptTerms && styles.checkError,
              ]}
            >
              {acceptTerms ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : null}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Pressable>
          {fieldErrors.terms ? (
            <View style={styles.errorRow}>
              <Ionicons name="warning" size={14} color={ERROR} />
              <Text style={styles.errorText}>{fieldErrors.terms}</Text>
            </View>
          ) : null}
        </View>

        <PrimaryButton
          title="Create account"
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
          style={styles.linkRow}
          disabled={loading}
        >
          <Text style={styles.linkMuted}>Already have an account? </Text>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
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
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: '#94A3B8',
    fontSize: 13,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameCol: {
    flex: 1,
  },
  phoneWrap: {
    marginBottom: 16,
  },
  phoneLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  phoneRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2B52',
    borderWidth: 1,
    borderColor: '#2B3B68',
    borderRadius: 12,
  },
  phoneFocused: {
    borderColor: '#3B82F6',
    ...fieldGlow,
  },
  phoneError: {
    borderColor: '#F87171',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#2B3B68',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    flex: 1,
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
  strengthWrap: {
    marginTop: -8,
    marginBottom: 16,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#2B3B68',
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: 999,
  },
  strengthLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  termsRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3B4C80',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkOn: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkError: {
    borderColor: ERROR,
    borderWidth: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
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
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  linkMuted: {
    fontSize: 13,
    color: '#94A3B8',
  },
  link: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
  },
});
