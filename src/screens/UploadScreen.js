import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

import { uploadVideo } from '../api/videos';
import ErrorBanner from '../components/ErrorBanner';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { useWideLayout, widePage } from '../layout';
import { colors, fontSize, radius, spacing } from '../theme';

const MAX_BYTES = 50 * 1024 * 1024;

function extensionOf(name) {
  const parts = String(name || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function mimeFromName(name) {
  return extensionOf(name) === 'mov' ? 'video/quicktime' : 'video/mp4';
}

function validateVideo(name, mime, size) {
  const ext = extensionOf(name);
  const extOk = ext === 'mp4' || ext === 'mov';
  const mimeOk = mime === 'video/mp4' || mime === 'video/quicktime' || mime === 'video/mov';
  if (!extOk && !mimeOk) {
    return 'Only MP4 and MOV videos are allowed.';
  }
  if (size > MAX_BYTES) {
    return 'Video must be 50 MB or smaller.';
  }
  return '';
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function pickWebFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/quicktime,.mp4,.mov';
    let settled = false;
    const finish = (file) => {
      if (settled) return;
      settled = true;
      resolve(file);
    };
    input.onchange = () => {
      finish(input.files && input.files[0] ? input.files[0] : null);
    };
    input.addEventListener('cancel', () => finish(null));
    input.click();
  });
}

function VideoPreview({ uri, tall }) {
  const player = useVideoPlayer(uri, (next) => {
    next.pause();
  });

  return (
    <VideoView
      style={[styles.video, tall && styles.videoWide]}
      player={player}
      nativeControls
      contentFit="contain"
    />
  );
}

/** Pick an mp4/mov up to 50 MB, then upload it. */
const TIPS = [
  { icon: 'time-outline', text: 'Use a 5–10 second video' },
  { icon: 'person-outline', text: 'Face and neck clearly visible' },
  { icon: 'sunny-outline', text: 'Good light, facing the camera' },
];

export default function UploadScreen({ navigation }) {
  const { wide } = useWideLayout();
  const dropRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [missingVideo, setMissingVideo] = useState(false);

  useEffect(() => {
    return () => {
      if (video?.uri && video.file && Platform.OS === 'web') {
        URL.revokeObjectURL(video.uri);
      }
    };
  }, [video]);

  useEffect(() => {
    if (!wide || Platform.OS !== 'web') return undefined;
    const node = dropRef.current;
    if (!node || typeof node.addEventListener !== 'function') return undefined;

    function takeFile(event) {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (!file || uploading) return;
      setError('');
      setSuccess('');
      const problem = validateVideo(file.name, file.type, file.size);
      if (problem) {
        setError(problem);
        return;
      }
      remember({
        name: file.name,
        size: file.size,
        mime: file.type || mimeFromName(file.name),
        uri: URL.createObjectURL(file),
        file,
      });
    }

    function onDragOver(event) {
      event.preventDefault();
      setDragging(true);
    }

    function onDragLeave() {
      setDragging(false);
    }

    node.addEventListener('dragover', onDragOver);
    node.addEventListener('dragleave', onDragLeave);
    node.addEventListener('drop', takeFile);
    return () => {
      node.removeEventListener('dragover', onDragOver);
      node.removeEventListener('dragleave', onDragLeave);
      node.removeEventListener('drop', takeFile);
    };
  }, [wide, uploading]);

  function remember(next) {
    setMissingVideo(false);
    setVideo((current) => {
      if (current?.uri && current.file && Platform.OS === 'web') {
        URL.revokeObjectURL(current.uri);
      }
      return next;
    });
  }

  async function chooseVideo() {
    if (uploading) return;
    setError('');
    setSuccess('');

    if (Platform.OS === 'web') {
      const file = await pickWebFile();
      if (!file) return;
      const problem = validateVideo(file.name, file.type, file.size);
      if (problem) {
        setError(problem);
        return;
      }
      remember({
        name: file.name,
        size: file.size,
        mime: file.type || mimeFromName(file.name),
        uri: URL.createObjectURL(file),
        file,
      });
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow video access to choose a file.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
    });
    if (result.canceled || !result.assets || !result.assets[0]) return;

    const asset = result.assets[0];
    const name = asset.fileName || asset.uri.split('/').pop() || 'video.mp4';
    let size = asset.fileSize;
    if (size == null) {
      try {
        const blob = await (await fetch(asset.uri)).blob();
        size = blob.size;
      } catch {
        size = null;
      }
    }
    if (size == null) {
      setError('Could not read that video. Please choose another file.');
      return;
    }

    const problem = validateVideo(name, asset.mimeType, size);
    if (problem) {
      setError(problem);
      return;
    }

    remember({
      name,
      size,
      mime: asset.mimeType || mimeFromName(name),
      uri: asset.uri,
      file: null,
    });
  }

  async function onCheckQuality() {
    if (uploading) return;
    if (!video) {
      setError('');
      setSuccess('');
      setMissingVideo(true);
      return;
    }
    setMissingVideo(false);
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const result = await uploadVideo(video);
      navigation.navigate('QualityCheck', { result });
    } catch (err) {
      setError(err.message || 'Could not upload the video.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']} contentStyle={[styles.page, wide && widePage]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.navigate('Home')}
          style={styles.back}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>New scan</Text>
        <View style={styles.back} />
      </View>

      <View style={wide ? styles.columns : undefined}>
        <View ref={wide ? dropRef : undefined} style={wide ? styles.leftCol : undefined}>
          {video ? (
            <View style={[styles.preview, wide && styles.previewWide]}>
              <VideoPreview key={video.uri} uri={video.uri} tall={wide} />
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={chooseVideo}
              style={[
                styles.preview,
                wide && styles.previewWide,
                dragging && styles.previewDrag,
                missingVideo && styles.previewMissing,
              ]}
              disabled={uploading}
            >
              <View style={styles.placeholder}>
                <Ionicons name="videocam-outline" size={wide ? 48 : 36} color={colors.muted} />
                <Text style={[styles.placeholderText, wide && styles.placeholderWide]}>
                  {wide ? 'Drop a video here' : 'Choose a video'}
                </Text>
                {wide ? <Text style={styles.placeholderHint}>or click to choose a file</Text> : null}
              </View>
            </Pressable>
          )}

          {missingVideo ? (
            <View style={styles.missingRow}>
              <Ionicons name="warning" size={14} color="#F87171" />
              <Text style={styles.missingText}>Please choose a video</Text>
            </View>
          ) : null}

          {video ? (
            <View style={styles.meta}>
              <Text style={styles.fileName} numberOfLines={1}>{video.name}</Text>
              <Text style={styles.fileSize}>{formatSize(video.size)}</Text>
            </View>
          ) : null}

          <ErrorBanner message={error} />
          {success ? <Text style={styles.success}>{success}</Text> : null}

          {wide ? null : (
            <View style={styles.tip}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.tipText}>
                Use a 5-10 second video where face and neck are clearly visible
              </Text>
            </View>
          )}

          <PrimaryButton
            title="Check video quality"
            onPress={onCheckQuality}
            loading={uploading}
            disabled={uploading}
          />

          <Pressable
            accessibilityRole="button"
            onPress={chooseVideo}
            disabled={uploading}
            style={styles.another}
          >
            <Text style={styles.anotherText}>
              {video ? 'Choose another video' : 'Choose a video'}
            </Text>
          </Pressable>
        </View>

        {wide ? (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips for a good clip</Text>
            {TIPS.map((tip) => (
              <View key={tip.text} style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Ionicons name={tip.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.tipRowText}>{tip.text}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
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
  preview: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: 220,
    alignSelf: 'stretch',
    backgroundColor: colors.input,
  },
  videoWide: {
    height: 360,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  meta: {
    marginBottom: spacing.md,
  },
  fileName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  fileSize: {
    marginTop: 2,
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  success: {
    marginBottom: spacing.md,
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tipText: {
    flex: 1,
    color: colors.muted,
    fontSize: fontSize.sm,
    lineHeight: 20,
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
    flex: 1.2,
    minWidth: 0,
  },
  previewWide: {
    height: 360,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  previewDrag: {
    borderColor: colors.primary,
  },
  previewMissing: {
    borderColor: '#F87171',
    borderStyle: 'solid',
    borderWidth: 1.5,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  missingText: {
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
  placeholderWide: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  placeholderHint: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  tipsCard: {
    flex: 0.8,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  tipsTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipRowText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});
