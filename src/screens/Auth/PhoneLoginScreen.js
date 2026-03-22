import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { sendPhoneOTP, verifyPhoneOTP } from '../../services/firebaseService';

const API = 'https://healthpilot-pz8o.onrender.com/api/v1';

export default function PhoneLoginScreen({ navigation }) {
  const { login } = useAuthStore();
  const [step,           setStep]           = useState('phone'); // phone | otp
  const [phone,          setPhone]          = useState('');
  const [otp,            setOtp]            = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const otpRefs = useRef([]);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const result = await sendPhoneOTP(phone);
    setLoading(false);
    if (result.success) {
      setVerificationId(result.sessionInfo);
      setStep('otp');
    } else {
      Alert.alert('Failed to send OTP', result.error);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    const result = await verifyPhoneOTP(verificationId, otp);
    if (!result.success) {
      setLoading(false);
      Alert.alert('Wrong OTP', result.error);
      return;
    }

    // Send Firebase token to our backend to get app token
    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          phone:          `+91${phone}`,
          firebase_token: result.idToken,
          uid:            result.uid,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.token || data.access_token)) {
        const tokenStr = data.token || data.access_token;
        const SecureStore = require('expo-secure-store');
        await SecureStore.setItemAsync('auth_token', tokenStr);
        await SecureStore.setItemAsync('user_data', JSON.stringify(data.user || { phone: `+91${phone}` }));
        useAuthStore.setState({
          user:            data.user || { phone: `+91${phone}`, name: `User${phone.slice(-4)}` },
          token:           tokenStr,
          isAuthenticated: true,
          isLoading:       false,
          error:           null,
        });
      } else {
        Alert.alert('Login Failed', data.detail || 'Could not verify with server');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0FDF4' }}>
      <LinearGradient colors={['#14532D', '#16A34A', '#4ADE80']} style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View style={styles.logoRing}>
              <Ionicons name="leaf" size={34} color="#fff" />
            </View>
            <Text style={styles.appName}>Stevia Care</Text>
            <Text style={styles.tagline}>Sign in with your mobile number</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>

            {step === 'phone' ? (
              <>
                <Text style={styles.cardTitle}>Enter Mobile Number</Text>
                <Text style={styles.cardSub}>We'll send you a 6-digit OTP</Text>

                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="9876543210"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                  />
                </View>

                <TouchableOpacity onPress={handleSendOTP} disabled={loading} style={{ marginTop: 20 }} activeOpacity={0.88}>
                  <LinearGradient colors={['#14532D', '#16A34A']} style={styles.btn}>
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.btnText}>Send OTP</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Enter OTP</Text>
                <Text style={styles.cardSub}>
                  Sent to +91 {phone}{'  '}
                  <Text style={{ color: '#16A34A', fontWeight: '700' }} onPress={() => setStep('phone')}>
                    Change
                  </Text>
                </Text>

                <View style={styles.otpRow}>
                  {[0,1,2,3,4,5].map(i => (
                    <TextInput
                      key={i}
                      ref={r => otpRefs.current[i] = r}
                      style={[styles.otpBox, otp[i] && styles.otpBoxFilled]}
                      value={otp[i] || ''}
                      onChangeText={val => {
                        const v = val.replace(/[^0-9]/g, '');
                        const arr = otp.split('');
                        arr[i] = v;
                        const newOtp = arr.join('').substring(0, 6);
                        setOtp(newOtp);
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
                    />
                  ))}
                </View>

                <TouchableOpacity onPress={handleVerifyOTP} disabled={loading || otp.length !== 6} style={{ marginTop: 20 }} activeOpacity={0.88}>
                  <LinearGradient
                    colors={otp.length === 6 ? ['#14532D', '#16A34A'] : ['#CBD5E1', '#CBD5E1']}
                    style={styles.btn}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={styles.btnText}>Verify OTP</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSendOTP} style={styles.resendRow}>
                  <Text style={styles.resendText}>Didn't receive? <Text style={{ color: '#16A34A', fontWeight: '700' }}>Resend OTP</Text></Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider}>
              <View style={styles.divLine} /><Text style={styles.divText}>or</Text><View style={styles.divLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.emailBtn}>
              <Ionicons name="mail-outline" size={18} color="#16A34A" />
              <Text style={styles.emailBtnText}>Sign in with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
              <Text style={styles.registerText}>New user? <Text style={styles.registerLink}>Create account →</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:          { paddingBottom: 40 },
  heroContent:   { alignItems: 'center', paddingTop: 20, paddingBottom: 10, gap: 10 },
  logoRing:      { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  appName:       { color: '#fff', fontSize: 28, fontWeight: '900' },
  tagline:       { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  scroll:        { padding: 16, paddingTop: 0, paddingBottom: 40 },
  card:          { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginTop: -20, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 10 },
  cardTitle:     { fontSize: 22, fontWeight: '900', color: '#0F1729', marginBottom: 4 },
  cardSub:       { fontSize: 13, color: '#94A3B8', marginBottom: 24 },
  phoneRow:      { flexDirection: 'row', gap: 10, alignItems: 'center' },
  countryCode:   { backgroundColor: '#F0FDF4', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5, borderColor: '#DCFCE7' },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: '#14532D' },
  phoneInput:    { flex: 1, backgroundColor: '#F5F7FF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 18, fontWeight: '700', color: '#0F1729', borderWidth: 1.5, borderColor: '#E2E8F4', letterSpacing: 2 },
  otpRow:        { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  otpBox:        { width: 46, height: 56, borderRadius: 12, backgroundColor: '#F5F7FF', borderWidth: 1.5, borderColor: '#E2E8F4', fontSize: 24, fontWeight: '900', color: '#0F1729' },
  otpBoxFilled:  { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  btn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '800' },
  resendRow:     { alignItems: 'center', marginTop: 16 },
  resendText:    { fontSize: 13, color: '#64748B' },
  divider:       { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divLine:       { flex: 1, height: 1, backgroundColor: '#E2E8F4' },
  divText:       { marginHorizontal: 14, color: '#94A3B8', fontSize: 13 },
  emailBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  emailBtnText:  { color: '#16A34A', fontSize: 14, fontWeight: '700' },
  registerRow:   { alignItems: 'center', marginTop: 20 },
  registerText:  { fontSize: 13, color: '#64748B' },
  registerLink:  { color: '#16A34A', fontWeight: '800' },
});
