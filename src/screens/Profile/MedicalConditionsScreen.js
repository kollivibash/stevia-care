import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const COMMON_CONDITIONS = ['Diabetes Type 2','Hypertension','PCOD/PCOS','Hypothyroidism','Asthma','Heart Disease','Arthritis','Migraine','Anemia','Depression/Anxiety','Obesity','Kidney Disease'];
const COMMON_MEDS = ['Metformin','Amlodipine','Aspirin','Atorvastatin','Paracetamol','Thyroxine','Insulin','Omeprazole','Vitamin D3','Calcium','Iron','B12'];

export default function MedicalConditionsScreen({ navigation }) {
  const { user, updateProfile } = useAuthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  const [conditions, setConditions] = useState(user?.conditions || '');
  const [medications, setMedications] = useState(user?.medications || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');

  const save = () => {
    updateProfile({ conditions: conditions.trim(), medications: medications.trim(), allergies: allergies.trim() });
    Alert.alert('✅ Updated', 'Medical information saved.');
    navigation.goBack();
  };

  const toggleChip = (val, current, setter) => {
    const parts = current.split(',').map(s => s.trim()).filter(Boolean);
    const exists = parts.some(p => p.toLowerCase() === val.toLowerCase());
    const updated = exists ? parts.filter(p => p.toLowerCase() !== val.toLowerCase()) : [...parts, val];
    setter(updated.join(', '));
  };

  const isActive = (val, current) => current.toLowerCase().includes(val.toLowerCase());

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#7F1D1D', '#EF4444']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Conditions</Text>
        <Text style={styles.headerSub}>Help us personalize your health insights</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

        <View style={[styles.card, { backgroundColor: T.card }]}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Conditions</Text>
          <Text style={[styles.hint, { color: T.textMuted }]}>Tap common conditions or type your own</Text>
          <View style={styles.chips}>
            {COMMON_CONDITIONS.map(c => (
              <TouchableOpacity key={c} style={[styles.chip, { backgroundColor: T.inputBg, borderColor: T.border }, isActive(c, conditions) && styles.chipOn]} onPress={() => toggleChip(c, conditions, setConditions)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: T.textSub }, isActive(c, conditions) && { color: '#EF4444', fontFamily: 'Nunito_800ExtraBold' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.inputWrap, { backgroundColor: T.inputBg, borderColor: T.border, marginTop: 12 }]}>
            <Ionicons name="medical-outline" size={18} color={T.textMuted} />
            <TextInput style={[styles.input, { color: T.text }]} placeholder="Type conditions, separated by commas" placeholderTextColor={T.textMuted} value={conditions} onChangeText={setConditions} multiline />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: T.card }]}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Current Medications</Text>
          <Text style={[styles.hint, { color: T.textMuted }]}>Medicines you take regularly</Text>
          <View style={styles.chips}>
            {COMMON_MEDS.map(m => (
              <TouchableOpacity key={m} style={[styles.chip, { backgroundColor: T.inputBg, borderColor: T.border }, isActive(m, medications) && { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]} onPress={() => toggleChip(m, medications, setMedications)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: T.textSub }, isActive(m, medications) && { color: '#10B981', fontFamily: 'Nunito_800ExtraBold' }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.inputWrap, { backgroundColor: T.inputBg, borderColor: T.border, marginTop: 12 }]}>
            <Ionicons name="medkit-outline" size={18} color={T.textMuted} />
            <TextInput style={[styles.input, { color: T.text }]} placeholder="Type medications, dosage, frequency..." placeholderTextColor={T.textMuted} value={medications} onChangeText={setMedications} multiline />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: T.card }]}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Allergies</Text>
          <View style={[styles.inputWrap, { backgroundColor: T.inputBg, borderColor: T.border }]}>
            <Ionicons name="warning-outline" size={18} color={T.textMuted} />
            <TextInput style={[styles.input, { color: T.text }]} placeholder="e.g. Penicillin, Sulfa, Pollen..." placeholderTextColor={T.textMuted} value={allergies} onChangeText={setAllergies} multiline />
          </View>
        </View>

        <TouchableOpacity onPress={save} activeOpacity={0.88} style={{ marginTop: 8 }}>
          <LinearGradient colors={['#7F1D1D', '#EF4444']} style={styles.saveBtn}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Medical Info</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  card: { borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  hint: { fontSize: 12, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  chipOn: { backgroundColor: '#FFF5F5', borderColor: '#EF4444' },
  chipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 14, fontFamily: 'Nunito_600SemiBold', minHeight: 40 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
});
