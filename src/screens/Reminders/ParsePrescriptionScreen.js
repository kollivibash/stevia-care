import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { ScreenHeader, Button, Card, LoadingOverlay } from '../../components';
import { parsePrescription } from '../../services/aiService';
import { useHealthStore } from '../../store/healthStore';

const DEMO_PRESCRIPTION = `Tab. Metformin 500mg - 1-0-1 (After meals) x 30 days
Tab. Atorvastatin 10mg - 0-0-1 (At bedtime) x 30 days
Tab. Aspirin 75mg - 1-0-0 (After breakfast) x 30 days
Syr. Vitamin D3 60000 IU - Once a week x 8 weeks
Tab. Pantoprazole 40mg - 1-0-0 (Before breakfast) x 14 days`;

const MEDICINE_COLORS = ['#8B5CF6', '#0057B8', '#F59E0B', '#10B981', '#EC4899', '#EF4444', '#3B82F6'];

export default function ParsePrescriptionScreen({ navigation }) {
  const [prescriptionText, setPrescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addReminder, familyMembers } = useHealthStore();
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]?.id || '');

  const handleParse = async () => {
    const text = prescriptionText.trim();
    if (!text) { Alert.alert('Enter prescription text first'); return; }

    setLoading(true);
    try {
      const parsed = await parsePrescription({ prescriptionText: text });
      setResult(parsed);
    } catch (e) {
      Alert.alert('Parse Failed', e.message || 'Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReminder = () => {
    if (!result?.medications?.length) return;
    const member = familyMembers.find(m => m.id === selectedMember);
    addReminder({
      memberId: selectedMember,
      memberName: member?.name || 'Family Member',
      medicines: result.medications.map((med, i) => ({
        name: `${med.name}${med.dosage ? ' ' + med.dosage : ''}`,
        generic_name: med.generic_name,
        times: med.times || ['08:00'],
        withFood: med.with_food,
        duration_days: med.duration_days,
        color: MEDICINE_COLORS[i % MEDICINE_COLORS.length],
        instructions: med.special_instructions,
      })),
    });
    Alert.alert('✅ Reminders Saved', 'Medicine reminders have been created!', [
      { text: 'View Reminders', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {loading && <LoadingOverlay message="AI is reading the prescription..." />}
      <ScreenHeader title="Parse Prescription" subtitle="AI extracts medicine schedule" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Member Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>For which family member?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {familyMembers.map(m => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedMember(m.id)}
                style={[styles.memberChip, selectedMember === m.id && styles.memberChipActive]}
              >
                <Text style={styles.memberEmoji}>{m.avatar}</Text>
                <Text style={[styles.memberChipText, selectedMember === m.id && styles.memberChipTextActive]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Prescription Text</Text>
          <TextInput
            style={styles.prescriptionInput}
            value={prescriptionText}
            onChangeText={setPrescriptionText}
            placeholder="Type or paste your prescription here..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.demoBtn} onPress={() => setPrescriptionText(DEMO_PRESCRIPTION)}>
            <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
            <Text style={styles.demoBtnText}>Load demo prescription</Text>
          </TouchableOpacity>

          <Button title="Parse with AI" icon="scan" onPress={handleParse} style={styles.parseBtn} />
        </View>

        {/* Results */}
        {result && result.medications && (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
              <Text style={styles.resultTitle}>
                {result.medications.length} medicine{result.medications.length !== 1 ? 's' : ''} found
              </Text>
            </View>

            {result.medications.map((med, i) => (
              <Card key={i} style={styles.medResultCard}>
                <View style={[styles.medColorBar, { backgroundColor: MEDICINE_COLORS[i % MEDICINE_COLORS.length] }]} />
                <View style={styles.medResultContent}>
                  <Text style={styles.medResultName}>{med.name} {med.dosage}</Text>
                  {med.generic_name && <Text style={styles.medGeneric}>{med.generic_name}</Text>}
                  <View style={styles.medResultMeta}>
                    <MetaChip icon="time-outline" label={med.times?.join(', ') || med.frequency} />
                    {med.with_food && <MetaChip icon="restaurant-outline" label="With food" />}
                    {med.duration_days && <MetaChip icon="calendar-outline" label={`${med.duration_days} days`} />}
                  </View>
                  {med.special_instructions && (
                    <Text style={styles.medInstructions}>{med.special_instructions}</Text>
                  )}
                </View>
              </Card>
            ))}

            {result.general_advice?.length > 0 && (
              <Card style={styles.adviceCard}>
                <Text style={styles.adviceTitle}>General Advice</Text>
                {result.general_advice.map((a, i) => (
                  <Text key={i} style={styles.adviceText}>• {a}</Text>
                ))}
              </Card>
            )}

            {result.food_restrictions?.length > 0 && (
              <Card style={[styles.adviceCard, { borderLeftColor: COLORS.warning }]}>
                <Text style={[styles.adviceTitle, { color: COLORS.warning }]}>⚠️ Food Restrictions</Text>
                {result.food_restrictions.map((r, i) => (
                  <Text key={i} style={styles.adviceText}>• {r}</Text>
                ))}
              </Card>
            )}

            <Button title="Save Reminders for Selected Member" icon="alarm" onPress={handleSaveReminder} style={{ marginTop: 8 }} />
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaChip({ icon, label }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={11} color={COLORS.textMuted} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding },
  section: { marginBottom: 20 },
  label: { fontSize: SIZES.sm, fontFamily: 'Nunito_600SemiBold', color: COLORS.textSecondary, marginBottom: 10 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusFull,
    paddingHorizontal: 14, paddingVertical: 10, marginRight: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  memberChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  memberEmoji: { fontSize: 16 },
  memberChipText: { fontSize: SIZES.sm, fontFamily: 'Nunito_600SemiBold', color: COLORS.textSecondary },
  memberChipTextActive: { color: COLORS.white },
  prescriptionInput: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: COLORS.border,
    padding: 14, minHeight: 160, fontSize: SIZES.sm,
    color: COLORS.textPrimary, lineHeight: 20, ...SHADOWS.small,
  },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, justifyContent: 'center',
  },
  demoBtnText: { color: COLORS.primary, fontSize: SIZES.sm, fontFamily: 'Nunito_600SemiBold' },
  parseBtn: { marginTop: 4 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  resultTitle: { fontSize: SIZES.md, fontFamily: 'Nunito_700Bold', color: COLORS.textPrimary },
  medResultCard: { marginBottom: 10, padding: 14, overflow: 'hidden' },
  medColorBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2 },
  medResultContent: { paddingLeft: 10 },
  medResultName: { fontSize: SIZES.base, fontFamily: 'Nunito_700Bold', color: COLORS.textPrimary },
  medGeneric: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  medResultMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  medInstructions: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 6, fontStyle: 'italic' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.inputBg, borderRadius: SIZES.radiusFull,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  metaChipText: { fontSize: 11, color: COLORS.textSecondary },
  adviceCard: {
    marginBottom: 10, borderLeftWidth: 3, borderLeftColor: COLORS.accent, paddingLeft: 16,
  },
  adviceTitle: { fontSize: SIZES.sm, fontFamily: 'Nunito_700Bold', color: COLORS.accentDark, marginBottom: 8 },
  adviceText: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 4 },
});
