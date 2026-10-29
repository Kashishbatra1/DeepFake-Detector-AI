import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '../theme';

/**
 * Labeled text field with left icon, focus ring, optional password toggle,
 * and red error text under the field.
 */
export default function AppTextInput({
  label,
  icon,
  error,
  secureTextEntry = false,
  value,
  onChangeText,
  containerStyle,
  labelStyle,
  fieldStyle,
  inputStyle,
  focusedStyle,
  iconColor,
  appearance,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);
  const signup = appearance === 'signup';

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text style={[styles.label, signup && styles.labelSignup, labelStyle]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.field,
          signup && styles.fieldSignup,
          fieldStyle,
          focused && !error && (signup ? styles.fieldFocusedSignup : styles.fieldFocused),
          focused && !error && focusedStyle,
          error ? (signup ? styles.fieldErrorSignup : styles.fieldError) : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={iconColor || (focused ? colors.primary : colors.muted)}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          placeholderTextColor={signup ? '#94A3B8' : colors.muted}
          style={[styles.input, signup && styles.inputSignup, inputStyle]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          cursorColor={colors.primary}
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        signup ? (
          <View style={styles.errorRow}>
            <Ionicons name="warning" size={14} color="#F87171" />
            <Text style={styles.errorSignup}>{error}</Text>
          </View>
        ) : (
          <Text style={styles.error}>{error}</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: {
    borderColor: colors.primary,
  },
  fieldSignup: {
    borderColor: '#3B4C80',
    paddingHorizontal: 14,
  },
  fieldFocusedSignup: {
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
  fieldError: {
    borderColor: colors.danger,
  },
  fieldErrorSignup: {
    borderColor: '#F87171',
  },
  labelSignup: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  inputSignup: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  error: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  errorSignup: {
    flex: 1,
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
});
