import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { useWideLayout, widePage } from '../layout';
import { colors, fontSize, spacing } from '../theme';

/** Placeholder until scan history is saved. */
export default function HistoryScreen() {
  const { wide } = useWideLayout();
  return (
    <ScreenContainer edges={['top', 'left', 'right']} contentStyle={[styles.page, wide && widePage]}>
      <Text style={[styles.title, wide && styles.titleWide]}>History</Text>
      <Text style={styles.body}>Your past checks will show up here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  body: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.muted,
  },
  titleWide: {
    fontSize: 36,
  },
});
