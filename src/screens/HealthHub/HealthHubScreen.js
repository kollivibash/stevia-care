/**
 * Health Hub — inspired by:
 *   Practo    → category cards with clean icon tiles
 *   HealthTap → "coming soon" teasers with progress
 *   WebMD     → informational sub-title on each tool
 *   NHS       → clear, accessible, no clutter
 *   Fitbit    → pastel icon backgrounds
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme, tr } from '../../store/themeStore';

const { width } = Dimensions.get('window');

const getModules = (s) => [
  { id: 'lab',     title: s('labAnalyzer'),        sub: s('labAnalyzerSub'),        icon: 'flask',               colors: ['#5B21B6','#7C3AED'], bg: '#EDE9FE', ic: '#7C3AED', tag: 'AI',        nav: 'LabHome'          },
  { id: 'meds',    title: s('medicineTracker'),     sub: s('medicineTrackerSub'),    icon: 'medical',             colors: ['#92400E','#F59E0B'], bg: '#FEF3C7', ic: '#F59E0B', tag: 'Reminders', nav: 'RemindersHome'    },
  { id: 'symptom', title: s('symptomChecker'),      sub: s('symptomCheckerSub'),     icon: 'search-circle',       colors: ['#0C4A6E','#0EA5E9'], bg: '#E0F2FE', ic: '#0EA5E9', tag: 'AI',        nav: 'SymptomChecker'   },
  { id: 'ai',      title: s('askStevia'),           sub: s('askSteviaSub'),          icon: 'chatbubble-ellipses', colors: ['#3730A3','#6366F1'], bg: '#EEF2FF', ic: '#6366F1', tag: 'AI Chat',   nav: 'ChatScreen'       },
  { id: 'tracker', title: s('periodTracker'),       sub: s('periodTrackerSub'),      icon: 'heart',               colors: ['#9D174D','#EC4899'], bg: '#FCE7F3', ic: '#EC4899', tag: 'Wellness',  nav: 'TrackerHome'      },
  { id: 'vitals',  title: s('vitalsBMI'),           sub: s('vitalsBMISub'),          icon: 'pulse',               colors: ['#065F46','#16A34A'], bg: '#DCFCE7', ic: '#16A34A', tag: 'Track',     nav: 'VitalsHome'       },
  { id: 'history', title: s('reportHistory'),       sub: s('reportHistorySub'),      icon: 'time',                colors: ['#0F172A','#1E293B'], bg: '#F1F5F9', ic: '#475569', tag: 'History',   nav: 'LabHistory'       },
  { id: 'cg',      title: s('caregiverMode'),       sub: s('caregiverModeSub'),      icon: 'people-circle',       colors: ['#7C2D12','#EA580C'], bg: '#FFF7ED', ic: '#EA580C', tag: '🔥 New',    nav: 'CaregiverMode'    },
  { id: 'doctor',  title: 'Book a Doctor',          sub: 'Verified specialists · Instant booking', icon: 'medical-outline', colors: ['#0C4A6E','#0EA5E9'], bg: '#E0F2FE', ic: '#0EA5E9', tag: '🔥 New', nav: 'DoctorBooking'  },
  { id: 'abha',    title: 'ABHA Health ID',          sub: 'Govt health account · Nationwide records', icon: 'id-card',      colors: ['#1E3A5F','#1D4ED8'], bg: '#DBEAFE', ic: '#1D4ED8', tag: 'Govt',      nav: 'ABHAScreen'       },
  { id: 'timeline',title: 'Health Timeline',         sub: 'Your complete medical history',           icon: 'time',          colors: ['#0F172A','#374151'], bg: '#F1F5F9', ic: '#475569', tag: 'Records',   nav: 'HealthTimeline'   },
  { id: 'sos',     title: s('emergencySOS'),        sub: s('emergencySOSSub'),       icon: 'alert-circle',        colors: ['#7F1D1D','#DC2626'], bg: '#FEE2E2', ic: '#DC2626', tag: 'SOS',       nav: 'EmergencySOS'     },
];

const COMING = [
  { icon: '🏥', label: 'Nearby Hospitals', color: '#EF4444' },
  { icon: '🍎', label: 'Diet Tracker',     color: '#F59E0B' },
  { icon: '🏃', label: 'Fitness Tracker',  color: '#8B5CF6' },
  { icon: '😴', label: 'Sleep Tracker',    color: '#7C3AED' },
  { icon: '📍', label: 'Doctor Nearby',    color: '#EC4899' },
  { icon: '⚡', label: '10 Min Medicine',  color: '#16A34A' },
  { icon: '🧬', label: 'Genetic Health',   color: '#10B981' },
];

export default function HealthHubScreen({ navigation }) {
  const { reminders, labReports, vitalsLog } = useHealthStore();
  const { isDark, languageCode } = useThemeStore();
  const T = getTheme(isDark);
  const s = tr(languageCode);
  const MODULES = getModules(s);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const stats = [
    { label: 'Reports',   value: labReports.length },
    { label: 'Medicines', value: reminders.flatMap(r => r.medicines).length },
    { label: 'Vitals',    value: vitalsLog?.length || 0 },
  ];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <LinearGradient colors={['#064E3B', '#065F46', '#16A34A']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.orb} />
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.eyebrow}>YOUR HEALTH SUITE</Text>
            <Text style={styles.headerTitle}>Health Hub</Text>
            <Text style={styles.headerSub}>All your health tools in one place</Text>
          </Animated.View>
          {/* Stats pill row */}
          <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </LinearGradient>

        <View style={{ padding: 16 }}>

          {/* Module Grid — Practo/HealthTap style 2-column */}
          <Text style={[styles.sectionTitle, { color: T.text }]}>Health Tools</Text>
          <View style={styles.grid}>
            {MODULES.map((mod, i) => (
              <TouchableOpacity key={mod.id} style={[styles.moduleCard, { backgroundColor: T.card }]}
                onPress={() => navigation.navigate(mod.nav)} activeOpacity={0.82}>
                {/* Tag badge */}
                <View style={[styles.tagBadge, { backgroundColor: mod.ic + '18' }]}>
                  <Text style={[styles.tagText, { color: mod.ic }]}>{mod.tag}</Text>
                </View>
                {/* Icon */}
                <View style={[styles.modIcon, { backgroundColor: isDark ? mod.ic + '22' : mod.bg }]}>
                  <Ionicons name={mod.icon} size={26} color={mod.ic} />
                </View>
                <Text style={[styles.modTitle, { color: T.text }]}>{mod.title}</Text>
                <Text style={[styles.modSub, { color: T.textMuted }]}>{mod.sub}</Text>
                <View style={styles.modArrow}>
                  <Ionicons name="arrow-forward-circle" size={20} color={mod.ic} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Coming Soon — NHS / WHO style teaser section */}
          <View style={[styles.comingCard, { backgroundColor: isDark ? T.card : '#0F172A' }]}>
            <View style={styles.comingBadge}>
              <Text style={styles.comingBadgeText}>COMING SOON</Text>
            </View>
            <Text style={styles.comingTitle}>More tools on the way</Text>
            <Text style={styles.comingSub}>We are building powerful health modules for you</Text>
            <View style={styles.comingDivider} />
            <View style={styles.comingGrid}>
              {COMING.map((c, i) => (
                <View key={i} style={styles.comingItem}>
                  <View style={[styles.comingIconBox, { backgroundColor: c.color + '18' }]}>
                    <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                  </View>
                  <Text style={styles.comingLabel}>{c.label}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (width - 44) / 2;
const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, overflow: 'hidden' },
  orb: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.04)', top: -100, right: -80 },
  eyebrow: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 28, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4, marginBottom: 20, fontFamily: 'Nunito_400Regular' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 13 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statVal: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_900Black', marginBottom: 14, letterSpacing: -0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  moduleCard: { width: CARD_W, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 4 },
  tagBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 12 },
  tagText: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 0.5 },
  modIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modTitle: { fontSize: 14, fontFamily: 'Nunito_900Black', marginBottom: 4 },
  modSub:   { fontSize: 11, lineHeight: 15, fontFamily: 'Nunito_400Regular' },
  modArrow: { marginTop: 12, alignSelf: 'flex-end' },
  comingCard: { borderRadius: 22, padding: 20 },
  comingBadge: { backgroundColor: '#16A34A', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
  comingBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_900Black', letterSpacing: 1.5 },
  comingTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginBottom: 4 },
  comingSub:   { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 16, fontFamily: 'Nunito_400Regular' },
  comingDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  comingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  comingItem: { alignItems: 'center', gap: 6, width: (width - 80) / 4 },
  comingIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  comingLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
});
