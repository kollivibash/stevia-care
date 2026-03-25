/**
 * Family Health Dashboard — inspired by:
 *   Samsung Health  → family group overview card
 *   Apple Health    → individual metric rings per member
 *   Practo          → member profile cards with conditions
 *   WHO             → family health score concept
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const { width } = Dimensions.get('window');

const RELATION_COLORS = {
  self: '#16A34A', spouse: '#EC4899', child: '#F59E0B',
  parent: '#7C3AED', sibling: '#0EA5E9', other: '#64748B',
};
const RELATION_ICONS = {
  self: 'person', spouse: 'heart', child: 'happy',
  parent: 'people', sibling: 'person-add', other: 'ellipse',
};

function HealthBar({ score }) {
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 10, color: '#8BA58D', fontFamily: 'Nunito_700Bold' }}>HEALTH SCORE</Text>
        <Text style={[{ fontSize: 12, fontFamily: 'Nunito_900Black' }, { color }]}>{score}/100</Text>
      </View>
      <View style={{ height: 5, backgroundColor: '#E2E8F0', borderRadius: 3 }}>
        <View style={{ height: 5, borderRadius: 3, backgroundColor: color, width: `${score}%` }} />
      </View>
    </View>
  );
}

function getScore(member) {
  let s = 100;
  s -= (member.conditions?.length || 0) * 10;
  s -= (member.medications?.length || 0) * 5;
  if (member.age > 60) s -= 8;
  return Math.max(s, 35);
}

export default function FamilyScreen({ navigation }) {
  const { familyMembers, removeFamilyMember } = useHealthStore();
  const { isDark } = useThemeStore();
  const { token } = useAuthStore();
  const T = getTheme(isDark);

  const familyScore = familyMembers.length > 0
    ? Math.round(familyMembers.reduce((a, m) => a + getScore(m), 0) / familyMembers.length)
    : 0;

  const confirmDelete = (id, name) => {
    Alert.alert('Remove Member', `Remove ${name} from your family?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFamilyMember(id, token) },
    ]);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#064E3B', '#065F46', '#16A34A']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerEye}>FAMILY HEALTH</Text>
            <Text style={styles.headerTitle}>Family Dashboard</Text>
            <Text style={styles.headerSub}>{familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} · AI-powered insights</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddMember')} style={styles.addBtn} activeOpacity={0.85}>
            <Ionicons name="person-add" size={18} color="#16A34A" />
          </TouchableOpacity>
        </View>

        {/* Samsung Health-style family score */}
        {familyMembers.length > 0 && (
          <View style={styles.familyScoreCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fscLabel}>Family Health Score</Text>
              <Text style={styles.fscNum}>{familyScore}<Text style={styles.fscOf}>/100</Text></Text>
              <Text style={styles.fscStatus}>
                {familyScore >= 80 ? 'Excellent' : familyScore >= 60 ? 'Good' : 'Needs Attention'}
              </Text>
            </View>
            <View style={styles.memberAvatarRow}>
              {familyMembers.slice(0, 4).map((m, i) => (
                <View key={i} style={[styles.miniAvatar, { marginLeft: i > 0 ? -10 : 0, backgroundColor: RELATION_COLORS[m.relation] || '#16A34A' }]}>
                  <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Nunito_900Black' }}>
                    {(m.name || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              ))}
              {familyMembers.length > 4 && (
                <View style={[styles.miniAvatar, { marginLeft: -10, backgroundColor: '#64748B' }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' }}>+{familyMembers.length - 4}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* AI Insights button */}
        {familyMembers.length > 0 && (
          <TouchableOpacity style={styles.insightsBtn} onPress={() => navigation.navigate('FamilyInsights')} activeOpacity={0.88}>
            <LinearGradient colors={['#5B21B6','#7C3AED']} style={styles.insightsBtnInner}>
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={styles.insightsBtnText}>Get AI Family Health Insights</Text>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Member Cards — Practo / Apple Health inspired */}
        {familyMembers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: T.card }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Ionicons name="people" size={44} color="#16A34A" />
            </View>
            <Text style={[styles.emptyTitle, { color: T.text }]}>Add your family</Text>
            <Text style={[styles.emptySub, { color: T.textMuted }]}>Manage health for everyone you care about — parents, spouse, children</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddMember')} activeOpacity={0.88}>
              <LinearGradient colors={['#065F46','#16A34A']} style={styles.emptyBtn}>
                <Ionicons name="person-add" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Add First Member</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          familyMembers.map(member => {
            const score = getScore(member);
            const relColor = RELATION_COLORS[member.relation] || '#16A34A';
            const relIcon  = RELATION_ICONS[member.relation]  || 'person';
            return (
              <TouchableOpacity key={member.id} style={[styles.memberCard, { backgroundColor: T.card }]}
                onPress={() => navigation.navigate('FamilyInsights', { memberId: member.id })} activeOpacity={0.88}>
                <View style={styles.memberTop}>
                  {/* Avatar */}
                  <View style={[styles.memberAvatar, { backgroundColor: relColor + '18', borderColor: relColor + '40', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 24, fontFamily: 'Nunito_900Black', color: relColor }}>
                      {(member.name || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberName, { color: T.text }]}>{member.name}</Text>
                      <View style={[styles.relBadge, { backgroundColor: relColor + '18' }]}>
                        <Ionicons name={relIcon} size={10} color={relColor} />
                        <Text style={[styles.relText, { color: relColor }]}>{member.relation}</Text>
                      </View>
                    </View>
                    <Text style={[styles.memberMeta, { color: T.textMuted }]}>
                      Age {member.age} · {member.gender} · {member.bloodGroup || 'Blood N/A'}
                    </Text>
                    <HealthBar score={score} />
                  </View>
                  {/* Actions */}
                  <View style={styles.memberActions}>
                    <TouchableOpacity onPress={() => confirmDelete(member.id, member.name)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={16} color={T.textMuted} style={{ marginTop: 8 }} />
                  </View>
                </View>

                {/* Conditions */}
                {(member.conditions?.length > 0 || member.medications?.length > 0) && (
                  <View style={[styles.memberDetails, { borderTopColor: T.border }]}>
                    {member.conditions?.slice(0, 3).map((c, i) => (
                      <View key={i} style={styles.condChip}>
                        <Text style={styles.condText}>{c}</Text>
                      </View>
                    ))}
                    {member.medications?.slice(0, 2).map((m, i) => (
                      <View key={`m${i}`} style={styles.medChip}>
                        <Ionicons name="medical" size={9} color="#F59E0B" />
                        <Text style={styles.medChipText}>{m}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={[styles.tapToView, { color: relColor }]}>Tap to view full health profile →</Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* Add more button */}
        {familyMembers.length > 0 && (
          <TouchableOpacity style={[styles.addMoreBtn, { borderColor: '#16A34A', backgroundColor: T.card }]}
            onPress={() => navigation.navigate('AddMember')} activeOpacity={0.88}>
            <Ionicons name="add-circle-outline" size={20} color="#16A34A" />
            <Text style={styles.addMoreText}>Add Another Family Member</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerEye: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 3, fontFamily: 'Nunito_400Regular' },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  familyScoreCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  fscLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  fscNum:   { color: '#fff', fontSize: 36, fontFamily: 'Nunito_900Black' },
  fscOf:    { fontSize: 14, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.5)' },
  fscStatus:{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Nunito_700Bold', marginTop: 4 },
  memberAvatarRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  insightsBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  insightsBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  insightsBtnText: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  emptyCard: { borderRadius: 22, padding: 32, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Nunito_900Black' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20, fontFamily: 'Nunito_400Regular' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 13 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  memberCard: { borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#14532D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  memberTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  memberAvatar: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memberName: { fontSize: 16, fontFamily: 'Nunito_900Black' },
  relBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  relText: { fontSize: 10, fontFamily: 'Nunito_700Bold', textTransform: 'capitalize' },
  memberMeta: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  memberActions: { alignItems: 'center', gap: 4 },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  memberDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  condChip: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  condText: { fontSize: 11, color: '#EF4444', fontFamily: 'Nunito_600SemiBold' },
  medChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  medChipText: { fontSize: 11, color: '#F59E0B', fontFamily: 'Nunito_600SemiBold' },
  tapToView: { fontSize: 12, fontFamily: 'Nunito_700Bold', marginTop: 12 },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderRadius: 16, paddingVertical: 14 },
  addMoreText: { color: '#16A34A', fontSize: 14, fontFamily: 'Nunito_700Bold' },
});
