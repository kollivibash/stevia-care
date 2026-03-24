import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Alert, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme } from '../../store/themeStore';
import {
  format, addDays, parseISO, differenceInDays,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
} from 'date-fns';

const { width } = Dimensions.get('window');
const DAY_SIZE  = Math.floor((width - 48) / 7);
const PINK      = '#EC4899';
const PINK2     = '#BE185D';
const PINK_LIGHT = '#FDF2F8';

const FLOW_OPTIONS = [
  { key: 'spotting', label: 'Spotting', dot: '#FB7185' },
  { key: 'light',    label: 'Light',    dot: '#F43F5E' },
  { key: 'medium',   label: 'Medium',   dot: '#BE123C' },
  { key: 'heavy',    label: 'Heavy',    dot: '#881337' },
];

const SYMPTOMS = [
  { key: 'cramps',      label: 'Cramps',      icon: '😣' },
  { key: 'headache',    label: 'Headache',    icon: '🤕' },
  { key: 'bloating',    label: 'Bloating',    icon: '😮' },
  { key: 'fatigue',     label: 'Fatigue',     icon: '😴' },
  { key: 'mood_swings', label: 'Mood Swings', icon: '🌊' },
  { key: 'back_pain',   label: 'Back Pain',   icon: '🔙' },
  { key: 'nausea',      label: 'Nausea',      icon: '🤢' },
  { key: 'acne',        label: 'Acne',        icon: '😤' },
  { key: 'tenderness',  label: 'Tenderness',  icon: '💗' },
  { key: 'spotting',    label: 'Spotting',    icon: '🩸' },
  { key: 'happy',       label: 'Happy',       icon: '😊' },
  { key: 'anxious',     label: 'Anxious',     icon: '😟' },
];

const MOODS = [
  { key: 'great',    emoji: '😊', label: 'Great'    },
  { key: 'good',     emoji: '🙂', label: 'Good'     },
  { key: 'okay',     emoji: '😐', label: 'Okay'     },
  { key: 'bad',      emoji: '😢', label: 'Bad'      },
  { key: 'terrible', emoji: '😩', label: 'Terrible' },
];

const BLANK = { period_start: '', period_end: '', flow: 'medium', symptoms: [], mood: '' };

export default function TrackerScreen({ navigation }) {
  const { periodCycles, addPeriodCycle, updatePeriodCycle, deletePeriodCycle } = useHealthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const today = new Date();

  const [viewMonth,  setViewMonth]  = useState(today);
  const [showModal,  setShowModal]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(BLANK);

  // ── Cycle stats — computed from actual period history ──────────────────
  // Sort cycles newest first
  const sortedCycles = [...periodCycles].sort(
    (a, b) => parseISO(b.period_start) - parseISO(a.period_start)
  );
  const lastCycle = sortedCycles[0];

  // Calculate real cycle lengths from consecutive period_start dates
  const realCycleLengths = [];
  for (let i = 0; i < sortedCycles.length - 1; i++) {
    const len = differenceInDays(
      parseISO(sortedCycles[i].period_start),
      parseISO(sortedCycles[i + 1].period_start)
    );
    if (len >= 20 && len <= 45) realCycleLengths.push(len); // only valid lengths
  }

  const avgLen = realCycleLengths.length > 0
    ? Math.round(realCycleLengths.reduce((s, l) => s + l, 0) / realCycleLengths.length)
    : 28;

  // Is cycle irregular? (std deviation > 4 days across 2+ cycles)
  const isIrregular = realCycleLengths.length >= 2 && (() => {
    const variance = realCycleLengths.reduce((s, l) => s + Math.pow(l - avgLen, 2), 0) / realCycleLengths.length;
    return Math.sqrt(variance) > 4;
  })();

  // Next period = last period start + avg cycle length
  const nextPeriod = lastCycle
    ? addDays(parseISO(lastCycle.period_start), avgLen)
    : addDays(today, 14);
  const daysUntil = differenceInDays(nextPeriod, today);

  // Ovulation = last period start + (avgLen - 14)  ← luteal phase is fixed ~14 days
  const ovulationDay = lastCycle
    ? addDays(parseISO(lastCycle.period_start), Math.max(avgLen - 14, 10))
    : addDays(today, 14);

  // Fertile window: wider if irregular cycles
  const fertileStart = addDays(ovulationDay, isIrregular ? -7 : -5);
  const fertileEnd   = addDays(ovulationDay, isIrregular ? 3  : 1);

  const cycleDay = lastCycle
    ? Math.max(1, differenceInDays(today, parseISO(lastCycle.period_start)) + 1)
    : 0;

  // Phase
  const getPhase = () => {
    if (!lastCycle)               return { name: 'Unknown',   color: '#94A3B8', desc: 'Log your first period to see your phase.',        emoji: '❓' };
    if (cycleDay >= 1  && cycleDay <= 5)  return { name: 'Menstrual',  color: PINK,      desc: 'Period is active. Rest and stay hydrated.',       emoji: '🩸' };
    if (cycleDay >= 6  && cycleDay <= 13) return { name: 'Follicular', color: '#F59E0B', desc: 'Energy rising! Great time for new projects.',      emoji: '🌱' };
    if (cycleDay >= 14 && cycleDay <= 16) return { name: 'Ovulation',  color: '#10B981', desc: 'Peak fertility window. High energy and confidence.', emoji: '🌸' };
    return                               { name: 'Luteal',     color: '#8B5CF6', desc: 'Progesterone rising. You may feel introspective.',  emoji: '🌙' };
  };
  const phase = getPhase();

  // Calendar sets
  const monthDays  = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startPad   = getDay(startOfMonth(viewMonth));
  const periodSet  = new Set();
  const predictSet = new Set();
  const fertileSet = new Set();

  periodCycles.forEach((c) => {
    const s = parseISO(c.period_start);
    const e = c.period_end ? parseISO(c.period_end) : addDays(s, 4);
    try { eachDayOfInterval({ start: s, end: e }).forEach(d => periodSet.add(format(d, 'yyyy-MM-dd'))); } catch (_) {}
  });
  try { eachDayOfInterval({ start: nextPeriod, end: addDays(nextPeriod, 4) }).forEach(d => predictSet.add(format(d, 'yyyy-MM-dd'))); } catch (_) {}
  try { eachDayOfInterval({ start: fertileStart, end: fertileEnd }).forEach(d => fertileSet.add(format(d, 'yyyy-MM-dd'))); } catch (_) {}
  const ovuKey = format(ovulationDay, 'yyyy-MM-dd');

  // Open modal
  const openNew = (dateStr) => {
    setEditingId(null);
    setForm({ ...BLANK, period_start: dateStr || format(today, 'yyyy-MM-dd') });
    setShowModal(true);
  };

  const openEdit = (cycle) => {
    setEditingId(cycle.id);
    setForm({
      period_start: cycle.period_start   || '',
      period_end:   cycle.period_end     || '',
      flow:         cycle.flow           || 'medium',
      symptoms:     cycle.symptoms       || [],
      mood:         cycle.mood           || '',
    });
    setShowModal(true);
  };

  // Validate date
  const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const handleSave = () => {
    if (!form.period_start.trim()) {
      Alert.alert('Start Date Required', 'Please enter the period start date.');
      return;
    }
    if (!isValidDate(form.period_start)) {
      Alert.alert('Invalid Start Date', 'Use YYYY-MM-DD format, e.g. 2026-03-10');
      return;
    }
    if (form.period_end && !isValidDate(form.period_end)) {
      Alert.alert('Invalid End Date', 'Use YYYY-MM-DD format, e.g. 2026-03-15\nOr leave it blank if period is ongoing.');
      return;
    }
    const payload = { ...form, cycle_length: avgLen };
    if (editingId) {
      updatePeriodCycle(editingId, payload);
      setShowModal(false);
      Alert.alert('Updated!', 'Cycle updated successfully.');
    } else {
      addPeriodCycle(payload);
      setShowModal(false);
      Alert.alert('Logged!', 'Period logged. Tap AI Analysis to get insights.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Cycle',
      'Are you sure you want to remove this period log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePeriodCycle(id) },
      ]
    );
  };

  const toggleSymptom = (key) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(key)
        ? prev.symptoms.filter(s => s !== key)
        : [...prev.symptoms, key],
    }));
  };

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <LinearGradient
          colors={['#831843', PINK2, PINK]}
          style={styles.header}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.orb} />
          <Text style={styles.eyebrow}>CYCLE TRACKER</Text>
          <Text style={styles.headerTitle}>Period & PCOD</Text>

          {/* Phase card */}
          <View style={styles.phaseCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.phaseName}>{phase.emoji}  {phase.name} Phase</Text>
              <Text style={styles.phaseDesc}>{phase.desc}</Text>
              {cycleDay > 0 && <Text style={styles.cycleDay}>Day {cycleDay} of your cycle</Text>}
            </View>
            <View style={[styles.phaseCircle, { borderColor: phase.color }]}>
              <Text style={[styles.phaseNum, { color: phase.color }]}>{cycleDay > 0 ? cycleDay : '?'}</Text>
              <Text style={styles.phaseSub}>day</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              {
                label: 'Next Period',
                value: daysUntil > 0 ? `${daysUntil}d` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)}d late`,
              },
              { label: 'Avg Cycle', value: `${avgLen}d` },
              { label: 'Logged',    value: `${periodCycles.length}` },
            ].map((s, i) => (
              <View key={i} style={[styles.statBox, i < 2 && { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* FERTILE WINDOW */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={[styles.fertileCard, { backgroundColor: T.card }]}>
            <View style={styles.fertileItem}>
              <Ionicons name="heart" size={18} color={PINK} />
              <View>
                <Text style={[styles.fertileLabel, { color: T.textMuted }]}>Fertile Window</Text>
                <Text style={[styles.fertileDate, { color: T.text }]}>
                  {format(fertileStart, 'dd MMM')} – {format(fertileEnd, 'dd MMM')}
                </Text>
              </View>
            </View>
            <View style={{ width: 1, height: 36, backgroundColor: T.border, marginHorizontal: 12 }} />
            <View style={styles.fertileItem}>
              <Text style={{ fontSize: 18 }}>🌸</Text>
              <View>
                <Text style={[styles.fertileLabel, { color: T.textMuted }]}>Ovulation</Text>
                <Text style={[styles.fertileDate, { color: T.text }]}>{format(ovulationDay, 'dd MMM yyyy')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CALENDAR */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={[styles.calCard, { backgroundColor: T.card }]}>
            <View style={styles.calHeader}>
              <TouchableOpacity
                style={[styles.calNavBtn, { backgroundColor: PINK_LIGHT }]}
                onPress={() => setViewMonth(prev => addDays(startOfMonth(prev), -1))}
              >
                <Ionicons name="chevron-back" size={20} color={PINK} />
              </TouchableOpacity>
              <Text style={[styles.calMonth, { color: T.text }]}>{format(viewMonth, 'MMMM yyyy')}</Text>
              <TouchableOpacity
                style={[styles.calNavBtn, { backgroundColor: PINK_LIGHT }]}
                onPress={() => setViewMonth(prev => addDays(endOfMonth(prev), 1))}
              >
                <Ionicons name="chevron-forward" size={20} color={PINK} />
              </TouchableOpacity>
            </View>

            {/* Day name headers */}
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {DAY_NAMES.map(d => (
                <Text key={d} style={[styles.dayName, { color: T.textMuted, width: DAY_SIZE }]}>{d}</Text>
              ))}
            </View>

            {/* Day cells */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Array(startPad).fill(null).map((_, i) => (
                <View key={`pad_${i}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />
              ))}
              {monthDays.map((day) => {
                const key      = format(day, 'yyyy-MM-dd');
                const isToday  = key === format(today, 'yyyy-MM-dd');
                const isPeriod = periodSet.has(key);
                const isPredict = predictSet.has(key) && !isPeriod;
                const isFertile = fertileSet.has(key) && !isPeriod;
                const isOvu    = key === ovuKey && !isPeriod;

                let bg = 'transparent', tc = T.text, bw = 0, bc = 'transparent';
                if (isPeriod)  { bg = PINK;      tc = '#fff'; }
                if (isPredict) { bg = '#FCE7F3';  tc = PINK;    bw = 1.5; bc = PINK; }
                if (isFertile) { bg = '#ECFDF5';  tc = '#10B981'; }
                if (isOvu)     { bg = '#10B981';  tc = '#fff'; }
                if (isToday && !isPeriod && !isOvu) { bw = 1.5; bc = PINK; }

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => openNew(key)}
                    activeOpacity={0.7}
                    style={[
                      styles.dayCell,
                      { width: DAY_SIZE, height: DAY_SIZE, backgroundColor: bg, borderColor: bc, borderWidth: bw },
                    ]}
                  >
                    <Text style={[styles.dayNum, { color: tc, fontFamily: isToday || isPeriod ? 'Nunito_900Black' : 'Nunito_600SemiBold' }]}>
                      {format(day, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              {[
                { color: PINK,      label: 'Period'    },
                { color: '#FCE7F3', label: 'Predicted', border: PINK },
                { color: '#ECFDF5', label: 'Fertile'   },
                { color: '#10B981', label: 'Ovulation' },
              ].map((l, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: l.color, borderWidth: l.border ? 1.5 : 0, borderColor: l.border || 'transparent' }} />
                  <Text style={{ fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: T.textMuted }}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ paddingHorizontal: 16, marginTop: 14, flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => openNew(format(today, 'yyyy-MM-dd'))} activeOpacity={0.88}>
            <LinearGradient colors={['#831843', PINK]} style={styles.logBtn}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.logBtnText}>Log Period Today</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aiBtn, { borderColor: PINK, backgroundColor: PINK_LIGHT }]}
            onPress={() => navigation.navigate('TrackerAnalysis')}
            activeOpacity={0.88}
          >
            <Ionicons name="analytics" size={20} color={PINK} />
            <Text style={{ color: PINK, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' }}>AI Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* RECENT CYCLES */}
        {periodCycles.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { color: T.text }]}>Recent Cycles</Text>
            {periodCycles.slice(0, 8).map((c) => {
              const fc = FLOW_OPTIONS.find(f => f.key === c.flow) || FLOW_OPTIONS[2];
              const startDateStr = c.period_start ? format(parseISO(c.period_start), 'dd MMM yyyy') : '—';
              const endDateStr   = c.period_end   ? format(parseISO(c.period_end),   'dd MMM')      : 'Ongoing';
              return (
                <View key={c.id} style={[styles.cycleRow, { backgroundColor: T.card }]}>
                  <View style={[styles.cycleBar, { backgroundColor: fc.dot }]} />
                  <View style={{ flex: 1, padding: 12 }}>
                    <Text style={[styles.cycleDate, { color: T.text }]}>
                      {startDateStr} → {endDateStr}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      <View style={[styles.chip, { backgroundColor: fc.dot + '25', borderColor: fc.dot }]}>
                        <Text style={[styles.chipText, { color: fc.dot }]}>🩸 {c.flow || 'medium'}</Text>
                      </View>
                      {(c.symptoms || []).slice(0, 2).map((s) => {
                        const sym = SYMPTOMS.find(x => x.key === s || x.label.toLowerCase() === s.toLowerCase());
                        return (
                          <View key={s} style={[styles.chip, { backgroundColor: PINK_LIGHT, borderColor: PINK }]}>
                            <Text style={[styles.chipText, { color: PINK }]}>{sym?.icon || '•'} {sym?.label || s}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, paddingRight: 10, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#F0FDF4' }]}
                      onPress={() => openEdit(c)}
                    >
                      <Ionicons name="pencil" size={15} color="#16A34A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                      onPress={() => handleDelete(c.id)}
                    >
                      <Ionicons name="trash" size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* PCOD TIPS */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={[styles.pcodCard, { backgroundColor: T.card }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Ionicons name="pulse" size={18} color="#8B5CF6" />
              <Text style={[{ fontSize: 15, fontFamily: 'Nunito_800ExtraBold' }, { color: T.text }]}>PCOD Awareness</Text>
            </View>
            {[
              { icon: '⚠️', text: 'Irregular cycles over 35 days apart may indicate PCOD. Consult your gynecologist.' },
              { icon: '🥗', text: 'Low-GI diet and regular exercise significantly improve PCOD symptoms.' },
              { icon: '🧘', text: 'Stress worsens hormonal imbalance. Try yoga or meditation daily.' },
              { icon: '💊', text: 'Use AI Analysis for personalized PCOD risk assessment based on your cycles.' },
            ].map((tip, i) => (
              <View
                key={i}
                style={[
                  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
                  i > 0 && { borderTopWidth: 1, borderTopColor: T.divider },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{tip.icon}</Text>
                <Text style={[{ flex: 1, fontSize: 12, lineHeight: 18 }, { color: T.textSub }]}>{tip.text}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* LOG / EDIT MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: T.border, backgroundColor: T.card }]}>
            <View>
              <Text style={[styles.modalTitle, { color: T.text }]}>
                {editingId ? 'Edit Cycle' : 'Log Period'}
              </Text>
              <Text style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                Dates in YYYY-MM-DD format (e.g. 2026-03-10)
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close-circle" size={28} color={T.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* START DATE */}
            <Text style={[styles.fieldLabel, { color: T.text }]}>Start Date *</Text>
            <View style={[styles.inputRow, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              <Ionicons name="calendar" size={18} color={PINK} />
              <TextInput
                style={[styles.input, { color: T.text }]}
                value={form.period_start}
                onChangeText={v => setForm(p => ({ ...p, period_start: v }))}
                placeholder="YYYY-MM-DD  e.g. 2026-03-10"
                placeholderTextColor={T.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            {/* END DATE */}
            <Text style={[styles.fieldLabel, { color: T.text }]}>
              End Date{' '}
              <Text style={{ color: T.textMuted, fontFamily: 'Nunito_600SemiBold' }}>(optional — leave blank if ongoing)</Text>
            </Text>
            <View style={[styles.inputRow, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              <Ionicons name="calendar-outline" size={18} color={T.textMuted} />
              <TextInput
                style={[styles.input, { color: T.text }]}
                value={form.period_end}
                onChangeText={v => setForm(p => ({ ...p, period_end: v }))}
                placeholder="YYYY-MM-DD  e.g. 2026-03-15"
                placeholderTextColor={T.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
              {form.period_end ? (
                <TouchableOpacity onPress={() => setForm(p => ({ ...p, period_end: '' }))}>
                  <Ionicons name="close-circle" size={20} color={T.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* FLOW */}
            <Text style={[styles.fieldLabel, { color: T.text }]}>Flow Intensity</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {FLOW_OPTIONS.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.flowBtn,
                    { borderColor: f.dot },
                    form.flow === f.key && { backgroundColor: f.dot + '30' },
                  ]}
                  onPress={() => setForm(p => ({ ...p, flow: f.key }))}
                >
                  <View style={[styles.flowDot, { backgroundColor: f.dot }]} />
                  <Text style={[styles.flowLabel, { color: f.dot }]}>{f.label}</Text>
                  {form.flow === f.key && <Ionicons name="checkmark" size={12} color={f.dot} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* MOOD */}
            <Text style={[styles.fieldLabel, { color: T.text }]}>How are you feeling?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodBtn,
                    { backgroundColor: T.cardAlt },
                    form.mood === m.key && { backgroundColor: PINK_LIGHT, borderColor: PINK, borderWidth: 2 },
                  ]}
                  onPress={() => setForm(p => ({ ...p, mood: m.key }))}
                >
                  <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    { color: T.textSub },
                    form.mood === m.key && { color: PINK, fontFamily: 'Nunito_800ExtraBold' },
                  ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* SYMPTOMS */}
            <Text style={[styles.fieldLabel, { color: T.text }]}>Symptoms</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {SYMPTOMS.map(s => {
                const active = form.symptoms.includes(s.key);
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.sympBtn,
                      { backgroundColor: T.cardAlt },
                      active && { backgroundColor: PINK_LIGHT, borderColor: PINK, borderWidth: 1.5 },
                    ]}
                    onPress={() => toggleSymptom(s.key)}
                  >
                    <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                    <Text style={[
                      styles.sympLabel,
                      { color: T.textSub },
                      active && { color: PINK, fontFamily: 'Nunito_700Bold' },
                    ]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SAVE */}
            <TouchableOpacity onPress={handleSave} activeOpacity={0.88}>
              <LinearGradient colors={['#831843', PINK]} style={styles.saveBtn}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {editingId ? 'Save Changes' : 'Save Period Log'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:     { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, overflow: 'hidden' },
  orb:        { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.06)', top: -100, right: -70 },
  eyebrow:    { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 28, fontFamily: 'Nunito_900Black', marginBottom: 16 },

  phaseCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  phaseName:  { color: '#fff', fontSize: 16, fontFamily: 'Nunito_900Black', marginBottom: 4 },
  phaseDesc:  { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17 },
  cycleDay:   { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 6, fontFamily: 'Nunito_600SemiBold' },
  phaseCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  phaseNum:   { fontSize: 22, fontFamily: 'Nunito_900Black' },
  phaseSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontFamily: 'Nunito_700Bold' },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statBox:  { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal:  { color: '#fff', fontSize: 16, fontFamily: 'Nunito_900Black' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },

  fertileCard: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  fertileItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fertileLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', letterSpacing: 0.5, marginBottom: 3 },
  fertileDate:  { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  calCard:    { borderRadius: 20, padding: 16, shadowColor: '#EC4899', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 5 },
  calHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calNavBtn:  { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  calMonth:   { fontSize: 16, fontFamily: 'Nunito_900Black' },
  dayName:    { textAlign: 'center', fontSize: 10, fontFamily: 'Nunito_700Bold' },
  dayCell:    { alignItems: 'center', justifyContent: 'center', borderRadius: DAY_SIZE / 2, marginVertical: 2 },
  dayNum:     { fontSize: 12 },

  logBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  logBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  aiBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2 },

  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', marginBottom: 12 },

  cycleRow: { flexDirection: 'row', alignItems: 'stretch', borderRadius: 16, overflow: 'hidden', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cycleBar: { width: 4 },
  cycleDate: { fontSize: 13, fontFamily: 'Nunito_700Bold' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  actionBtn: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  pcodCard: { borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },

  // Modal
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle:   { fontSize: 20, fontFamily: 'Nunito_900Black' },
  fieldLabel:   { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', marginBottom: 10, marginTop: 4 },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5, marginBottom: 18 },
  input:        { flex: 1, fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  flowBtn:      { flex: 1, alignItems: 'center', gap: 6, borderRadius: 14, paddingVertical: 12, borderWidth: 2 },
  flowDot:      { width: 20, height: 20, borderRadius: 10 },
  flowLabel:    { fontSize: 10, fontFamily: 'Nunito_700Bold' },
  moodBtn:      { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 12, gap: 5 },
  moodLabel:    { fontSize: 9, fontFamily: 'Nunito_600SemiBold' },
  sympBtn:      { width: (width - 64) / 4, alignItems: 'center', borderRadius: 14, paddingVertical: 10, gap: 4 },
  sympLabel:    { fontSize: 9, fontFamily: 'Nunito_600SemiBold', textAlign: 'center' },
  saveBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 16 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
});
