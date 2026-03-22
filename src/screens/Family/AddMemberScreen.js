import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const RELATIONS = ['spouse','child','parent','sibling','grandparent','other'];
const AVATARS   = ['👨','👩','👦','👧','👴','👵','🧑','👶'];
const GENDERS   = ['female','male','other'];

export default function AddMemberScreen({ navigation }) {
  const { addFamilyMember } = useHealthStore();
  const { token } = useAuthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  const [form, setForm] = useState({
    name:'', age:'', gender:'female', relation:'spouse',
    conditions:'', medications:'', bloodGroup:'', avatar:'👨',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim()) { Alert.alert('Missing Name', 'Please enter member name.'); return; }
    addFamilyMember({
      ...form,
      age:         parseInt(form.age) || 0,
      conditions:  form.conditions  ? form.conditions.split(',').map(s=>s.trim()).filter(Boolean)  : [],
      medications: form.medications ? form.medications.split(',').map(s=>s.trim()).filter(Boolean) : [],
    }, token); // ← pass token for sync
    Alert.alert('✅ Added', `${form.name} added to your family.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={[{ flex:1 }, { backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#065F46','#10B981']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Family Member</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <Text style={[styles.label,{color:T.textSub}]}>Avatar</Text>
        <View style={styles.avatarRow}>
          {AVATARS.map(a => (
            <TouchableOpacity key={a} onPress={() => update('avatar', a)}
              style={[styles.avatarChip, { backgroundColor: T.card, borderColor: form.avatar===a ? '#10B981' : T.border },
                form.avatar===a && { backgroundColor:'#ECFDF5' }]}>
              <Text style={{ fontSize:24 }}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text style={[styles.label,{color:T.textSub}]}>Full Name *</Text>
        <View style={[styles.inputWrap,{backgroundColor:T.inputBg,borderColor:T.border}]}>
          <Ionicons name="person-outline" size={16} color={T.textMuted} />
          <TextInput style={[styles.input,{color:T.text}]} value={form.name} onChangeText={v=>update('name',v)} placeholder="Member's full name" placeholderTextColor={T.textMuted} />
        </View>

        {/* Age + Blood Group row */}
        <View style={{ flexDirection:'row', gap:12 }}>
          <View style={{ flex:1 }}>
            <Text style={[styles.label,{color:T.textSub}]}>Age</Text>
            <View style={[styles.inputWrap,{backgroundColor:T.inputBg,borderColor:T.border}]}>
              <TextInput style={[styles.input,{color:T.text}]} value={form.age} onChangeText={v=>update('age',v)} keyboardType="numeric" placeholder="Age" placeholderTextColor={T.textMuted} />
            </View>
          </View>
          <View style={{ flex:1 }}>
            <Text style={[styles.label,{color:T.textSub}]}>Blood Group</Text>
            <View style={[styles.inputWrap,{backgroundColor:T.inputBg,borderColor:T.border}]}>
              <TextInput style={[styles.input,{color:T.text}]} value={form.bloodGroup} onChangeText={v=>update('bloodGroup',v)} placeholder="e.g. O+" placeholderTextColor={T.textMuted} />
            </View>
          </View>
        </View>

        {/* Relation */}
        <Text style={[styles.label,{color:T.textSub}]}>Relation</Text>
        <View style={styles.chipRow}>
          {RELATIONS.map(r => (
            <TouchableOpacity key={r} onPress={() => update('relation', r)}
              style={[styles.chip, { backgroundColor: form.relation===r ? '#10B981' : T.card, borderColor: form.relation===r ? '#10B981' : T.border }]}>
              <Text style={[styles.chipText, { color: form.relation===r ? '#fff' : T.text }]}>
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gender */}
        <Text style={[styles.label,{color:T.textSub}]}>Gender</Text>
        <View style={styles.chipRow}>
          {GENDERS.map(g => (
            <TouchableOpacity key={g} onPress={() => update('gender', g)}
              style={[styles.chip, { backgroundColor: form.gender===g ? '#10B981' : T.card, borderColor: form.gender===g ? '#10B981' : T.border }]}>
              <Text style={[styles.chipText, { color: form.gender===g ? '#fff' : T.text }]}>
                {g.charAt(0).toUpperCase()+g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conditions */}
        <Text style={[styles.label,{color:T.textSub}]}>Medical Conditions (comma separated)</Text>
        <View style={[styles.inputWrap,{backgroundColor:T.inputBg,borderColor:T.border}]}>
          <Ionicons name="medical-outline" size={16} color={T.textMuted} />
          <TextInput style={[styles.input,{color:T.text}]} value={form.conditions} onChangeText={v=>update('conditions',v)} placeholder="e.g. Diabetes, Hypertension" placeholderTextColor={T.textMuted} />
        </View>

        {/* Medications */}
        <Text style={[styles.label,{color:T.textSub}]}>Medications (comma separated)</Text>
        <View style={[styles.inputWrap,{backgroundColor:T.inputBg,borderColor:T.border}]}>
          <Ionicons name="medkit-outline" size={16} color={T.textMuted} />
          <TextInput style={[styles.input,{color:T.text}]} value={form.medications} onChangeText={v=>update('medications',v)} placeholder="e.g. Metformin 500mg" placeholderTextColor={T.textMuted} />
        </View>

        <TouchableOpacity onPress={handleAdd} activeOpacity={0.88} style={{ marginTop:16 }}>
          <LinearGradient colors={['#065F46','#10B981']} style={styles.saveBtn}>
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Add Family Member</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal:20, paddingTop:12, paddingBottom:20 },
  backBtn: { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:10 },
  headerTitle: { color:'#fff', fontSize:20, fontWeight:'900' },
  label: { fontSize:12, fontWeight:'700', marginBottom:6, marginTop:14 },
  avatarRow: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:4 },
  avatarChip: { width:48, height:48, borderRadius:24, alignItems:'center', justifyContent:'center', borderWidth:2 },
  inputWrap: { flexDirection:'row', alignItems:'center', gap:10, borderRadius:12, paddingHorizontal:12, paddingVertical:11, borderWidth:1.5, marginBottom:2 },
  input: { flex:1, fontSize:14 },
  chipRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:2 },
  chip: { paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1.5 },
  chipText: { fontSize:13, fontWeight:'600' },
  saveBtn: { borderRadius:14, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10 },
  saveBtnText: { color:'#fff', fontSize:15, fontWeight:'900' },
});
