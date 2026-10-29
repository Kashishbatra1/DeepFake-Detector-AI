import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '../config';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useWideLayout, widePage } from '../layout';
import { colors, fontSize, radius, spacing } from '../theme';

function CheckRow({ ok, title, detail }) {
  const tone = ok ? colors.success : colors.danger;
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: tone }]}>
        <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={colors.text} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const NECK_FAIL = {
  covered: 'Neck is covered (scarf, collar, hair or beard)',
  out_of_frame: 'Neck is cut off at the bottom of the video',
  too_dark: 'Neck is too dark to check',
};

function shownNeckPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  if (number >= 100) return 100;
  return Math.floor(number);
}

/** Face, neck, and length result after upload. */
export default function QualityCheckScreen({ navigation, route }) {
  const { wide } = useWideLayout();
  const result = route.params?.result;
  const neckOk = result?.neck_ok === true;
  const ready = Boolean(result?.face_found && neckOk);
  const seconds = Number(result?.duration_sec || 0).toFixed(1);
  const neckPercent = shownNeckPercent(result?.neck_pct);
  const neckDetail = neckOk
    ? `Neck visible in ${neckPercent}% of frames`
    : NECK_FAIL[result?.neck_reason] || NECK_FAIL.covered;
  const previewUri = result?.preview_url ? `${API_BASE_URL}${result.preview_url}` : null;

  function chooseAnother() {
    navigation.goBack();
  }

  const preview = previewUri ? (
    <View style={[styles.previewWrap, wide && styles.previewWrapWide]}>
      <Image
        source={{ uri: previewUri }}
        style={[styles.preview, wide && styles.previewWide]}
        resizeMode="contain"
      />
    </View>
  ) : null;

  const summary = (
    <>
      <Text style={[styles.ready, wide && styles.readyWide]}>
        {ready ? 'Ready to check' : 'Not ready to check'}
      </Text>
      <Text style={styles.readySub}>
        {ready ? 'You can start analysis' : 'Face and neck both need to be visible'}
      </Text>

      <View style={[styles.list, wide && styles.listWide]}>
        <CheckRow
          ok={Boolean(result?.face_found)}
          title="Face found"
          detail={
            result?.face_found
              ? 'One clear face in most frames'
              : 'Face was missing in too many frames'
          }
        />
        <CheckRow
          ok={neckOk}
          title={neckOk ? 'Neck visible' : 'Neck not visible'}
          detail={neckDetail}
        />
        <CheckRow
          ok={Boolean(result?.length_ok)}
          title="Length OK"
          detail={`${seconds} seconds`}
        />
      </View>

      {ready ? (
        <PrimaryButton
          title="Start analysis"
          onPress={() => navigation.navigate('Analysis', { videoId: result.id })}
        />
      ) : (
        <PrimaryButton title="Choose another video" onPress={chooseAnother} />
      )}

      {ready ? (
        <Pressable accessibilityRole="button" onPress={chooseAnother} style={styles.another}>
          <Text style={styles.anotherText}>Choose another video</Text>
        </Pressable>
      ) : null}
    </>
  );

  return (
    <ScreenContainer contentStyle={[styles.page, wide && widePage]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={chooseAnother}
          style={styles.back}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Video quality</Text>
        <View style={styles.back} />
      </View>

      {wide ? (
        <View style={styles.columns}>
          <View style={styles.leftCol}>
            <Text style={styles.fileName} numberOfLines={1}>
              {result?.original_name || 'Video'}
            </Text>
            <Text style={styles.fileMeta}>{seconds} seconds</Text>
            {preview}
          </View>
          <View style={styles.rightCol}>{summary}</View>
        </View>
      ) : (
        <>
          <Text style={styles.fileName} numberOfLines={1}>
            {result?.original_name || 'Video'}
          </Text>
          <Text style={styles.fileMeta}>{seconds} seconds</Text>
          {preview}
          {summary}
        </>
      )}
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
    marginBottom: spacing.md,
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
  fileName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  fileMeta: {
    marginTop: 2,
    marginBottom: spacing.md,
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  previewWrap: {
    width: '100%',
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.input,
    marginBottom: spacing.lg,
  },
  preview: {
    width: '100%',
    height: 240,
  },
  ready: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  readySub: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  rowDetail: {
    marginTop: 2,
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  another: {
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  anotherText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  leftCol: {
    flex: 1.15,
    minWidth: 0,
  },
  rightCol: {
    flex: 0.85,
    minWidth: 0,
  },
  previewWrapWide: {
    height: 460,
    borderRadius: 16,
    marginBottom: 0,
  },
  previewWide: {
    height: 460,
  },
  readyWide: {
    fontSize: 36,
  },
  listWide: {
    borderRadius: 16,
    padding: spacing.lg,
  },
});
