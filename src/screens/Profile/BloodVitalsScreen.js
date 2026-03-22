import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ORGAN_DONOR = ['Yes, I am an organ donor', 'No', 'Not decided yet'];

export default function BloodVitalsScreen({ navigation }) {
  const { user, updateProfile } = useAuthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [organDonor, setOrganDonor]   = useState(user?.organDonor || '');

  const save = () => {
    updateProfile({ bloodGroup, organDonor });
    Alert.alert('✅ Saved', 'Blood & vitals info updated.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood & Vitals</Text>
        <Text style={styles.headerSub}>Critical info for emergency situations</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        <View style={[styles.card, { backgroundColor: T.card }]}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Blood Group</Text>
          <Text style={[styles.hint, { color: T.textMuted }]}>Used in emergency SOS alerts</Text>
          <View style={styles.chips}>
            {BLOOD_GROUPS.map(bg => (
              <TouchableOpacity key={bg} style={[styles.chip, { backgroundColor: T.inputBg, borderColor: T.border }, bloodGroup === bg && { backgroundColor: '#FFF5F5', borderColor: '#EF4444' }]} onPress={() => setBloodGroup(bg)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: T.textSub }, bloodGroup === bg && { color: '#EF4444', fontWeight: '900' }]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: T.card }]}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Organ Donor Status</Text>
          {ORGAN_DONOR.map(opt => (
            <TouchableOpacity key={opt} style={[styles.optionRow, { borderColor: T.border }, organDonor === opt && { backgroundColor: '#EFF5FF', borderColor: '#0057B8' }]} onPress={() => setOrganDonor(opt)} activeOpacity={0.85}>
              <View style={[styles.radio, { borderColor: organDonor === opt ? '#0057B8' : T.textMuted }]}>
                {organDonor === opt && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, { color: T.text }, organDonor === opt && { color: '#0057B8', fontWeight: '700' }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
          <Ionicons name="information-circle" size={18} color="#D97706" />
          <Text style={styles.infoText}>Go to Health → Vitals & BMI to log your blood pressure, blood sugar, SpO2, temperature and more.</Text>
        </View>

        <TouchableOpacity onPress={save} activeOpacity={0.88} style={{ marginTop: 8 }}>
          <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.saveBtn}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Info</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  card: { borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  hint: { fontSize: 12, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontWeight: '700' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 10 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0057B8' },
  optionText: { fontSize: 14, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 14 },
  infoText: { flex: 1, fontSize: 12, color: '#D97706', lineHeight: 18 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
