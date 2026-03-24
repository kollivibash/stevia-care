import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { ScreenHeader, Card, Button, LoadingOverlay } from '../../components';
import { analyzeCycleHealth } from '../../services/aiService';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';

export default function TrackerAnalysisScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { periodCycles } = useHealthStore();
  const { user } = useAuthStore();

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeCycleHealth({
        cycles: periodCycles.slice(0, 6),
        age: user?.age || 28,
        symptoms: periodCycles[0]?.symptoms || [],
        bmi: null,
        lifestyle: { conditions: user?.conditions },
      });
      setAnalysis(result);
    } catch (e) {
      Alert.alert('Analysis Failed', e.message || 'Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const pcodColors = { Low: COLORS.success, Moderate: COLORS.warning, High: COLORS.danger };
  const regularityColors = { Regular: COLORS.success, Irregular: COLORS.warning, 'Highly Irregular': COLORS.danger };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {loading && <LoadingOverlay message="AI is analyzing your cycle health..." />}
      <ScreenHeader title="AI Cycle Analysis" subtitle="PCOD & hormonal health insights" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!analysis ? (
          <View style={styles.promptSection}>
            <View style={styles.promptIcon}>
              <Ionicons name="heart" size={40} color={COLORS.trackerColor} />
            </View>
            <Text style={styles.promptTitle}>AI Cycle Health Analysis</Text>
            <Text style={styles.promptSub}>
              Claude AI will analyze your last {Math.min(periodCycles.length, 6)} cycles for regularity patterns, PCOD indicators, and provide personalised lifestyle recommendations.
            </Text>
            <View style={styles.dataPreview}>
              {[
                { icon: 'analytics-outline', label: `${periodCycles.length} cycles logged` },
                { icon: 'checkmark-circle-outline', label: 'PCOD risk assessment' },
                { icon: 'leaf-outline', label: 'Lifestyle suggestions' },
              ].map(item => (
                <View key={item.label} style={styles.previewChip}>
                  <Ionicons name={item.icon} size={16} color={COLORS.trackerColor} />
                  <Text style={styles.previewChipText}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Button title="Analyze My Cycle Health" icon="analytics" onPress={handleAnalyze} style={{ width: '100%' }} />
          </View>
        ) : (
          <>
            {/* Prediction */}
            <Card style={styles.predCard}>
              <Text style={styles.cardTitle}>Next Period Prediction</Text>
              <Text style={styles.bigDate}>{analysis.next_period?.estimated_date || 'Calculating...'}</Text>
              <Text style={styles.confidence}>± {analysis.next_period?.confidence_window_days || 3} days confidence window</Text>

              {analysis.ovulation_window && (
                <View style={styles.ovulationBox}>
                  <Ionicons name="heart" size={15} color={COLORS.accent} />
                  <Text style={styles.ovulationText}>
                    Fertile window: {analysis.ovulation_window.start_date} → {analysis.ovulation_window.end_date}
                  </Text>
                </View>
              )}
            </Card>

            {/* Cycle Analysis */}
            {analysis.cycle_analysis && (
              <Card style={styles.analysisCard}>
                <Text style={styles.cardTitle}>Cycle Analysis</Text>
                <View style={styles.regularityRow}>
                  <View style={[styles.regularityBadge, { backgroundColor: regularityColors[analysis.cycle_analysis.regularity] + '20' }]}>
                    <Text style={[styles.regularityText, { color: regularityColors[analysis.cycle_analysis.regularity] }]}>
                      {analysis.cycle_analysis.regularity}
                    </Text>
                  </View>
                  <Text style={styles.cycleStats}>
                    Avg {analysis.cycle_analysis.avg_cycle_length} days · ±{analysis.cycle_analysis.variation_days} days variation
                  </Text>
                </View>
                <Text style={styles.analysisSummary}>{analysis.cycle_analysis.summary}</Text>
              </Card>
            )}

            {/* PCOD Risk */}
            {analysis.pcod_risk && (
              <Card style={[styles.pcodCard, { borderColor: pcodColors[analysis.pcod_risk.level] + '40' }]}>
                <View style={styles.pcodHeader}>
                  <Text style={styles.cardTitle}>PCOD Risk Assessment</Text>
                  <View style={[styles.riskBadge, { backgroundColor: pcodColors[analysis.pcod_risk.level] }]}>
                    <Text style={styles.riskBadgeText}>{analysis.pcod_risk.level} Risk</Text>
                  </View>
                </View>
                <Text style={styles.pcodExplain}>{analysis.pcod_risk.explanation}</Text>
                {analysis.pcod_risk.indicators?.length > 0 && (
                  <View style={styles.indicatorsList}>
                    <Text style={styles.indicatorsTitle}>Indicators noted:</Text>
                    {analysis.pcod_risk.indicators.map((ind, i) => (
                      <View key={i} style={styles.indicatorRow}>
                        <Ionicons name="information-circle-outline" size={14} color={COLORS.warning} />
                        <Text style={styles.indicatorText}>{ind}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            )}

            {/* Lifestyle Suggestions */}
            {analysis.lifestyle_suggestions && (
              <>
                <Text style={styles.sectionTitle}>Lifestyle Recommendations</Text>
                {Object.entries(analysis.lifestyle_suggestions).map(([key, suggestions]) => (
                  suggestions?.length > 0 && (
                    <Card key={key} style={styles.lifestyleCard}>
                      <Text style={styles.lifestyleCategory}>
                        {key === 'diet' ? '🥗 Diet' : key === 'exercise' ? '🏃 Exercise' : '😴 Stress & Sleep'}
                      </Text>
                      {suggestions.map((s, i) => (
                        <View key={i} style={styles.suggestionRow}>
                          <View style={styles.suggestionDot} />
                          <Text style={styles.suggestionText}>{s}</Text>
                        </View>
                      ))}
                    </Card>
                  )
                ))}
              </>
            )}

            {/* When to see doctor */}
            {analysis.when_to_see_doctor?.length > 0 && (
              <Card style={styles.doctorCard}>
                <View style={styles.doctorHeader}>
                  <Ionicons name="medical" size={18} color={COLORS.danger} />
                  <Text style={styles.doctorTitle}>Consult a Gynaecologist if:</Text>
                </View>
                {analysis.when_to_see_doctor.map((d, i) => (
                  <Text key={i} style={styles.doctorPoint}>• {d}</Text>
                ))}
              </Card>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.disclaimerText}>
                {analysis.disclaimer || 'This analysis is informational only. Consult a gynaecologist for medical decisions.'}
              </Text>
            </View>

            <Button title="Re-analyze" variant="outline" icon="refresh" onPress={handleAnalyze} style={{ marginTop: 8 }} />
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding },
  promptSection: { alignItems: 'center', paddingTop: 20 },
  promptIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.trackerLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  promptTitle: { fontSize: SIZES.xl, fontFamily: 'Nunito_800ExtraBold', color: COLORS.textPrimary, textAlign: 'center' },
  promptSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 24 },
  dataPreview: { gap: 10, marginBottom: 24, width: '100%' },
  previewChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.trackerLight, borderRadius: SIZES.radius, padding: 12 },
  previewChipText: { fontSize: SIZES.sm, color: COLORS.trackerColor, fontFamily: 'Nunito_600SemiBold' },
  predCard: { marginBottom: 14 },
  cardTitle: { fontSize: SIZES.sm, fontFamily: 'Nunito_700Bold', color: COLORS.textMuted, marginBottom: 8 },
  bigDate: { fontSize: SIZES.xxl, fontFamily: 'Nunito_800ExtraBold', color: COLORS.trackerColor },
  confidence: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  ovulationBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accentLight, borderRadius: SIZES.radius, padding: 10, marginTop: 10 },
  ovulationText: { fontSize: SIZES.xs, color: COLORS.accentDark, fontFamily: 'Nunito_600SemiBold', flex: 1 },
  analysisCard: { marginBottom: 14 },
  regularityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  regularityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  regularityText: { fontSize: SIZES.sm, fontFamily: 'Nunito_700Bold' },
  cycleStats: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  analysisSummary: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },
  pcodCard: { marginBottom: 14, borderWidth: 1.5 },
  pcodHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  riskBadgeText: { color: COLORS.white, fontSize: SIZES.xs, fontFamily: 'Nunito_700Bold' },
  pcodExplain: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  indicatorsList: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  indicatorsTitle: { fontSize: SIZES.xs, fontFamily: 'Nunito_700Bold', color: COLORS.textMuted, marginBottom: 6 },
  indicatorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  indicatorText: { flex: 1, fontSize: SIZES.xs, color: COLORS.textSecondary, lineHeight: 16 },
  sectionTitle: { fontSize: SIZES.md, fontFamily: 'Nunito_700Bold', color: COLORS.textPrimary, marginBottom: 10, marginTop: 4 },
  lifestyleCard: { marginBottom: 10 },
  lifestyleCategory: { fontSize: SIZES.base, fontFamily: 'Nunito_700Bold', color: COLORS.textPrimary, marginBottom: 10 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  suggestionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.trackerColor, marginRight: 8, marginTop: 6 },
  suggestionText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },
  doctorCard: { marginBottom: 14, borderWidth: 1, borderColor: COLORS.redBg },
  doctorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  doctorTitle: { fontSize: SIZES.base, fontFamily: 'Nunito_700Bold', color: COLORS.danger },
  doctorPoint: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 6, lineHeight: 18 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8, padding: 12, backgroundColor: COLORS.inputBg, borderRadius: SIZES.radius },
  disclaimerText: { flex: 1, fontSize: SIZES.xs, color: COLORS.textMuted, lineHeight: 16, fontStyle: 'italic' },
});
