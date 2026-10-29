import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fontSize, spacing } from '../theme';
import AppLogo from './AppLogo';

/** Logo and tagline shown beside the login and signup forms on a laptop. */
export default function BrandPanel({ title, tagline, logo, colors: gradientColors, taglineStyle }) {
  return (
    <LinearGradient
      colors={gradientColors || [colors.primary, colors.violet]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.panel}
    >
      {logo || <AppLogo size={96} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.tagline, taglineStyle]}>{tagline}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 520,
  },
  title: {
    marginTop: spacing.lg,
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  tagline: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: fontSize.lg,
    lineHeight: 28,
  },
});
