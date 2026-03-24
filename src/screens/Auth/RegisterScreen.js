// ─── Stevia Care — Register Screen (Premium UI) ────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import SteviaLogo from '../../components/SteviaLogo';

const GENDERS = [
  { key: 'female', label: '👩 Female' },
  { key: 'male',   label: '👨 Male'   },
  { key: 'other',  label: '🧑 Other'  },
];

export default function RegisterScreen({ navigation }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [age,      setAge]      = useState('');
  const [gender,   setGender]   = useState('female');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { register, demoLogin, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    clearError();
    if (!name.trim())        { Alert.alert('Missing Name', 'Please enter your full name.'); return; }
    if (!email.trim())       { Alert.alert('Missing Email', 'Please enter your email.'); return; }
    if (password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }
    if (!age)                { Alert.alert('Missing Age', 'Please enter your age.'); return; }
    setLoading(true);
    const result = await register(name, email, password, age, gender);
    setLoading(false);
    if (!result.success) Alert.alert('Registration Failed', result.error || 'Please try again.');
  };

  const fields = [
    { label: 'Full Name',     icon: 'person-outline',   value: name,     set: setName,     placeholder: 'Rahul Sharma',    type: 'default',       secure: false },
    { label: 'Email Address', icon: 'mail-outline',     value: email,    set: setEmail,    placeholder: 'you@example.com', type: 'email-address', secure: false },
    { label: 'Age',           icon: 'calendar-outline', value: age,      set: setAge,      placeholder: '28',              type: 'numeric',       secure: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F0FDF4' }}>
      <LinearGradient
        colors={['#052E16', '#14532D', '#166534', '#16A34A']}
        style={styles.hero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <SteviaLogo size={60} showText={false} animate />
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSub}>Join 10,000+ Indian families on Stevia Care</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>

            <View style={styles.iconBadge}>
              <Ionicons name="person-add" size={22} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Let's get started 🚀</Text>
            <Text style={styles.cardSub}>Fill in your details to create your free account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Registration failed.'}</Text>
              </View>
            ) : null}

            {fields.map(f => (
              <View key={f.label}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={f.icon} size={18} color="#8BA58D" />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#A0AEB5"
                    value={f.value}
                    onChangeText={t => { clearError(); f.set(t); }}
                    keyboardType={f.type}
                    autoCapitalize={f.type === 'email-address' ? 'none' : 'words'}
                    autoCorrect={false}
                  />
                </View>
              </View>
            ))}

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#8BA58D" />
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor="#A0AEB5"
                value={password}
                onChangeText={t => { clearError(); setPassword(t); }}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8BA58D" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.genderBtn, gender === g.key && styles.genderBtnActive]}
                  onPress={() => setGender(g.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderText, gender === g.key && styles.genderTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.88} style={{ marginTop: 28 }}>
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
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Sign In →</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:            { paddingBottom: 48, overflow: 'hidden' },
  orb1:            { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -50 },
  orb2:            { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: 'rgba(255,255,255,0.04)', bottom: 10, left: -30 },
  heroContent:     { alignItems: 'center', paddingTop: 20, paddingBottom: 12, gap: 8 },
  backBtn:         { position: 'absolute', left: 20, top: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroTitle:       { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black', marginTop: 4 },
  heroSub:         { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  scroll:          { padding: 16, paddingTop: 0, paddingBottom: 48 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    marginTop: -24,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  iconBadge:       { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1.5, borderColor: '#DCFCE7' },
  cardTitle:       { fontSize: 24, fontFamily: 'Nunito_900Black', color: '#0D1F12', marginBottom: 4 },
  cardSub:         { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#6B7280', marginBottom: 20 },
  errorBox:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorText:       { flex: 1, fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#EF4444' },
  label:           { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#4B6B52', marginBottom: 8, marginTop: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5FAF6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#E8F0E9' },
  input:           { flex: 1, fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: '#0D1F12' },
  genderRow:       { flexDirection: 'row', gap: 10 },
  genderBtn:       { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 14, backgroundColor: '#F5FAF6', borderWidth: 1.5, borderColor: '#E8F0E9' },
  genderBtnActive: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  genderText:      { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#6B7280' },
  genderTextActive:{ color: '#16A34A' },
  registerBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16 },
  registerBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },
  divider:         { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  divLine:         { flex: 1, height: 1, backgroundColor: '#E8F0E9' },
  divText:         { marginHorizontal: 14, color: '#94A3B8', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  demoBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  demoBtnText:     { color: '#16A34A', fontSize: 15, fontFamily: 'Nunito_700Bold' },
  loginRow:        { alignItems: 'center', marginTop: 22 },
  loginText:       { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#64748B' },
  loginLink:       { color: '#16A34A', fontFamily: 'Nunito_800ExtraBold' },
});
