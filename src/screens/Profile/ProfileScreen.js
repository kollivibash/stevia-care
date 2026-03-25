/**
 * Profile Screen — inspired by:
 *   Apple Health   → clean white sections with subtle dividers
 *   Calm/Headspace → warm personal header with avatar
 *   Noom           → streak and progress gamification
 *   Medisafe       → settings list with right chevrons
 *   BetterHelp     → premium upgrade card
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme, tr } from '../../store/themeStore';

const LANGUAGES = [
  { label: 'English',   code: 'en', native: 'English'    },
  { label: 'Hindi',     code: 'hi', native: 'हिन्दी'       },
  { label: 'Bengali',   code: 'bn', native: 'বাংলা'        },
  { label: 'Marathi',   code: 'mr', native: 'मराठी'        },
  { label: 'Telugu',    code: 'te', native: 'తెలుగు'       },
  { label: 'Tamil',     code: 'ta', native: 'தமிழ்'       },
  { label: 'Gujarati',  code: 'gu', native: 'ગુજરાતી'      },
  { label: 'Urdu',      code: 'ur', native: 'اردو'        },
  { label: 'Kannada',   code: 'kn', native: 'ಕನ್ನಡ'       },
  { label: 'Odia',      code: 'or', native: 'ଓଡ଼ିଆ'      },
  { label: 'Malayalam', code: 'ml', native: 'മലയാളം'      },
];

function MenuRow({ icon, iconBg, label, sub, right, onPress, danger }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  return (
    <TouchableOpacity style={[styles.menuRow, { borderBottomColor: T.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg || '#F0FDF4' }]}>
        <Ionicons name={icon} size={18} color={danger ? '#EF4444' : iconBg ? '#fff' : '#16A34A'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: danger ? '#EF4444' : T.text }]}>{label}</Text>
        {sub ? <Text style={[styles.menuSub, { color: T.textMuted }]}>{sub}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const { reminders, labReports, familyMembers } = useHealthStore();
  const { isDark, setDark, language, languageCode, setLanguage } = useThemeStore();
  const T = getTheme(isDark);
  const s = tr(languageCode);
  const [notifOn, setNotifOn] = useState(true);
  const [showLang, setShowLang] = useState(false);

  const handleLanguage = async (lang) => {
    await setLanguage(lang.label, lang.code);
    setShowLang(false);
    // Show alert in the NEW language immediately
    const newS = tr(lang.code);
    Alert.alert(`🌐 ${newS('languageUpdated')}`, `${newS('languageUpdatedMsg')} ${lang.native}`);
  };

  const handleLogout = () => {
    Alert.alert(s('signOut'), 'Are you sure you want to sign out of Stevia Care?', [
      { text: s('cancel'), style: 'cancel' },
      { text: s('signOut'), style: 'destructive', onPress: logout },
    ]);
  };

  const stats = [
    { val: labReports.length,   label: 'Reports'  },
    { val: familyMembers.length, label: 'Members'  },
    { val: reminders.flatMap(r => r.medicines).length, label: 'Medicines' },
  ];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── HEADER — Calm/Headspace warm personal header ── */}
        <LinearGradient colors={['#064E3B', '#065F46', '#16A34A']} style={styles.header}>
          <View style={styles.profileRow}>
            <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.8}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{(user?.name || 'U')[0].toUpperCase()}</Text>
              </View>
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={11} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.profileName}>{user?.name || 'Stevia Care User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@steviacare.in'}</Text>
              <View style={styles.freeBadge}>
                <Ionicons name="leaf-outline" size={10} color="#4ADE80" />
                <Text style={styles.freeBadgeText}>Free Member</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Health Score bar */}
          <View style={styles.scoreBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreBarLabel}>Health Score</Text>
              <View style={styles.scoreBarTrack}>
                <View style={[styles.scoreBarFill, { width: '78%' }]} />
              </View>
              <Text style={styles.scoreBarSub}>Based on your profile and activity</Text>
            </View>
            <Text style={styles.scoreBarNum}>78</Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 16 }}>

          {/* ── BetterHelp-style Premium Upgrade Card ── */}
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient colors={['#1E1B4B','#3730A3','#6366F1']} style={styles.premCard}>
              <View style={styles.premOrb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.premLabel}>STEVIA PRO</Text>
                <Text style={styles.premTitle}>Upgrade to Premium</Text>
                <Text style={styles.premSub}>Unlimited AI · Family plans · PDF exports</Text>
              </View>
              <View style={styles.premPriceBox}>
                <Text style={styles.premPrice}>₹99</Text>
                <Text style={styles.premPer}>/month</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── HEALTH PROFILE Section ── */}
          <Text style={[styles.sectionTitle, { color: T.textMuted }]}>HEALTH PROFILE</Text>
          <View style={[styles.menuCard, { backgroundColor: T.card }]}>
            <MenuRow icon="person-outline"    iconBg="#DCFCE7"   label="Personal Info"       sub={`${user?.name || ''} · ${user?.age || ''}y`}  right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => navigation.navigate('PersonalInfo')}      />
            <MenuRow icon="fitness-outline"   iconBg="#FEE2E2"   label="Medical Conditions"  sub="Conditions & medications"                        right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => navigation.navigate('MedicalConditions')} />
            <MenuRow icon="water-outline"     iconBg="#DBEAFE"   label="Blood & Vitals"      sub={`Blood: ${user?.bloodGroup || 'Not set'}`}       right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => navigation.navigate('BloodVitals')}       />
          </View>

          {/* ── APP SETTINGS Section ── */}
          <Text style={[styles.sectionTitle, { color: T.textMuted }]}>APP SETTINGS</Text>
          <View style={[styles.menuCard, { backgroundColor: T.card }]}>
            <MenuRow icon="notifications-outline" iconBg="#FEF3C7" label="Notifications" sub="Medicine reminders active"
              right={<Switch value={notifOn} onValueChange={setNotifOn} trackColor={{ true: '#16A34A' }} />}
            />
            <MenuRow icon="moon-outline" iconBg="#EDE9FE" label="Dark Mode" sub={isDark ? 'Dark theme active' : 'Light theme active'}
              right={<Switch value={isDark} onValueChange={setDark} trackColor={{ true: '#16A34A' }} />}
            />
            <MenuRow icon="language-outline" iconBg="#DCFCE7" label="Language" sub={`${language} — tap to change`}
              right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />}
              onPress={() => setShowLang(true)}
            />
          </View>

          {/* ── SUPPORT Section ── */}
          <Text style={[styles.sectionTitle, { color: T.textMuted }]}>SUPPORT</Text>
          <View style={[styles.menuCard, { backgroundColor: T.card }]}>
            <MenuRow icon="help-circle-outline" iconBg="#EDE9FE" label="Help & FAQ"       sub="Get help and answers"      right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => navigation.navigate('HelpFAQ')}        />
            <MenuRow icon="document-outline"    iconBg="#F1F5F9" label="Privacy Policy"   sub="How we use your data"      right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => Alert.alert('Privacy Policy', 'Visit steviacare.in/privacy')} />
            <MenuRow icon="shield-outline"      iconBg="#F1F5F9" label="Terms of Service" sub="Our terms and conditions"  right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => Alert.alert('Terms', 'Visit steviacare.in/terms')} />
            <MenuRow icon="star-outline"        iconBg="#FEF3C7" label="Rate the App"     sub="Love us? Let us know!"     right={<Ionicons name="chevron-forward" size={16} color={T.textMuted} />} onPress={() => Alert.alert('Rate Stevia Care', 'Thank you! Rating opens when app is on Play Store.')} />
          </View>

          {/* Logout */}
          <View style={[styles.menuCard, { backgroundColor: T.card }]}>
            <MenuRow icon="log-out-outline" danger label="Sign Out" sub="Logout from Stevia Care" right={<Ionicons name="chevron-forward" size={16} color="#EF4444" />} onPress={handleLogout} />
          </View>

          {/* App brand footer */}
          <View style={styles.footer}>
            <Text style={{ fontSize: 20 }}>🌿</Text>
            <Text style={[styles.footerName, { color: T.text }]}>Stevia Care</Text>
            <Text style={[styles.footerVer, { color: T.textMuted }]}>v1.0.0 · Made with ❤️ in India</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLang} transparent animationType="slide" onRequestClose={() => setShowLang(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowLang(false)}>
          <View style={[styles.langSheet, { backgroundColor: T.card }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.langTitle, { color: T.text }]}>Choose Language</Text>
            <Text style={[styles.langSub, { color: T.textMuted }]}>Stevia AI will respond in your selected language</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map(lang => {
                const selected = language === lang.label;
                return (
                  <TouchableOpacity key={lang.code} onPress={() => handleLanguage(lang)} activeOpacity={0.8}
                    style={[styles.langChip, { backgroundColor: selected ? '#16A34A' : T.cardAlt, borderColor: selected ? '#16A34A' : T.border }]}>
                    <Text style={[styles.langNative, { color: selected ? '#fff' : T.text }]}>{lang.native}</Text>
                    <Text style={[styles.langEn, { color: selected ? 'rgba(255,255,255,0.7)' : T.textMuted }]}>{lang.label}</Text>
                    {selected && <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)' },
  avatarLetter: { color: '#fff', fontSize: 26, fontFamily: 'Nunito_900Black' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileName: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black' },
  profileEmail: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  freeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  freeBadgeText: { color: '#4ADE80', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statVal: { color: '#fff', fontSize: 18, fontFamily: 'Nunito_900Black' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  scoreBar: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  scoreBarLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Nunito_700Bold', marginBottom: 6 },
  scoreBarTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: 7, backgroundColor: '#4ADE80', borderRadius: 4 },
  scoreBarSub: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 4, fontFamily: 'Nunito_400Regular' },
  scoreBarNum: { color: '#fff', fontSize: 32, fontFamily: 'Nunito_900Black' },
  premCard: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  premOrb: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', right: 60, top: -30 },
  premLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1.5, marginBottom: 4 },
  premTitle: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_900Black', marginBottom: 4 },
  premSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'Nunito_400Regular' },
  premPriceBox: { alignItems: 'center' },
  premPrice: { color: '#fff', fontSize: 26, fontFamily: 'Nunito_900Black' },
  premPer: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Nunito_400Regular' },
  sectionTitle: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1.5, marginBottom: 8, marginTop: 16, paddingHorizontal: 4 },
  menuCard: { borderRadius: 18, overflow: 'hidden', marginBottom: 4, shadowColor: '#14532D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  menuSub: { fontSize: 11, marginTop: 1, fontFamily: 'Nunito_400Regular' },
  footer: { alignItems: 'center', gap: 4, paddingVertical: 24 },
  footerName: { fontSize: 15, fontFamily: 'Nunito_900Black' },
  footerVer: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  langSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 18 },
  langTitle: { fontSize: 20, fontFamily: 'Nunito_900Black', marginBottom: 4 },
  langSub: { fontSize: 12, marginBottom: 18, fontFamily: 'Nunito_400Regular' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langChip: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, minWidth: '28%', alignItems: 'center', position: 'relative' },
  langNative: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  langEn: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
});
