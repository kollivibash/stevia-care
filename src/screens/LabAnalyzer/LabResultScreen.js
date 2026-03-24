import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { format } from 'date-fns';

const STATUS_COLOR = { GREEN: '#16A34A', YELLOW: '#F59E0B', RED: '#DC2626' };
const STATUS_BG    = { GREEN: '#F0FDF4', YELLOW: '#FFFBEB', RED: '#FFF1F2' };
const STATUS_LABEL = { GREEN: 'Normal', YELLOW: 'Borderline', RED: 'Abnormal' };

export default function LabResultScreen({ navigation, route }) {
  const { report } = route.params;
  const result = report?.result || {};
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('results');

  const params    = result.parameters || [];
  const abnormal  = params.filter(p => p.status === 'RED');
  const borderline= params.filter(p => p.status === 'YELLOW');
  const normal    = params.filter(p => p.status === 'GREEN');
  const ordered   = [...abnormal, ...borderline, ...normal];

  const overallColor = result.overall_status === 'Normal'
    ? '#16A34A' : result.overall_status === 'Borderline' ? '#F59E0B' : '#DC2626';
  const overallBg = result.overall_status === 'Normal'
    ? ['#064E3B','#16A34A'] : result.overall_status === 'Borderline'
    ? ['#92400E','#F59E0B'] : ['#7F1D1D','#DC2626'];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>

      {/* Header */}
      <LinearGradient colors={overallBg} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex:1 }}>
          <Text style={styles.hTitle}>Analysis Results</Text>
          <Text style={styles.hSub}>{format(new Date(report.date || Date.now()), 'dd MMM yyyy · hh:mm a')}</Text>
        </View>
        <View style={styles.overallBadge}>
          <Text style={styles.overallText}>{result.overall_status || 'Complete'}</Text>
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={[styles.statsRow, { backgroundColor:T.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color:'#DC2626' }]}>{result.abnormal_count ?? abnormal.length}</Text>
          <Text style={styles.statLabel}>Abnormal</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor:T.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color:'#F59E0B' }]}>{result.borderline_count ?? borderline.length}</Text>
          <Text style={styles.statLabel}>Borderline</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor:T.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color:'#16A34A' }]}>{result.normal_count ?? normal.length}</Text>
          <Text style={styles.statLabel}>Normal</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor:T.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color:T.text }]}>{params.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor:T.card, borderBottomColor:T.border }]}>
        {[
          { id:'results', label:'Results', icon:'flask' },
          { id:'advice',  label:'Advice',  icon:'leaf'  },
          { id:'doctor',  label:'Doctor',  icon:'medical' },
        ].map(tab => (
          <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab===tab.id && styles.tabActive]}>
            <Ionicons name={tab.icon} size={14} color={activeTab===tab.id ? '#16A34A' : T.textMuted} />
            <Text style={[styles.tabLabel, { color: activeTab===tab.id ? '#16A34A' : T.textMuted }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:80 }} showsVerticalScrollIndicator={false}>

        {/* ── RESULTS TAB ── */}
        {activeTab === 'results' && (
          <>
            {/* Summary */}
            <View style={[styles.card, { backgroundColor:T.card }]}>
              <Text style={[styles.cardTitle, { color:T.text }]}>AI Summary</Text>
              <Text style={[styles.summaryText, { color:T.textSub }]}>{result.summary}</Text>
            </View>

            {/* Critical Alerts */}
            {result.critical_alerts?.length > 0 && (
              <View style={[styles.alertCard, { backgroundColor:'#FFF1F2', borderColor:'#FCA5A5' }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={18} color="#DC2626" />
                  <Text style={styles.alertTitle}>⚠️ Critical — See Doctor Soon</Text>
                </View>
                {result.critical_alerts.map((a, i) => (
                  <Text key={i} style={styles.alertText}>• {a}</Text>
                ))}
              </View>
            )}

            {/* Parameters */}
            {params.length > 0 && (
              <>
                <Text style={[styles.secTitle, { color:T.text }]}>
                  All Parameters ({params.length})
                </Text>
                {ordered.map((param, i) => (
                  <TouchableOpacity key={i} activeOpacity={0.85}
                    onPress={() => setExpanded(expanded === i ? null : i)}>
                    <View style={[styles.paramCard, { backgroundColor:T.card },
                      expanded===i && { borderColor: STATUS_COLOR[param.status], borderWidth:1.5 }]}>

                      {/* Row */}
                      <View style={styles.paramRow}>
                        <View style={[styles.statusBar, { backgroundColor: STATUS_COLOR[param.status]||'#888' }]} />
                        <View style={{ flex:1 }}>
                          <Text style={[styles.paramName, { color:T.text }]}>{param.name}</Text>
                          <Text style={[styles.paramValue, { color: STATUS_COLOR[param.status]||T.textSub }]}>
                            {param.value}
                          </Text>
                        </View>
                        <View style={styles.paramRight}>
                          <View style={[styles.statusChip, { backgroundColor: STATUS_BG[param.status]||'#f5f5f5' }]}>
                            <Text style={[styles.statusChipText, { color: STATUS_COLOR[param.status]||'#888' }]}>
                              {STATUS_LABEL[param.status] || param.status}
                            </Text>
                          </View>
                          <Ionicons name={expanded===i?'chevron-up':'chevron-down'} size={14} color={T.textMuted} style={{ marginTop:4 }} />
                        </View>
                      </View>

                      {/* Expanded */}
                      {expanded === i && (
                        <View style={[styles.paramExpanded, { borderTopColor:T.border }]}>
                          <View style={styles.refRow}>
                            <Ionicons name="analytics-outline" size={13} color={T.textMuted} />
                            <Text style={[styles.refText, { color:T.textMuted }]}>
                              Reference: <Text style={{ fontFamily:'Nunito_700Bold', color:T.textSub }}>{param.reference_range}</Text>
                            </Text>
                          </View>
                          {param.deviation && (
                            <View style={styles.refRow}>
                              <Ionicons name="trending-up-outline" size={13} color={STATUS_COLOR[param.status]} />
                              <Text style={[styles.refText, { color: STATUS_COLOR[param.status] }]}>{param.deviation}</Text>
                            </View>
                          )}
                          <Text style={[styles.explanText, { color:T.textSub }]}>{param.explanation}</Text>
                          {param.action && (
                            <View style={[styles.actionBox, { backgroundColor: STATUS_BG[param.status]||'#f5f5f5' }]}>
                              <Ionicons name="bulb-outline" size={14} color={STATUS_COLOR[param.status]} />
                              <Text style={[styles.actionText, { color: STATUS_COLOR[param.status] }]}>{param.action}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Key Findings */}
            {result.key_findings?.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <Text style={[styles.cardTitle, { color:T.text }]}>Key Findings</Text>
                {result.key_findings.map((f, i) => (
                  <View key={i} style={styles.findingRow}>
                    <View style={[styles.bullet, { backgroundColor: i<abnormal.length?'#DC2626':'#F59E0B' }]} />
                    <Text style={[styles.findingText, { color:T.textSub }]}>{f}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── ADVICE TAB ── */}
        {activeTab === 'advice' && (
          <>
            {/* Diet */}
            {result.diet_advice?.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="restaurant" size={18} color="#16A34A" />
                  <Text style={[styles.cardTitle, { color:T.text }]}>Indian Diet Advice</Text>
                </View>
                {result.diet_advice.map((d, i) => (
                  <View key={i} style={styles.adviceRow}>
                    <View style={[styles.adviceNum, { backgroundColor:'#DCFCE7' }]}>
                      <Text style={{ color:'#14532D', fontSize:11, fontFamily:'Nunito_900Black' }}>{i+1}</Text>
                    </View>
                    <Text style={[styles.adviceText, { color:T.textSub }]}>{d}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Lifestyle */}
            {result.lifestyle_suggestions?.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="fitness" size={18} color="#0EA5E9" />
                  <Text style={[styles.cardTitle, { color:T.text }]}>Lifestyle Changes</Text>
                </View>
                {result.lifestyle_suggestions.map((s, i) => (
                  <View key={i} style={styles.adviceRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={[styles.adviceText, { color:T.textSub }]}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Follow-up tests */}
            {result.follow_up_tests?.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="flask" size={18} color="#7C3AED" />
                  <Text style={[styles.cardTitle, { color:T.text }]}>Recommended Tests</Text>
                </View>
                {result.follow_up_tests.map((t, i) => (
                  <View key={i} style={styles.adviceRow}>
                    <Ionicons name="arrow-forward-circle-outline" size={18} color="#7C3AED" />
                    <Text style={[styles.adviceText, { color:T.textSub }]}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── DOCTOR TAB ── */}
        {activeTab === 'doctor' && (
          <>
            {result.consult_doctor_if?.length > 0 && (
              <View style={[styles.alertCard, { backgroundColor:'#FFF7ED', borderColor:'#FED7AA' }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="medical" size={18} color="#EA580C" />
                  <Text style={[styles.alertTitle, { color:'#C2410C' }]}>See a Doctor if You Have:</Text>
                </View>
                {result.consult_doctor_if.map((c, i) => (
                  <View key={i} style={styles.findingRow}>
                    <Ionicons name="alert-circle-outline" size={14} color="#EA580C" />
                    <Text style={[styles.findingText, { color:'#9A3412' }]}>{c}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Abnormal summary for doctor visit */}
            {abnormal.length > 0 && (
              <View style={[styles.card, { backgroundColor:T.card }]}>
                <Text style={[styles.cardTitle, { color:T.text }]}>Share with Your Doctor</Text>
                <Text style={[{ fontSize:12, marginBottom:12 }, { color:T.textSub }]}>
                  These {abnormal.length} abnormal values need medical attention:
                </Text>
                {abnormal.map((p, i) => (
                  <View key={i} style={[styles.docRow, { backgroundColor:'#FFF1F2', borderColor:'#FCA5A5' }]}>
                    <Text style={styles.docParam}>{p.name}</Text>
                    <Text style={styles.docValue}>{p.value}</Text>
                    <Text style={styles.docRef}>Ref: {p.reference_range}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={[styles.card, { backgroundColor: isDark?'#1C1C1E':'#F8FAFC', borderColor:T.border, borderWidth:1 }]}>
              <Ionicons name="information-circle-outline" size={16} color={T.textMuted} />
              <Text style={[styles.disclaimerText, { color:T.textMuted }]}>{result.disclaimer}</Text>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:         { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:20 },
  backBtn:        { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center' },
  hTitle:         { color:'#fff', fontSize:18, fontFamily:'Nunito_900Black' },
  hSub:           { color:'rgba(255,255,255,0.75)', fontSize:11, marginTop:2 },
  overallBadge:   { backgroundColor:'rgba(255,255,255,0.25)', paddingHorizontal:12, paddingVertical:6, borderRadius:20 },
  overallText:    { color:'#fff', fontSize:12, fontFamily:'Nunito_900Black' },
  statsRow:       { flexDirection:'row', paddingVertical:14, marginBottom:2 },
  statItem:       { flex:1, alignItems:'center' },
  statNum:        { fontSize:22, fontFamily:'Nunito_900Black' },
  statLabel:      { fontSize:10, color:'#888', marginTop:2 },
  statDivider:    { width:0.5, height:36, alignSelf:'center' },
  tabRow:         { flexDirection:'row', borderBottomWidth:0.5, marginBottom:4 },
  tab:            { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:12 },
  tabActive:      { borderBottomWidth:2, borderBottomColor:'#16A34A' },
  tabLabel:       { fontSize:12, fontFamily:'Nunito_700Bold' },
  card:           { borderRadius:16, padding:16, marginBottom:12 },
  cardHeader:     { flexDirection:'row', alignItems:'center', gap:8, marginBottom:12 },
  cardTitle:      { fontSize:14, fontFamily:'Nunito_800ExtraBold' },
  summaryText:    { fontSize:13, lineHeight:22 },
  alertCard:      { borderRadius:14, padding:14, borderWidth:1.5, marginBottom:12 },
  alertHeader:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  alertTitle:     { fontSize:13, fontFamily:'Nunito_800ExtraBold', color:'#DC2626' },
  alertText:      { fontSize:12, color:'#991B1B', lineHeight:20, paddingLeft:4 },
  secTitle:       { fontSize:14, fontFamily:'Nunito_800ExtraBold', marginBottom:10 },
  paramCard:      { borderRadius:14, padding:14, marginBottom:8, backgroundColor:'transparent' },
  paramRow:       { flexDirection:'row', alignItems:'center', gap:12 },
  statusBar:      { width:4, height:44, borderRadius:2, flexShrink:0 },
  paramName:      { fontSize:13, fontFamily:'Nunito_700Bold' },
  paramValue:     { fontSize:12, fontFamily:'Nunito_600SemiBold', marginTop:2 },
  paramRight:     { alignItems:'flex-end', gap:4 },
  statusChip:     { paddingHorizontal:10, paddingVertical:4, borderRadius:10 },
  statusChipText: { fontSize:11, fontFamily:'Nunito_800ExtraBold' },
  paramExpanded:  { marginTop:12, paddingTop:12, borderTopWidth:0.5 },
  refRow:         { flexDirection:'row', gap:6, alignItems:'center', marginBottom:5 },
  refText:        { fontSize:12, flex:1 },
  explanText:     { fontSize:13, lineHeight:20, marginTop:4, marginBottom:8 },
  actionBox:      { flexDirection:'row', gap:8, alignItems:'flex-start', padding:10, borderRadius:10, marginTop:4 },
  actionText:     { fontSize:12, flex:1, lineHeight:18, fontFamily:'Nunito_600SemiBold' },
  findingRow:     { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:8 },
  bullet:         { width:6, height:6, borderRadius:3, marginTop:6, flexShrink:0 },
  findingText:    { flex:1, fontSize:13, lineHeight:20 },
  adviceRow:      { flexDirection:'row', alignItems:'flex-start', gap:12, paddingVertical:8, borderBottomWidth:0.5, borderBottomColor:'rgba(0,0,0,0.05)' },
  adviceNum:      { width:22, height:22, borderRadius:11, alignItems:'center', justifyContent:'center', flexShrink:0 },
  adviceText:     { flex:1, fontSize:13, lineHeight:20 },
  docRow:         { borderRadius:10, padding:10, borderWidth:1, marginBottom:8 },
  docParam:       { fontSize:13, fontFamily:'Nunito_700Bold', color:'#DC2626' },
  docValue:       { fontSize:12, color:'#7F1D1D', marginTop:2 },
  docRef:         { fontSize:11, color:'#9CA3AF', marginTop:2 },
  disclaimerText: { fontSize:11, lineHeight:18, fontStyle:'italic', flex:1, marginTop:6 },
});
