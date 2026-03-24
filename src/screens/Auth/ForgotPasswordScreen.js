import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SHADOWS } from '../../constants/theme';

const API = 'https://healthpilot-pz8o.onrender.com/api/v1';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = async () => {
    if (!email.includes('@')) { setError('Enter a valid email address'); shake(); return; }
    setLoading(true); setError('');
    try {
      await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSent(true);
    } catch (e) {
      setError('Network error. Check your connection.');
      shake();
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#003087', '#0057B8', '#2E86DE']} style={StyleSheet.absoluteFill} />
      <View style={styles.bubble1} /><View style={styles.bubble2} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.iconWrap}>
              <View style={styles.iconBg}>
                <Ionicons name="lock-open" size={36} color="#fff" />
              </View>
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>No worries! Enter your email and we'll send you a reset link instantly.</Text>

            {!sent ? (
              <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
                {!!error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputRow, email.length > 0 && styles.inputRowActive]}>
                  <Ionicons name="mail-outline" size={18} color={email.length > 0 ? '#0057B8' : '#94A3B8'} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={t => { setEmail(t); setError(''); }}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSend}
                  />
                  {email.includes('@') && <Ionicons name="checkmark-circle" size={17} color="#00C896" />}
                </View>
                <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={['#0057B8', '#2E86DE']} style={styles.btnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : <><Text style={styles.btnText}>Send Reset Link</Text><Ionicons name="send" size={16} color="#fff" /></>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')} style={styles.phoneAlt}>
                  <Ionicons name="phone-portrait-outline" size={16} color="#0057B8" />
                  <Text style={styles.phoneAltText}>Use phone number instead</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.card}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={56} color="#00C896" />
                </View>
                <Text style={styles.successTitle}>Email Sent! 📬</Text>
                <Text style={styles.successText}>We've sent a password reset link to <Text style={{ fontFamily: 'Nunito_700Bold', color: '#0057B8' }}>{email}</Text>. Check your inbox (and spam folder).</Text>
                <View style={styles.tipBox}>
                  <Ionicons name="bulb-outline" size={15} color="#F59E0B" />
                  <Text style={styles.tipText}>The link expires in 1 hour. Click it to set a new password.</Text>
                </View>
                <TouchableOpacity style={[styles.btn, { marginTop: 8 }]} onPress={() => setSent(false)} activeOpacity={0.85}>
                  <LinearGradient colors={['#64748B', '#475569']} style={styles.btnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.btnText}>Resend Email</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn]} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                  <LinearGradient colors={['#0057B8', '#2E86DE']} style={styles.btnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.btnText}>Back to Sign In</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  bubble1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -80 },
  bubble2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,200,150,0.07)', bottom: 200, left: -50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 24 },
  iconWrap: { alignItems: 'center', marginBottom: 20 },
  iconBg: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 30, fontFamily: 'Nunito_800ExtraBold', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, ...SHADOWS.large },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', fontFamily: 'Nunito_600SemiBold' },
  inputLabel: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#F7F9FF', borderRadius: 13, borderWidth: 1.5, borderColor: '#E2E8F4', paddingHorizontal: 15, paddingVertical: 14, marginBottom: 18 },
  inputRowActive: { borderColor: '#0057B8', backgroundColor: '#F0F5FF' },
  input: { flex: 1, fontSize: 15.5, color: '#0F1729' },
  btn: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  btnText: { color: '#fff', fontSize: 15.5, fontFamily: 'Nunito_700Bold' },
  phoneAlt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 6, paddingVertical: 10 },
  phoneAltText: { color: '#0057B8', fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  successIcon: { alignItems: 'center', marginBottom: 14 },
  successTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#0F1729', textAlign: 'center', marginBottom: 10 },
  successText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 21, marginBottom: 16 },
  tipBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginBottom: 18 },
  tipText: { flex: 1, fontSize: 12.5, color: '#92400E', lineHeight: 18 },
});
