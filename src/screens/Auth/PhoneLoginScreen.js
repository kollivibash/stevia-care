// ─── Stevia Care — Phone Login ─────────────────────────────────────────────────
// Design: Forward Health + One Medical + Sollis Health + Cleveland Clinic
// Aesthetic: Dark luxury, ultra-minimal, world-class premium healthcare
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendPhoneOTP, verifyPhoneOTP } from '../../services/firebaseService';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

// ── Colour tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:       '#060F0A',   // near-black forest
  surface:  '#0E1A11',   // deep green surface
  card:     '#121E15',   // card background
  border:   '#1E3024',   // subtle border
  accent:   '#3DD68C',   // mint green accent
  accentDim:'#1A6644',   // dimmed accent
  white:    '#F7FDF9',   // warm white
  muted:    '#5A7A65',   // muted green-grey
  mutedLt:  '#8BA899',   // lighter muted
  danger:   '#FF6B6B',   // error red
  gold:     '#C9A84C',   // premium gold accent
};

export default function PhoneLoginScreen({ navigation }) {
  const [step,         setStep]         = useState('phone');
  const [phone,        setPhone]        = useState('');
  const [otp,          setOtp]          = useState(['', '', '', '', '', '']);
  const [loading,      setLoading]      = useState(false);
  const [loadingMsg,   setLoadingMsg]   = useState('Sending OTP...');
  const [devOtp,       setDevOtp]       = useState(null);
  const [sessionPhone, setSessionPhone] = useState('');
  const [timer,        setTimer]        = useState(30);
  const [canResend,    setCanResend]    = useState(false);
  const [focused,      setFocused]      = useState(false);

  const otpRefs  = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const yAnim    = useRef(new Animated.Value(24)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(yAnim,    { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
    // Subtle glow pulse on accent
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [step]);

  useEffect(() => {
    if (step !== 'otp') return;
    setTimer(30); setCanResend(false);
    const iv = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(iv); setCanResend(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [step]);

  const animateStep = () => {
    fadeAnim.setValue(0); yAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(yAnim,    { toValue: 0, tension: 65, friction: 13, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setLoadingMsg('Sending OTP...');
    // Show server wake-up hint after 5s
    const hint = setTimeout(() => setLoadingMsg('Connecting to server...'), 5000);
    const result = await sendPhoneOTP(cleaned);
    clearTimeout(hint);
    setLoading(false);
    if (result.success) {
      setSessionPhone(cleaned);
      setDevOtp(result.devOtp || null);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      animateStep();
    } else {
      Alert.alert('Could not send OTP', result.error || 'Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setLoadingMsg('Verifying...');
    const result = await verifyPhoneOTP(sessionPhone, otpStr);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Incorrect OTP', result.error || 'Please check and try again.');
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
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (digit && idx === 5) {
      // Auto-verify when last digit entered
      const full = next.join('');
      if (full.length === 6) setTimeout(handleVerifyOTP, 200);
    }
  };

  const handleOtpBack = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[idx]) {
        const next = [...otp]; next[idx] = ''; setOtp(next);
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus();
      }
    }
  };

  const otpFilled = otp.join('').length === 6;
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── BACKGROUND ── */}
      <LinearGradient
        colors={[C.bg, '#071410', C.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      {/* Ambient glow circles */}
      <Animated.View style={[styles.glowCircle1, { opacity: glowOpacity }]} />
      <View style={styles.glowCircle2} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: yAnim }] }]}>

              {/* ── BRAND MARK ── */}
              <View style={styles.brandSection}>
                <View style={styles.logoMark}>
                  <LinearGradient
                    colors={['#1A4D35', '#0F3325']}
                    style={StyleSheet.absoluteFill}
                    borderRadius={24}
                  />
                  <Ionicons name="leaf" size={32} color={C.accent} />
                </View>
                <View style={styles.brandText}>
                  <Text style={styles.brandName}>Stevia Care</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.premiumBadge}>
                      <View style={styles.premiumDot} />
                      <Text style={styles.premiumLabel}>Private Healthcare · Est. 2024</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── HEADLINE ── */}
              <View style={styles.headlineSection}>
                <Text style={styles.headline}>
                  {step === 'phone' ? 'Your health,\npersonalised.' : 'One step\naway.'}
                </Text>
                <Text style={styles.subline}>
                  {step === 'phone'
                    ? 'Enter your mobile number to access\nyour private health dashboard.'
                    : `We sent a 6-digit code to\n+91 ${sessionPhone.slice(0, 5)} ${sessionPhone.slice(5)}`}
                </Text>
              </View>

              {/* ── FORM ── */}
              <View style={styles.formCard}>

                {step === 'phone' ? (
                  /* ── PHONE INPUT ── */
                  <>
                    <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
                    <View style={[styles.phoneField, focused && styles.phoneFieldFocused]}>
                      <View style={styles.dialCode}>
                        <Text style={styles.dialFlag}>IN</Text>
                        <Text style={styles.dialNum}>+91</Text>
                      </View>
                      <View style={styles.fieldDivider} />
                      <TextInput
                        style={styles.phoneInput}
                        value={phone}
                        onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                        placeholder="00000 00000"
                        placeholderTextColor={C.muted}
                        keyboardType="number-pad"
                        maxLength={10}
                        autoFocus
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        returnKeyType="done"
                        onSubmitEditing={handleSendOTP}
                        selectionColor={C.accent}
                      />
                      {phone.length > 0 && (
                        <TouchableOpacity onPress={() => setPhone('')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                          <Ionicons name="close-circle" size={18} color={C.muted} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Digit dots progress */}
                    <View style={styles.digitDots}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <View
                          key={i}
                          style={[styles.digitDot, i < phone.length && styles.digitDotFilled]}
                        />
                      ))}
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                      onPress={handleSendOTP}
                      disabled={loading || phone.length !== 10}
                      activeOpacity={0.9}
                      style={{ marginTop: 32 }}
                    >
                      <LinearGradient
                        colors={phone.length === 10
                          ? [C.accent, '#2EC47A', C.accent]
                          : [C.border, C.border]}
                        style={styles.cta}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      >
                        {loading ? (
                          <View style={styles.ctaLoading}>
                            <ActivityIndicator color={C.bg} size="small" />
                            <Text style={styles.ctaLoadingText}>{loadingMsg}</Text>
                          </View>
                        ) : (
                          <Text style={[styles.ctaText, phone.length !== 10 && { color: C.muted }]}>
                            Continue →
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.trustRow}>
                      <Ionicons name="shield-checkmark" size={12} color={C.muted} />
                      <Text style={styles.trustText}>256-bit encrypted · Never shared · HIPAA compliant</Text>
                    </View>
                  </>
                ) : (
                  /* ── OTP INPUT ── */
                  <>
                    <View style={styles.otpHeader}>
                      <TouchableOpacity
                        onPress={() => { setStep('phone'); setOtp(['','','','','','']); animateStep(); }}
                        style={styles.backChip}
                      >
                        <Ionicons name="arrow-back" size={14} color={C.accent} />
                        <Text style={styles.backChipText}>Change</Text>
                      </TouchableOpacity>
                    </View>

                    {devOtp ? (
                      <View style={styles.devBanner}>
                        <Ionicons name="flash" size={14} color={C.gold} />
                        <Text style={styles.devText}>Test code: <Text style={styles.devOtp}>{devOtp}</Text></Text>
                      </View>
                    ) : null}

                    <Text style={styles.fieldLabel}>VERIFICATION CODE</Text>
                    <View style={styles.otpRow}>
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <React.Fragment key={i}>
                          {i === 3 && <View style={styles.otpSep}><Text style={styles.otpSepText}>—</Text></View>}
                          <TextInput
                            ref={r => otpRefs.current[i] = r}
                            style={[styles.otpBox, otp[i] ? styles.otpBoxFilled : null]}
                            value={otp[i]}
                            onChangeText={v => handleOtpChange(v, i)}
                            onKeyPress={e => handleOtpBack(e, i)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                            autoFocus={i === 0}
                            selectTextOnFocus
                            selectionColor={C.accent}
                          />
                        </React.Fragment>
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={handleVerifyOTP}
                      disabled={loading || !otpFilled}
                      activeOpacity={0.9}
                      style={{ marginTop: 32 }}
                    >
                      <LinearGradient
                        colors={otpFilled ? [C.accent, '#2EC47A', C.accent] : [C.border, C.border]}
                        style={styles.cta}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      >
                        {loading ? (
                          <View style={styles.ctaLoading}>
                            <ActivityIndicator color={C.bg} size="small" />
                            <Text style={styles.ctaLoadingText}>{loadingMsg}</Text>
                          </View>
                        ) : (
                          <Text style={[styles.ctaText, !otpFilled && { color: C.muted }]}>
                            Verify & Enter →
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                      {canResend ? (
                        <TouchableOpacity onPress={handleSendOTP}>
                          <Text style={styles.resendActive}>Resend Code</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.resendTimer}>
                          Resend in{' '}
                          <Text style={styles.resendCount}>00:{String(timer).padStart(2, '0')}</Text>
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </View>

              {/* ── DIVIDER ── */}
              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>or</Text>
                <View style={styles.divLine} />
              </View>

              {/* ── SECONDARY ACTIONS ── */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.ghostBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={16} color={C.mutedLt} />
                <Text style={styles.ghostBtnText}>Continue with Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={{ alignItems: 'center', marginTop: 20 }}
              >
                <Text style={styles.registerText}>
                  New here?{'  '}
                  <Text style={styles.registerLink}>Create your account</Text>
                </Text>
              </TouchableOpacity>

              {/* ── FOOTER ── */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.footerLink}>Terms</Text>
                  {' & '}
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </Text>
              </View>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  inner:  { flex: 1, paddingTop: 24 },

  // ── Ambient glow ──
  glowCircle1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: '#0A3D22', top: -80, right: -100,
  },
  glowCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#071E12', bottom: 80, left: -60,
  },

  // ── Brand ──
  brandSection: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 40 },
  logoMark: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
  },
  brandText:    { gap: 4 },
  brandName:    { fontSize: 20, fontFamily: 'Nunito_900Black', color: C.white, letterSpacing: 0.3 },
  badgeRow:     { flexDirection: 'row' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  premiumDot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },
  premiumLabel: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: C.muted, letterSpacing: 0.4 },

  // ── Headline ──
  headlineSection: { marginBottom: 32 },
  headline: {
    fontSize: 38, fontFamily: 'Nunito_900Black', color: C.white,
    lineHeight: 46, letterSpacing: -0.5, marginBottom: 12,
  },
  subline: {
    fontSize: 15, fontFamily: 'Nunito_400Regular', color: C.mutedLt,
    lineHeight: 22,
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 10, fontFamily: 'Nunito_700Bold', color: C.muted,
    letterSpacing: 1.5, marginBottom: 12,
  },

  // ── Phone ──
  phoneField: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16, borderWidth: 1.5, borderColor: C.border,
    height: 62, overflow: 'hidden',
  },
  phoneFieldFocused: { borderColor: C.accentDim },
  dialCode: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, height: '100%',
    backgroundColor: '#0A1A0F',
  },
  dialFlag:      { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: C.accent, letterSpacing: 0.5 },
  dialNum:       { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: C.white },
  fieldDivider:  { width: 1, height: 28, backgroundColor: C.border },
  phoneInput: {
    flex: 1, fontSize: 24, fontFamily: 'Nunito_800ExtraBold',
    color: C.white, paddingHorizontal: 16, letterSpacing: 3,
  },

  // Digit dots
  digitDots:      { flexDirection: 'row', gap: 5, marginTop: 10, justifyContent: 'center' },
  digitDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  digitDotFilled: { backgroundColor: C.accent },

  // ── OTP ──
  otpHeader:   { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  backChip:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  backChipText:{ fontSize: 12, fontFamily: 'Nunito_700Bold', color: C.accent },

  devBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1A1500', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#3A3000' },
  devText:    { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: C.gold },
  devOtp:     { fontFamily: 'Nunito_900Black', letterSpacing: 4, color: C.gold },

  otpRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  otpSep:     { paddingHorizontal: 2 },
  otpSepText: { color: C.muted, fontSize: 16, fontFamily: 'Nunito_400Regular' },
  otpBox: {
    width: 46, height: 58, borderRadius: 14,
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    fontSize: 24, fontFamily: 'Nunito_900Black', color: C.white,
    textAlign: 'center',
  },
  otpBoxFilled: { borderColor: C.accent, backgroundColor: '#0A2A18', color: C.accent },

  resendRow:    { alignItems: 'center', marginTop: 20 },
  resendTimer:  { fontSize: 13, fontFamily: 'Nunito_400Regular', color: C.muted },
  resendCount:  { fontFamily: 'Nunito_700Bold', color: C.accent },
  resendActive: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: C.accent },

  // ── CTA ──
  cta: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 18, fontFamily: 'Nunito_900Black', color: C.bg, letterSpacing: 0.3 },
  ctaLoading:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctaLoadingText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: C.bg },

  trustRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  trustText: { fontSize: 10, fontFamily: 'Nunito_400Regular', color: C.muted, textAlign: 'center' },

  // ── Divider ──
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divText: { marginHorizontal: 16, fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: C.muted },

  // ── Ghost button ──
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
  },
  ghostBtnText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: C.mutedLt },

  // ── Register ──
  registerText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: C.muted },
  registerLink: { fontFamily: 'Nunito_800ExtraBold', color: C.accent },

  // ── Footer ──
  footer:     { alignItems: 'center', marginTop: 32, paddingBottom: 8 },
  footerText: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: C.muted, textAlign: 'center', lineHeight: 17 },
  footerLink: { color: C.mutedLt, fontFamily: 'Nunito_600SemiBold' },
});
