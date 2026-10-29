import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useWideLayout, widePage } from '../layout';
import { colors, fontSize, spacing } from '../theme';

/** Placeholder until the deepfake analysis step is built. */
export default function AnalysisScreen({ navigation }) {
  const { wide } = useWideLayout();
  return (
    <ScreenContainer contentStyle={[styles.page, wide && widePage]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.back}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Analysis</Text>
        <View style={styles.back} />
      </View>
      <Text style={styles.body}>Analysis will run on this video next.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  body: {
    color: colors.muted,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
});
