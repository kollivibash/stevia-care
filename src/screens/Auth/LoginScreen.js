import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

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
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [fpMode,     setFpMode]     = useState(false);   // forgot-password mode
  const [fpEmail,    setFpEmail]    = useState('');
  const [fpLoading,  setFpLoading]  = useState(false);
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
    if (!email.trim()) { Alert.alert('Missing email', 'Please enter your email address.'); return; }
    if (!password)     { Alert.alert('Missing password', 'Please enter your password.'); return; }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) shake();
  };

  const handleDemo = () => {
    clearError();
    demoLogin();
  };

  const handleForgotPassword = async () => {
    if (!fpEmail.trim()) {
      Alert.alert('Enter Email', 'Please enter your registered email address.');
      return;
    }
    setFpLoading(true);
    const result = await sendPasswordReset(fpEmail.trim());
    setFpLoading(false);
    if (result.success) {
      Alert.alert(
        '✅ Email Sent',
        `A password reset link has been sent to ${fpEmail.trim()}. Check your inbox (and spam folder).`,
        [{ text: 'OK', onPress: () => { setFpMode(false); setFpEmail(''); } }]
      );
    } else {
      Alert.alert('Failed', result.error || 'Could not send reset email. Check the address and try again.');
    }
  };

  // Safe error display — always convert to string
  const errorMsg = error
    ? (typeof error === 'string' ? error : 'Login failed. Please try again.')
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F0FDF4' }}>
      {/* GREEN HEADER — Stevia Care branding */}
      <LinearGradient colors={['#14532D', '#16A34A', '#4ADE80']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View style={styles.logoRing}>
              <Ionicons name="leaf" size={34} color="#fff" />
            </View>
            <Text style={styles.appName}>Stevia Care</Text>
            <Text style={styles.tagline}>The Future of Personal Healthcare</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

            {/* ── FORGOT PASSWORD MODE ── */}
            {fpMode ? (
              <>
                <TouchableOpacity onPress={() => { setFpMode(false); setFpEmail(''); }} style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#16A34A', fontWeight: '700', fontSize: 13 }}>← Back to Sign In</Text>
                </TouchableOpacity>
                <Text style={styles.cardTitle}>Reset Password 🔑</Text>
                <Text style={styles.cardSub}>Enter your email — we'll send a reset link</Text>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#CBD5E1"
                    value={fpEmail}
                    onChangeText={setFpEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>

                <TouchableOpacity onPress={handleForgotPassword} disabled={fpLoading} activeOpacity={0.88} style={{ marginTop: 20 }}>
                  <LinearGradient colors={['#14532D', '#16A34A']} style={styles.loginBtn}>
                    {fpLoading
                      ? <Text style={styles.loginBtnText}>Sending...</Text>
                      : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.loginBtnText}>Send Reset Link</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Welcome back 👋</Text>
                <Text style={styles.cardSub}>Sign in to your Stevia Care account</Text>

                {/* ERROR BOX */}
                {errorMsg ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#CBD5E1"
                    value={email}
                    onChangeText={(t) => { clearError(); setEmail(t); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    value={password}
                    onChangeText={(t) => { clearError(); setPassword(t); }}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Forgot password — triggers real Firebase email reset */}
                <TouchableOpacity
                  onPress={() => { setFpMode(true); setFpEmail(email); }}
                  style={styles.forgotRow}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* SIGN IN BUTTON */}
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

                {/* DEMO BUTTON */}
                <TouchableOpacity onPress={handleDemo} style={styles.demoBtn} activeOpacity={0.85}>
                  <Ionicons name="play-circle-outline" size={18} color="#16A34A" />
                  <Text style={styles.demoBtnText}>Continue with Demo Account</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
                  <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerLink}>Create one →</Text></Text>
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
  hero: { paddingBottom: 40 },
  heroContent: { alignItems: 'center', paddingTop: 20, paddingBottom: 10, gap: 10 },
  logoRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  appName: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  tagline: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  scroll: { padding: 16, paddingTop: 0, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginTop: -20, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 10 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#0F1729', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, fontSize: 13, color: '#EF4444', fontWeight: '600', lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 7, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F7FF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5, borderColor: '#E2E8F4' },
  input: { flex: 1, fontSize: 15, color: '#0F1729', fontWeight: '500' },
  forgotRow: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { fontSize: 13, color: '#16A34A', fontWeight: '700' },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: '#E2E8F4' },
  divText: { marginHorizontal: 14, color: '#94A3B8', fontSize: 13 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  demoBtnText: { color: '#16A34A', fontSize: 14, fontWeight: '700' },
  registerRow: { alignItems: 'center', marginTop: 20 },
  registerText: { fontSize: 13, color: '#64748B' },
  registerLink: { color: '#16A34A', fontWeight: '800' },
});
