// ─── Stevia Care — Doctor Booking (Full Platform) ──────────────────────────
// Commission model: Stevia earns ₹49 platform fee per booking
// Filters: Nearby · Fee · Rating · Availability · Gender · Online
// Inspired by: Practo · Apollo 247 · One Medical · Zocdoc
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const PLATFORM_FEE = 49; // Stevia Care earns this per booking

// ── Speciality filter pills ────────────────────────────────────────────────
const SPECIALITIES = [
  { id: 'all',    label: 'All',          icon: 'grid-outline',          color: '#6366F1' },
  { id: 'gp',     label: 'General',      icon: 'medical-outline',       color: '#059669' },
  { id: 'cardio', label: 'Cardiology',   icon: 'heart-outline',         color: '#EF4444' },
  { id: 'derm',   label: 'Skin',         icon: 'body-outline',          color: '#F59E0B' },
  { id: 'ortho',  label: 'Ortho',        icon: 'fitness-outline',       color: '#3B82F6' },
  { id: 'gynae',  label: 'Gynaecology',  icon: 'rose-outline',          color: '#EC4899' },
  { id: 'neuro',  label: 'Neurology',    icon: 'flash-outline',         color: '#8B5CF6' },
  { id: 'pedia',  label: 'Paediatrics',  icon: 'happy-outline',         color: '#06B6D4' },
  { id: 'dental', label: 'Dental',       icon: 'color-wand-outline',    color: '#14B8A6' },
  { id: 'eye',    label: 'Eye',          icon: 'eye-outline',           color: '#0EA5E9' },
  { id: 'endo',   label: 'Endocrinology',icon: 'analytics-outline',     color: '#D97706' },
  { id: 'psych',  label: 'Psychiatry',   icon: 'bulb-outline',          color: '#7C3AED' },
];

// ── Sort options ───────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: 'nearby',    label: 'Nearby',       icon: 'navigate-outline' },
  { id: 'rating',    label: 'Top Rated',    icon: 'star-outline'     },
  { id: 'fee_asc',   label: 'Fee: Low',     icon: 'trending-down'    },
  { id: 'fee_desc',  label: 'Fee: High',    icon: 'trending-up'      },
  { id: 'exp',       label: 'Experience',   icon: 'ribbon-outline'   },
  { id: 'today',     label: 'Available Today', icon: 'calendar-outline' },
];

// ── Doctor data ────────────────────────────────────────────────────────────
const DOCTORS = [
  {
    id: 1, name: 'Dr. Priya Sharma', spec: 'General Physician', specId: 'gp',
    qual: 'MBBS, MD', exp: 12, rating: 4.8, reviews: 342, gender: 'female',
    fee: 500, wait: '15 min', distance: 1.2, hospital: 'Apollo Clinic',
    address: 'MG Road, Vijayawada', phone: '+919876543210',
    tags: ['Diabetes', 'Hypertension', 'Fever', 'Cold & Flu'],
    online: true, availToday: true, avail: 'Today',
    about: 'Expert in managing chronic conditions. Fluent in Hindi, Telugu & English. 12+ years at Apollo.',
    slots: { today: ['10:00 AM','11:00 AM','2:00 PM','4:00 PM'], tomorrow: ['9:00 AM','11:30 AM','3:00 PM'] },
    languages: ['Telugu','Hindi','English'],
  },
  {
    id: 2, name: 'Dr. Rajesh Kumar', spec: 'Cardiologist', specId: 'cardio',
    qual: 'MBBS, DM Cardiology', exp: 18, rating: 4.9, reviews: 518, gender: 'male',
    fee: 1200, wait: '30 min', distance: 3.4, hospital: 'Care Hospitals',
    address: 'Benz Circle, Vijayawada', phone: '+919876543211',
    tags: ['Heart Disease', 'ECG', 'Cholesterol', 'Angioplasty'],
    online: true, availToday: false, avail: 'Tomorrow',
    about: 'Senior cardiologist with expertise in preventive cardiology and interventional procedures.',
    slots: { today: [], tomorrow: ['10:00 AM','12:00 PM','3:30 PM','5:00 PM'] },
    languages: ['Telugu','English'],
  },
  {
    id: 3, name: 'Dr. Anitha Reddy', spec: 'Dermatologist', specId: 'derm',
    qual: 'MBBS, MD Dermatology', exp: 8, rating: 4.7, reviews: 215, gender: 'female',
    fee: 600, wait: '20 min', distance: 0.8, hospital: 'Skin Care Centre',
    address: 'Governorpet, Vijayawada', phone: '+919876543212',
    tags: ['Acne', 'Psoriasis', 'Hair Loss', 'Skin Allergy'],
    online: true, availToday: true, avail: 'Today',
    about: 'Specialised in cosmetic and medical dermatology. Trained at AIIMS Delhi.',
    slots: { today: ['9:30 AM','11:00 AM','1:00 PM','5:00 PM'], tomorrow: ['10:00 AM','2:00 PM'] },
    languages: ['Telugu','Hindi','English'],
  },
  {
    id: 4, name: 'Dr. Suresh Nair', spec: 'Orthopaedic Surgeon', specId: 'ortho',
    qual: 'MBBS, MS Orthopaedics', exp: 15, rating: 4.6, reviews: 189, gender: 'male',
    fee: 800, wait: '45 min', distance: 5.1, hospital: 'KMC Hospital',
    address: 'Patamata, Vijayawada', phone: '+919876543213',
    tags: ['Back Pain', 'Joint Pain', 'Sports Injury', 'Fractures'],
    online: false, availToday: false, avail: 'Thu, 27 Mar',
    about: 'Expert in sports injuries, joint replacement, and spine surgery.',
    slots: { today: [], tomorrow: ['11:00 AM','2:00 PM','4:00 PM'] },
    languages: ['Telugu','Kannada','English'],
  },
  {
    id: 5, name: 'Dr. Meena Iyer', spec: 'Gynaecologist', specId: 'gynae',
    qual: 'MBBS, DGO, MRCOG', exp: 10, rating: 4.9, reviews: 427, gender: 'female',
    fee: 700, wait: '25 min', distance: 2.0, hospital: "Women's Health Clinic",
    address: 'Labbipet, Vijayawada', phone: '+919876543214',
    tags: ['PCOD', 'Pregnancy', 'Menstrual Issues', 'Fertility'],
    online: true, availToday: true, avail: 'Today',
    about: 'Specialised in PCOD, infertility, high-risk pregnancy, and laparoscopic surgery.',
    slots: { today: ['10:30 AM','12:00 PM','3:00 PM','6:00 PM'], tomorrow: ['9:00 AM','11:00 AM','4:00 PM'] },
    languages: ['Telugu','Tamil','English'],
  },
  {
    id: 6, name: 'Dr. Arun Patel', spec: 'Paediatrician', specId: 'pedia',
    qual: 'MBBS, MD Paediatrics', exp: 14, rating: 4.8, reviews: 603, gender: 'male',
    fee: 500, wait: '10 min', distance: 1.5, hospital: 'Rainbow Children Hospital',
    address: 'Auto Nagar, Vijayawada', phone: '+919876543215',
    tags: ['Child Health', 'Vaccines', 'Growth', 'Newborn Care'],
    online: true, availToday: true, avail: 'Today',
    about: 'Trusted by thousands of families. Expert in child development, neonatal care, and vaccines.',
    slots: { today: ['9:00 AM','10:00 AM','11:00 AM','4:00 PM','5:00 PM'], tomorrow: ['9:00 AM','3:00 PM'] },
    languages: ['Telugu','Gujarati','Hindi','English'],
  },
  {
    id: 7, name: 'Dr. Kavitha Rao', spec: 'Endocrinologist', specId: 'endo',
    qual: 'MBBS, MD, DM Endocrinology', exp: 11, rating: 4.7, reviews: 198, gender: 'female',
    fee: 900, wait: '20 min', distance: 4.2, hospital: 'Andhra Hospitals',
    address: 'Vijayawada Central', phone: '+919876543216',
    tags: ['Diabetes', 'Thyroid', 'Hormones', 'PCOD'],
    online: true, availToday: false, avail: 'Tomorrow',
    about: 'Specialised in thyroid disorders, diabetes management, and hormonal imbalances.',
    slots: { today: [], tomorrow: ['10:00 AM','12:00 PM','3:00 PM'] },
    languages: ['Telugu','Kannada','English'],
  },
  {
    id: 8, name: 'Dr. Srinivas Murthy', spec: 'Psychiatrist', specId: 'psych',
    qual: 'MBBS, MD Psychiatry', exp: 9, rating: 4.6, reviews: 144, gender: 'male',
    fee: 1000, wait: '30 min', distance: 6.0, hospital: 'Mind Wellness Centre',
    address: 'Bandar Road, Vijayawada', phone: '+919876543217',
    tags: ['Anxiety', 'Depression', 'Stress', 'Sleep Issues'],
    online: true, availToday: true, avail: 'Today',
    about: 'Compassionate psychiatrist specialising in anxiety, depression, and cognitive therapy.',
    slots: { today: ['11:00 AM','2:00 PM','5:00 PM'], tomorrow: ['10:00 AM','3:00 PM','6:00 PM'] },
    languages: ['Telugu','Hindi','English'],
  },
];

// ── Time slot colors ───────────────────────────────────────────────────────
function getSlotColor(slot) {
  const h = parseInt(slot);
  if (h < 12) return '#0EA5E9';
  if (h < 17) return '#F59E0B';
  return '#7C3AED';
}

// ── Star rating component ──────────────────────────────────────────────────
function StarRating({ rating, size = 11 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
          size={size} color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function DoctorBookingScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const { user } = useAuthStore();

  const [search,      setSearch]      = useState('');
  const [selSpec,     setSelSpec]     = useState('all');
  const [selSort,     setSelSort]     = useState('nearby');
  const [filterOnline,setFilterOnline]= useState(false);
  const [filterToday, setFilterToday] = useState(false);
  const [filterGender,setFilterGender]= useState('all'); // 'all' | 'male' | 'female'
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId,  setExpandedId]  = useState(null);

  // Booking modal state
  const [bookingDoc,   setBookingDoc]   = useState(null);
  const [bookingDate,  setBookingDate]  = useState('today');  // 'today' | 'tomorrow'
  const [bookingSlot,  setBookingSlot]  = useState(null);
  const [patientName,  setPatientName]  = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [reason,       setReason]       = useState('');
  const [showBooking,  setShowBooking]  = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmRef,   setConfirmRef]   = useState('');

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = DOCTORS.filter(d => {
      if (selSpec !== 'all' && d.specId !== selSpec) return false;
      if (filterOnline && !d.online) return false;
      if (filterToday && !d.availToday) return false;
      if (filterGender !== 'all' && d.gender !== filterGender) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q)
          || d.spec.toLowerCase().includes(q)
          || d.hospital.toLowerCase().includes(q)
          || d.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });

    switch (selSort) {
      case 'nearby':   list = [...list].sort((a,b) => a.distance - b.distance); break;
      case 'rating':   list = [...list].sort((a,b) => b.rating - a.rating);     break;
      case 'fee_asc':  list = [...list].sort((a,b) => a.fee - b.fee);           break;
      case 'fee_desc': list = [...list].sort((a,b) => b.fee - a.fee);           break;
      case 'exp':      list = [...list].sort((a,b) => b.exp - a.exp);           break;
      case 'today':    list = [...list].sort((a,b) => (b.availToday?1:0) - (a.availToday?1:0)); break;
    }
    return list;
  }, [search, selSpec, selSort, filterOnline, filterToday, filterGender]);

  const activeFilterCount = [filterOnline, filterToday, filterGender !== 'all'].filter(Boolean).length;

  // ── Open booking modal ───────────────────────────────────────────────────
  const openBooking = (doc) => {
    setBookingDoc(doc);
    setBookingDate('today');
    setBookingSlot(null);
    setReason('');
    setPatientName(user?.name || '');
    setPatientPhone(user?.phone || '');
    setShowBooking(true);
  };

  // ── Confirm booking ──────────────────────────────────────────────────────
  const confirmBooking = () => {
    if (!bookingSlot) { Alert.alert('Select Slot', 'Please choose an available time slot.'); return; }
    if (!patientName.trim()) { Alert.alert('Missing Info', 'Please enter patient name.'); return; }
    if (!patientPhone.trim()) { Alert.alert('Missing Info', 'Please enter your phone number.'); return; }

    const ref = `STC${Date.now().toString().slice(-6)}`;
    setConfirmRef(ref);
    setShowBooking(false);
    setShowConfirm(true);
  };

  const slots = bookingDoc?.slots?.[bookingDate] || [];

  // ── Doctor card ──────────────────────────────────────────────────────────
  const renderDoc = (doc) => {
    const expanded = expandedId === doc.id;
    return (
      <View key={doc.id} style={[styles.docCard, { backgroundColor: T.card, borderColor: T.border }]}>
        {/* Top row */}
        <TouchableOpacity onPress={() => setExpandedId(expanded ? null : doc.id)} activeOpacity={0.88}>
          <View style={styles.docTop}>
            {/* Avatar */}
            <LinearGradient
              colors={doc.gender === 'female' ? ['#9D174D','#EC4899'] : ['#064E3B','#059669']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
              </Text>
            </LinearGradient>

            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.docName, { color: T.text }]} numberOfLines={1}>{doc.name}</Text>
                {doc.online && (
                  <View style={styles.onlineTag}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#059669', marginRight: 3 }} />
                    <Text style={styles.onlineTagTxt}>Online</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.docSpec, { color: '#059669' }]}>{doc.spec}</Text>
              <Text style={[styles.docQual, { color: T.textMuted }]}>{doc.qual} · {doc.exp} yrs</Text>
              <View style={styles.ratingRow}>
                <StarRating rating={doc.rating} />
                <Text style={[styles.ratingNum, { color: T.textSub }]}>{doc.rating}</Text>
                <Text style={[styles.reviewCount, { color: T.textMuted }]}>({doc.reviews})</Text>
                <View style={styles.distancePill}>
                  <Ionicons name="navigate-outline" size={9} color="#0EA5E9" />
                  <Text style={styles.distanceTxt}>{doc.distance} km</Text>
                </View>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={[styles.fee, { color: T.text }]}>₹{doc.fee}</Text>
              <Text style={[styles.feeLabel, { color: T.textMuted }]}>consult</Text>
              <View style={[styles.availPill, { backgroundColor: doc.availToday ? '#DCFCE7' : '#FEF3C7' }]}>
                <Text style={{ fontSize: 9, fontFamily: 'Nunito_700Bold', color: doc.availToday ? '#059669' : '#D97706' }}>
                  {doc.avail}
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {doc.tags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: T.cardAlt, borderColor: T.border }]}>
                <Text style={[styles.tagTxt, { color: T.textSub }]}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>

        {/* Expanded details */}
        {expanded && (
          <View style={[styles.expanded, { borderTopColor: T.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={13} color={T.textMuted} />
              <Text style={[styles.infoTxt, { color: T.textSub }]}>{doc.hospital} · {doc.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={13} color={T.textMuted} />
              <Text style={[styles.infoTxt, { color: T.textSub }]}>{doc.languages.join(', ')}</Text>
            </View>
            <Text style={[styles.aboutTxt, { color: T.textSub }]}>{doc.about}</Text>
            <View style={styles.availInfoRow}>
              <View style={[styles.availChip, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="time-outline" size={13} color="#0284C7" />
                <Text style={[styles.availChipTxt, { color: '#0284C7' }]}>Wait ~{doc.wait}</Text>
              </View>
              <View style={[styles.availChip, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#059669" />
                <Text style={[styles.availChipTxt, { color: '#059669' }]}>Verified</Text>
              </View>
              <View style={[styles.availChip, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="ribbon-outline" size={13} color="#7C3AED" />
                <Text style={[styles.availChipTxt, { color: '#7C3AED' }]}>{doc.exp} yrs exp</Text>
              </View>
            </View>
          </View>
        )}

        {/* Book button row */}
        <View style={styles.bookRow}>
          <TouchableOpacity
            onPress={() => openBooking(doc)}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={['#065F46','#059669']}
              style={styles.bookBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="calendar-outline" size={15} color="#fff" />
              <Text style={styles.bookBtnTxt}>Book Appointment</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Call Clinic', `Call ${doc.hospital}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => {} },
            ])}
            style={[styles.callBtn, { backgroundColor: T.cardAlt, borderColor: T.border }]}
          >
            <Ionicons name="call-outline" size={18} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <SafeAreaView edges={['top']}>
        <LinearGradient colors={['#064E3B','#065F46','#047857']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Book a Doctor</Text>
            <Text style={styles.headerSub}>{DOCTORS.length} verified doctors · Instant booking</Text>
          </View>
          <View style={styles.commBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#4ADE80" />
            <Text style={styles.commTxt}>Verified</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Search bar ── */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBox, { backgroundColor: T.card, borderColor: T.border }]}>
            <Ionicons name="search-outline" size={18} color={T.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: T.text }]}
              placeholder="Search doctor, symptom, hospital..."
              placeholderTextColor={T.textMuted}
              value={search} onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={T.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter toggle */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterToggle, { backgroundColor: activeFilterCount > 0 ? '#059669' : T.card, borderColor: activeFilterCount > 0 ? '#059669' : T.border }]}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? '#fff' : T.textSub} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}><Text style={styles.filterBadgeTxt}>{activeFilterCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Advanced filters panel ── */}
        {showFilters && (
          <View style={[styles.filterPanel, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.filterSectionTitle, { color: T.textMuted }]}>GENDER</Text>
            <View style={styles.filterChipRow}>
              {[['all','All','people-outline'],['male','Male','man-outline'],['female','Female','woman-outline']].map(([val,lbl,icon]) => (
                <TouchableOpacity key={val} onPress={() => setFilterGender(val)}
                  style={[styles.filterChip, { backgroundColor: filterGender === val ? '#059669' : T.cardAlt, borderColor: filterGender === val ? '#059669' : T.border }]}>
                  <Ionicons name={icon} size={13} color={filterGender === val ? '#fff' : T.textSub} />
                  <Text style={[styles.filterChipTxt, { color: filterGender === val ? '#fff' : T.textSub }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterSectionTitle, { color: T.textMuted, marginTop: 12 }]}>AVAILABILITY</Text>
            <View style={styles.filterChipRow}>
              <TouchableOpacity onPress={() => setFilterOnline(!filterOnline)}
                style={[styles.filterChip, { backgroundColor: filterOnline ? '#059669' : T.cardAlt, borderColor: filterOnline ? '#059669' : T.border }]}>
                <Ionicons name="videocam-outline" size={13} color={filterOnline ? '#fff' : T.textSub} />
                <Text style={[styles.filterChipTxt, { color: filterOnline ? '#fff' : T.textSub }]}>Online Consult</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterToday(!filterToday)}
                style={[styles.filterChip, { backgroundColor: filterToday ? '#059669' : T.cardAlt, borderColor: filterToday ? '#059669' : T.border }]}>
                <Ionicons name="today-outline" size={13} color={filterToday ? '#fff' : T.textSub} />
                <Text style={[styles.filterChipTxt, { color: filterToday ? '#fff' : T.textSub }]}>Available Today</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => { setFilterGender('all'); setFilterOnline(false); setFilterToday(false); setShowFilters(false); }}
              style={styles.clearFiltersBtn}>
              <Text style={styles.clearFiltersTxt}>Clear all filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Speciality pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specRow}>
          {SPECIALITIES.map(s => (
            <TouchableOpacity key={s.id} onPress={() => setSelSpec(s.id)}
              style={[styles.specPill, { backgroundColor: selSpec === s.id ? s.color : T.card, borderColor: selSpec === s.id ? s.color : T.border }]}>
              <Ionicons name={s.icon} size={13} color={selSpec === s.id ? '#fff' : T.textSub} />
              <Text style={[styles.specLabel, { color: selSpec === s.id ? '#fff' : T.textSub }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Sort bar ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => setSelSort(opt.id)}
              style={[styles.sortPill, { backgroundColor: selSort === opt.id ? '#0EA5E9' : T.cardAlt, borderColor: selSort === opt.id ? '#0EA5E9' : T.border }]}>
              <Ionicons name={opt.icon} size={12} color={selSort === opt.id ? '#fff' : T.textSub} />
              <Text style={[styles.sortLabel, { color: selSort === opt.id ? '#fff' : T.textSub }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Results row ── */}
        <View style={styles.resultRow}>
          <Text style={[styles.resultCount, { color: T.textSub }]}>
            {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' }} />
            <Text style={{ fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#059669' }}>Online consult available</Text>
          </View>
        </View>

        {/* ── Doctor list ── */}
        <View style={styles.cardList}>
          {filtered.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: T.card }]}>
              <Ionicons name="search-outline" size={48} color={T.textMuted} />
              <Text style={[{ fontSize: 16, fontFamily: 'Nunito_800ExtraBold', marginTop: 12 }, { color: T.text }]}>No doctors found</Text>
              <Text style={[{ fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 6, textAlign: 'center' }, { color: T.textMuted }]}>Try changing your filters or search term</Text>
            </View>
          ) : filtered.map(renderDoc)}
        </View>

        {/* ── Platform info banner ── */}
        <View style={[styles.platformBanner, { backgroundColor: T.card, borderColor: '#059669' + '40' }]}>
          <View style={styles.platformIconBox}>
            <Ionicons name="shield-checkmark" size={22} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.platformTitle, { color: T.text }]}>Stevia Care Booking Guarantee</Text>
            <Text style={[styles.platformSub, { color: T.textMuted }]}>
              A ₹{PLATFORM_FEE} platform fee is charged per booking. Free cancellation up to 2 hours before appointment.
            </Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ════ BOOKING MODAL ════════════════════════════════════════════════ */}
      <Modal visible={showBooking} animationType="slide" transparent onRequestClose={() => setShowBooking(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.bookingSheet, { backgroundColor: T.bg }]}>
            <View style={[styles.bookingHeader, { backgroundColor: T.card, borderBottomColor: T.border }]}>
              <View style={styles.sheetHandle} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.bookingTitle, { color: T.text }]}>Book Appointment</Text>
                <TouchableOpacity onPress={() => setShowBooking(false)}>
                  <Ionicons name="close-circle" size={26} color={T.textMuted} />
                </TouchableOpacity>
              </View>
              {bookingDoc && (
                <View style={styles.bookingDocRow}>
                  <LinearGradient
                    colors={bookingDoc.gender === 'female' ? ['#9D174D','#EC4899'] : ['#064E3B','#059669']}
                    style={styles.bookingAvatar}
                  >
                    <Text style={styles.bookingAvatarTxt}>
                      {bookingDoc.name.split(' ').slice(1).map(n => n[0]).join('')}
                    </Text>
                  </LinearGradient>
                  <View>
                    <Text style={[styles.bookingDocName, { color: T.text }]}>{bookingDoc.name}</Text>
                    <Text style={[styles.bookingDocSpec, { color: '#059669' }]}>{bookingDoc.spec}</Text>
                    <Text style={[styles.bookingDocHosp, { color: T.textMuted }]}>{bookingDoc.hospital}</Text>
                  </View>
                </View>
              )}
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              {/* Date tabs */}
              <Text style={[styles.fieldLabel, { color: T.textSub }]}>Select Date</Text>
              <View style={styles.dateTabs}>
                {['today','tomorrow'].map(d => (
                  <TouchableOpacity key={d} onPress={() => { setBookingDate(d); setBookingSlot(null); }}
                    style={[styles.dateTab, { backgroundColor: bookingDate === d ? '#059669' : T.card, borderColor: bookingDate === d ? '#059669' : T.border }]}>
                    <Ionicons name="calendar-outline" size={14} color={bookingDate === d ? '#fff' : T.textSub} />
                    <Text style={[styles.dateTxt, { color: bookingDate === d ? '#fff' : T.textSub }]}>
                      {d === 'today' ? 'Today' : 'Tomorrow'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time slots */}
              <Text style={[styles.fieldLabel, { color: T.textSub, marginTop: 16 }]}>Select Time Slot</Text>
              {slots.length === 0 ? (
                <View style={[styles.noSlots, { backgroundColor: T.card }]}>
                  <Ionicons name="time-outline" size={28} color={T.textMuted} />
                  <Text style={[{ fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 8 }, { color: T.textMuted }]}>No slots available for this day</Text>
                  <Text style={[{ fontSize: 11, fontFamily: 'Nunito_400Regular', marginTop: 4 }, { color: T.textMuted }]}>Try another date</Text>
                </View>
              ) : (
                <View style={styles.slotsGrid}>
                  {slots.map(slot => (
                    <TouchableOpacity key={slot} onPress={() => setBookingSlot(slot)}
                      style={[styles.slotPill, {
                        backgroundColor: bookingSlot === slot ? getSlotColor(slot) : T.card,
                        borderColor: bookingSlot === slot ? getSlotColor(slot) : T.border,
                      }]}>
                      <Text style={[styles.slotTxt, { color: bookingSlot === slot ? '#fff' : T.textSub }]}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Patient details */}
              <Text style={[styles.fieldLabel, { color: T.textSub, marginTop: 16 }]}>Patient Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: T.card, color: T.text, borderColor: T.border }]}
                value={patientName} onChangeText={setPatientName}
                placeholder="Full name" placeholderTextColor={T.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: T.textSub, marginTop: 12 }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: T.card, color: T.text, borderColor: T.border }]}
                value={patientPhone} onChangeText={setPatientPhone}
                placeholder="+91 XXXXXXXXXX" placeholderTextColor={T.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={[styles.fieldLabel, { color: T.textSub, marginTop: 12 }]}>Reason for Visit (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: T.card, color: T.text, borderColor: T.border, height: 70 }]}
                value={reason} onChangeText={setReason}
                placeholder="Brief description of symptoms or reason..." placeholderTextColor={T.textMuted}
                multiline
              />

              {/* Fee breakdown */}
              {bookingDoc && (
                <View style={[styles.feeBreakdown, { backgroundColor: T.card, borderColor: '#059669' + '40' }]}>
                  <Text style={[styles.feeBDTitle, { color: T.text }]}>Fee Breakdown</Text>
                  <View style={styles.feeBDRow}>
                    <Text style={[styles.feeBDKey, { color: T.textSub }]}>Consultation Fee</Text>
                    <Text style={[styles.feeBDVal, { color: T.text }]}>₹{bookingDoc.fee}</Text>
                  </View>
                  <View style={styles.feeBDRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[styles.feeBDKey, { color: T.textSub }]}>Platform Fee</Text>
                      <View style={{ backgroundColor: '#DCFCE7', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Nunito_700Bold', color: '#059669' }}>Stevia Care</Text>
                      </View>
                    </View>
                    <Text style={[styles.feeBDVal, { color: T.text }]}>₹{PLATFORM_FEE}</Text>
                  </View>
                  <View style={[styles.feeBDDivider, { backgroundColor: T.border }]} />
                  <View style={styles.feeBDRow}>
                    <Text style={[styles.feeBDKey, { color: T.text, fontFamily: 'Nunito_800ExtraBold' }]}>Total</Text>
                    <Text style={[styles.feeBDTotal, { color: '#059669' }]}>₹{bookingDoc.fee + PLATFORM_FEE}</Text>
                  </View>
                </View>
              )}

              {/* Confirm button */}
              <TouchableOpacity onPress={confirmBooking} activeOpacity={0.85} style={{ marginTop: 16 }}>
                <LinearGradient colors={['#065F46','#059669']} style={styles.confirmBtn}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmBtnTxt}>Confirm Booking · ₹{bookingDoc ? bookingDoc.fee + PLATFORM_FEE : 0}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[styles.cancelNote, { color: T.textMuted }]}>Free cancellation up to 2 hours before appointment</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════ CONFIRMATION MODAL ═══════════════════════════════════════════ */}
      <Modal visible={showConfirm} animationType="fade" transparent onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmSheet, { backgroundColor: T.card }]}>
            <LinearGradient colors={['#064E3B','#059669']} style={styles.confirmTop}>
              <View style={styles.confirmTick}>
                <Ionicons name="checkmark" size={36} color="#fff" />
              </View>
              <Text style={styles.confirmHeading}>Booking Confirmed!</Text>
              <Text style={styles.confirmSub}>Your appointment has been booked</Text>
            </LinearGradient>

            <View style={{ padding: 20 }}>
              <View style={[styles.refBox, { backgroundColor: T.bg }]}>
                <Text style={[styles.refLabel, { color: T.textMuted }]}>Booking Reference</Text>
                <Text style={[styles.refNum, { color: '#059669' }]}>{confirmRef}</Text>
              </View>

              {bookingDoc && (
                <View style={{ gap: 10, marginTop: 16 }}>
                  {[
                    { icon: 'person-outline',    val: bookingDoc.name },
                    { icon: 'medical-outline',   val: bookingDoc.spec },
                    { icon: 'business-outline',  val: bookingDoc.hospital },
                    { icon: 'calendar-outline',  val: bookingDate === 'today' ? 'Today' : 'Tomorrow' },
                    { icon: 'time-outline',      val: bookingSlot || '-' },
                    { icon: 'cash-outline',      val: `₹${bookingDoc.fee + PLATFORM_FEE} (incl. platform fee)` },
                  ].map((row, i) => (
                    <View key={i} style={styles.confirmRow}>
                      <Ionicons name={row.icon} size={15} color="#059669" />
                      <Text style={[styles.confirmRowTxt, { color: T.text }]}>{row.val}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity onPress={() => setShowConfirm(false)} activeOpacity={0.85} style={{ marginTop: 20 }}>
                <LinearGradient colors={['#065F46','#059669']} style={[styles.confirmBtn, { paddingVertical: 15 }]}>
                  <Text style={styles.confirmBtnTxt}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[styles.cancelNote, { color: T.textMuted, textAlign: 'center', marginTop: 10 }]}>
                You will receive a confirmation SMS on your registered number
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:              { flex: 1 },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:           { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  headerSub:         { fontSize: 11, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  commBadge:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  commTxt:           { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#fff' },

  searchWrap:        { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  searchBox:         { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5 },
  searchInput:       { flex: 1, fontSize: 14, fontFamily: 'Nunito_500Medium' },
  filterToggle:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  filterBadge:       { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  filterBadgeTxt:    { fontSize: 9, fontFamily: 'Nunito_900Black', color: '#fff' },

  filterPanel:       { marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 16, borderWidth: 1.5 },
  filterSectionTitle:{ fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1 },
  filterChipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  filterChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  filterChipTxt:     { fontSize: 12, fontFamily: 'Nunito_700Bold' },
  clearFiltersBtn:   { alignSelf: 'flex-end', marginTop: 12 },
  clearFiltersTxt:   { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#EF4444' },

  specRow:           { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  specPill:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  specLabel:         { fontSize: 11, fontFamily: 'Nunito_700Bold' },

  sortRow:           { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  sortPill:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  sortLabel:         { fontSize: 11, fontFamily: 'Nunito_700Bold' },

  resultRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  resultCount:       { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },

  cardList:          { paddingHorizontal: 16, gap: 14 },
  docCard:           { borderRadius: 20, padding: 16, borderWidth: 1.5 },
  docTop:            { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar:            { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:        { fontSize: 18, fontFamily: 'Nunito_900Black', color: '#fff' },
  nameRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  docName:           { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', flex: 1 },
  onlineTag:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  onlineTagTxt:      { fontSize: 9, fontFamily: 'Nunito_700Bold', color: '#059669' },
  docSpec:           { fontSize: 12, fontFamily: 'Nunito_700Bold', marginTop: 1 },
  docQual:           { fontSize: 10, fontFamily: 'Nunito_400Regular', marginTop: 1 },
  ratingRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingNum:         { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  reviewCount:       { fontSize: 10, fontFamily: 'Nunito_400Regular' },
  distancePill:      { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#E0F2FE', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  distanceTxt:       { fontSize: 9, fontFamily: 'Nunito_700Bold', color: '#0284C7' },
  fee:               { fontSize: 17, fontFamily: 'Nunito_900Black' },
  feeLabel:          { fontSize: 9, fontFamily: 'Nunito_400Regular' },
  availPill:         { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  tag:               { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, marginRight: 6, borderWidth: 1 },
  tagTxt:            { fontSize: 10, fontFamily: 'Nunito_600SemiBold' },
  expanded:          { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  infoRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoTxt:           { fontSize: 11, fontFamily: 'Nunito_400Regular', flex: 1 },
  aboutTxt:          { fontSize: 12, fontFamily: 'Nunito_400Regular', lineHeight: 18, marginTop: 6, marginBottom: 10 },
  availInfoRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  availChip:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  availChipTxt:      { fontSize: 10, fontFamily: 'Nunito_700Bold' },
  bookRow:           { flexDirection: 'row', gap: 10, marginTop: 12 },
  bookBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, paddingVertical: 12 },
  bookBtnTxt:        { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  callBtn:           { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  emptyBox:          { borderRadius: 20, padding: 40, alignItems: 'center' },

  platformBanner:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, margin: 16, marginTop: 20, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  platformIconBox:   { width: 40, height: 40, borderRadius: 12, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  platformTitle:     { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginBottom: 3 },
  platformSub:       { fontSize: 11, fontFamily: 'Nunito_400Regular', lineHeight: 16 },

  // Booking modal
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bookingSheet:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' },
  bookingHeader:     { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, borderBottomWidth: 1 },
  sheetHandle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 14 },
  bookingTitle:      { fontSize: 18, fontFamily: 'Nunito_900Black' },
  bookingDocRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  bookingAvatar:     { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bookingAvatarTxt:  { fontSize: 16, fontFamily: 'Nunito_900Black', color: '#fff' },
  bookingDocName:    { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  bookingDocSpec:    { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: '#059669' },
  bookingDocHosp:    { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  fieldLabel:        { fontSize: 12, fontFamily: 'Nunito_700Bold', marginBottom: 8 },
  dateTabs:          { flexDirection: 'row', gap: 10 },
  dateTab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 11, borderWidth: 1.5 },
  dateTxt:           { fontSize: 13, fontFamily: 'Nunito_700Bold' },
  noSlots:           { borderRadius: 14, padding: 20, alignItems: 'center' },
  slotsGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotPill:          { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  slotTxt:           { fontSize: 12, fontFamily: 'Nunito_700Bold' },
  input:             { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  feeBreakdown:      { borderRadius: 16, padding: 14, marginTop: 16, borderWidth: 1.5 },
  feeBDTitle:        { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginBottom: 10 },
  feeBDRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  feeBDKey:          { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  feeBDVal:          { fontSize: 13, fontFamily: 'Nunito_700Bold' },
  feeBDDivider:      { height: 1, marginVertical: 8 },
  feeBDTotal:        { fontSize: 18, fontFamily: 'Nunito_900Black' },
  confirmBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 15 },
  confirmBtnTxt:     { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  cancelNote:        { fontSize: 11, fontFamily: 'Nunito_400Regular', textAlign: 'center', marginTop: 8 },

  // Confirmation modal
  confirmOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmSheet:      { borderRadius: 28, width: '100%', overflow: 'hidden' },
  confirmTop:        { alignItems: 'center', padding: 28 },
  confirmTick:       { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  confirmHeading:    { fontSize: 22, fontFamily: 'Nunito_900Black', color: '#fff' },
  confirmSub:        { fontSize: 13, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  refBox:            { borderRadius: 14, padding: 14, alignItems: 'center' },
  refLabel:          { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  refNum:            { fontSize: 24, fontFamily: 'Nunito_900Black', letterSpacing: 3, marginTop: 4 },
  confirmRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confirmRowTxt:     { fontSize: 13, fontFamily: 'Nunito_600SemiBold', flex: 1 },
});
