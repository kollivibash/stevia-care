// ─── Stevia Care — Phone OTP Login ────────────────────────────────────────────
// Design: Apollo 247 + WhatsApp + Practo — clean, medical, trustworthy
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendPhoneOTP, verifyPhoneOTP } from '../../services/firebaseService';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function PhoneLoginScreen({ navigation }) {
  const [step,         setStep]         = useState('phone');
  const [phone,        setPhone]        = useState('');
  const [otp,          setOtp]          = useState(['', '', '', '', '', '']);
  const [loading,      setLoading]      = useState(false);
  const [devOtp,       setDevOtp]       = useState(null);
  const [sessionPhone, setSessionPhone] = useState('');
  const [timer,        setTimer]        = useState(30);
  const [canResend,    setCanResend]    = useState(false);

  const otpRefs   = useRef([]);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
    ]).start();
  }, [step]);

  // countdown timer for resend
  useEffect(() => {
    if (step !== 'otp') return;
    setTimer(30); setCanResend(false);
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const result = await sendPhoneOTP(cleaned);
    setLoading(false);
    if (result.success) {
      setSessionPhone(cleaned);
      setDevOtp(result.devOtp || null);
      setOtp(['', '', '', '', '', '']);
      fadeAnim.setValue(0); slideAnim.setValue(30);
      setStep('otp');
    } else {
      Alert.alert('Failed to Send OTP', result.error || 'Please check the number and try again.');
    }
  };

  const handleVerifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    const result = await verifyPhoneOTP(sessionPhone, otpStr);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Wrong OTP', result.error || 'Please check and try again.');
      return;
    }
    await SecureStore.setItemAsync('auth_token', result.token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(result.user));
    useAuthStore.setState({
      user: result.user, token: result.token,
      isAuthenticated: true, isLoading: false, error: null,
    });
  };

  const handleOtpChange = (val, idx) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    if (digit && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpBack = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = '';
        setOtp(newOtp);
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus();
      }
    }
  };

  const otpFilled = otp.join('').length === 6;

  return (
    <View style={styles.root}>
      {/* ── TOP HEADER ── */}
      <LinearGradient
        colors={['#064E3B', '#065F46', '#047857', '#16A34A']}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            {/* Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.logoRing}>
                <Ionicons name="leaf" size={28} color="#fff" />
              </View>
            </View>
            <Text style={styles.appName}>Stevia Care</Text>
            <Text style={styles.appTagline}>Your Family's Health AI</Text>

            {/* Step indicator */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={[styles.stepLine, step === 'otp' && styles.stepLineActive]} />
              <View style={[styles.stepDot, step === 'otp' && styles.stepDotActive]} />
            </View>
            <Text style={styles.stepLabel}>
              {step === 'phone' ? 'Step 1 of 2 — Enter Number' : 'Step 2 of 2 — Verify OTP'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── CARD ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>

            {/* ── PHONE STEP ── */}
            {step === 'phone' ? (
              <>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <Ionicons name="phone-portrait-outline" size={24} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Enter Mobile Number</Text>
                    <Text style={styles.cardSub}>We'll send a 6-digit OTP to verify</Text>
                  </View>
                </View>

                {/* Phone Input */}
                <View style={styles.phoneContainer}>
                  {/* Country code badge */}
                  <View style={styles.countryBadge}>
                    <Text style={styles.countryFlag}>IN</Text>
                    <View style={styles.countryDivider} />
                    <Text style={styles.countryCode}>+91</Text>
                  </View>

                  {/* Number input */}
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={10}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSendOTP}
                  />

                  {/* Clear button */}
                  {phone.length > 0 && (
                    <TouchableOpacity onPress={() => setPhone('')} style={styles.clearBtn}>
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Phone progress bar */}
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(phone.length / 10) * 100}%` }]} />
                </View>
                <Text style={styles.charCount}>{phone.length}/10 digits</Text>

                {/* Send OTP button */}
                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={loading || phone.length !== 10}
                  activeOpacity={0.88}
                  style={{ marginTop: 28 }}
                >
                  <LinearGradient
                    colors={phone.length === 10 ? ['#065F46', '#059669'] : ['#D1D5DB', '#D1D5DB']}
                    style={styles.primaryBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <>
                          <Ionicons name="send-outline" size={18} color="#fff" />
                          <Text style={styles.primaryBtnText}>Send OTP</Text>
                        </>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                {/* Privacy note */}
                <View style={styles.privacyRow}>
                  <Ionicons name="lock-closed-outline" size={13} color="#9CA3AF" />
                  <Text style={styles.privacyText}>
                    Your number is safe. We never share your data.
                  </Text>
                </View>
              </>
            ) : (
              /* ── OTP STEP ── */
              <>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Verify OTP</Text>
                    <Text style={styles.cardSub}>
                      Code sent to +91 {sessionPhone.slice(0, 5)} {sessionPhone.slice(5)}
                    </Text>
                  </View>
                </View>

                {/* Change number */}
                <TouchableOpacity
                  onPress={() => { setStep('phone'); setOtp(['','','','','','']); }}
                  style={styles.changeRow}
                >
                  <Ionicons name="pencil-outline" size={13} color="#059669" />
                  <Text style={styles.changeText}>Change Number</Text>
                </TouchableOpacity>

                {/* Dev OTP banner */}
                {devOtp ? (
                  <View style={styles.devBanner}>
                    <Ionicons name="information-circle-outline" size={16} color="#0369A1" />
                    <Text style={styles.devText}>
                      Test OTP: <Text style={{ fontFamily: 'Nunito_900Black', letterSpacing: 2 }}>{devOtp}</Text>
                    </Text>
                  </View>
                ) : null}

                {/* OTP Boxes */}
                <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>
                <View style={styles.otpRow}>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <TextInput
                      key={i}
                      ref={r => otpRefs.current[i] = r}
                      style={[
                        styles.otpBox,
                        otp[i] ? styles.otpBoxFilled : null,
                        i === 2 ? { marginRight: 20 } : null,
                      ]}
                      value={otp[i]}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={e => handleOtpBack(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      autoFocus={i === 0}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {/* Verify button */}
                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  disabled={loading || !otpFilled}
                  activeOpacity={0.88}
                  style={{ marginTop: 28 }}
                >
                  <LinearGradient
                    colors={otpFilled ? ['#065F46', '#059669'] : ['#D1D5DB', '#D1D5DB']}
                    style={styles.primaryBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={styles.primaryBtnText}>Verify & Sign In</Text>
                        </>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend timer */}
                <View style={styles.resendRow}>
                  {canResend ? (
                    <TouchableOpacity onPress={handleSendOTP}>
                      <Text style={styles.resendActive}>Resend OTP</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.resendTimer}>
                      Resend in <Text style={{ color: '#059669', fontFamily: 'Nunito_700Bold' }}>00:{String(timer).padStart(2, '0')}</Text>
                    </Text>
                  )}
                </View>
              </>
            )}

            {/* ── DIVIDER ── */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>or</Text>
              <View style={styles.divLine} />
            </View>

            {/* ── EMAIL LOGIN ── */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.altBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={18} color="#059669" />
              <Text style={styles.altBtnText}>Sign in with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerRow}
            >
              <Text style={styles.registerText}>
                New to Stevia Care?{'  '}
                <Text style={styles.registerLink}>Create Account →</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0FDF4' },

  // ── Header ──
  header:        { paddingBottom: 56, overflow: 'hidden' },
  circle1:       { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.05)', top: -100, right: -80 },
  circle2:       { position: 'absolute', width: 160, height: 160, borderRadius: 80,  backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: -40 },
  circle3:       { position: 'absolute', width: 80,  height: 80,  borderRadius: 40,  backgroundColor: 'rgba(255,255,255,0.06)', top: 40, left: 30 },
  headerContent: { alignItems: 'center', paddingTop: 20, paddingBottom: 10, gap: 6 },
  logoWrap:      { marginBottom: 4 },
  logoRing:      { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  appName:       { fontSize: 26, fontFamily: 'Nunito_900Black', color: '#fff', letterSpacing: 0.3 },
  appTagline:    { fontSize: 13, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.75)' },

  // Step indicator
  stepRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 0 },
  stepDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.35)' },
  stepDotActive: { backgroundColor: '#fff', width: 12, height: 12, borderRadius: 6 },
  stepLine:      { width: 48, height: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 6 },
  stepLineActive:{ backgroundColor: '#fff' },
  stepLabel:     { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.65)', marginTop: 6 },

  // ── Card ──
  scroll: { padding: 16, paddingTop: 0, paddingBottom: 48 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 26,
    marginTop: -28,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 36,
    elevation: 14,
  },

  stepHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 24 },
  stepIcon:    { width: 52, height: 52, borderRadius: 16, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#D1FAE5' },
  cardTitle:   { fontSize: 20, fontFamily: 'Nunito_900Black', color: '#0D1F12', marginBottom: 2 },
  cardSub:     { fontSize: 13, fontFamily: 'Nunito_400Regular', color: '#6B7280', lineHeight: 18 },

  // ── Phone Input ──
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    height: 58,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    height: '100%',
    gap: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#E5E7EB',
  },
  countryFlag:    { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: '#059669', letterSpacing: 0.5 },
  countryDivider: { width: 1, height: 16, backgroundColor: '#D1D5DB' },
  countryCode:    { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#065F46' },
  phoneInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#111827',
    paddingHorizontal: 16,
    letterSpacing: 2,
    height: '100%',
  },
  clearBtn:      { padding: 12 },
  progressBar:   { height: 3, backgroundColor: '#F3F4F6', borderRadius: 2, marginTop: 8 },
  progressFill:  { height: 3, backgroundColor: '#059669', borderRadius: 2 },
  charCount:     { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#9CA3AF', marginTop: 4, textAlign: 'right' },

  // ── OTP ──
  changeRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  changeText:   { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#059669' },
  otpLabel:     { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#4B6B52', marginBottom: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
  otpRow:       { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox: {
    width: (width - 32 - 52 - 20 - 50) / 6,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: '#111827',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
  },

  resendRow:    { alignItems: 'center', marginTop: 18 },
  resendTimer:  { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#6B7280' },
  resendActive: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#059669' },

  devBanner:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  devText:      { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#1D4ED8' },

  // ── Buttons ──
  primaryBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 17 },
  primaryBtnText:{ color: '#fff', fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },

  privacyRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  privacyText:  { fontSize: 12, fontFamily: 'Nunito_400Regular', color: '#9CA3AF' },

  divider:      { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine:      { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  divText:      { marginHorizontal: 14, fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#9CA3AF' },

  altBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, borderWidth: 1.5, borderColor: '#059669', backgroundColor: '#F0FDF4' },
  altBtnText:   { color: '#059669', fontSize: 15, fontFamily: 'Nunito_700Bold' },

  registerRow:  { alignItems: 'center', marginTop: 20 },
  registerText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#6B7280' },
  registerLink: { color: '#059669', fontFamily: 'Nunito_800ExtraBold' },
});
