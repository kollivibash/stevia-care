import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendHealthChatMessage } from '../../services/aiService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
  'Chest pain', 'Back pain', 'Dizziness', 'Shortness of breath', 'Sore throat',
  'Joint pain', 'Stomach ache', 'Vomiting', 'Skin rash', 'Anxiety',
];

const URGENCY_CONFIG = {
  emergency: { color: '#EF4444', bg: '#FFF5F5', icon: 'alert-circle',    label: '🚨 Go to Emergency',      border: '#FECACA' },
  doctor:    { color: '#F59E0B', bg: '#FFFBEB', icon: 'medical',          label: '👨‍⚕️ See a Doctor Soon', border: '#FDE68A' },
  monitor:   { color: '#3B82F6', bg: '#EFF5FF', icon: 'eye-outline',      label: '👁️ Monitor at Home',    border: '#BFDBFE' },
  home:      { color: '#10B981', bg: '#ECFDF5', icon: 'home-outline',     label: '🏠 Home Remedies OK',    border: '#A7F3D0' },
};

export default function SymptomCheckerScreen({ navigation }) {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [selected, setSelected] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const allSymptoms = [
    ...selected,
    ...customInput.split(',').map(s => s.trim()).filter(Boolean),
  ];

  const handleCheck = async () => {
    if (allSymptoms.length === 0) return;
    setLoading(true);
    setResult(null);

    const prompt = `You are a medical AI assistant. A patient reports these symptoms: ${allSymptoms.join(', ')}.
${age ? `Age: ${age}.` : ''} ${gender ? `Gender: ${gender}.` : ''}
Respond ONLY with valid JSON, no markdown, no extra text:
{
  "possibleConditions": [{"name":"string","probability":"High|Medium|Low","description":"string"}],
  "urgency": "emergency|doctor|monitor|home",
  "urgencyReason": "string",
  "redFlags": ["string"],
  "homeRemedies": ["string"],
  "whenToSeeDoctor": "string",
  "disclaimer": "string"
}`;

    try {
      // sendHealthChatMessage expects { messages, userProfile }
      const text = await sendHealthChatMessage({
        messages: [{ role: 'user', content: prompt }],
        userProfile: {
          age: age || user?.age || 'unknown',
          gender: gender || user?.gender || 'unknown',
          conditions: user?.conditions || 'none',
          medications: user?.medications || 'none',
        },
      });
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
    } catch (e) {
      setResult({ error: 'Could not analyze symptoms. Please check your API key and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const urgency = result?.urgency ? URGENCY_CONFIG[result.urgency] : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* HEADER */}
          <LinearGradient colors={['#065F46', '#059669', '#34D399']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.orb} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.eyebrow}>AI HEALTH ASSISTANT</Text>
            <Text style={styles.title}>Symptom Checker</Text>
            <Text style={styles.sub}>Select symptoms and get instant AI health insights</Text>
            <View style={styles.noticeBadge}>
              <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.noticeText}>For information only. Not a medical diagnosis.</Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>

            {/* PATIENT INFO */}
            <View style={[styles.card, { backgroundColor: T.card }]}>
              <Text style={[styles.cardTitle, { color: T.text }]}>Patient Info <Text style={styles.optional}>(optional)</Text></Text>
              <View style={styles.infoRow}>
                <View style={styles.infoField}>
                  <Text style={[styles.infoLabel, { color: T.textSub }]}>Age</Text>
                  <TextInput style={[styles.infoInput, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} placeholder="e.g. 32" placeholderTextColor={T.textMuted} keyboardType="numeric" value={age} onChangeText={setAge} />
                </View>
                <View style={styles.infoField}>
                  <Text style={[styles.infoLabel, { color: T.textSub }]}>Gender</Text>
                  <View style={styles.genderRow}>
                    {['Male', 'Female'].map(g => (
                      <TouchableOpacity key={g} style={[styles.genderBtn, { backgroundColor: T.inputBg, borderColor: T.border }, gender === g && styles.genderActive]} onPress={() => setGender(gender === g ? '' : g)}>
                        <Text style={[styles.genderText, { color: T.textSub }, gender === g && styles.genderTextActive]}>{g === 'Male' ? '👨' : '👩'} {g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* SYMPTOM CHIPS */}
            <View style={[styles.card, { backgroundColor: T.card }]}>
              <Text style={[styles.cardTitle, { color: T.text }]}>Common Symptoms</Text>
              <Text style={styles.cardSub}>Tap all that apply</Text>
              <View style={styles.chips}>
                {COMMON_SYMPTOMS.map(s => {
                  const on = selected.includes(s);
                  return (
                    <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: T.cardAlt, borderColor: T.border }, on && styles.chipOn]} onPress={() => toggle(s)} activeOpacity={0.8}>
                      {on && <Ionicons name="checkmark" size={11} color="#fff" />}
                      <Text style={[styles.chipText, { color: T.text }, on && styles.chipTextOn]}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* CUSTOM SYMPTOMS */}
            <View style={[styles.card, { backgroundColor: T.card }]}>
              <Text style={[styles.cardTitle, { color: T.text }]}>Other Symptoms</Text>
              <Text style={styles.cardSub}>Separate with commas</Text>
              <View style={[styles.customBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                <Ionicons name="create-outline" size={18} color={T.textMuted} />
                <TextInput style={[styles.customInput, { color: T.text }]} placeholder="e.g. blurry vision, swollen feet..." placeholderTextColor={T.textMuted} value={customInput} onChangeText={setCustomInput} multiline />
              </View>
            </View>

            {/* SELECTED COUNT */}
            {allSymptoms.length > 0 && (
              <View style={styles.selectedBar}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={[styles.selectedText, { color: T.text }]}>
                  <Text style={styles.selectedCount}>{allSymptoms.length}</Text> symptom{allSymptoms.length > 1 ? 's' : ''} selected
                </Text>
              </View>
            )}

            {/* ANALYZE BUTTON */}
            <TouchableOpacity onPress={handleCheck} disabled={loading || allSymptoms.length === 0} activeOpacity={0.88} style={[styles.analyzeBtn, allSymptoms.length === 0 && { opacity: 0.45 }]}>
              <LinearGradient colors={['#065F46', '#059669']} style={styles.analyzeBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <><ActivityIndicator color="#fff" size="small" /><Text style={styles.analyzeBtnText}>Analyzing with AI...</Text></>
                  : <><Ionicons name="sparkles" size={20} color="#fff" /><Text style={styles.analyzeBtnText}>Analyze Symptoms</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* RESULTS */}
            {result && !result.error && (
              <View style={{ gap: 14 }}>
                {urgency && (
                  <View style={[styles.urgencyCard, { backgroundColor: urgency.bg, borderColor: urgency.border }]}>
                    <Ionicons name={urgency.icon} size={28} color={urgency.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.urgencyLabel, { color: urgency.color }]}>{urgency.label}</Text>
                      <Text style={[styles.urgencyReason, { color: T.textSub }]}>{result.urgencyReason}</Text>
                    </View>
                  </View>
                )}

                <View style={[styles.resultCard, { backgroundColor: T.card }]}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="medical" size={18} color="#16A34A" />
                    <Text style={[styles.resultTitle, { color: T.text }]}>Possible Conditions</Text>
                  </View>
                  {result.possibleConditions?.map((c, i) => {
                    const pc = c.probability === 'High' ? '#EF4444' : c.probability === 'Medium' ? '#F59E0B' : '#10B981';
                    return (
                      <View key={i} style={[styles.condRow, i > 0 && { borderTopWidth: 1, borderTopColor: T.border }]}>
                        <View style={{ flex: 1, paddingTop: i > 0 ? 10 : 0 }}>
                          <Text style={[styles.condName, { color: T.text }]}>{c.name}</Text>
                          <Text style={[styles.condDesc, { color: T.textSub }]}>{c.description}</Text>
                        </View>
                        <View style={[styles.probPill, { backgroundColor: pc + '20', marginTop: i > 0 ? 10 : 0 }]}>
                          <Text style={[styles.probText, { color: pc }]}>{c.probability}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {result.redFlags?.length > 0 && (
                  <View style={[styles.resultCard, { backgroundColor: T.card, borderLeftWidth: 3, borderLeftColor: '#EF4444' }]}>
                    <View style={styles.resultHeader}>
                      <Ionicons name="warning" size={18} color="#EF4444" />
                      <Text style={[styles.resultTitle, { color: '#EF4444' }]}>Red Flags — Seek Help Immediately</Text>
                    </View>
                    {result.redFlags.map((f, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <View style={[styles.bullet, { backgroundColor: '#EF4444' }]} />
                        <Text style={[styles.bulletText, { color: T.text }]}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.homeRemedies?.length > 0 && (
                  <View style={[styles.resultCard, { backgroundColor: T.card, borderLeftWidth: 3, borderLeftColor: '#10B981' }]}>
                    <View style={styles.resultHeader}>
                      <Ionicons name="leaf" size={18} color="#10B981" />
                      <Text style={[styles.resultTitle, { color: '#10B981' }]}>Home Remedies</Text>
                    </View>
                    {result.homeRemedies.map((r, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bulletNum}>{i + 1}</Text>
                        <Text style={[styles.bulletText, { color: T.text }]}>{r}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.whenToSeeDoctor && (
                  <View style={[styles.resultCard, { backgroundColor: T.card, borderWidth: 1, borderColor: '#FDE68A' }]}>
                    <View style={styles.resultHeader}>
                      <Ionicons name="time-outline" size={18} color="#D97706" />
                      <Text style={[styles.resultTitle, { color: '#D97706' }]}>When to See a Doctor</Text>
                    </View>
                    <Text style={[styles.doctorText, { color: T.text }]}>{result.whenToSeeDoctor}</Text>
                  </View>
                )}

                <View style={[styles.disclaimer, { backgroundColor: T.cardAlt }]}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#94A3B8" />
                  <Text style={styles.disclaimerText}>{result.disclaimer || 'AI-generated info for educational purposes only. Always consult a qualified doctor.'}</Text>
                </View>
              </View>
            )}

            {result?.error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
                <Text style={styles.errorText}>{result.error}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, overflow: 'hidden' },
  orb: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.05)', top: -100, right: -60 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eyebrow: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 14 },
  noticeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  noticeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, flex: 1 },
  body: { padding: 16, gap: 14 },
  card: { borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  optional: { fontSize: 12, fontWeight: '500', color: '#94A3B8' },
  cardSub: { fontSize: 12, color: '#94A3B8', marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 14 },
  infoField: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  infoInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontWeight: '700', borderWidth: 1 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  genderActive: { backgroundColor: '#ECFDF5', borderColor: '#059669' },
  genderText: { fontSize: 12, fontWeight: '700' },
  genderTextActive: { color: '#059669' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipOn: { backgroundColor: '#059669', borderColor: '#059669' },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  customBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  customInput: { flex: 1, fontSize: 14, lineHeight: 20, minHeight: 40 },
  selectedBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  selectedText: { fontSize: 13 },
  selectedCount: { fontWeight: '800', color: '#059669' },
  analyzeBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  analyzeBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  urgencyCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1.5 },
  urgencyLabel: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  urgencyReason: { fontSize: 12, lineHeight: 17 },
  resultCard: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultTitle: { fontSize: 14, fontWeight: '800' },
  condRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingBottom: 10 },
  condName: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  condDesc: { fontSize: 12, lineHeight: 17 },
  probPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  probText: { fontSize: 11, fontWeight: '800' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 5 },
  bullet: { width: 7, height: 7, borderRadius: 3.5, marginTop: 6 },
  bulletNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#ECFDF5', textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#059669', lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 19 },
  doctorText: { fontSize: 13, lineHeight: 20 },
  disclaimer: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderRadius: 12, padding: 14 },
  disclaimerText: { flex: 1, fontSize: 11, color: '#94A3B8', lineHeight: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF5F5', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, fontSize: 13, color: '#EF4444', fontWeight: '600' },
});
