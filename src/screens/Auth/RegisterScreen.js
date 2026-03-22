import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

const GENDERS = [
  { key: 'female', label: '👩 Female' },
  { key: 'male',   label: '👨 Male'   },
  { key: 'other',  label: '🧑 Other'  },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge]           = useState('');
  const [gender, setGender]     = useState('female');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register, demoLogin, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    clearError();
    if (!name.trim())     { Alert.alert('Enter your name'); return; }
    if (!email.trim())    { Alert.alert('Enter your email'); return; }
    if (password.length < 6) { Alert.alert('Password must be at least 6 characters'); return; }
    if (!age)             { Alert.alert('Enter your age'); return; }
    setLoading(true);
    const result = await register(name, email, password, age, gender);
    setLoading(false);
    if (!result.success) Alert.alert('Registration Failed', result.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FF' }}>
      <LinearGradient colors={['#14532D', '#16A34A', '#4ADE80']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.logoRing}>
              <Ionicons name="leaf" size={30} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSub}>Join Stevia Care for free</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {[
              { label: 'Full Name',     icon: 'person-outline',      value: name,     set: setName,     placeholder: 'Your full name',     type: 'default',       secure: false },
              { label: 'Email Address', icon: 'mail-outline',        value: email,    set: setEmail,    placeholder: 'you@example.com',    type: 'email-address', secure: false },
              { label: 'Age',           icon: 'calendar-outline',    value: age,      set: setAge,      placeholder: 'Your age',           type: 'numeric',       secure: false },
            ].map(f => (
              <View key={f.label}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={f.icon} size={18} color="#94A3B8" />
                  <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor="#CBD5E1" value={f.value} onChangeText={f.set} keyboardType={f.type} autoCapitalize="none" />
                </View>
              </View>
            ))}

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
              <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor="#CBD5E1" value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity key={g.key} style={[styles.genderBtn, gender === g.key && styles.genderBtnActive]} onPress={() => setGender(g.key)} activeOpacity={0.8}>
                  <Text style={[styles.genderText, gender === g.key && styles.genderTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.88} style={{ marginTop: 20 }}>
              <LinearGradient colors={['#14532D', '#16A34A']} style={styles.registerBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.registerBtnText}>{loading ? 'Creating Account...' : 'Create Account 🚀'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.divLine} /><Text style={styles.divText}>or</Text><View style={styles.divLine} />
            </View>

            <TouchableOpacity onPress={demoLogin} style={styles.demoBtn} activeOpacity={0.85}>
              <Ionicons name="play-circle-outline" size={18} color="#16A34A" />
              <Text style={styles.demoBtnText}>Try Demo Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Sign In →</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 36 },
  heroContent: { alignItems: 'center', paddingTop: 16, paddingBottom: 8, gap: 8 },
  backBtn: { position: 'absolute', left: 20, top: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  logoRing: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  scroll: { padding: 16, paddingTop: 0, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginTop: -16, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 10 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, fontSize: 13, color: '#EF4444', fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 7, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F7FF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5, borderColor: '#E2E8F4' },
  input: { flex: 1, fontSize: 15, color: '#0F1729', fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, backgroundColor: '#F5F7FF', borderWidth: 1.5, borderColor: '#E2E8F4' },
  genderBtnActive: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  genderText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  genderTextActive: { color: '#16A34A' },
  registerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 15 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: '#E2E8F4' },
  divText: { marginHorizontal: 14, color: '#94A3B8', fontSize: 13 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  demoBtnText: { color: '#16A34A', fontSize: 14, fontWeight: '700' },
  loginRow: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 13, color: '#64748B' },
  loginLink: { color: '#16A34A', fontWeight: '800' },
});
