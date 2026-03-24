import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';

export default function CaregiverScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const { familyMembers } = useHealthStore();
  const { user } = useAuthStore();

  const [caregiverCode, setCaregiverCode] = useState('');
  const [linkedCode]  = useState(`STEVIA-${(user?.id || 'USER').slice(-6).toUpperCase()}`);
  const [remoteAlerts, setRemoteAlerts] = useState(true);
  const [missedDoseAlert, setMissedDoseAlert] = useState(true);

  const copyCode = () => {
    Alert.alert('Code Copied!', `Share this code with your caregiver:\n\n${linkedCode}\n\nThey can link to your account using this code in their Stevia Care app.`);
  };

  const linkCaregiver = () => {
    if (!caregiverCode.trim()) { Alert.alert('Enter a caregiver code'); return; }
    Alert.alert('🔗 Linking...', `Sending request to link with ${caregiverCode}.\n\nThis feature sends a request to the account holder for approval. Full caregiver linking coming in next update!`);
  };

  const elderMembers = familyMembers.filter(m =>
    m.relation === 'parent' || m.relation === 'grandparent' || (parseInt(m.age) >= 55)
  );

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <LinearGradient colors={['#7C2D12','#C2410C','#EA580C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.hIcon}><Ionicons name="heart" size={28} color="#fff" /></View>
        <Text style={styles.hTitle}>Caregiver Mode</Text>
        <Text style={styles.hSub}>Manage your loved ones' health remotely</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:60 }}>

        {/* What is caregiver mode */}
        <View style={[styles.card, { backgroundColor:'#FFF7ED', borderColor:'#FED7AA', borderWidth:1 }]}>
          <Text style={styles.whatTitle}>❤️ What is Caregiver Mode?</Text>
          <Text style={styles.whatSub}>
            If you are an adult child managing your parent's health, or a family member looking after an elderly relative — this mode lets you monitor their medicines, vitals, and health from your own phone. They stay independent, you stay informed.
          </Text>
        </View>

        {/* Your caregiver code */}
        <View style={[styles.card, { backgroundColor:T.card }]}>
          <Text style={[styles.secTitle, { color:T.text }]}>Your Account Code</Text>
          <Text style={[styles.secSub, { color:T.textSub }]}>Share this with someone who wants to monitor your health</Text>
          <View style={[styles.codeBox, { backgroundColor:'#FFF7ED', borderColor:'#FDBA74' }]}>
            <Text style={styles.codeText}>{linkedCode}</Text>
            <TouchableOpacity onPress={copyCode} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color="#EA580C" />
              <Text style={{ color:'#EA580C', fontSize:12, fontFamily:'Nunito_700Bold' }}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Link to someone */}
        <View style={[styles.card, { backgroundColor:T.card }]}>
          <Text style={[styles.secTitle, { color:T.text }]}>Link to a Family Member</Text>
          <Text style={[styles.secSub, { color:T.textSub }]}>Enter the code from your parent or relative's Stevia Care app</Text>
          <View style={[styles.inputWrap, { backgroundColor:T.inputBg, borderColor:T.border }]}>
            <Ionicons name="link-outline" size={16} color={T.textMuted} />
            <TextInput
              style={[styles.input, { color:T.text }]}
              value={caregiverCode}
              onChangeText={setCaregiverCode}
              placeholder="e.g. STEVIA-ABC123"
              placeholderTextColor={T.textMuted}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity onPress={linkCaregiver} activeOpacity={0.88} style={{ marginTop:12 }}>
            <LinearGradient colors={['#7C2D12','#EA580C']} style={styles.linkBtn}>
              <Ionicons name="heart-circle" size={18} color="#fff" />
              <Text style={styles.linkBtnText}>Send Link Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Alert settings */}
        <View style={[styles.card, { backgroundColor:T.card }]}>
          <Text style={[styles.secTitle, { color:T.text }]}>Alert Settings</Text>
          <View style={styles.settingRow}>
            <View style={{ flex:1 }}>
              <Text style={[styles.settingLabel, { color:T.text }]}>Remote health alerts</Text>
              <Text style={[styles.settingSub, { color:T.textSub }]}>Get notified of family health updates</Text>
            </View>
            <Switch value={remoteAlerts} onValueChange={setRemoteAlerts} trackColor={{ true:'#EA580C' }} />
          </View>
          <View style={styles.settingRow}>
            <View style={{ flex:1 }}>
              <Text style={[styles.settingLabel, { color:T.text }]}>Missed dose alerts</Text>
              <Text style={[styles.settingSub, { color:T.textSub }]}>Alert if linked person misses medicine</Text>
            </View>
            <Switch value={missedDoseAlert} onValueChange={setMissedDoseAlert} trackColor={{ true:'#EA580C' }} />
          </View>
        </View>

        {/* Elder family members */}
        {elderMembers.length > 0 && (
          <View style={[styles.card, { backgroundColor:T.card }]}>
            <Text style={[styles.secTitle, { color:T.text }]}>Family Members to Monitor</Text>
            {elderMembers.map((m, i) => (
              <View key={i} style={[styles.memberRow, { backgroundColor:T.bg }]}>
                <View style={styles.memberAvatar}>
                  <Text style={{ fontSize:24 }}>{m.avatar || '👴'}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[{ fontSize:14, fontFamily:'Nunito_700Bold' }, { color:T.text }]}>{m.name}</Text>
                  <Text style={[{ fontSize:12 }, { color:T.textSub }]}>{m.age} years · {m.relation}</Text>
                  {m.conditions?.length > 0 && (
                    <Text style={[{ fontSize:11, marginTop:2 }, { color:'#EF4444' }]}>⚠️ {m.conditions.slice(0,2).join(', ')}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor:'#DCFCE7' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={{ fontSize:10, color:'#14532D', fontFamily:'Nunito_700Bold' }}>Linked</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Coming soon features */}
        <View style={[styles.card, { backgroundColor:T.card }]}>
          <Text style={[styles.secTitle, { color:T.text }]}>Coming Soon</Text>
          {[
            { icon:'📊', label:'Real-time vitals dashboard for linked members' },
            { icon:'💊', label:'See if parent took their medicines today' },
            { icon:'📍', label:'Location sharing for elderly family' },
            { icon:'🆘', label:'Emergency alert button for linked accounts' },
            { icon:'📞', label:'One-tap video call to family member' },
          ].map((f, i) => (
            <View key={i} style={{ flexDirection:'row', gap:12, alignItems:'center', paddingVertical:8, borderBottomWidth:0.5, borderBottomColor:T.border }}>
              <Text style={{ fontSize:20 }}>{f.icon}</Text>
              <Text style={[{ fontSize:13, flex:1 }, { color:T.textSub }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:      { padding:20, paddingTop:16, paddingBottom:28 },
  back:        { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 },
  hIcon:       { width:56, height:56, borderRadius:28, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:10 },
  hTitle:      { color:'#fff', fontSize:22, fontFamily:'Nunito_900Black' },
  hSub:        { color:'rgba(255,255,255,0.75)', fontSize:13, marginTop:4 },
  card:        { borderRadius:16, padding:16, marginBottom:12 },
  whatTitle:   { fontSize:14, fontFamily:'Nunito_800ExtraBold', color:'#C2410C', marginBottom:6 },
  whatSub:     { fontSize:13, color:'#9A3412', lineHeight:20 },
  secTitle:    { fontSize:15, fontFamily:'Nunito_800ExtraBold', marginBottom:4 },
  secSub:      { fontSize:12, marginBottom:14 },
  codeBox:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14, borderRadius:12, borderWidth:1.5, marginBottom:4 },
  codeText:    { fontSize:18, fontFamily:'Nunito_900Black', color:'#EA580C', letterSpacing:2 },
  copyBtn:     { flexDirection:'row', gap:6, alignItems:'center', padding:8 },
  inputWrap:   { flexDirection:'row', alignItems:'center', gap:10, borderRadius:12, paddingHorizontal:12, paddingVertical:11, borderWidth:1.5 },
  input:       { flex:1, fontSize:14, letterSpacing:1 },
  linkBtn:     { borderRadius:14, paddingVertical:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  linkBtnText: { color:'#fff', fontSize:15, fontFamily:'Nunito_900Black' },
  settingRow:  { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:0.5, borderBottomColor:'rgba(0,0,0,0.06)' },
  settingLabel:{ fontSize:14, fontFamily:'Nunito_600SemiBold' },
  settingSub:  { fontSize:12, marginTop:1 },
  memberRow:   { flexDirection:'row', alignItems:'center', gap:12, padding:12, borderRadius:12, marginBottom:8 },
  memberAvatar:{ width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center', backgroundColor:'#FEF3C7' },
  statusBadge: { flexDirection:'row', gap:4, alignItems:'center', paddingHorizontal:8, paddingVertical:4, borderRadius:10 },
});
