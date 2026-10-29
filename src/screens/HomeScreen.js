import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['#1D4ED8', '#6D28D9', '#0F766E'];

function Pulse() {
  return (
    <Svg width={130} height={56} viewBox="0 0 130 56">
      <Path
        d="M0 34 H36 C44 34 48 26 54 26 C60 26 62 34 70 34 L78 34 L86 8 L94 48 L102 34 H130"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatScanWhen(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const startOf = (day) => new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayDiff = Math.round((startOf(now) - startOf(date)) / 86400000);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${time}`;
}

function badgeColors(label) {
  const kind = String(label || '').toLowerCase();
  if (kind.startsWith('real')) {
    return { color: '#4ADE80', backgroundColor: 'rgba(34,197,94,0.18)' };
  }
  if (kind.startsWith('unsure')) {
    return { color: '#FBBF24', backgroundColor: 'rgba(245,158,11,0.18)' };
  }
  return { color: '#F87171', backgroundColor: 'rgba(239,68,68,0.18)' };
}

function StatCard({ value, label, valueColor }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ScanCard({ item, index }) {
  const tone = badgeColors(item.label || item.result);
  const percent = item.percent ?? item.percentage;
  const badge = percent == null ? String(item.label || item.result || '') : `${item.label || item.result} ${percent}%`;
  return (
    <View style={styles.scan}>
      <View style={[styles.scanAvatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
        <Ionicons name="person" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.scanText}>
        <Text style={styles.scanName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.scanWhen}>{formatScanWhen(item.createdAt || item.date)}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
        <Text style={[styles.badgeText, { color: tone.color }]}>{badge}</Text>
      </View>
    </View>
  );
}

/** Home tab shown after login. Counts stay at zero until scans exist. */
export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const firstName = user?.first_name || 'there';
  const initial = firstName.trim().charAt(0).toUpperCase() || 'T';
  const recent = [];
  const total = 0;
  const real = 0;
  const fake = 0;

  return (
    <ScreenContainer edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.column}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.welcome}>Welcome, {firstName}</Text>
            <Text style={styles.prompt}>What would you like to check today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Check a video</Text>
          <Text style={styles.heroBody}>
            Upload a 5 to 10 second clip with a clear face and voice.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Upload')}
            style={styles.scanPress}
          >
            <Ionicons name="cloud-upload-outline" size={16} color="#3B82F6" />
            <Text style={styles.scanLabel}>Scan a video</Text>
          </Pressable>
          <View style={styles.pulse} pointerEvents="none">
            <Pulse />
          </View>
        </LinearGradient>

        <View style={styles.stats}>
          <StatCard value={String(total)} label="Total scans" valueColor="#FFFFFF" />
          <StatCard value={String(real)} label="Real" valueColor="#22C55E" />
          <StatCard value={String(fake)} label="Fake" valueColor="#EF4444" />
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent scans</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No scans yet.</Text>
          </View>
        ) : (
          recent.slice(0, 3).map((item, index) => (
            <ScanCard key={item.id || item.name || index} item={item} index={index} />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 16,
  },
  column: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  welcome: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  prompt: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 13,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '700',
  },
  hero: {
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  heroBody: {
    marginTop: 6,
    maxWidth: '60%',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  scanPress: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  scanLabel: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
  },
  pulse: {
    position: 'absolute',
    right: 8,
    bottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#182447',
    borderWidth: 1,
    borderColor: '#2B3B68',
    padding: 14,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748B',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    borderRadius: 16,
    backgroundColor: '#182447',
    borderWidth: 1,
    borderColor: '#2B3B68',
    padding: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  scan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#182447',
    borderWidth: 1,
    borderColor: '#2B3B68',
    padding: 12,
    marginBottom: 10,
  },
  scanAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    flex: 1,
  },
  scanName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scanWhen: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 11,
  },
  badge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
