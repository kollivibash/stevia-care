import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { analyzeFamilyHealth } from '../../services/aiService';
import { HealthScoreRing } from '../../components';

function getScore(member) {
  let s = 100;
  s -= member.conditions.length * 10;
  s -= member.medications.length * 5;
  if (member.age > 60) s -= 10;
  return Math.max(s, 40);
}

export default function FamilyInsightsScreen({ navigation, route }) {
  const { familyMembers, reminders } = useHealthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  // If opened from a member card, show that member's profile first
  const memberId = route?.params?.memberId;
  const focusMember = memberId ? familyMembers.find(m => m.id === memberId) : null;

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const familyData = familyMembers.map(m => ({
        name: m.name, relation: m.relation, age: m.age, gender: m.gender,
        conditions: m.conditions, medications: m.medications, bloodGroup: m.bloodGroup,
      }));
      const result = await analyzeFamilyHealth(familyData);
      setInsights(result);
    } catch (e) {
      Alert.alert('Error', 'Could not analyze family health. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#065F46', '#10B981']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {focusMember ? `${focusMember.name}'s Profile` : 'Family AI Insights'}
        </Text>
        <Text style={styles.headerSub}>
          {focusMember ? `${focusMember.relation} · Age ${focusMember.age}` : 'AI-powered family health analysis'}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* FOCUSED MEMBER CARD */}
        {focusMember && (
          <View style={[styles.card, { backgroundColor: T.card }]}>
            <View style={styles.memberTop}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28 }}>{focusMember.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: T.text }]}>{focusMember.name}</Text>
                <Text style={[styles.memberMeta, { color: T.textMuted }]}>
                  {focusMember.relation.charAt(0).toUpperCase() + focusMember.relation.slice(1)} · Age {focusMember.age} · {focusMember.bloodGroup} · {focusMember.gender}
                </Text>
              </View>
              <HealthScoreRing score={getScore(focusMember)} size={54} />
            </View>

            <View style={[{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.border }]}>
              <Text style={[styles.secLabel, { color: T.text }]}>Conditions</Text>
              {focusMember.conditions.length === 0
                ? <Text style={{ color: '#10B981', fontSize: 13 }}>✅ No conditions listed</Text>
                : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {focusMember.conditions.map(c => (
                      <View key={c} style={styles.conditionChip}><Text style={styles.conditionText}>{c}</Text></View>
                    ))}
                  </View>
              }
            </View>

            <View style={[{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.border }]}>
              <Text style={[styles.secLabel, { color: T.text }]}>Medications</Text>
              {focusMember.medications.length === 0
                ? <Text style={{ color: T.textMuted, fontSize: 13 }}>No medications listed</Text>
                : <View style={{ gap: 6, marginTop: 6 }}>
                    {focusMember.medications.map(med => (
                      <View key={med} style={[styles.medRow, { backgroundColor: T.cardAlt }]}>
                        <Ionicons name="medical" size={14} color="#F59E0B" />
                        <Text style={[{ fontSize: 13 }, { color: T.text }]}>{med}</Text>
                      </View>
                    ))}
                  </View>
              }
            </View>

            <TouchableOpacity
              style={{ marginTop: 14 }}
              onPress={() => { setInsights(null); runAnalysis(); }}
              activeOpacity={0.88}
            >
              <LinearGradient colors={['#065F46','#10B981']} style={styles.analyzeBtn}>
                <Ionicons name="analytics" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' }}>
                  Get AI Insights for {focusMember.name.split(' ')[0]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ALL MEMBERS SUMMARY */}
        {!focusMember && (
          <>
            {familyMembers.map(m => (
              <TouchableOpacity key={m.id} style={[styles.card, { backgroundColor: T.card }]}
                onPress={() => navigation.navigate('FamilyInsights', { memberId: m.id })} activeOpacity={0.88}>
                <View style={styles.memberTop}>
                  <Text style={{ fontSize: 28 }}>{m.avatar}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.memberName, { color: T.text }]}>{m.name}</Text>
                    <Text style={[styles.memberMeta, { color: T.textMuted }]}>
                      {m.relation} · Age {m.age} · {m.bloodGroup}
                    </Text>
                  </View>
                  <HealthScoreRing score={getScore(m)} size={44} />
                  <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={runAnalysis} disabled={loading} activeOpacity={0.88}>
              <LinearGradient colors={['#065F46','#10B981']} style={[styles.analyzeBtn, { marginTop: 4 }]}>
                {loading ? <ActivityIndicator color="#fff" size="small" />
                  : <><Ionicons name="analytics" size={18} color="#fff" />
                     <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' }}>Analyze All Family Health</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* AI INSIGHTS RESULT */}
        {loading && !insights && (
          <View style={[styles.card, { backgroundColor: T.card, alignItems: 'center', paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={[{ marginTop: 16, fontSize: 14, fontFamily: 'Nunito_600SemiBold' }, { color: T.textSub }]}>
              Stevia AI is analyzing...
            </Text>
          </View>
        )}

        {insights && !loading && (
          <View style={[styles.card, { backgroundColor: T.card, marginTop: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <LinearGradient colors={['#065F46','#10B981']} style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.memberName, { color: T.text }]}>AI Health Insights</Text>
            </View>
            {Object.entries(insights).map(([k, v]) => (
              <View key={k} style={[{ marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.divider }]}>
                <Text style={[{ fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6, textTransform: 'capitalize' }, { color: '#10B981' }]}>{k.replace(/_/g, ' ')}</Text>
                <Text style={[{ fontSize: 13, lineHeight: 20 }, { color: T.text }]}>
                  {typeof v === 'string' ? v : JSON.stringify(v)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 },
  card: { borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberName: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  memberMeta: { fontSize: 11, marginTop: 2 },
  secLabel: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  conditionChip: { backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  conditionText: { fontSize: 11, color: '#EF4444', fontFamily: 'Nunito_600SemiBold' },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 14 },
});
