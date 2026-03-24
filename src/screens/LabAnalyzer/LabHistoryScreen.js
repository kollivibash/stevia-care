import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const STATUS_CONFIG = {
  Normal:     { color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-circle' },
  Borderline: { color: '#F59E0B', bg: '#FFFBEB', icon: 'warning' },
  Abnormal:   { color: '#EF4444', bg: '#FFF5F5', icon: 'close-circle' },
};

export default function LabHistoryScreen({ navigation }) {
  const { labReports } = useHealthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#14532D', '#16A34A', '#4ADE80']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>ALL REPORTS</Text>
        <Text style={styles.title}>Lab History</Text>
        <Text style={styles.sub}>{labReports.length} report{labReports.length !== 1 ? 's' : ''} saved</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'Total',      val: labReports.length },
            { label: 'Abnormal',   val: labReports.filter(r => r.result?.overall_status === 'Abnormal').length },
            { label: 'Normal',     val: labReports.filter(r => r.result?.overall_status === 'Normal').length },
            { label: 'Borderline', val: labReports.filter(r => r.result?.overall_status === 'Borderline').length },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.navigate('LabHome')} activeOpacity={0.88} style={styles.newBtn}>
          <LinearGradient colors={['#14532D', '#16A34A']} style={styles.newBtnInner}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.newBtnText}>Analyze New Report</Text>
          </LinearGradient>
        </TouchableOpacity>

        {labReports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 64 }}>🧪</Text>
            <Text style={[styles.emptyTitle, { color: T.text }]}>No reports yet</Text>
            <Text style={[styles.emptySub, { color: T.textMuted }]}>Upload your first lab report to get instant AI analysis</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: T.text }]}>Recent Reports</Text>
            {labReports.map((report, i) => {
              const status = report.result?.overall_status || 'Unknown';
              const cfg = STATUS_CONFIG[status] || { color: '#64748B', bg: '#F5F7FF', icon: 'help-circle' };
              const date = new Date(report.uploadedAt || Date.now());
              const abnCount  = (report.result?.parameters || []).filter(p => p.status === 'RED').length;
              const warnCount = (report.result?.parameters || []).filter(p => p.status === 'YELLOW').length;
              const normCount = (report.result?.parameters || []).filter(p => p.status === 'GREEN').length;
              return (
                <TouchableOpacity key={report.id || i} style={[styles.reportCard, { backgroundColor: T.card }]}
                  onPress={() => navigation.navigate('LabResult', { report })} activeOpacity={0.88}>
                  <View style={[styles.reportColorBar, { backgroundColor: cfg.color }]} />
                  <View style={styles.reportBody}>
                    <View style={styles.reportTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reportName, { color: T.text }]} numberOfLines={1}>
                          {report.name || `Lab Report ${labReports.length - i}`}
                        </Text>
                        <Text style={[styles.reportDate, { color: T.textMuted }]}>
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                        <Text style={[styles.statusText, { color: cfg.color }]}>{status}</Text>
                      </View>
                    </View>
                    {report.result?.summary ? (
                      <Text style={[styles.reportSummary, { color: T.textSub }]} numberOfLines={2}>{report.result.summary}</Text>
                    ) : null}
                    {(report.result?.parameters?.length > 0) && (
                      <View style={styles.paramRow}>
                        {abnCount  > 0 && <View style={[styles.paramChip, { backgroundColor: T.cardAlt }]}><View style={[styles.paramDot, { backgroundColor: '#EF4444' }]} /><Text style={[styles.paramChipText, { color: T.text }]}>{abnCount} Abnormal</Text></View>}
                        {warnCount > 0 && <View style={[styles.paramChip, { backgroundColor: T.cardAlt }]}><View style={[styles.paramDot, { backgroundColor: '#F59E0B' }]} /><Text style={[styles.paramChipText, { color: T.text }]}>{warnCount} Borderline</Text></View>}
                        {normCount > 0 && <View style={[styles.paramChip, { backgroundColor: T.cardAlt }]}><View style={[styles.paramDot, { backgroundColor: '#10B981' }]} /><Text style={[styles.paramChipText, { color: T.text }]}>{normCount} Normal</Text></View>}
                      </View>
                    )}
                    <View style={[styles.reportFooter, { borderTopColor: T.border }]}>
                      <Text style={styles.viewText}>View full analysis →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eyebrow: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 2, marginBottom: 4 },
  title: { color: '#fff', fontSize: 28, fontFamily: 'Nunito_900Black' },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 3, marginBottom: 18 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statVal: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  body: { padding: 16 },
  newBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 22 },
  newBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15 },
  newBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', marginBottom: 14 },
  reportCard: { borderRadius: 18, flexDirection: 'row', overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  reportColorBar: { width: 5 },
  reportBody: { flex: 1, padding: 16 },
  reportTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  reportName: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', marginBottom: 3 },
  reportDate: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold' },
  reportSummary: { fontSize: 12.5, lineHeight: 18, marginBottom: 10 },
  paramRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  paramChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  paramDot: { width: 6, height: 6, borderRadius: 3 },
  paramChipText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  reportFooter: { borderTopWidth: 1, paddingTop: 10 },
  viewText: { fontSize: 12, color: '#16A34A', fontFamily: 'Nunito_700Bold' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyTitle: { fontSize: 20, fontFamily: 'Nunito_900Black' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
