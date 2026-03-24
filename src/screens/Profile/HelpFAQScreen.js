import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { q: 'How does the AI lab report analyzer work?', a: 'Upload your lab report as a photo or PDF. Our AI reads each parameter, compares it to reference ranges, and explains what each value means in plain English. It never diagnoses — it helps you understand.' },
  { q: 'Is my health data private?', a: 'Yes. All data is encrypted with AES-256. We never sell or share your data with advertisers. You can request deletion at any time from Privacy & Security settings.' },
  { q: 'Why is the AI giving a wrong answer?', a: 'AI can make mistakes. Always verify AI health insights with a qualified doctor. The AI is meant to help you understand, not replace medical advice.' },
  { q: 'How do medicine reminders work?', a: 'After adding medicines in the Medicine Tracker, enable Notifications in Profile settings. The app schedules daily notifications at the exact times you set.' },
  { q: 'Can I add my whole family?', a: 'Yes! Go to the Family tab and tap Add Member. You can add unlimited family members and track their medicines, conditions and health data separately.' },
  { q: 'The period tracker prediction is wrong — why?', a: 'Period predictions are based on your logged cycle history. The more cycles you log, the more accurate predictions become. Log at least 3 cycles for reliable predictions.' },
  { q: 'How do I change the app language?', a: 'Go to Profile → Language and select from 11 Indian languages. AI responses will also switch to your chosen language.' },
  { q: 'Is the demo account real?', a: 'The demo account is pre-filled with sample data so you can explore all features. Your real account data is separate and private.' },
  { q: 'I forgot my password. What do I do?', a: 'On the login screen, tap "Forgot password?" and enter your registered email. You will receive a password reset link within a few minutes.' },
  { q: 'How do I contact support?', a: 'Email us at support@healthpilot.in — we typically respond within 24 hours. For urgent issues, use the Emergency SOS feature to alert your contacts.' },
];

export default function HelpFAQScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [open, setOpen] = useState(null);

  const toggle = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === i ? null : i);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#4C1D95', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <Text style={styles.headerSub}>Frequently asked questions</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {FAQS.map((faq, i) => (
          <TouchableOpacity key={i} style={[styles.card, { backgroundColor: T.card, borderColor: open === i ? '#8B5CF6' : T.border }]} onPress={() => toggle(i)} activeOpacity={0.85}>
            <View style={styles.qRow}>
              <Ionicons name={open === i ? 'chevron-up-circle' : 'help-circle-outline'} size={20} color={open === i ? '#8B5CF6' : T.textMuted} />
              <Text style={[styles.question, { color: T.text }]}>{faq.q}</Text>
            </View>
            {open === i && (
              <Text style={[styles.answer, { color: T.textSub, borderTopColor: T.border }]}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  qRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  question: { flex: 1, fontSize: 14, fontFamily: 'Nunito_700Bold', lineHeight: 20 },
  answer: { fontSize: 13, lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
});
