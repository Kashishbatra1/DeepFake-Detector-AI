import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme';

function PersonOutline() {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34">
      <Circle cx="17" cy="11" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <Path
        d="M8 27.5C8 20.5 26 20.5 26 27.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Mark({ kind }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      {kind === 'check' ? (
        <Path
          d="M2.4 6.2 L4.8 8.6 L9.6 3.4"
          stroke="#FFFFFF"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <Path
          d="M3.2 3.2 L8.8 8.8 M8.8 3.2 L3.2 8.8"
          stroke="#FFFFFF"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

function FaceExample({ label, labelColor, badgeColor, mark }) {
  return (
    <View style={styles.faceWrap}>
      <View style={styles.face}>
        <PersonOutline />
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Mark kind={mark} />
        </View>
      </View>
      <Text style={[styles.faceLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

/** One intro page. Next and Skip both continue to login. */
export default function OnboardingScreen({ onDone }) {
  const { height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const skipTop = Math.max(screenH * 0.08, insets.top + 8);
  const nextTop = screenH - 48 - Math.max(insets.bottom + 8, screenH * 0.07);

  return (
    <View style={styles.screen}>
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          onPress={onDone}
          style={[styles.skip, { top: skipTop }]}
          hitSlop={8}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <View style={[styles.card, { top: screenH * 0.12, height: screenH * 0.39 }]}>
          <View style={styles.faceRow}>
            <FaceExample label="Real" labelColor="#22C55E" badgeColor="#22C55E" mark="check" />
            <FaceExample label="Fake" labelColor="#F87171" badgeColor="#EF4444" mark="x" />
          </View>
          <Text style={styles.cardCaption}>They look the same to our eyes</Text>
        </View>

        <View style={[styles.copy, { top: screenH * 0.58 }]}>
          <Text style={styles.title}>Fake videos look real</Text>
          <Text style={styles.body}>
            AI can now copy anyone's face and voice. Checking by eye is no longer enough.
          </Text>
        </View>

        <View style={[styles.dots, { top: screenH * 0.72 }]}>
          <View style={[styles.dot, styles.dotOn]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onDone}
          style={[styles.next, { top: nextTop }]}
        >
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextFill}
          >
            <Text style={styles.nextText}>Next</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    height: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  skip: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
    minHeight: 32,
    justifyContent: 'center',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 20,
    backgroundColor: '#263169',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  faceRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  faceWrap: {
    alignItems: 'center',
  },
  face: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1A2457',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  cardCaption: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  copy: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'left',
  },
  body: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  dots: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#3B4C80',
  },
  dotOn: {
    width: 18,
    height: 4,
    backgroundColor: '#3B82F6',
  },
  next: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
