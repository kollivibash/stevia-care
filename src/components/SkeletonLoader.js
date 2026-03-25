// ─── Stevia Care — Skeleton Loader Component ──────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });
}

// ── Single skeleton bar ───────────────────────────────────────────────────────
export default function SkeletonLoader({ width: w = 200, height: h = 16, borderRadius = 8, style, isDark }) {
  const opacity = useShimmer();
  const bg = isDark ? '#1E293B' : '#E2E8F0';
  return (
    <Animated.View style={[{ width: w, height: h, borderRadius, backgroundColor: bg, opacity }, style]} />
  );
}

// ── Card skeleton (for health module cards) ────────────────────────────────────
export function SkeletonCard({ isDark }) {
  const opacity = useShimmer();
  const bg = isDark ? '#1E293B' : '#E2E8F0';
  const card = isDark ? '#111827' : '#F8FAFC';
  return (
    <View style={[styles.card, { backgroundColor: card }]}>
      <Animated.View style={[styles.cardIcon, { backgroundColor: bg, opacity }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <Animated.View style={[styles.cardTitle, { backgroundColor: bg, opacity }]} />
        <Animated.View style={[styles.cardSub, { backgroundColor: bg, opacity }]} />
      </View>
    </View>
  );
}

// ── List skeleton (for reminders/medicines list) ───────────────────────────────
export function SkeletonList({ count = 3, isDark }) {
  const opacity = useShimmer();
  const bg = isDark ? '#1E293B' : '#E2E8F0';
  const card = isDark ? '#111827' : '#F8FAFC';
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.listRow, { backgroundColor: card }]}>
          <Animated.View style={[styles.listAvatar, { backgroundColor: bg, opacity }]} />
          <View style={{ flex: 1, gap: 8 }}>
            <Animated.View style={[styles.listTitle, { backgroundColor: bg, opacity, width: `${60 + (i % 3) * 15}%` }]} />
            <Animated.View style={[styles.listSub, { backgroundColor: bg, opacity, width: `${40 + (i % 2) * 20}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Dashboard stats skeleton ──────────────────────────────────────────────────
export function SkeletonStats({ isDark }) {
  const opacity = useShimmer();
  const bg = isDark ? '#1E293B' : '#E2E8F0';
  const card = isDark ? '#111827' : '#F8FAFC';
  return (
    <View style={styles.statsRow}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.statBox, { backgroundColor: card }]}>
          <Animated.View style={[{ width: 40, height: 28, borderRadius: 6, backgroundColor: bg, opacity, marginBottom: 6 }]} />
          <Animated.View style={[{ width: 56, height: 12, borderRadius: 4, backgroundColor: bg, opacity }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, marginBottom: 10 },
  cardIcon:  { width: 48, height: 48, borderRadius: 14 },
  cardTitle: { height: 16, borderRadius: 6, width: '70%' },
  cardSub:   { height: 12, borderRadius: 5, width: '50%' },
  listRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 14 },
  listAvatar:{ width: 44, height: 44, borderRadius: 12 },
  listTitle: { height: 14, borderRadius: 5 },
  listSub:   { height: 11, borderRadius: 4 },
  statsRow:  { flexDirection: 'row', gap: 10 },
  statBox:   { flex: 1, alignItems: 'center', borderRadius: 14, padding: 14 },
});
