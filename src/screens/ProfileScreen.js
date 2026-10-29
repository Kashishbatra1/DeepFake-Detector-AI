import React from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useWideLayout, widePage } from '../layout';
import { colors, fontSize, radius, spacing } from '../theme';

/** Simple profile page, including log out. */
export default function ProfileScreen() {
  const { wide } = useWideLayout();
  const { user, logout } = useAuth();
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');

  function onLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        logout();
      }
      return;
    }

    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']} contentStyle={[styles.page, wide && widePage]}>
      <Text style={[styles.title, wide && styles.titleWide]}>Profile</Text>

      <View style={[styles.card, wide && styles.cardWide]}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={18} color={colors.muted} />
          <Text style={styles.rowText}>{fullName || 'Signed in'}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={18} color={colors.muted} />
          <Text style={styles.rowText}>{user?.email}</Text>
        </View>
      </View>

      <PrimaryButton title="Log out" variant="outline" onPress={onLogout} />
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
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  titleWide: {
    fontSize: 36,
  },
  cardWide: {
    borderRadius: 16,
    padding: spacing.xl,
  },
});
