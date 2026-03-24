// ─── Stevia Care — Phone OTP Login (Premium UI) ────────────────────────────
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendPhoneOTP, verifyPhoneOTP } from '../../services/firebaseService';
import SteviaLogo from '../../components/SteviaLogo';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';

export default function PhoneLoginScreen({ navigation }) {
  const { } = useAuthStore();
  const [step,    setStep]    = useState('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp,  setDevOtp]  = useState(null); // shown in dev mode
  const [sessionPhone, setSessionPhone] = useState('');
  const otpRefs  = useRef([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slide = () => {
    slideAnim.setValue(40);
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
  };

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const result = await sendPhoneOTP(cleaned);
    setLoading(false);
    if (result.success) {
      setSessionPhone(cleaned.slice(-10));
      setDevOtp(result.devOtp || null);
      setOtp('');
      setStep('otp');
      slide();
    } else {
      Alert.alert('Failed to Send OTP', result.error || 'Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    const result = await verifyPhoneOTP(sessionPhone, otp);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Wrong OTP', result.error || 'Please try again.');
      return;
    }
    // Save token and user
    await SecureStore.setItemAsync('auth_token', result.token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(result.user));
    useAuthStore.setState({
      user:            result.user,
      token:           result.token,
      isAuthenticated: true,
      isLoading:       false,
      error:           null,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0FDF4' }}>
      <LinearGradient
        colors={['#052E16', '#14532D', '#166534', '#16A34A']}
        style={styles.hero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        {/* Decorative orbs */}
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
          <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>

            {step === 'phone' ? (
              <>
                <View style={styles.iconBadge}>
                  <Ionicons name="phone-portrait" size={22} color="#16A34A" />
                </View>
                <Text style={styles.cardTitle}>Enter Mobile Number</Text>
                <Text style={styles.cardSub}>We'll send a 6-digit OTP to verify you</Text>

                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryPill}>
                    <Text style={styles.countryText}>🇮🇳  +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="98765 43210"
                    placeholderTextColor="#A0AEB5"
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                  />
                </View>

                <TouchableOpacity onPress={handleSendOTP} disabled={loading} activeOpacity={0.88} style={{ marginTop: 24 }}>
                  <LinearGradient colors={['#14532D', '#16A34A']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.btnText}>Send OTP</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.iconBadge}>
                  <Ionicons name="shield-checkmark" size={22} color="#16A34A" />
                </View>
                <Text style={styles.cardTitle}>Verify OTP</Text>
                <Text style={styles.cardSub}>
                  Sent to +91 {sessionPhone.slice(0,5)} {sessionPhone.slice(5)}{'  '}
                  <Text style={styles.changeLink} onPress={() => { setStep('phone'); setOtp(''); }}>
                    Change
                  </Text>
                </Text>

                {/* Dev OTP hint — remove when SMS is live */}
                {devOtp ? (
                  <View style={styles.devBanner}>
                    <Ionicons name="information-circle" size={16} color="#0EA5E9" />
                    <Text style={styles.devText}>Test OTP: <Text style={{ fontFamily: 'Nunito_900Black' }}>{devOtp}</Text></Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Enter 6-Digit OTP</Text>
                <View style={styles.otpRow}>
                  {[0,1,2,3,4,5].map(i => (
                    <TextInput
                      key={i}
                      ref={r => otpRefs.current[i] = r}
                      style={[styles.otpBox, otp[i] ? styles.otpBoxFilled : null]}
                      value={otp[i] || ''}
                      onChangeText={val => {
                        const v = val.replace(/[^0-9]/g, '');
                        const arr = otp.split('');
                        arr[i] = v;
                        const next = arr.join('').substring(0, 6);
                        setOtp(next);
                        if (v && i < 5) otpRefs.current[i + 1]?.focus();
                      }}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
                          otpRefs.current[i - 1]?.focus();
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      autoFocus={i === 0}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  activeOpacity={0.88}
                  style={{ marginTop: 24 }}
                >
                  <LinearGradient
                    colors={otp.length === 6 ? ['#14532D', '#16A34A'] : ['#D1D5DB', '#D1D5DB']}
                    style={styles.btn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={styles.btnText}>Verify & Sign In</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSendOTP} style={styles.resendRow}>
                  <Text style={styles.resendText}>
                    Didn't receive? <Text style={styles.resendLink}>Resend OTP</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider}>
              <View style={styles.divLine} /><Text style={styles.divText}>or</Text><View style={styles.divLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.altBtn}>
              <Ionicons name="mail-outline" size={18} color="#16A34A" />
              <Text style={styles.altBtnText}>Sign in with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
              <Text style={styles.registerText}>
                New to Stevia Care? <Text style={styles.registerLink}>Create Account →</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:          { paddingBottom: 50, overflow: 'hidden' },
  orb1:          { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -60 },
  orb2:          { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: 'rgba(255,255,255,0.05)', bottom: 10, left: -40 },
  heroContent:   { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  scroll:        { padding: 16, paddingTop: 0, paddingBottom: 48 },

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
  iconBadge:     { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#DCFCE7' },
  cardTitle:     { fontSize: 24, fontFamily: 'Nunito_900Black', color: '#0D1F12', marginBottom: 4 },
  cardSub:       { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#6B7280', marginBottom: 24 },
  label:         { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#4B6B52', marginBottom: 8, letterSpacing: 0.6, textTransform: 'uppercase' },

  phoneRow:      { flexDirection: 'row', gap: 10 },
  countryPill:   { backgroundColor: '#F0FDF4', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#DCFCE7', justifyContent: 'center' },
  countryText:   { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#14532D' },
  phoneInput:    { flex: 1, backgroundColor: '#F5FAF6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#0D1F12', borderWidth: 1.5, borderColor: '#E8F0E9', letterSpacing: 3 },

  otpRow:        { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 4 },
  otpBox:        { width: 48, height: 60, borderRadius: 14, backgroundColor: '#F5FAF6', borderWidth: 2, borderColor: '#E8F0E9', fontSize: 26, fontFamily: 'Nunito_900Black', color: '#0D1F12' },
  otpBoxFilled:  { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },

  btn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16 },
  btnText:       { color: '#fff', fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },

  changeLink:    { color: '#16A34A', fontFamily: 'Nunito_700Bold' },
  resendRow:     { alignItems: 'center', marginTop: 18 },
  resendText:    { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#64748B' },
  resendLink:    { color: '#16A34A', fontFamily: 'Nunito_700Bold' },

  devBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  devText:       { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#0369A1' },

  divider:       { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  divLine:       { flex: 1, height: 1, backgroundColor: '#E8F0E9' },
  divText:       { marginHorizontal: 14, color: '#94A3B8', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },

  altBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  altBtnText:    { color: '#16A34A', fontSize: 15, fontFamily: 'Nunito_700Bold' },

  registerRow:   { alignItems: 'center', marginTop: 22 },
  registerText:  { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#64748B' },
  registerLink:  { color: '#16A34A', fontFamily: 'Nunito_800ExtraBold' },
});
