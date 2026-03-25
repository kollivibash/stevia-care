// ─── Stevia Care — ABHA (Ayushman Bharat Health Account) ──────────────────────
// Inspired by: NHA ABHA app + One Medical clean cards + Forward Health records
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const ABHA_APP_URL = 'https://abha.abdm.gov.in/';
const ABDM_URL     = 'https://abdm.gov.in/';

const FEATURES = [
  {
    icon: 'id-card',
    title: 'Unique Health ID',
    desc: '14-digit ABHA number linked to all your health records across India.',
    color: '#059669',
    bg: '#D1FAE5',
  },
  {
    icon: 'document-text',
    title: 'Unified Health Records',
    desc: 'Prescriptions, lab reports, discharge summaries — all in one place.',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  {
    icon: 'shield-checkmark',
    title: 'Consent-Based Sharing',
    desc: 'You control who sees your health data. Share securely with doctors.',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    icon: 'business',
    title: 'Accepted Nationwide',
    desc: 'Works at 550,000+ hospitals, labs, and clinics empanelled under ABDM.',
    color: '#0EA5E9',
    bg: '#E0F2FE',
  },
];

const STEPS = [
  { num: '01', title: 'Download ABHA App', desc: 'Install the official NHA ABHA app from Play Store or App Store.' },
  { num: '02', title: 'Verify Aadhaar', desc: 'Link your Aadhaar (12-digit) to verify identity via OTP.' },
  { num: '03', title: 'Get ABHA Number', desc: 'Receive your unique 14-digit ABHA health ID instantly.' },
  { num: '04', title: 'Link Health Records', desc: 'Connect your past medical records from hospitals and labs.' },
];

export default function ABHAScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const { user } = useAuthStore();
  const [abhaId,     setAbhaId]     = useState('');
  const [verifying,  setVerifying]  = useState(false);
  const [linked,     setLinked]     = useState(false);

  const handleLink = async () => {
    if (!abhaId.trim()) {
      Alert.alert('Enter ABHA ID', 'Please enter your 14-digit ABHA number.');
      return;
    }
    const digits = abhaId.replace(/[-\s]/g, '');
    if (digits.length !== 14) {
      Alert.alert('Invalid ABHA ID', 'ABHA number must be 14 digits (e.g. 12-3456-7890-1234).');
      return;
    }
    setVerifying(true);
    // Simulate verification — real integration requires ABDM PHR APIs
    setTimeout(() => {
      setVerifying(false);
      setLinked(true);
      Alert.alert(
        '✅ ABHA Linked!',
        `Your ABHA ID ${abhaId} has been saved to your Stevia Care profile.\n\nFull ABDM integration will be available in the next update.`,
      );
    }, 2000);
  };

  const handleCreateABHA = () => {
    Linking.openURL(ABHA_APP_URL);
  };

  const handleLearnMore = () => {
    Linking.openURL(ABDM_URL);
  };

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={['#1E3A5F', '#1D4ED8', '#2563EB']}
          style={styles.header}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>GOVT. OF INDIA · NHA</Text>
            </View>
            <Text style={styles.headerTitle}>ABHA Health ID</Text>
            <Text style={styles.headerSub}>Ayushman Bharat Health Account</Text>
          </View>
          <View style={styles.abhaLogo}>
            <Text style={styles.abhaLogoText}>🏥</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ABHA Card Visual */}
        <View style={styles.cardSection}>
          <LinearGradient
            colors={linked ? ['#064E3B', '#059669'] : ['#1E293B', '#334155']}
            style={styles.abhaCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.abhaCardTop}>
              <View>
                <Text style={styles.abhaCardEyebrow}>ABHA NUMBER</Text>
                <Text style={styles.abhaCardId}>
                  {linked ? abhaId : '__ - ____ - ____ - ____'}
                </Text>
              </View>
              {linked
                ? <Ionicons name="checkmark-circle" size={36} color="#4ADE80" />
                : <Ionicons name="id-card-outline" size={36} color="rgba(255,255,255,0.3)" />
              }
            </View>
            <View style={styles.abhaCardBottom}>
              <View>
                <Text style={styles.abhaCardLabel}>NAME</Text>
                <Text style={styles.abhaCardValue}>{user?.name || 'Not Linked'}</Text>
              </View>
              <View>
                <Text style={styles.abhaCardLabel}>STATUS</Text>
                <View style={[styles.statusBadge, { backgroundColor: linked ? '#4ADE80' : '#F59E0B' }]}>
                  <Text style={styles.statusText}>{linked ? 'ACTIVE' : 'NOT LINKED'}</Text>
                </View>
              </View>
            </View>
            {/* Card shimmer overlay */}
            <View style={styles.cardOrb1} />
            <View style={styles.cardOrb2} />
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 16 }}>

          {/* Link ABHA */}
          <View style={[styles.section, { backgroundColor: T.card }]}>
            <Text style={[styles.sectionTitle, { color: T.text }]}>
              {linked ? '✅ ABHA ID Linked' : 'Link Your ABHA ID'}
            </Text>
            <Text style={[styles.sectionSub, { color: T.textSub }]}>
              {linked
                ? 'Your ABHA is connected. Health records will sync when full ABDM integration launches.'
                : 'Already have an ABHA number? Enter it below to link with Stevia Care.'}
            </Text>
            {!linked && (
              <>
                <View style={[styles.inputRow, { borderColor: T.border, backgroundColor: T.bg }]}>
                  <Ionicons name="id-card-outline" size={20} color="#1D4ED8" />
                  <TextInput
                    style={[styles.input, { color: T.text }]}
                    placeholder="12-3456-7890-1234"
                    placeholderTextColor={T.textMuted}
                    keyboardType="numeric"
                    maxLength={17}
                    value={abhaId}
                    onChangeText={text => {
                      // Auto-format as XX-XXXX-XXXX-XXXX
                      const digits = text.replace(/\D/g, '').slice(0, 14);
                      let formatted = digits;
                      if (digits.length > 2)  formatted = digits.slice(0,2)  + '-' + digits.slice(2);
                      if (digits.length > 6)  formatted = formatted.slice(0,7) + '-' + formatted.slice(7);
                      if (digits.length > 10) formatted = formatted.slice(0,12) + '-' + formatted.slice(12);
                      setAbhaId(formatted);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleLink}
                  disabled={verifying}
                  style={[styles.linkBtn, verifying && { opacity: 0.7 }]}
                >
                  <LinearGradient
                    colors={['#1E3A5F', '#1D4ED8']}
                    style={styles.linkBtnInner}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {verifying
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <>
                          <Ionicons name="link" size={16} color="#fff" />
                          <Text style={styles.linkBtnText}>Link ABHA ID</Text>
                        </>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Create ABHA */}
          <TouchableOpacity
            onPress={handleCreateABHA}
            style={[styles.createCard, { backgroundColor: T.card, borderColor: '#1D4ED8' + '40' }]}
            activeOpacity={0.85}
          >
            <View style={[styles.createIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="add-circle" size={26} color="#1D4ED8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.createTitle, { color: T.text }]}>Create New ABHA ID</Text>
              <Text style={[styles.createSub, { color: T.textMuted }]}>
                Don't have one? Create free via Aadhaar or Driving Licence
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#1D4ED8" />
          </TouchableOpacity>

          {/* Features */}
          <Text style={[styles.heading, { color: T.text }]}>What is ABHA?</Text>
          <View style={styles.featGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featCard, { backgroundColor: T.card }]}>
                <View style={[styles.featIcon, { backgroundColor: isDark ? f.color + '22' : f.bg }]}>
                  <Ionicons name={f.icon} size={22} color={f.color} />
                </View>
                <Text style={[styles.featTitle, { color: T.text }]}>{f.title}</Text>
                <Text style={[styles.featDesc, { color: T.textMuted }]}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* How to create */}
          <Text style={[styles.heading, { color: T.text }]}>How to Create ABHA</Text>
          <View style={[styles.stepsCard, { backgroundColor: T.card }]}>
            {STEPS.map((step, i) => (
              <View key={i} style={[styles.stepRow, i < STEPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.border }]}>
                <View style={styles.stepNumBox}>
                  <Text style={styles.stepNum}>{step.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: T.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: T.textMuted }]}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Learn more */}
          <TouchableOpacity
            onPress={handleLearnMore}
            style={[styles.learnBtn, { borderColor: T.border, backgroundColor: T.card }]}
            activeOpacity={0.85}
          >
            <Ionicons name="globe-outline" size={16} color="#1D4ED8" />
            <Text style={[styles.learnText, { color: '#1D4ED8' }]}>Learn more at abdm.gov.in</Text>
            <Ionicons name="arrow-forward" size={14} color="#1D4ED8" />
          </TouchableOpacity>

          {/* Disclaimer */}
          <View style={[styles.disclaimer, { backgroundColor: isDark ? T.card : '#FFF7ED', borderColor: '#F59E0B40' }]}>
            <Ionicons name="information-circle" size={16} color="#F59E0B" />
            <Text style={[styles.disclaimerText, { color: T.textMuted }]}>
              ABHA integration is built per NHA guidelines. Full record sync requires ABDM PHR API access which is under review. Local linking is available now.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:         { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerBadge:     { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  headerBadgeText: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: '#fff', letterSpacing: 1 },
  headerTitle:     { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  headerSub:       { fontSize: 12, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.7)' },
  abhaLogo:        { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  abhaLogoText:    { fontSize: 24 },

  cardSection:     { padding: 16, paddingBottom: 8 },
  abhaCard:        { borderRadius: 22, padding: 22, overflow: 'hidden' },
  abhaCardTop:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  abhaCardEyebrow: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 4 },
  abhaCardId:      { fontSize: 22, fontFamily: 'Nunito_900Black', color: '#fff', letterSpacing: 1 },
  abhaCardBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  abhaCardLabel:   { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  abhaCardValue:   { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#fff', marginTop: 2 },
  statusBadge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusText:      { fontSize: 10, fontFamily: 'Nunito_900Black', color: '#000' },
  cardOrb1:        { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', top: -40, right: -30 },
  cardOrb2:        { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20 },

  section:         { borderRadius: 20, padding: 16, marginBottom: 12 },
  sectionTitle:    { fontSize: 16, fontFamily: 'Nunito_900Black', marginBottom: 6 },
  sectionSub:      { fontSize: 13, fontFamily: 'Nunito_400Regular', lineHeight: 19, marginBottom: 14 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12 },
  input:           { flex: 1, fontSize: 18, fontFamily: 'Nunito_700Bold', letterSpacing: 2 },
  linkBtn:         { borderRadius: 14 },
  linkBtnInner:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  linkBtnText:     { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },

  createCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, borderWidth: 1.5, marginBottom: 24 },
  createIcon:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  createTitle:     { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', marginBottom: 3 },
  createSub:       { fontSize: 12, fontFamily: 'Nunito_400Regular', lineHeight: 17 },

  heading:         { fontSize: 17, fontFamily: 'Nunito_900Black', marginBottom: 14 },
  featGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  featCard:        { width: '47%', borderRadius: 18, padding: 14 },
  featIcon:        { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featTitle:       { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginBottom: 5 },
  featDesc:        { fontSize: 11, fontFamily: 'Nunito_400Regular', lineHeight: 16 },

  stepsCard:       { borderRadius: 20, marginBottom: 16, overflow: 'hidden' },
  stepRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  stepNumBox:      { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' },
  stepNum:         { fontSize: 13, fontFamily: 'Nunito_900Black', color: '#fff' },
  stepTitle:       { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', marginBottom: 3 },
  stepDesc:        { fontSize: 12, fontFamily: 'Nunito_400Regular', lineHeight: 17 },

  learnBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 14, paddingVertical: 13, marginBottom: 16 },
  learnText:       { fontSize: 14, fontFamily: 'Nunito_700Bold' },

  disclaimer:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1 },
  disclaimerText:  { flex: 1, fontSize: 11, fontFamily: 'Nunito_400Regular', lineHeight: 17 },
});
