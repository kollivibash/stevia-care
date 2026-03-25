import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Animated, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '../../store/themeStore';

const EMERGENCY_NUMBERS = [
  { label: 'Ambulance',     number: '108', icon: 'car',            color: '#EF4444' },
  { label: 'Police',        number: '100', icon: 'shield',         color: '#3B82F6' },
  { label: 'Fire',          number: '101', icon: 'flame',          color: '#F97316' },
  { label: 'Women Helpline',number: '1091', icon: 'person',        color: '#EC4899' },
  { label: 'Child Helpline',number: '1098', icon: 'happy',         color: '#8B5CF6' },
  { label: 'Disaster',      number: '1078', icon: 'warning',       color: '#F59E0B' },
];

const FIRST_AID = [
  { title: 'Heart Attack',  steps: ['Call 108 immediately','Make person sit/lie comfortably','Loosen tight clothing','Give aspirin if available & not allergic','Do CPR if unconscious & not breathing'], icon: '🫀' },
  { title: 'Choking',       steps: ['Ask if they can cough','Encourage forceful coughing','Give 5 back blows between shoulder blades','5 abdominal thrusts (Heimlich)','Call 108 if not resolved'], icon: '🤚' },
  { title: 'Bleeding',      steps: ['Apply firm pressure with clean cloth','Keep pressure for 10–15 minutes','Do not remove cloth — add more if needed','Elevate injured area above heart','Call 108 for severe bleeding'], icon: '🩹' },
  { title: 'Burns',         steps: ['Cool with running water for 20 min','Do not use ice or butter','Cover with clean bandage','Do not pop blisters','Seek medical help for large burns'], icon: '🔥' },
  { title: 'Seizure',       steps: ['Clear the area around person','Cushion their head','Do not restrain them','Turn on side if vomiting','Time the seizure — call 108 if > 5 min'], icon: '⚡' },
  { title: 'Allergic Shock',steps: ['Use EpiPen if available','Call 108 immediately','Lay person flat, legs elevated','Loosen tight clothing','Stay with them until help arrives'], icon: '🚨' },
];

export default function EmergencySOSScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [expandedFirst, setExpandedFirst] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for SOS button
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const callNumber = (num) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`Call ${num}?`, `This will dial emergency number ${num}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Call ${num}`, style: 'destructive', onPress: () => Linking.openURL(`tel:${num}`) },
    ]);
  };

  // Direct dial 108 — no confirm dialog in real emergency
  const directCall108 = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Vibration.vibrate([0, 200, 100, 200]);
    Linking.openURL('tel:108');
  };

  const triggerSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Vibration.vibrate([0, 300, 100, 300, 100, 300]);
    setSosActive(true);
    Alert.alert('SOS Triggered', 'Calling 108 — Ambulance', [
      { text: 'Cancel', style: 'cancel', onPress: () => setSosActive(false) },
      { text: 'Call 108 Now', style: 'destructive', onPress: () => { directCall108(); setSosActive(false); } },
    ]);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#7F1D1D', '#DC2626', '#EF4444']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Emergency SOS</Text>
            <Text style={styles.headerSub}>Stevia Care · Quick emergency help</Text>
          </View>
          <Ionicons name="warning" size={32} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* DIRECT 108 CALL — Prominent top button */}
        <TouchableOpacity onPress={directCall108} activeOpacity={0.8} style={styles.directCallBtn}>
          <View style={styles.directCallInner}>
            <View style={styles.directCallIcon}>
              <Ionicons name="call" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.directCallTitle}>Call 108 — Ambulance</Text>
              <Text style={styles.directCallSub}>Tap to call directly · No confirmation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>

        {/* BIG SOS BUTTON */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity onPress={triggerSOS} activeOpacity={0.85}>
            <LinearGradient colors={sosActive ? ['#991B1B','#B91C1C'] : ['#DC2626','#EF4444']} style={styles.sosBtn}>
              <View style={styles.sosInner}>
                <Ionicons name="warning" size={40} color="#fff" />
                <Text style={styles.sosBtnText}>SOS</Text>
                <Text style={styles.sosBtnSub}>Hold for full emergency alert</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* EMERGENCY NUMBERS */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Emergency Numbers</Text>
        <View style={styles.numbersGrid}>
          {EMERGENCY_NUMBERS.map((em, i) => (
            <TouchableOpacity key={i} style={[styles.numCard, { backgroundColor: T.card }]}
              onPress={() => callNumber(em.number)} activeOpacity={0.8}>
              <View style={[styles.numIcon, { backgroundColor: em.color + '18' }]}>
                <Ionicons name={em.icon} size={22} color={em.color} />
              </View>
              <Text style={[styles.numLabel, { color: T.text }]}>{em.label}</Text>
              <Text style={[styles.numNumber, { color: em.color }]}>{em.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FIRST AID */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>First Aid Guide</Text>
        {FIRST_AID.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.firstAidCard, { backgroundColor: T.card }]}
            onPress={() => setExpandedFirst(expandedFirst === i ? null : i)} activeOpacity={0.88}>
            <View style={styles.firstAidHeader}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={[styles.firstAidTitle, { color: T.text }]}>{item.title}</Text>
              <Ionicons name={expandedFirst === i ? 'chevron-up' : 'chevron-down'} size={18} color={T.textMuted} />
            </View>
            {expandedFirst === i && (
              <View style={{ marginTop: 12, gap: 8 }}>
                {item.steps.map((step, si) => (
                  <View key={si} style={styles.stepRow}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>{si + 1}</Text></View>
                    <Text style={[styles.stepText, { color: T.textSub }]}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  directCallBtn:   { backgroundColor: '#16A34A', borderRadius: 18, marginBottom: 14, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  directCallInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  directCallIcon:  { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  directCallTitle: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_900Black' },
  directCallSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  sosBtn: { borderRadius: 24, marginBottom: 24, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 },
  sosInner: { alignItems: 'center', paddingVertical: 36, gap: 6 },
  sosBtnText: { color: '#fff', fontSize: 42, fontFamily: 'Nunito_900Black', letterSpacing: 4 },
  sosBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', marginBottom: 14, marginTop: 4 },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  numCard: { width: '30%', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  numIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numLabel: { fontSize: 11, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
  numNumber: { fontSize: 16, fontFamily: 'Nunito_900Black' },
  firstAidCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  firstAidHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  firstAidTitle: { flex: 1, fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { color: '#fff', fontSize: 11, fontFamily: 'Nunito_900Black' },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20, fontFamily: 'Nunito_400Regular' },
});
