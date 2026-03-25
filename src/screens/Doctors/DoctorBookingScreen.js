// ─── Stevia Care — Doctor Booking ─────────────────────────────────────────────
// Inspired by: Practo + One Medical + Forward Health
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';

const SPECIALITIES = [
  { id: 'all',        label: 'All',          icon: 'grid',                 color: '#6366F1' },
  { id: 'gp',         label: 'General',      icon: 'medical',              color: '#059669' },
  { id: 'cardio',     label: 'Cardiology',   icon: 'heart',                color: '#EF4444' },
  { id: 'derm',       label: 'Skin',         icon: 'body',                 color: '#F59E0B' },
  { id: 'ortho',      label: 'Ortho',        icon: 'fitness',              color: '#3B82F6' },
  { id: 'gynae',      label: 'Gynaecology',  icon: 'rose',                 color: '#EC4899' },
  { id: 'neuro',      label: 'Neurology',    icon: 'flash',                color: '#8B5CF6' },
  { id: 'pedia',      label: 'Paediatrics',  icon: 'happy',                color: '#06B6D4' },
  { id: 'dental',     label: 'Dental',       icon: 'color-wand',           color: '#14B8A6' },
  { id: 'eye',        label: 'Eye',          icon: 'eye',                  color: '#0EA5E9' },
];

const DOCTORS = [
  {
    id: 1, name: 'Dr. Priya Sharma', spec: 'General Physician',
    qual: 'MBBS, MD', exp: 12, rating: 4.8, reviews: 342,
    fee: 500, wait: '15 min', avail: 'Today',
    tags: ['Diabetes', 'Hypertension', 'Fever'],
    online: true, specId: 'gp',
    about: 'Expert in managing chronic conditions. Fluent in Hindi, Telugu, English.',
  },
  {
    id: 2, name: 'Dr. Rajesh Kumar', spec: 'Cardiologist',
    qual: 'MBBS, DM Cardiology', exp: 18, rating: 4.9, reviews: 518,
    fee: 800, wait: '30 min', avail: 'Tomorrow',
    tags: ['Heart Disease', 'ECG', 'Cholesterol'],
    online: true, specId: 'cardio',
    about: 'Senior cardiologist with expertise in preventive cardiology.',
  },
  {
    id: 3, name: 'Dr. Anitha Reddy', spec: 'Dermatologist',
    qual: 'MBBS, MD Dermatology', exp: 8, rating: 4.7, reviews: 215,
    fee: 600, wait: '20 min', avail: 'Today',
    tags: ['Acne', 'Psoriasis', 'Hair Loss'],
    online: true, specId: 'derm',
    about: 'Specialised in cosmetic and medical dermatology.',
  },
  {
    id: 4, name: 'Dr. Suresh Nair', spec: 'Orthopaedic Surgeon',
    qual: 'MBBS, MS Orthopaedics', exp: 15, rating: 4.6, reviews: 189,
    fee: 700, wait: '45 min', avail: 'Thu, 26 Mar',
    tags: ['Back Pain', 'Joint Pain', 'Sports Injury'],
    online: false, specId: 'ortho',
    about: 'Expert in sports injuries and joint replacement.',
  },
  {
    id: 5, name: 'Dr. Meena Iyer', spec: 'Gynaecologist',
    qual: 'MBBS, DGO', exp: 10, rating: 4.9, reviews: 427,
    fee: 600, wait: '25 min', avail: 'Today',
    tags: ['PCOD', 'Pregnancy', 'Menstrual Issues'],
    online: true, specId: 'gynae',
    about: 'Specialised in PCOD, infertility, and high-risk pregnancy.',
  },
  {
    id: 6, name: 'Dr. Arun Patel', spec: 'Paediatrician',
    qual: 'MBBS, MD Paediatrics', exp: 14, rating: 4.8, reviews: 603,
    fee: 500, wait: '10 min', avail: 'Today',
    tags: ['Child Health', 'Vaccines', 'Growth'],
    online: true, specId: 'pedia',
    about: 'Trusted by thousands of families for child healthcare.',
  },
];

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
          size={11}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export default function DoctorBookingScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const [search,   setSearch]   = useState('');
  const [selSpec,  setSelSpec]  = useState('all');
  const [selDoc,   setSelDoc]   = useState(null);

  const filtered = DOCTORS.filter(d => {
    const matchSpec   = selSpec === 'all' || d.specId === selSpec;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      || d.spec.toLowerCase().includes(search.toLowerCase())
      || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchSpec && matchSearch;
  });

  const handleBook = (doc) => {
    Alert.alert(
      `Book ${doc.name}`,
      `Consultation fee: ₹${doc.fee}\nAvailable: ${doc.avail}\nWait time: ~${doc.wait}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book via Practo',
          onPress: () => Linking.openURL(`https://www.practo.com/search/doctors?results_type=doctor&q=${encodeURIComponent(doc.spec)}&city=Vijayawada`)
        },
        {
          text: 'Call Clinic',
          onPress: () => Linking.openURL('tel:+919876543210'),
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={['#064E3B', '#065F46', '#047857']}
          style={styles.header}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Book a Doctor</Text>
            <Text style={styles.headerSub}>Verified doctors · Instant booking</Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBox, { backgroundColor: T.card, borderColor: T.border }]}>
            <Ionicons name="search-outline" size={18} color={T.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: T.text }]}
              placeholder="Search doctors, symptoms, speciality..."
              placeholderTextColor={T.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={T.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Speciality pills */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specRow}
        >
          {SPECIALITIES.map(s => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSelSpec(s.id)}
              style={[
                styles.specPill,
                { backgroundColor: selSpec === s.id ? s.color : T.card,
                  borderColor: selSpec === s.id ? s.color : T.border },
              ]}
            >
              <Ionicons name={s.icon} size={14} color={selSpec === s.id ? '#fff' : T.textSub} />
              <Text style={[styles.specLabel, { color: selSpec === s.id ? '#fff' : T.textSub }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultRow}>
          <Text style={[styles.resultCount, { color: T.textSub }]}>
            {filtered.length} doctors available
          </Text>
          <View style={styles.availBadge}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' }} />
            <Text style={styles.availText}>Online consult available</Text>
          </View>
        </View>

        {/* Doctor cards */}
        <View style={styles.cardList}>
          {filtered.map(doc => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.docCard, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => setSelDoc(selDoc === doc.id ? null : doc.id)}
              activeOpacity={0.85}
            >
              {/* Top row */}
              <View style={styles.docTop}>
                {/* Avatar */}
                <LinearGradient
                  colors={['#064E3B', '#059669']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                  </Text>
                </LinearGradient>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.docName, { color: T.text }]}>{doc.name}</Text>
                    {doc.online && (
                      <View style={styles.onlineTag}>
                        <Text style={styles.onlineTagText}>Online</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.docSpec, { color: '#059669' }]}>{doc.spec}</Text>
                  <Text style={[styles.docQual, { color: T.textMuted }]}>{doc.qual} · {doc.exp} yrs exp</Text>
                  <View style={styles.ratingRow}>
                    <StarRating rating={doc.rating} />
                    <Text style={[styles.ratingNum, { color: T.textSub }]}>{doc.rating}</Text>
                    <Text style={[styles.reviewCount, { color: T.textMuted }]}>({doc.reviews} reviews)</Text>
                  </View>
                </View>

                {/* Fee */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.fee, { color: T.text }]}>₹{doc.fee}</Text>
                  <Text style={[styles.feeLabel, { color: T.textMuted }]}>consult</Text>
                </View>
              </View>

              {/* Tags */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {doc.tags.map(tag => (
                  <View key={tag} style={[styles.tag, { backgroundColor: T.cardAlt, borderColor: T.border }]}>
                    <Text style={[styles.tagText, { color: T.textSub }]}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Expanded info */}
              {selDoc === doc.id && (
                <View style={[styles.expanded, { borderTopColor: T.border }]}>
                  <Text style={[styles.aboutText, { color: T.textSub }]}>{doc.about}</Text>
                  <View style={styles.availRow}>
                    <View style={[styles.availItem, { backgroundColor: T.cardAlt }]}>
                      <Ionicons name="time-outline" size={14} color="#059669" />
                      <Text style={[styles.availItemText, { color: T.textSub }]}>Wait: {doc.wait}</Text>
                    </View>
                    <View style={[styles.availItem, { backgroundColor: T.cardAlt }]}>
                      <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                      <Text style={[styles.availItemText, { color: T.textSub }]}>{doc.avail}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Book button */}
              <TouchableOpacity
                onPress={() => handleBook(doc)}
                style={styles.bookBtn}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#065F46', '#059669']}
                  style={styles.bookBtnInner}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="calendar" size={15} color="#fff" />
                  <Text style={styles.bookBtnText}>Book Appointment</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={T.textMuted} />
          <Text style={[styles.disclaimerText, { color: T.textMuted }]}>
            Doctor listings are for informational purposes. Always verify credentials before booking.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  headerSub:     { fontSize: 12, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.7)' },
  onlineBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  onlineDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  onlineText:    { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#fff' },

  searchWrap:    { padding: 16, paddingBottom: 8 },
  searchBox:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5 },
  searchInput:   { flex: 1, fontSize: 15, fontFamily: 'Nunito_500Medium' },

  specRow:       { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  specPill:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  specLabel:     { fontSize: 12, fontFamily: 'Nunito_700Bold' },

  resultRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  resultCount:   { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  availBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  availText:     { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#059669' },

  cardList:      { paddingHorizontal: 16, gap: 14 },
  docCard:       { borderRadius: 20, padding: 16, borderWidth: 1.5 },
  docTop:        { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar:        { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 18, fontFamily: 'Nunito_900Black', color: '#fff' },
  nameRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  docName:       { fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  onlineTag:     { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  onlineTagText: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: '#059669' },
  docSpec:       { fontSize: 13, fontFamily: 'Nunito_700Bold', marginTop: 1 },
  docQual:       { fontSize: 11, fontFamily: 'Nunito_400Regular', marginTop: 1 },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingNum:     { fontSize: 12, fontFamily: 'Nunito_700Bold' },
  reviewCount:   { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  fee:           { fontSize: 18, fontFamily: 'Nunito_900Black' },
  feeLabel:      { fontSize: 10, fontFamily: 'Nunito_400Regular', marginTop: 1 },

  tag:           { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, borderWidth: 1 },
  tagText:       { fontSize: 11, fontFamily: 'Nunito_600SemiBold' },

  expanded:      { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  aboutText:     { fontSize: 13, fontFamily: 'Nunito_400Regular', lineHeight: 19, marginBottom: 10 },
  availRow:      { flexDirection: 'row', gap: 8 },
  availItem:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  availItemText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },

  bookBtn:       { marginTop: 12 },
  bookBtnInner:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 13 },
  bookBtnText:   { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },

  disclaimer:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, margin: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12 },
  disclaimerText:{ flex: 1, fontSize: 11, fontFamily: 'Nunito_400Regular', lineHeight: 16 },
});
