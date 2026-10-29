import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fontSize, radius, spacing } from '../theme';

/**
 * Full-width action button.
 * variant: "primary" (blue-to-violet gradient) | "outline" (border only)
 */
export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  contentStyle,
  labelStyle,
}) {
  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';

  const content = loading ? (
    <ActivityIndicator color={isOutline ? colors.primary : colors.text} />
  ) : (
    <Text style={[styles.label, isOutline ? styles.outlineLabel : styles.primaryLabel, labelStyle]}>
      {title}
    </Text>
  );

  if (isOutline) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.outline,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, contentStyle]}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 52,
    width: '100%',
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  outline: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.button,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  primaryLabel: {
    color: colors.text,
  },
  outlineLabel: {
    color: colors.danger,
  },
});
