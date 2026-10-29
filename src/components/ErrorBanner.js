import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '../theme';

/** Inline banner for API / form-level errors. */
export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
