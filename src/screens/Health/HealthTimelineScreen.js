// ─── Stevia Care — Health Timeline ────────────────────────────────────────────
// Complete medical history · Lab + Vitals + Prescriptions + Symptoms
// Inspired by: Apple Health Records + One Medical timeline + Forward Health
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const FILTERS = [
  { id: 'all',        label: 'All',         icon: 'apps',           color: '#6366F1' },
  { id: 'lab',        label: 'Lab Reports', icon: 'flask',          color: '#7C3AED' },
  { id: 'vitals',     label: 'Vitals',      icon: 'pulse',          color: '#059669' },
  { id: 'medicine',   label: 'Medicines',   icon: 'medical',        color: '#F59E0B' },
  { id: 'symptom',    label: 'Symptoms',    icon: 'search-circle',  color: '#0EA5E9' },
];

function TimelineEvent({ event, isLast, T }) {
  const [expanded, setExpanded] = useState(false);

  const iconColor = {
    lab:      '#7C3AED',
    vitals:   '#059669',
    medicine: '#F59E0B',
    symptom:  '#0EA5E9',
  }[event.type] || '#6366F1';

  const iconBg = {
    lab:      '#EDE9FE',
    vitals:   '#D1FAE5',
    medicine: '#FEF3C7',
    symptom:  '#E0F2FE',
  }[event.type] || '#EEF2FF';

  const iconName = {
    lab:      'flask',
    vitals:   'pulse',
    medicine: 'medical',
    symptom:  'search-circle',
  }[event.type] || 'document';

  return (
    <View style={styles.eventWrap}>
      {/* Vertical line */}
      <View style={styles.lineCol}>
        <View style={[styles.dot, { backgroundColor: iconColor, borderColor: iconColor + '33' }]} />
        {!isLast && <View style={[styles.line, { backgroundColor: T.border }]} />}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={[styles.eventCard, { backgroundColor: T.card }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.85}
      >
        <View style={styles.eventTop}>
          <View style={[styles.eventIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={18} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eventTitle, { color: T.text }]}>{event.title}</Text>
            <Text style={[styles.eventDate, { color: T.textMuted }]}>{event.dateStr}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: iconColor + '18' }]}>
            <Text style={[styles.typeText, { color: iconColor }]}>{event.typeLabel}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={T.textMuted}
          />
        </View>

        {/* Summary always visible */}
        <Text style={[styles.eventSummary, { color: T.textSub }]} numberOfLines={expanded ? undefined : 2}>
          {event.summary}
        </Text>

        {/* Expanded details */}
        {expanded && event.details && (
          <View style={[styles.detailsBox, { backgroundColor: T.bg, borderColor: T.border }]}>
            {event.details.map((d, i) => (
              <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: T.border }]}>
                <Text style={[styles.detailKey, { color: T.textMuted }]}>{d.key}</Text>
                <Text style={[styles.detailVal, { color: T.text }]}>{d.val}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function HealthTimelineScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const { user } = useAuthStore();
  const { labReports, vitalsLog, reminders } = useHealthStore();
  const [activeFilter, setActiveFilter] = useState('all');

  // Build unified timeline from all health data
  const allEvents = useMemo(() => {
    const events = [];

    // Lab Reports
    (labReports || []).forEach(r => {
      const abnormal = r.result?.abnormal_count || 0;
      const overall  = r.result?.overall_status || 'Unknown';
      events.push({
        id:        `lab-${r.id || Math.random()}`,
        type:      'lab',
        typeLabel: 'Lab',
        date:      new Date(r.date || r.createdAt || Date.now()),
        dateStr:   new Date(r.date || r.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        title:     r.name || 'Lab Report',
        summary:   `Overall: ${overall}. ${abnormal > 0 ? `${abnormal} abnormal parameter(s) found.` : 'All parameters within range.'}`,
        details: [
          { key: 'Status',    val: overall },
          { key: 'Abnormal',  val: String(abnormal) },
          { key: 'Borderline', val: String(r.result?.borderline_count || 0) },
          { key: 'Normal',    val: String(r.result?.normal_count || 0) },
        ],
      });
    });

    // Vitals
    (vitalsLog || []).forEach(v => {
      events.push({
        id:        `vital-${v.id || Math.random()}`,
        type:      'vitals',
        typeLabel: 'Vitals',
        date:      new Date(v.date || v.timestamp || Date.now()),
        dateStr:   new Date(v.date || v.timestamp || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        title:     'Vitals Recorded',
        summary:   [
          v.bp && `BP: ${v.bp}`,
          v.pulse && `Pulse: ${v.pulse} bpm`,
          v.weight && `Weight: ${v.weight} kg`,
          v.bmi && `BMI: ${v.bmi}`,
          v.sugar && `Sugar: ${v.sugar} mg/dL`,
          v.spo2 && `SpO₂: ${v.spo2}%`,
        ].filter(Boolean).join(' · ') || 'Vitals logged',
        details: [
          v.bp     && { key: 'Blood Pressure', val: v.bp },
          v.pulse  && { key: 'Pulse',          val: v.pulse + ' bpm' },
          v.weight && { key: 'Weight',         val: v.weight + ' kg' },
          v.height && { key: 'Height',         val: v.height + ' cm' },
          v.bmi    && { key: 'BMI',            val: String(v.bmi) },
          v.sugar  && { key: 'Blood Sugar',    val: v.sugar + ' mg/dL' },
          v.spo2   && { key: 'SpO₂',           val: v.spo2 + '%' },
          v.temp   && { key: 'Temperature',    val: v.temp + '°F' },
        ].filter(Boolean),
      });
    });

    // Medicine reminders
    (reminders || []).forEach(r => {
      const medNames = (r.medicines || []).map(m => m.name).join(', ');
      if (!medNames) return;
      events.push({
        id:        `med-${r.id || Math.random()}`,
        type:      'medicine',
        typeLabel: 'Medicines',
        date:      new Date(r.createdAt || r.startDate || Date.now()),
        dateStr:   new Date(r.createdAt || r.startDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        title:     r.name || 'Prescription Added',
        summary:   `Medicines: ${medNames}`,
        details:   (r.medicines || []).map(m => ({
          key: m.name,
          val: `${m.dosage || ''} · ${m.frequency || ''} · ${m.duration_days ? m.duration_days + ' days' : ''}`.replace(/\s·\s$/,''),
        })),
      });
    });

    // Sort newest first
    return events.sort((a, b) => b.date - a.date);
  }, [labReports, vitalsLog, reminders]);

  const filtered = activeFilter === 'all'
    ? allEvents
    : allEvents.filter(e => e.type === activeFilter);

  // Group by month-year
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const key = e.date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups);
  }, [filtered]);

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <SafeAreaView edges={['top']}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#1E3A5F']}
          style={styles.header}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Health Timeline</Text>
            <Text style={styles.headerSub}>Your complete medical history</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{allEvents.length}</Text>
            <Text style={styles.countLabel}>records</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Filter Pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { backgroundColor: T.card, borderBottomColor: T.border }]}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setActiveFilter(f.id)}
            style={[
              styles.filterPill,
              { backgroundColor: activeFilter === f.id ? f.color : T.bg, borderColor: activeFilter === f.id ? f.color : T.border },
            ]}
          >
            <Ionicons name={f.icon} size={13} color={activeFilter === f.id ? '#fff' : T.textSub} />
            <Text style={[styles.filterLabel, { color: activeFilter === f.id ? '#fff' : T.textSub }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

        {grouped.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={64} color={T.textMuted} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: T.text }]}>No records yet</Text>
            <Text style={[styles.emptySub, { color: T.textMuted }]}>
              Your health history will appear here as you add lab reports, vitals, and medicines.
            </Text>
          </View>
        ) : (
          grouped.map(([monthYear, events]) => (
            <View key={monthYear} style={{ marginBottom: 8 }}>
              {/* Month header */}
              <View style={styles.monthHeader}>
                <View style={[styles.monthLine, { backgroundColor: T.border }]} />
                <View style={[styles.monthBadge, { backgroundColor: T.card }]}>
                  <Text style={[styles.monthText, { color: T.textSub }]}>{monthYear}</Text>
                </View>
                <View style={[styles.monthLine, { backgroundColor: T.border }]} />
              </View>

              {/* Events */}
              {events.map((ev, idx) => (
                <TimelineEvent
                  key={ev.id}
                  event={ev}
                  isLast={idx === events.length - 1}
                  T={T}
                />
              ))}
            </View>
          ))
        )}

        {/* Stats summary */}
        {allEvents.length > 0 && (
          <View style={[styles.statsCard, { backgroundColor: T.card }]}>
            <Text style={[styles.statsTitle, { color: T.text }]}>Your Health Summary</Text>
            <View style={styles.statsRow}>
              {[
                { val: (labReports || []).length,   label: 'Lab Reports',  color: '#7C3AED' },
                { val: (vitalsLog   || []).length,   label: 'Vitals Logs',  color: '#059669' },
                { val: (reminders   || []).length,   label: 'Prescriptions',color: '#F59E0B' },
              ].map((s, i) => (
                <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: T.border }]}>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={[styles.statLabel, { color: T.textMuted }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:      { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  headerSub:    { fontSize: 12, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.65)' },
  countBadge:   { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  countText:    { fontSize: 20, fontFamily: 'Nunito_900Black', color: '#fff' },
  countLabel:   { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.6)' },

  filterBar:    { borderBottomWidth: 1, maxHeight: 56 },
  filterContent:{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  filterLabel:  { fontSize: 12, fontFamily: 'Nunito_700Bold' },

  monthHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 8 },
  monthLine:    { flex: 1, height: 1 },
  monthBadge:   { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  monthText:    { fontSize: 12, fontFamily: 'Nunito_700Bold' },

  eventWrap:    { flexDirection: 'row', gap: 12, marginBottom: 2 },
  lineCol:      { alignItems: 'center', width: 20 },
  dot:          { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 14, zIndex: 1 },
  line:         { flex: 1, width: 2, marginTop: 4, marginBottom: 4 },

  eventCard:    { flex: 1, borderRadius: 18, padding: 14, marginBottom: 10 },
  eventTop:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  eventIcon:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  eventTitle:   { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  eventDate:    { fontSize: 11, fontFamily: 'Nunito_400Regular', marginTop: 1 },
  typeBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeText:     { fontSize: 10, fontFamily: 'Nunito_700Bold' },
  eventSummary: { fontSize: 12, fontFamily: 'Nunito_400Regular', lineHeight: 18 },

  detailsBox:   { marginTop: 10, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  detailKey:    { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  detailVal:    { fontSize: 12, fontFamily: 'Nunito_700Bold' },

  emptyBox:     { alignItems: 'center', padding: 40 },
  emptyTitle:   { fontSize: 18, fontFamily: 'Nunito_900Black', marginBottom: 8 },
  emptySub:     { fontSize: 13, fontFamily: 'Nunito_400Regular', textAlign: 'center', lineHeight: 20 },

  statsCard:    { borderRadius: 20, padding: 16, marginTop: 8 },
  statsTitle:   { fontSize: 15, fontFamily: 'Nunito_900Black', marginBottom: 12 },
  statsRow:     { flexDirection: 'row' },
  statItem:     { flex: 1, alignItems: 'center', paddingVertical: 6 },
  statVal:      { fontSize: 24, fontFamily: 'Nunito_900Black' },
  statLabel:    { fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2, textAlign: 'center' },
});
