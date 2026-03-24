import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { ScreenHeader, Card, Button, Input } from '../../components';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="My Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{(user?.name || 'U')[0]}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Ionicons name={editing ? 'close' : 'pencil'} size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <Input label="Full Name" value={form.name} onChangeText={v => setForm(p => ({...p, name: v}))} />
              <Input label="Age" value={String(form.age || '')} onChangeText={v => setForm(p => ({...p, age: v}))} keyboardType="numeric" />
              <Input label="Conditions" value={form.conditions} onChangeText={v => setForm(p => ({...p, conditions: v}))} placeholder="e.g. Diabetes, Hypertension" />
              <Input label="Medications" value={form.medications} onChangeText={v => setForm(p => ({...p, medications: v}))} placeholder="e.g. Metformin 500mg" />
              <Button title="Save Changes" onPress={handleSave} style={{ marginTop: 8 }} />
            </>
          ) : (
            <>
              {[
                { label: 'Age', value: `${user?.age} years`, icon: 'calendar-outline' },
                { label: 'Gender', value: user?.gender || 'Not set', icon: 'person-outline' },
                { label: 'Blood Group', value: user?.bloodGroup || 'Not set', icon: 'water-outline' },
                { label: 'Conditions', value: user?.conditions || 'None', icon: 'medical-outline' },
                { label: 'Medications', value: user?.medications || 'None', icon: 'medkit-outline' },
              ].map(item => (
                <View key={item.label} style={styles.infoRow}>
                  <Ionicons name={item.icon} size={18} color={COLORS.primary} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </Card>

        <Button
          title="Sign Out"
          variant="outline"
          icon="log-out-outline"
          onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
          ])}
          style={styles.logoutBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 32, fontFamily: 'Nunito_800ExtraBold' },
  name: { fontSize: SIZES.xl, fontFamily: 'Nunito_800ExtraBold', color: COLORS.textPrimary },
  email: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: SIZES.md, fontFamily: 'Nunito_700Bold', color: COLORS.textPrimary },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoIcon: { marginRight: 12, marginTop: 2 },
  infoLabel: { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold' },
  infoValue: { fontSize: SIZES.base, color: COLORS.textPrimary, fontFamily: 'Nunito_600SemiBold', marginTop: 1 },
  logoutBtn: { marginTop: 8 },
});
