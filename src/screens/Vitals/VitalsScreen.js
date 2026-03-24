import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const VITALS = [
  { key: 'weight',    label: 'Weight',        unit: 'kg',    icon: 'barbell',         color: '#16A34A', normal: '50–90 kg',     placeholder: '70' },
  { key: 'height',    label: 'Height',        unit: 'cm',    icon: 'resize',          color: '#0EA5E9', normal: '150–190 cm',   placeholder: '170' },
  { key: 'systolic',  label: 'Systolic BP',   unit: 'mmHg',  icon: 'heart',           color: '#EF4444', normal: '90–120',       placeholder: '120' },
  { key: 'diastolic', label: 'Diastolic BP',  unit: 'mmHg',  icon: 'heart-outline',   color: '#F97316', normal: '60–80',        placeholder: '80' },
  { key: 'pulse',     label: 'Heart Rate',    unit: 'bpm',   icon: 'pulse',           color: '#EC4899', normal: '60–100 bpm',   placeholder: '72' },
  { key: 'sugar',     label: 'Blood Sugar',   unit: 'mg/dL', icon: 'water',           color: '#8B5CF6', normal: '70–140 mg/dL', placeholder: '100' },
  { key: 'spo2',      label: 'Oxygen (SpO2)', unit: '%',     icon: 'cloud',           color: '#06B6D4', normal: '95–100%',      placeholder: '98' },
  { key: 'temp',      label: 'Temperature',   unit: '°F',    icon: 'thermometer',     color: '#F59E0B', normal: '97–99°F',      placeholder: '98.6' },
  { key: 'steps',     label: 'Steps Today',   unit: 'steps', icon: 'walk',            color: '#10B981', normal: '8000–12000',   placeholder: '5000' },
  { key: 'sleep',     label: 'Sleep Hours',   unit: 'hrs',   icon: 'moon',            color: '#7C3AED', normal: '7–9 hours',    placeholder: '7' },
  { key: 'water',     label: 'Water Intake',  unit: 'L',     icon: 'water-outline',   color: '#0EA5E9', normal: '2–3 L/day',    placeholder: '2' },
  { key: 'calories',  label: 'Calories',      unit: 'kcal',  icon: 'flame',           color: '#EF4444', normal: '1500–2500',    placeholder: '1800' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL', icon: 'analytics',       color: '#F97316', normal: '<200 mg/dL',   placeholder: '180' },
  { key: 'waist',     label: 'Waist',         unit: 'cm',    icon: 'body',            color: '#16A34A', normal: 'M<94 F<80cm',  placeholder: '80' },
  { key: 'stress',    label: 'Stress Level',  unit: '/10',   icon: 'warning-outline', color: '#EF4444', normal: '1–4 (low)',    placeholder: '3' },
];

function calcBMI(weight, height) {
  const w = parseFloat(weight), h = parseFloat(height);
  if (!w || !h) return null;
  const bmi = w / ((h / 100) ** 2);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const col = bmi < 18.5 ? '#0EA5E9' : bmi < 25 ? '#16A34A' : bmi < 30 ? '#F59E0B' : '#EF4444';
  return { value: bmi.toFixed(1), cat, col };
}

export default function VitalsScreen({ navigation }) {
  const { vitalsLog, addVitalsEntry } = useHealthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [values, setValues] = useState({});
  const [showLog, setShowLog] = useState(false);
  const [note, setNote] = useState('');

  const bmi = calcBMI(values.weight, values.height);
  const latest = vitalsLog[0];

  const handleSave = () => {
    const filled = Object.entries(values).filter(([,v]) => v.trim());
    if (filled.length === 0) { Alert.alert('Nothing to save', 'Enter at least one vital.'); return; }
    const entry = { ...Object.fromEntries(filled), note: note.trim(), date: new Date().toISOString(), bmi: bmi?.value };
    addVitalsEntry(entry);
    setValues({}); setNote(''); setShowLog(false);
    Alert.alert('✅ Saved', 'Vitals logged successfully!');
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#0C4A6E', '#0EA5E9', '#38BDF8']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Vitals & BMI</Text>
            <Text style={styles.headerSub}>{vitalsLog.length} entries logged</Text>
          </View>
          <TouchableOpacity onPress={() => setShowLog(true)} style={styles.logBtn}>
            <Ionicons name="add" size={22} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* BMI display */}
        {(values.weight && values.height && bmi) ? (
          <View style={styles.bmiCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bmiLabel}>BMI Preview</Text>
              <Text style={[styles.bmiValue, { color: bmi.col }]}>{bmi.value}</Text>
              <Text style={[styles.bmiCat, { color: bmi.col }]}>{bmi.cat}</Text>
            </View>
            <View style={styles.bmiScale}>
              {[{l:'Under',c:'#0EA5E9'},{l:'Normal',c:'#16A34A'},{l:'Over',c:'#F59E0B'},{l:'Obese',c:'#EF4444'}].map((b,i)=>(
                <View key={i} style={styles.bmiScaleItem}>
                  <View style={[styles.bmiScaleDot, {backgroundColor: b.c}]} />
                  <Text style={styles.bmiScaleText}>{b.l}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : latest ? (
          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>Last Entry — {new Date(latest.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</Text>
            <View style={styles.latestRow}>
              {['weight','systolic','pulse','spo2'].filter(k => latest[k]).map(k=>(
                <View key={k} style={styles.latestItem}>
                  <Text style={styles.latestVal}>{latest[k]}</Text>
                  <Text style={styles.latestKey}>{VITALS.find(v=>v.key===k)?.unit}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setShowLog(true)} activeOpacity={0.88}>
          <LinearGradient colors={['#0C4A6E','#0EA5E9']} style={styles.logBanner}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.logBannerText}>Log Today's Vitals</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: T.text }]}>Vital Signs Reference</Text>
        <View style={styles.vitalsGrid}>
          {VITALS.map(v => {
            const lastVal = vitalsLog[0]?.[v.key];
            return (
              <View key={v.key} style={[styles.vitalCard, { backgroundColor: T.card, borderTopColor: v.color }]}>
                <View style={[styles.vitalIcon, { backgroundColor: v.color + '18' }]}>
                  <Ionicons name={v.icon} size={18} color={v.color} />
                </View>
                <Text style={[styles.vitalLabel, { color: T.text }]}>{v.label}</Text>
                {lastVal ? (
                  <Text style={[styles.vitalVal, { color: v.color }]}>{lastVal} <Text style={styles.vitalUnit}>{v.unit}</Text></Text>
                ) : (
                  <Text style={[styles.vitalNormal, { color: T.textMuted }]}>{v.normal}</Text>
                )}
              </View>
            );
          })}
        </View>

        {vitalsLog.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: T.text, marginTop: 8 }]}>History</Text>
            {vitalsLog.slice(0, 10).map((entry, i) => (
              <View key={i} style={[styles.historyCard, { backgroundColor: T.card }]}>
                <View style={[styles.historyDate, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={styles.historyDateText}>{new Date(entry.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.historyValues}>
                    {VITALS.filter(v => entry[v.key]).slice(0,4).map(v => (
                      <Text key={v.key} style={[styles.historyVal, { color: T.textSub }]}>
                        <Text style={{ color: v.color, fontFamily: 'Nunito_800ExtraBold' }}>{entry[v.key]}</Text> {v.unit}
                      </Text>
                    ))}
                  </View>
                  {entry.bmi && <Text style={[styles.historyBMI, { color: T.textMuted }]}>BMI: {entry.bmi}</Text>}
                  {entry.note ? <Text style={[styles.historyNote, { color: T.textMuted }]}>📝 {entry.note}</Text> : null}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Log Vitals Modal */}
      <Modal visible={showLog} transparent animationType="slide" onRequestClose={() => setShowLog(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: T.bg }]}>
            <View style={[styles.modalHeader, { backgroundColor: T.card, borderBottomColor: T.border }]}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { color: T.text }]}>Log Today's Vitals</Text>
              <TouchableOpacity onPress={() => setShowLog(false)}>
                <Ionicons name="close-circle" size={26} color={T.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              {VITALS.map(v => (
                <View key={v.key} style={styles.inputRow}>
                  <View style={[styles.inputIcon, { backgroundColor: v.color + '18' }]}>
                    <Ionicons name={v.icon} size={16} color={v.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: T.textSub }]}>{v.label} <Text style={{ color: T.textMuted }}>({v.unit})</Text></Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: values[v.key] ? v.color : T.border }]}
                      value={values[v.key] || ''}
                      onChangeText={val => setValues(p => ({ ...p, [v.key]: val }))}
                      placeholder={v.placeholder}
                      placeholderTextColor={T.textMuted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={[styles.normalRange, { color: T.textMuted }]}>Normal: {v.normal}</Text>
                  </View>
                </View>
              ))}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.inputLabel, { color: T.textSub }]}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border, height: 70 }]}
                  value={note} onChangeText={setNote}
                  placeholder="Any symptoms, medication, or notes..."
                  placeholderTextColor={T.textMuted} multiline
                />
              </View>
              {bmi && (
                <View style={[styles.bmiPreview, { backgroundColor: T.card }]}>
                  <Text style={[{ fontSize: 13, fontFamily: 'Nunito_700Bold' }, { color: T.textSub }]}>BMI Calculated: </Text>
                  <Text style={[{ fontSize: 18, fontFamily: 'Nunito_900Black' }, { color: bmi.col }]}>{bmi.value} — {bmi.cat}</Text>
                </View>
              )}
              <TouchableOpacity onPress={handleSave} activeOpacity={0.88} style={{ marginTop: 16 }}>
                <LinearGradient colors={['#0C4A6E','#0EA5E9']} style={styles.saveBtn}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Vitals</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  logBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  bmiCard: { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  bmiLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'Nunito_700Bold', marginBottom: 4 },
  bmiValue: { fontSize: 32, fontFamily: 'Nunito_900Black' },
  bmiCat: { fontSize: 13, fontFamily: 'Nunito_700Bold' },
  bmiScale: { flexDirection: 'row', gap: 10, marginTop: 4 },
  bmiScaleItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bmiScaleDot: { width: 8, height: 8, borderRadius: 4 },
  bmiScaleText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Nunito_400Regular' },
  latestRow: { flexDirection: 'row', gap: 20, marginTop: 8 },
  latestItem: { alignItems: 'center' },
  latestVal: { color: '#fff', fontSize: 18, fontFamily: 'Nunito_900Black' },
  latestKey: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_400Regular' },
  logBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 16 },
  logBannerText: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  sectionTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', marginBottom: 14 },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  vitalCard: { width: '47%', borderRadius: 14, padding: 14, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  vitalIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  vitalLabel: { fontSize: 12, fontFamily: 'Nunito_700Bold', marginBottom: 4 },
  vitalVal: { fontSize: 16, fontFamily: 'Nunito_900Black' },
  vitalUnit: { fontSize: 10, fontFamily: 'Nunito_400Regular' },
  vitalNormal: { fontSize: 10, fontFamily: 'Nunito_400Regular' },
  historyCard: { borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  historyDate: { borderRadius: 10, padding: 8, alignItems: 'center', justifyContent: 'center', minWidth: 50 },
  historyDateText: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: '#16A34A', textAlign: 'center' },
  historyValues: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyVal: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  historyBMI: { fontSize: 11, marginTop: 4, fontFamily: 'Nunito_400Regular' },
  historyNote: { fontSize: 11, marginTop: 2, fontStyle: 'italic', fontFamily: 'Nunito_400Regular' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHandle: { position: 'absolute', top: 8, left: '45%', width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  modalTitle: { fontSize: 17, fontFamily: 'Nunito_900Black' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  inputIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 22, flexShrink: 0 },
  inputLabel: { fontSize: 12, fontFamily: 'Nunito_700Bold', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  normalRange: { fontSize: 10, marginTop: 4, fontFamily: 'Nunito_400Regular' },
  bmiPreview: { borderRadius: 14, padding: 14, marginTop: 12, alignItems: 'center' },
  saveBtn: { borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_900Black' },
});
