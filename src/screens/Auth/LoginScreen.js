// ─── Stevia Care — Login Screen (Premium UI) ──────────────────────────────
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import SteviaLogo from '../../components/SteviaLogo';

const FIREBASE_API_KEY = 'AIzaSyALp0aZr4aaueA4HLNyuC7uiBSLfVaciVo';

async function sendPasswordReset(email) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
      }
    );
    const data = await res.json();
    if (data.error) return { success: false, error: data.error.message };
    return { success: true };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export default function LoginScreen({ navigation }) {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [fpMode,    setFpMode]    = useState(false);
  const [fpEmail,   setFpEmail]   = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const { login, demoLogin, error, clearError } = useAuthStore();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    clearError();
    if (!email.trim()) { Alert.alert('Missing Email', 'Please enter your email address.'); return; }
    if (!password)     { Alert.alert('Missing Password', 'Please enter your password.'); return; }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) shake();
  };

  const handleForgotPassword = async () => {
    if (!fpEmail.trim()) { Alert.alert('Enter Email', 'Please enter your registered email address.'); return; }
    setFpLoading(true);
    const result = await sendPasswordReset(fpEmail.trim());
    setFpLoading(false);
    if (result.success) {
      Alert.alert('✅ Email Sent', `Reset link sent to ${fpEmail.trim()}. Check your inbox.`,
        [{ text: 'OK', onPress: () => { setFpMode(false); setFpEmail(''); } }]
      );
    } else {
      Alert.alert('Failed', result.error || 'Could not send reset email. Please try again.');
    }
  };

  const errorMsg = error ? (typeof error === 'string' ? error : 'Login failed. Please try again.') : null;

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
            <SteviaLogo size={72} showText animate />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

            {fpMode ? (
              /* ── Forgot Password Panel ── */
              <>
                <TouchableOpacity onPress={() => { setFpMode(false); setFpEmail(''); }} style={styles.backRow}>
                  <Ionicons name="arrow-back" size={16} color="#16A34A" />
                  <Text style={styles.backText}>Back to Sign In</Text>
                </TouchableOpacity>

                <View style={styles.iconBadge}>
                  <Ionicons name="key" size={22} color="#16A34A" />
                </View>
                <Text style={styles.cardTitle}>Reset Password</Text>
                <Text style={styles.cardSub}>Enter your email and we'll send a reset link</Text>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#8BA58D" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#A0AEB5"
                    value={fpEmail}
                    onChangeText={setFpEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>

                <TouchableOpacity onPress={handleForgotPassword} disabled={fpLoading} activeOpacity={0.88} style={{ marginTop: 24 }}>
                  <LinearGradient colors={['#14532D', '#16A34A']} style={styles.loginBtn}>
                    {fpLoading
                      ? <Text style={styles.loginBtnText}>Sending...</Text>
                      : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.loginBtnText}>Send Reset Link</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              /* ── Sign In Panel ── */
              <>
                <View style={styles.iconBadge}>
                  <Ionicons name="leaf" size={22} color="#16A34A" />
                </View>
                <Text style={styles.cardTitle}>Welcome back 👋</Text>
                <Text style={styles.cardSub}>Sign in to your Stevia Care account</Text>

                {errorMsg ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#8BA58D" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#A0AEB5"
                    value={email}
                    onChangeText={t => { clearError(); setEmail(t); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#8BA58D" />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#A0AEB5"
                    value={password}
                    onChangeText={t => { clearError(); setPassword(t); }}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8BA58D" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => { setFpMode(true); setFpEmail(email); }} style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.88} style={{ marginTop: 8 }}>
                  <LinearGradient colors={['#14532D', '#16A34A']} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {loading
                      ? <Text style={styles.loginBtnText}>Signing in...</Text>
                      : <><Ionicons name="log-in-outline" size={18} color="#fff" /><Text style={styles.loginBtnText}>Sign In</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.divLine} /><Text style={styles.divText}>or</Text><View style={styles.divLine} />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')} style={styles.altBtn} activeOpacity={0.85}>
                  <Ionicons name="phone-portrait-outline" size={18} color="#16A34A" />
                  <Text style={styles.altBtnText}>Sign in with Mobile OTP</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { clearError(); demoLogin(); }} style={[styles.altBtn, { marginTop: 10, borderColor: '#E8F0E9', backgroundColor: '#F5FAF6' }]} activeOpacity={0.85}>
                  <Ionicons name="play-circle-outline" size={18} color="#16A34A" />
                  <Text style={styles.altBtnText}>Try Demo Account</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
                  <Text style={styles.registerText}>
                    Don't have an account? <Text style={styles.registerLink}>Create one →</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:         { paddingBottom: 52, overflow: 'hidden' },
  orb1:         { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)', top: -70, right: -70 },
  orb2:         { position: 'absolute', width: 150, height: 150, borderRadius: 75,  backgroundColor: 'rgba(255,255,255,0.04)', bottom: 0, left: -50 },
  heroContent:  { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  scroll:       { padding: 16, paddingTop: 0, paddingBottom: 48 },
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
  backRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText:     { color: '#16A34A', fontFamily: 'Nunito_700Bold', fontSize: 14 },
  iconBadge:    { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#DCFCE7' },
  cardTitle:    { fontSize: 26, fontFamily: 'Nunito_900Black', color: '#0D1F12', marginBottom: 4 },
  cardSub:      { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#6B7280', marginBottom: 24 },
  errorBox:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorText:    { flex: 1, fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#EF4444', lineHeight: 18 },
  label:        { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#4B6B52', marginBottom: 8, marginTop: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5FAF6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#E8F0E9' },
  input:        { flex: 1, fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: '#0D1F12' },
  forgotRow:    { alignSelf: 'flex-end', marginTop: 12 },
  forgotText:   { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#16A34A' },
  loginBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16 },
  loginBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },
  divider:      { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  divLine:      { flex: 1, height: 1, backgroundColor: '#E8F0E9' },
  divText:      { marginHorizontal: 14, color: '#94A3B8', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  altBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  altBtnText:   { color: '#16A34A', fontSize: 15, fontFamily: 'Nunito_700Bold' },
  registerRow:  { alignItems: 'center', marginTop: 22 },
  registerText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#64748B' },
  registerLink: { color: '#16A34A', fontFamily: 'Nunito_800ExtraBold' },
});
