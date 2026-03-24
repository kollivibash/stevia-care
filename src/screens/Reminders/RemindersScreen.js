import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const TIME_SLOTS = [
  { key: 'morning',   label: 'Morning',   icon: '🌅', hours: [5,6,7,8,9,10,11] },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️', hours: [12,13,14,15,16] },
  { key: 'evening',   label: 'Evening',   icon: '🌆', hours: [17,18,19,20] },
  { key: 'night',     label: 'Night',     icon: '🌙', hours: [21,22,23,0,1,2,3,4] },
];

const MED_COLORS = ['#16A34A','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#EC4899'];

export default function RemindersScreen({ navigation }) {
  const { reminders, addReminder, deleteReminder, adherenceLogs, logAdherence } = useHealthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  const [activeSlot, setActiveSlot] = useState(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
  });

  const [showAdd, setShowAdd] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medTime, setMedTime] = useState('08:00');

  const allMeds = reminders.flatMap(r =>
    r.medicines.map(m => ({ ...m, memberName: r.memberName, reminderId: r.id }))
  );

  const getSlotMeds = (slot) => {
    const slotHours = TIME_SLOTS.find(s => s.key === slot)?.hours || [];
    return allMeds.filter(m => {
      const times = Array.isArray(m.times) ? m.times : [m.time || '08:00'];
      return times.some(t => {
        const h = parseInt(t.split(':')[0]);
        return slotHours.includes(h);
      });
    });
  };

  const handleLog = (med, action) => {
    logAdherence({ medicineName: med.name, memberName: med.memberName, action, time: med.times?.[0] || med.time });
    Alert.alert(action === 'taken' ? '✅ Marked Taken' : '⏭ Skipped', `${med.name} marked as ${action}`);
  };

  const handleAdd = () => {
    if (!memberName.trim() || !medName.trim()) {
      Alert.alert('Missing Info', 'Please enter member name and medicine name.'); return;
    }
    addReminder({
      memberName: memberName.trim(),
      medicines: [{ name: medName.trim(), dose: medDose.trim(), times: [medTime], color: MED_COLORS[Math.floor(Math.random()*MED_COLORS.length)] }],
    });
    setMemberName(''); setMedName(''); setMedDose(''); setMedTime('08:00');
    setShowAdd(false);
  };

  const totalTaken  = adherenceLogs.filter(l => l.action === 'taken').length;
  const totalSkipped = adherenceLogs.filter(l => l.action === 'skipped').length;
  const adherencePct = (totalTaken + totalSkipped) > 0 ? Math.round(totalTaken / (totalTaken + totalSkipped) * 100) : 100;

  const slotMeds = getSlotMeds(activeSlot);

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#92400E', '#F59E0B', '#FCD34D']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Medicine Tracker</Text>
            <Text style={styles.headerSub}>{allMeds.length} medicines · {reminders.length} members</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}>
            <Ionicons name="add" size={22} color="#F59E0B" />
          </TouchableOpacity>
        </View>

        {/* Adherence */}
        <View style={styles.adherenceRow}>
          <View style={styles.adherenceStat}>
            <Text style={styles.adherenceNum}>{adherencePct}%</Text>
            <Text style={styles.adherenceLabel}>Adherence</Text>
          </View>
          <View style={[styles.adherenceStat, styles.adherenceBorder]}>
            <Text style={styles.adherenceNum}>{totalTaken}</Text>
            <Text style={styles.adherenceLabel}>Taken</Text>
          </View>
          <View style={styles.adherenceStat}>
            <Text style={styles.adherenceNum}>{totalSkipped}</Text>
            <Text style={styles.adherenceLabel}>Skipped</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Time Slot Tabs */}
      <View style={[styles.slotTabs, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        {TIME_SLOTS.map(slot => (
          <TouchableOpacity key={slot.key} style={[styles.slotTab, activeSlot === slot.key && styles.slotTabActive]}
            onPress={() => setActiveSlot(slot.key)}>
            <Text style={styles.slotIcon}>{slot.icon}</Text>
            <Text style={[styles.slotLabel, { color: activeSlot === slot.key ? '#F59E0B' : T.textMuted }]}>{slot.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* AI Parse */}
        <TouchableOpacity onPress={() => navigation.navigate('HandwrittenRx')} activeOpacity={0.88}>
          <LinearGradient colors={['#14532D','#16A34A']} style={styles.aiBanner}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.aiBannerText}>📷 Scan Prescription with AI</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Slot medicines */}
        {slotMeds.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: T.card }]}>
            <Text style={{ fontSize: 40 }}>💊</Text>
            <Text style={[styles.emptyTitle, { color: T.text }]}>No medicines for {activeSlot}</Text>
            <Text style={[styles.emptySub, { color: T.textMuted }]}>Tap + to add a medicine reminder</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: T.text }]}>{TIME_SLOTS.find(s=>s.key===activeSlot)?.icon} {TIME_SLOTS.find(s=>s.key===activeSlot)?.label} Medicines</Text>
            {slotMeds.map((med, i) => (
              <View key={i} style={[styles.medCard, { backgroundColor: T.card, borderLeftColor: med.color || '#16A34A' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, { color: T.text }]}>{med.name}</Text>
                  <Text style={[styles.medMeta, { color: T.textMuted }]}>{med.memberName} · {(Array.isArray(med.times) ? med.times : [med.time]).join(', ')}</Text>
                  {med.dose ? <Text style={[styles.medDose, { color: T.textSub }]}>{med.dose}</Text> : null}
                </View>
                <View style={styles.medActions}>
                  <TouchableOpacity onPress={() => handleLog(med, 'taken')} style={[styles.takenBtn, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="checkmark" size={16} color="#16A34A" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleLog(med, 'skipped')} style={[styles.skipBtn, { backgroundColor: T.cardAlt }]}>
                    <Ionicons name="close" size={16} color={T.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* All reminders */}
        {reminders.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: T.text, marginTop: 16 }]}>All Members</Text>
            {reminders.map((rem, i) => (
              <View key={i} style={[styles.memberCard, { backgroundColor: T.card }]}>
                <View style={styles.memberCardHeader}>
                  <View style={[styles.memberAvatar, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="person" size={18} color="#16A34A" />
                  </View>
                  <Text style={[styles.memberName, { color: T.text }]}>{rem.memberName}</Text>
                  <Text style={[styles.memberMedCount, { color: T.textMuted }]}>{rem.medicines.length} medicine{rem.medicines.length !== 1 ? 's' : ''}</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Delete?', `Remove all reminders for ${rem.memberName}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(rem.id) },
                  ])}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                {rem.medicines.map((m, mi) => (
                  <View key={mi} style={[styles.medInMember, { borderTopColor: T.border }]}>
                    <View style={[styles.medColorDot, { backgroundColor: m.color || '#16A34A' }]} />
                    <Text style={[{ fontSize: 13, flex: 1 }, { color: T.text }]}>{m.name}</Text>
                    <Text style={[{ fontSize: 11 }, { color: T.textMuted }]}>{(Array.isArray(m.times) ? m.times : [m.time]).join(', ')}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Add Medicine Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <View style={[styles.modal, { backgroundColor: T.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: T.text }]}>Add Medicine Reminder</Text>
            {[
              { label: 'Member Name', value: memberName, setter: setMemberName, placeholder: 'e.g. Vib, Mom, Dad' },
              { label: 'Medicine Name', value: medName, setter: setMedName, placeholder: 'e.g. Metformin 500mg' },
              { label: 'Dose (optional)', value: medDose, setter: setMedDose, placeholder: 'e.g. 1 tablet after food' },
              { label: 'Time (HH:MM)', value: medTime, setter: setMedTime, placeholder: '08:00' },
            ].map(f => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={[styles.fieldLabel, { color: T.textSub }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
                  value={f.value} onChangeText={f.setter} placeholder={f.placeholder}
                  placeholderTextColor={T.textMuted}
                />
              </View>
            ))}
            <TouchableOpacity onPress={handleAdd} activeOpacity={0.88}>
              <LinearGradient colors={['#92400E','#F59E0B']} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save Reminder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  adherenceRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  adherenceStat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  adherenceBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  adherenceNum: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black' },
  adherenceLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontFamily: 'Nunito_700Bold', marginTop: 2 },
  slotTabs: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 8 },
  slotTab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  slotTabActive: { borderBottomWidth: 2, borderBottomColor: '#F59E0B' },
  slotIcon: { fontSize: 16 },
  slotLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', marginTop: 2 },
  aiBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 16 },
  aiBannerText: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  sectionTitle: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', marginBottom: 12 },
  medCard: { borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medName: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  medMeta: { fontSize: 11, marginTop: 2, fontFamily: 'Nunito_400Regular' },
  medDose: { fontSize: 11, marginTop: 2, fontStyle: 'italic', fontFamily: 'Nunito_400Regular' },
  medActions: { flexDirection: 'row', gap: 8 },
  takenBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  skipBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  empty: { borderRadius: 16, padding: 40, alignItems: 'center', gap: 10, marginTop: 10 },
  emptyTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  emptySub: { fontSize: 13, textAlign: 'center', fontFamily: 'Nunito_400Regular' },
  memberCard: { borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  memberCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  memberAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  memberName: { flex: 1, fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  memberMedCount: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  medInMember: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, marginTop: 4, borderTopWidth: 1 },
  medColorDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontFamily: 'Nunito_900Black', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontFamily: 'Nunito_700Bold', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_900Black' },
});
