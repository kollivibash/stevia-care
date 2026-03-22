import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function PersonalInfoScreen({ navigation }) {
  const { user, updateProfile } = useAuthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  const [name, setName]           = useState(user?.name || '');
  const [age, setAge]             = useState(String(user?.age || ''));
  const [gender, setGender]       = useState(user?.gender || 'female');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [email, setEmail]         = useState(user?.email || '');
  const [phone, setPhone]         = useState(user?.phone || '');

  const save = () => {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    updateProfile({ name: name.trim(), age: parseInt(age) || user?.age, gender, bloodGroup, email: email.trim(), phone: phone.trim() });
    Alert.alert('✅ Profile Updated', 'Your personal info has been saved.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#003087', '#0057B8']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Info</Text>
        <Text style={styles.headerSub}>Update your basic profile information</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: T.card, shadowColor: T.shadow }]}>

          {[
            { label: 'Full Name',     icon: 'person-outline',  value: name,  set: setName,  placeholder: 'Your full name',       type: 'default'       },
            { label: 'Age',           icon: 'calendar-outline',value: age,   set: setAge,   placeholder: 'Your age',             type: 'numeric'       },
            { label: 'Email Address', icon: 'mail-outline',    value: email, set: setEmail, placeholder: 'you@example.com',      type: 'email-address' },
            { label: 'Phone Number',  icon: 'call-outline',    value: phone, set: setPhone, placeholder: '10-digit number',     type: 'phone-pad'     },
          ].map(f => (
            <View key={f.label}>
              <Text style={[styles.label, { color: T.textSub }]}>{f.label}</Text>
              <View style={[styles.inputWrap, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                <Ionicons name={f.icon} size={18} color={T.textMuted} />
                <TextInput style={[styles.input, { color: T.text }]} placeholder={f.placeholder} placeholderTextColor={T.textMuted} value={f.value} onChangeText={f.set} keyboardType={f.type} autoCapitalize="none" />
              </View>
            </View>
          ))}

          <Text style={[styles.label, { color: T.textSub }]}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDERS.map(g => (
              <TouchableOpacity key={g} style={[styles.chip, { backgroundColor: T.inputBg, borderColor: T.border }, gender.toLowerCase() === g.toLowerCase() && styles.chipActive]} onPress={() => setGender(g.toLowerCase())} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: T.textSub }, gender.toLowerCase() === g.toLowerCase() && { color: '#0057B8', fontWeight: '800' }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: T.textSub }]}>Blood Group</Text>
          <View style={styles.chipRow}>
            {BLOOD_GROUPS.map(bg => (
              <TouchableOpacity key={bg} style={[styles.chip, { backgroundColor: T.inputBg, borderColor: T.border }, bloodGroup === bg && styles.chipActive]} onPress={() => setBloodGroup(bg)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: T.textSub }, bloodGroup === bg && { color: '#EF4444', fontWeight: '800' }]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={save} activeOpacity={0.88} style={{ marginTop: 16 }}>
          <LinearGradient colors={['#003087', '#0057B8']} style={styles.saveBtn}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  card: { borderRadius: 20, padding: 18, marginBottom: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5, gap: 4 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  chipActive: { backgroundColor: '#EFF5FF', borderColor: '#0057B8' },
  chipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
