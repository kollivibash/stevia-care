import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { checkDrugInteractions } from '../../services/aiService';

const SEV_COLOR = { Safe:'#16A34A', Mild:'#F59E0B', Moderate:'#EF4444', Severe:'#7F1D1D' };
const RISK_COLOR = { Safe:'#16A34A', Caution:'#F59E0B', Dangerous:'#DC2626' };

export default function DrugInteractionScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [meds, setMeds]     = useState(['','']);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const update = (i, v) => setMeds(p => p.map((m,idx) => idx===i ? v : m));
  const remove = (i)    => setMeds(p => p.filter((_,idx) => idx!==i));
  const add    = ()     => meds.length < 8 && setMeds(p => [...p,'']);

  const check = async () => {
    const filled = meds.filter(m => m.trim());
    if (filled.length < 2) { Alert.alert('Add at least 2 medicines'); return; }
    setLoading(true); setResult(null);
    try { setResult(await checkDrugInteractions(filled)); }
    catch (e) { Alert.alert('Error', 'Could not check. Try again.'); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <LinearGradient colors={['#1E1B4B','#3730A3','#4F46E5']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.hIcon}><Ionicons name="warning" size={28} color="#fff" /></View>
        <Text style={styles.hTitle}>Drug Interaction Checker</Text>
        <Text style={styles.hSub}>Check if your medicines are safe together</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:60 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor:T.card }]}>
          <Text style={[styles.secTitle, { color:T.text }]}>Enter Medicines / Supplements</Text>
          <Text style={[styles.secSub, { color:T.textSub }]}>Include Ayurvedic herbs, vitamins, all medicines</Text>
          {meds.map((med, i) => (
            <View key={i} style={styles.inputRow}>
              <View style={[styles.inputWrap, { backgroundColor:T.inputBg, borderColor:T.border }]}>
                <Ionicons name="medical-outline" size={16} color={T.textMuted} />
                <TextInput style={[styles.input, { color:T.text }]} value={med} onChangeText={v => update(i,v)}
                  placeholder={i===0?'e.g. Metformin 500mg':i===1?'e.g. Ashwagandha':`Medicine ${i+1}`}
                  placeholderTextColor={T.textMuted} />
              </View>
              {meds.length > 2 && (
                <TouchableOpacity onPress={() => remove(i)}>
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {meds.length < 8 && (
            <TouchableOpacity onPress={add} style={[styles.addBtn, { borderColor:'#4F46E5' }]}>
              <Ionicons name="add-circle-outline" size={18} color="#4F46E5" />
              <Text style={{ color:'#4F46E5', fontFamily:'Nunito_700Bold', fontSize:14 }}>Add another medicine</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={check} disabled={loading} activeOpacity={0.88} style={{ marginTop:16 }}>
            <LinearGradient colors={['#3730A3','#4F46E5']} style={styles.checkBtn}>
              {loading ? <ActivityIndicator color="#fff" size="small" />
                : <><Ionicons name="shield-checkmark" size={18} color="#fff" /><Text style={styles.checkTxt}>Check Interactions</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {result && (
          <>
            <View style={[styles.card, { backgroundColor:T.card }]}>
              <View style={[styles.riskBadge, { backgroundColor:RISK_COLOR[result.overall_risk]+'20', borderColor:RISK_COLOR[result.overall_risk] }]}>
                <Ionicons name={result.overall_risk==='Safe'?'checkmark-circle':result.overall_risk==='Caution'?'alert-circle':'warning'} size={28} color={RISK_COLOR[result.overall_risk]} />
                <View style={{ flex:1 }}>
                  <Text style={[styles.riskLabel, { color:RISK_COLOR[result.overall_risk] }]}>
                    {result.overall_risk==='Safe'?'Safe Combination':result.overall_risk==='Caution'?'Use with Caution':'Dangerous Combination'}
                  </Text>
                  <Text style={[{ fontSize:13, lineHeight:20 }, { color:T.textSub }]}>{result.summary}</Text>
                </View>
              </View>
            </View>

            {result.interactions?.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <Text style={[styles.secTitle, { color:T.text }]}>Interaction Details</Text>
                {result.interactions.map((inter, i) => (
                  <View key={i} style={[styles.interCard, { borderLeftColor:SEV_COLOR[inter.severity]||'#16A34A', backgroundColor:T.bg }]}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:6 }}>
                      <Text style={[{ fontSize:13, fontFamily:'Nunito_700Bold', flex:1 }, { color:T.text }]}>{inter.drug1} + {inter.drug2}</Text>
                      <View style={[styles.sevBadge, { backgroundColor:SEV_COLOR[inter.severity]+'20' }]}>
                        <Text style={[{ fontSize:11, fontFamily:'Nunito_700Bold' }, { color:SEV_COLOR[inter.severity] }]}>{inter.severity}</Text>
                      </View>
                    </View>
                    <Text style={[{ fontSize:12, lineHeight:18, marginBottom:6 }, { color:T.textSub }]}>{inter.effect}</Text>
                    {inter.recommendation && (
                      <View style={{ flexDirection:'row', gap:6, alignItems:'flex-start' }}>
                        <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
                        <Text style={[{ fontSize:12, flex:1, lineHeight:18 }, { color:T.text }]}>{inter.recommendation}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {result.general_advice?.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <Text style={[styles.secTitle, { color:T.text }]}>General Advice</Text>
                {result.general_advice.map((a,i) => (
                  <View key={i} style={{ flexDirection:'row', gap:10, alignItems:'flex-start', paddingVertical:6 }}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#16A34A" />
                    <Text style={[{ fontSize:13, flex:1, lineHeight:20 }, { color:T.textSub }]}>{a}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.disclaimer, { backgroundColor:'#FEF3C7', borderColor:'#F59E0B' }]}>
              <Ionicons name="information-circle" size={16} color="#92400E" />
              <Text style={{ fontSize:11, color:'#92400E', flex:1, lineHeight:18 }}>{result.disclaimer}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:    { padding:20, paddingTop:16, paddingBottom:28 },
  back:      { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 },
  hIcon:     { width:56, height:56, borderRadius:28, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:10 },
  hTitle:    { color:'#fff', fontSize:22, fontFamily:'Nunito_900Black' },
  hSub:      { color:'rgba(255,255,255,0.75)', fontSize:13, marginTop:4, fontFamily:'Nunito_400Regular' },
  card:      { borderRadius:16, padding:16, marginBottom:12 },
  secTitle:  { fontSize:15, fontFamily:'Nunito_800ExtraBold', marginBottom:4 },
  secSub:    { fontSize:12, marginBottom:14, fontFamily:'Nunito_400Regular' },
  inputRow:  { flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  inputWrap: { flex:1, flexDirection:'row', alignItems:'center', gap:10, borderRadius:12, paddingHorizontal:12, paddingVertical:11, borderWidth:1.5 },
  input:     { flex:1, fontSize:14, fontFamily:'Nunito_400Regular' },
  addBtn:    { flexDirection:'row', alignItems:'center', gap:8, padding:12, borderRadius:12, borderWidth:1.5, borderStyle:'dashed', justifyContent:'center', marginTop:4 },
  checkBtn:  { borderRadius:14, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  checkTxt:  { color:'#fff', fontSize:15, fontFamily:'Nunito_900Black' },
  riskBadge: { flexDirection:'row', gap:14, padding:16, borderRadius:14, borderWidth:1.5, alignItems:'flex-start' },
  riskLabel: { fontSize:15, fontFamily:'Nunito_900Black', marginBottom:4 },
  interCard: { borderLeftWidth:4, padding:12, marginBottom:10, borderRadius:8 },
  sevBadge:  { paddingHorizontal:10, paddingVertical:3, borderRadius:10 },
  disclaimer:{ borderRadius:12, padding:12, borderWidth:1, flexDirection:'row', gap:8, alignItems:'flex-start', marginBottom:16 },
});
