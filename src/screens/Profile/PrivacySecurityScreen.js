import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';

const ITEMS = [
  { icon: 'shield-checkmark', color: '#10B981', title: 'Data Encryption', sub: 'All your health data is encrypted with AES-256 before storage. Only you can access it.' },
  { icon: 'lock-closed',      color: '#0057B8', title: 'JWT Authentication', sub: 'Your login session uses signed JWT tokens with expiry. No password is ever stored in plain text.' },
  { icon: 'cloud-offline',    color: '#F59E0B', title: 'Data Stored Securely', sub: 'Data stored on MongoDB Atlas with server-side encryption. Location: India.' },
  { icon: 'eye-off',          color: '#8B5CF6', title: 'No Third-Party Sharing', sub: 'We never sell or share your health data with advertisers or third parties.' },
  { icon: 'trash',            color: '#EF4444', title: 'Delete My Data', sub: 'You can request complete deletion of your data at any time.', action: () => Linking.openURL('mailto:privacy@healthpilot.in?subject=Data Deletion Request') },
];

export default function PrivacySecurityScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      <LinearGradient colors={['#064E3B', '#10B981']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <Text style={styles.headerSub}>How we protect your health data</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {ITEMS.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.card, { backgroundColor: T.card }]} onPress={item.action} activeOpacity={item.action ? 0.85 : 1}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: T.text }]}>{item.title}</Text>
              <Text style={[styles.cardSub, { color: T.textMuted }]}>{item.sub}</Text>
            </View>
            {item.action && <Ionicons name="chevron-forward" size={16} color={T.textMuted} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  iconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 5 },
  cardSub: { fontSize: 12, lineHeight: 18 },
});
