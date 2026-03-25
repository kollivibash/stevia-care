/**
 * Stevia Care — Home Dashboard
 * Design inspiration:
 *   Apple Health    → clean activity rings, metric cards
 *   Samsung Health  → greeting + score card at top
 *   Google Fit      → pastel activity strips
 *   Noom            → daily tip card with emoji + color
 *   Medisafe        → medicine reminder horizontal scroll
 *   Fitbit          → health metrics grid
 *   Calm/Headspace  → warm welcoming greeting tone
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme, t } from '../../store/themeStore';

const { width } = Dimensions.get('window');

const ALL_TIPS = [
  { icon: 'water-outline',        text: 'Drink 8 glasses of water daily to boost kidney health.',          color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: 'leaf-outline',         text: 'Eat a rainbow — 5 servings of fruits and vegetables daily.',       color: '#16A34A', bg: '#F0FDF4' },
  { icon: 'walk-outline',         text: '10,000 steps a day reduces heart disease risk by 30%.',            color: '#F59E0B', bg: '#FFFBEB' },
  { icon: 'moon-outline',         text: '7–8 hours of sleep improves immunity and memory.',                 color: '#7C3AED', bg: '#F5F3FF' },
  { icon: 'body-outline',         text: '10 minutes of meditation daily reduces stress by 20%.',            color: '#EC4899', bg: '#FDF2F8' },
  { icon: 'heart-outline',        text: 'Check your blood pressure regularly. Normal: below 120/80.',      color: '#EF4444', bg: '#FFF5F5' },
  { icon: 'leaf-outline',         text: 'Turmeric with black pepper boosts anti-inflammatory benefits.',    color: '#16A34A', bg: '#F0FDF4' },
  { icon: 'sunny-outline',        text: 'Warm lemon water each morning kickstarts your digestion.',         color: '#F59E0B', bg: '#FFFBEB' },
  { icon: 'cloud-outline',        text: 'Deep breathing for 5 minutes lowers blood pressure.',              color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: 'nutrition-outline',    text: 'A handful of nuts daily protects your heart.',                     color: '#92400E', bg: '#FEF3C7' },
  { icon: 'sunny-outline',        text: '20 minutes of morning sunlight gives you natural Vitamin D.',      color: '#D97706', bg: '#FFFBEB' },
  { icon: 'medkit-outline',       text: 'Annual checkups catch 80% of chronic conditions early.',           color: '#EF4444', bg: '#FFF5F5' },
  { icon: 'moon-outline',         text: 'Avoid screens 1 hour before bed for better sleep quality.',        color: '#7C3AED', bg: '#F5F3FF' },
  { icon: 'medical-outline',      text: 'Never skip prescribed medicines — consistency matters most.',      color: '#EC4899', bg: '#FDF2F8' },
  { icon: 'flash-outline',        text: 'Learning a new skill daily keeps your brain sharp.',               color: '#6366F1', bg: '#EEF2FF' },
  { icon: 'fish-outline',         text: 'Eat fatty fish twice a week — Omega-3 protects your heart.',       color: '#16A34A', bg: '#F0FDF4' },
  { icon: 'nutrition-outline',    text: 'Bananas provide instant energy and regulate heart rhythm.',         color: '#F59E0B', bg: '#FFFBEB' },
  { icon: 'people-outline',       text: 'Strong social connections add up to 7 years to your lifespan.',    color: '#10B981', bg: '#ECFDF5' },
  { icon: 'water-outline',        text: 'Swimming 30 min burns as many calories as running.',               color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: 'bandage-outline',      text: 'Check your HbA1c once a year — early detection saves lives.',      color: '#EF4444', bg: '#FFF5F5' },
  { icon: 'leaf-outline',         text: 'Whole grains reduce diabetes risk by 30% vs refined grains.',      color: '#92400E', bg: '#FEF3C7' },
  { icon: 'color-fill-outline',   text: 'Blueberries improve memory — eat them 3 times a week.',            color: '#6366F1', bg: '#EEF2FF' },
  { icon: 'warning-outline',      text: 'Sugary drinks are a top cause of obesity. Switch to water.',       color: '#EF4444', bg: '#FFF5F5' },
  { icon: 'barbell-outline',      text: 'Strength training twice weekly prevents bone density loss.',        color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: 'egg-outline',          text: 'Eggs are one of the most complete proteins — safe daily.',         color: '#F59E0B', bg: '#FFFBEB' },
  { icon: 'heart-outline',        text: 'Call someone you love today — it reduces stress hormones.',        color: '#EC4899', bg: '#FDF2F8' },
  { icon: 'snow-outline',         text: '30 seconds of cold water in shower boosts your immunity.',         color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: 'happy-outline',        text: 'Brushing twice daily — oral health links directly to heart.',      color: '#6366F1', bg: '#EEF2FF' },
  { icon: 'cafe-outline',         text: 'Green tea antioxidants reduce inflammation and sharpen focus.',     color: '#16A34A', bg: '#F0FDF4' },
  { icon: 'alert-circle-outline', text: 'Cut sodium — high salt raises BP and strains kidneys.',            color: '#64748B', bg: '#F8FAFC' },
];

// Apple Health-inspired ring component
function ActivityRing({ value, max, color, size = 44, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: color + '25' }} />
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: 'transparent',
        borderTopColor: color,
        transform: [{ rotate: `${pct * 360 - 90}deg` }],
      }} />
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.2, fontFamily: 'Nunito_800ExtraBold', color }}>{Math.round(pct * 100)}</Text>
      </View>
    </View>
  );
}

// ── Dynamic health score ──────────────────────────────────────────────────────
function calcHealthScore({ vitalsLog, labReports, reminders, adherenceLogs, familyMembers }) {
  let score = 65;

  // +10 if vitals logged in the last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if ((vitalsLog || []).some(v => new Date(v.date || v.timestamp || 0).getTime() > sevenDaysAgo)) score += 10;

  // +5 if lab reports exist
  if ((labReports || []).length > 0) score += 5;

  // +5 if last lab has no critical alerts
  const lastLab = (labReports || [])[0];
  if (lastLab?.result && (lastLab.result.critical_alerts || []).length === 0) score += 5;

  // +5 medicine adherence bonus
  const taken   = (adherenceLogs || []).filter(l => l.action === 'taken').length;
  const skipped = (adherenceLogs || []).filter(l => l.action === 'skipped').length;
  const total   = taken + skipped;
  if (total > 0 && taken / total >= 0.8) score += 5;

  // +5 family health tracked
  if ((familyMembers || []).length > 0) score += 5;

  // -5 if latest vitals show high BMI (obese)
  const latestV = (vitalsLog || [])[0];
  if (latestV?.bmi && parseFloat(latestV.bmi) >= 30) score -= 5;

  // -3 if BP is high (systolic > 140)
  if (latestV?.systolic && parseInt(latestV.systolic) > 140) score -= 3;

  return Math.min(100, Math.max(30, score));
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const { reminders, labReports, familyMembers, vitalsLog, adherenceLogs } = useHealthStore();
  const { isDark, languageCode } = useThemeStore();
  const T = getTheme(isDark);
  const [showNotif, setShowNotif] = useState(false);
  const healthScore = calcHealthScore({ vitalsLog, labReports, reminders, adherenceLogs, familyMembers });
  const hasData = (vitalsLog?.length > 0) || (labReports?.length > 0) || (reminders?.length > 0);
  // Score change vs last week — +1 per data type added recently
  const scoreTrend = !hasData ? null
    : vitalsLog?.length > 0 && labReports?.length > 0 ? '+10 this month'
    : vitalsLog?.length > 0 ? '+5 this month'
    : '+3 this month';
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const todayMeds = reminders.flatMap(r =>
    r.medicines.map(m => ({ ...m, memberName: r.memberName, id: `${r.id}_${m.name}` }))
  ).slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t(languageCode, 'goodMorning')
    : hour < 17 ? t(languageCode, 'goodAfternoon')
    : t(languageCode, 'goodEvening');
  const greetIcon  = hour < 5 ? 'moon' : hour < 12 ? 'sunny' : hour < 17 ? 'hand-right' : hour < 20 ? 'partly-sunny' : 'moon';
  const greetIconColor = hour < 12 ? '#FCD34D' : hour < 17 ? '#FDE68A' : '#A78BFA';

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tip = ALL_TIPS[dayOfYear % ALL_TIPS.length];

  // Quick stats — Google Fit / Samsung Health style
  const quickStats = [
    { icon: 'flask-outline',   label: 'Reports',   val: labReports.length,   color: '#7C3AED', nav: () => navigation.navigate('Health', { screen: 'LabHome' }) },
    { icon: 'people-outline',  label: 'Family',    val: familyMembers.length, color: '#0EA5E9', nav: () => navigation.navigate('Family') },
    { icon: 'medical-outline', label: 'Medicines', val: todayMeds.length,     color: '#F59E0B', nav: () => navigation.navigate('Health', { screen: 'RemindersHome' }) },
    { icon: 'pulse-outline',   label: 'Vitals',    val: vitalsLog?.length || 0, color: '#EF4444', nav: () => navigation.navigate('Health', { screen: 'VitalsHome' }) },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── HEADER — Apple Health gradient + Samsung greeting ── */}
        <LinearGradient colors={['#064E3B', '#065F46', '#16A34A']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Top row */}
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={styles.greetText}>{greeting}</Text>
                  <Ionicons name={greetIcon} size={14} color={greetIconColor} />
                </View>
                <Text style={styles.nameText}>{user?.name?.split(' ')[0] || 'there'}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotif(true)} activeOpacity={0.8}>
                  <Ionicons name="notifications-outline" size={20} color="#fff" />
                  {todayMeds.length > 0 && <View style={styles.badgeDot} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'ProfileHome' })} activeOpacity={0.8}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Apple Health-style score card */}
            <View style={styles.scoreCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scoreTitle}>{t(languageCode, 'healthScore')}</Text>
                <Text style={styles.scoreNum}>{healthScore}<Text style={styles.scoreOf}>/100</Text></Text>
                <View style={styles.trendRow}>
                  {scoreTrend ? (
                    <View style={styles.trendPill}>
                      <Ionicons name="trending-up" size={10} color="#4ADE80" />
                      <Text style={styles.trendTxt}>{scoreTrend}</Text>
                    </View>
                  ) : (
                    <View style={[styles.trendPill, { backgroundColor: 'rgba(251,191,36,0.2)' }]}>
                      <Ionicons name="add-circle-outline" size={10} color="#FCD34D" />
                      <Text style={[styles.trendTxt, { color: '#FCD34D' }]}>Add data to improve</Text>
                    </View>
                  )}
                </View>
              </View>
              {/* Activity rings — Apple Health inspired */}
              <View style={styles.ringsWrap}>
                <ActivityRing value={healthScore} max={100} color="#4ADE80" size={80} strokeWidth={7} />
                <View style={styles.ringsLegend}>
                  <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} /><Text style={styles.legendTxt}>Health</Text></View>
                </View>
              </View>
            </View>

            {/* Quick stats row — Google Fit style */}
            <View style={styles.statsRow}>
              {quickStats.map((s, i) => (
                <TouchableOpacity key={i} style={styles.statPill} onPress={s.nav} activeOpacity={0.8}>
                  <Ionicons name={s.icon} size={14} color={s.color} />
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.body}>

          {/* ── NOOM-style Daily Tip ── */}
          <TouchableOpacity activeOpacity={0.9} style={[styles.tipCard, { backgroundColor: isDark ? T.card : tip.bg, borderColor: tip.color + '30' }]}>
            <View style={[styles.tipEmoji, { backgroundColor: tip.color + '18' }]}>
              <Ionicons name={tip.icon} size={26} color={tip.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                <Ionicons name="bulb-outline" size={11} color={tip.color} />
                <Text style={[styles.tipLabel, { color: tip.color, marginBottom: 0 }]}>{t(languageCode, 'dailyTip')}</Text>
              </View>
              <Text style={[styles.tipBody, { color: T.text }]}>{tip.text}</Text>
            </View>
          </TouchableOpacity>

          {/* ── Medisafe-style Medicine strip ── */}
          {todayMeds.length === 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Health', { screen: 'RemindersHome' })} activeOpacity={0.85}
              style={[styles.emptyMedsCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <View style={[styles.emptyMedsIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="medical" size={22} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emptyMedsTitle, { color: T.text }]}>No medicines added yet</Text>
                <Text style={[styles.emptyMedsSub, { color: T.textMuted }]}>Tap to set daily medicine reminders</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
            </TouchableOpacity>
          )}
          {todayMeds.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="medical" size={16} color="#F59E0B" />
                  <Text style={[styles.sectionTitle, { color: T.text }]}>{t(languageCode, 'todayMeds')}</Text>
                </View>
                  <Text style={[styles.sectionSub, { color: T.textMuted }]}>{todayMeds.length} medicine{todayMeds.length !== 1 ? 's' : ''} today</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Health', { screen: 'RemindersHome' })}>
                  <Text style={styles.seeAll}>{t(languageCode, 'seeAll')}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
                {todayMeds.map((med, i) => (
                  <View key={i} style={[styles.medCard, { backgroundColor: T.card }]}>
                    <View style={[styles.medAccent, { backgroundColor: med.color || '#16A34A' }]} />
                    <View style={styles.medContent}>
                      <View style={[styles.medIconBox, { backgroundColor: (med.color || '#16A34A') + '18' }]}>
                        <Ionicons name="medical" size={16} color={med.color || '#16A34A'} />
                      </View>
                      <Text style={[styles.medName, { color: T.text }]} numberOfLines={2}>{med.name}</Text>
                      <Text style={[styles.medMember, { color: T.textMuted }]}>{med.memberName}</Text>
                      <View style={styles.medTimeRow}>
                        <Ionicons name="time-outline" size={12} color={T.textMuted} />
                        <Text style={[styles.medTime, { color: T.textSub }]}>{(med.times || [med.time || '08:00'])[0]}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Health Tools Grid — Practo / HealthTap style ── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="medkit-outline" size={16} color="#16A34A" />
                  <Text style={[styles.sectionTitle, { color: T.text }]}>{t(languageCode, 'healthTools')}</Text>
                </View>
                <Text style={[styles.sectionSub, { color: T.textMuted }]}>Your complete health suite</Text>
              </View>
            </View>
            <View style={styles.toolsGrid}>
              {[
                { icon: 'flask',               title: 'Lab\nAnalyzer',   color: '#7C3AED', bg: '#EDE9FE', nav: 'LabHome'        },
                { icon: 'heart',               title: 'Period\nTracker', color: '#EC4899', bg: '#FCE7F3', nav: 'TrackerHome'    },
                { icon: 'medical',             title: 'Medicines',       color: '#F59E0B', bg: '#FEF3C7', nav: 'RemindersHome'  },
                { icon: 'pulse',               title: 'Vitals\n& BMI',   color: '#EF4444', bg: '#FEE2E2', nav: 'VitalsHome'    },
                { icon: 'search-circle',       title: 'Symptom\nCheck',  color: '#16A34A', bg: '#DCFCE7', nav: 'SymptomChecker' },
                { icon: 'warning',             title: 'Emergency\nSOS',  color: '#DC2626', bg: '#FEE2E2', nav: 'EmergencySOS'  },
              ].map((tool, i) => (
                <TouchableOpacity key={i} style={[styles.toolCard, { backgroundColor: T.card }]}
                  onPress={() => navigation.navigate('Health', { screen: tool.nav })} activeOpacity={0.82}>
                  <View style={[styles.toolIcon, { backgroundColor: isDark ? tool.color + '22' : tool.bg }]}>
                    <Ionicons name={tool.icon} size={22} color={tool.color} />
                  </View>
                  <Text style={[styles.toolTitle, { color: T.text }]}>{tool.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── BetterHelp-style Wellness Banner ── */}
          <TouchableOpacity onPress={() => navigation.navigate('Health', { screen: 'ChatScreen' })} activeOpacity={0.9}>
            <LinearGradient colors={['#5B21B6', '#7C3AED', '#A78BFA']} style={styles.aiBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.aiOrb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiLabel}>AI HEALTH ASSISTANT</Text>
                <Text style={styles.aiTitle}>Ask Stevia AI</Text>
                <Text style={styles.aiSub}>Get instant answers about your health in your language</Text>
              </View>
              <View style={styles.aiIconBox}>
                <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ── NOTIFICATION MODAL ── */}
      <Modal visible={showNotif} transparent animationType="slide" onRequestClose={() => setShowNotif(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowNotif(false)}>
          <View style={[styles.notifSheet, { backgroundColor: T.card }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.notifHead}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="notifications" size={18} color="#F59E0B" />
                <Text style={[styles.notifTitle, { color: T.text }]}>Today's Reminders</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotif(false)}>
                <Ionicons name="close-circle" size={24} color={T.textMuted} />
              </TouchableOpacity>
            </View>
            {todayMeds.length === 0 ? (
              <View style={styles.notifEmpty}>
                <Ionicons name="checkmark-circle" size={52} color="#16A34A" />
                <Text style={[{ fontSize: 15, fontFamily: 'Nunito_700Bold', marginTop: 12 }, { color: T.text }]}>All done!</Text>
                <Text style={[{ fontSize: 13, marginTop: 4, fontFamily: 'Nunito_400Regular' }, { color: T.textMuted }]}>No medicines due right now</Text>
              </View>
            ) : todayMeds.map((med, i) => (
              <View key={i} style={[styles.notifRow, { backgroundColor: T.cardAlt, borderLeftColor: med.color || '#16A34A' }]}>
                <Ionicons name="medical" size={16} color={med.color || '#16A34A'} />
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 14, fontFamily: 'Nunito_700Bold' }, { color: T.text }]}>{med.name}</Text>
                  <Text style={[{ fontSize: 11, fontFamily: 'Nunito_400Regular' }, { color: T.textMuted }]}>{med.memberName} · {(med.times || [med.time || ''])[0]}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.notifAllBtn, { borderColor: '#16A34A' }]}
              onPress={() => { setShowNotif(false); navigation.navigate('Health', { screen: 'RemindersHome' }); }}>
              <Text style={{ color: '#16A34A', fontFamily: 'Nunito_700Bold', fontSize: 14 }}>View All Reminders →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, overflow: 'hidden' },
  decorCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)', top: -80, right: -50 },
  decorCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: 'rgba(255,255,255,0.03)', bottom: -30, left: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  greetText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'Nunito_400Regular' },
  nameText:  { color: '#fff', fontSize: 28, fontFamily: 'Nunito_900Black', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  badgeDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757', borderWidth: 1.5, borderColor: '#14532D' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { color: '#fff', fontSize: 18, fontFamily: 'Nunito_900Black' },
  scoreCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  scoreTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Nunito_700Bold', letterSpacing: 0.5, textTransform: 'uppercase' },
  scoreNum:   { color: '#fff', fontSize: 42, fontFamily: 'Nunito_900Black', lineHeight: 48 },
  scoreOf:    { fontSize: 16, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.5)' },
  trendRow:   { marginTop: 6 },
  trendPill:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  trendTxt:   { color: '#4ADE80', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  ringsWrap:  { alignItems: 'center', gap: 8 },
  ringsLegend:{ gap: 4 },
  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 6, height: 6, borderRadius: 3 },
  legendTxt:  { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_400Regular' },
  statsRow:   { flexDirection: 'row', gap: 8 },
  statPill:   { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 10, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statVal:    { color: '#fff', fontSize: 16, fontFamily: 'Nunito_900Black' },
  statLabel:  { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontFamily: 'Nunito_600SemiBold', letterSpacing: 0.3 },
  body: { paddingHorizontal: 16, paddingTop: 18, gap: 0 },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1 },
  tipEmoji: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  tipBody:  { fontSize: 13, lineHeight: 19, fontFamily: 'Nunito_400Regular' },
  section:  { marginBottom: 22 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_900Black', letterSpacing: -0.3 },
  sectionSub:   { fontSize: 11, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  seeAll:       { fontSize: 13, color: '#16A34A', fontFamily: 'Nunito_700Bold', marginTop: 4 },
  medCard: { width: 130, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  medAccent: { height: 4 },
  medContent: { padding: 12 },
  medIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  medName:   { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', lineHeight: 16, marginBottom: 3 },
  medMember: { fontSize: 10, marginBottom: 6, fontFamily: 'Nunito_400Regular' },
  medTimeRow:{ flexDirection: 'row', alignItems: 'center', gap: 3 },
  medTime:   { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  emptyMedsCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1 },
  emptyMedsIcon:  { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyMedsTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  emptyMedsSub:   { fontSize: 11, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard:  { width: (width - 56) / 3, borderRadius: 18, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  toolIcon:  { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  toolTitle: { fontSize: 11, fontFamily: 'Nunito_700Bold', textAlign: 'center', lineHeight: 14 },
  aiBanner:  { borderRadius: 22, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden', marginBottom: 20 },
  aiOrb:     { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.06)', right: -20, top: -40 },
  aiLabel:   { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1, marginBottom: 4 },
  aiTitle:   { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginBottom: 4 },
  aiSub:     { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 17, fontFamily: 'Nunito_400Regular' },
  aiIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  notifSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 40 },
  sheetHandle:{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 18 },
  notifHead:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  notifTitle: { fontSize: 18, fontFamily: 'Nunito_900Black' },
  notifEmpty: { alignItems: 'center', paddingVertical: 32 },
  notifRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 13, marginBottom: 10, borderLeftWidth: 3 },
  notifAllBtn:{ borderWidth: 1.5, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
});
