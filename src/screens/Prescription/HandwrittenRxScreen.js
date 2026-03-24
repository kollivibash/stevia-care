import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL, API_BASE_URL } from '../../constants/config';

async function extractAndParseRx(imageUri) {
  // Step 1: Get OCR text from backend
  let rxText = '';
  try {
    const formData = new FormData();
    formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'prescription.jpg' });
    const ocrRes = await fetch(`${API_BASE_URL}/ocr/extract`, {
      method: 'POST',
      body: JSON.stringify({ image_base64: '', type: 'prescription' }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (ocrRes.ok) {
      const ocrData = await ocrRes.json();
      rxText = ocrData.text || '';
    }
  } catch (e) {
    console.log('[RX] OCR backend unavailable, using AI direct');
  }

  // Step 2: Parse with Groq AI
  const prompt = rxText
    ? `Parse this prescription text extracted via OCR:\n\n${rxText}`
    : `I'm showing you a prescription image. Please extract all medicines and their dosages from it. If you cannot see image content, provide a helpful message.`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL, max_tokens: 2000, temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a prescription parser for Indian medicines. Extract medicine details and respond ONLY in valid JSON with no markdown.' },
        { role: 'user', content: `${prompt}\n\nRespond ONLY with:\n{"medicines":[{"name":"medicine name","dosage":"dose","frequency":"OD|BD|TDS|QID","times":["08:00"],"duration_days":7,"with_food":true,"notes":"special instructions"}],"doctor_notes":"any general notes","follow_up":"follow up timing","confidence":"High|Medium|Low"}` }
      ]
    })
  });
  const data = await res.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
}

const FREQ_LABEL = { OD:'Once daily', BD:'Twice daily', TDS:'3x daily', QID:'4x daily' };

export default function HandwrittenRxScreen({ navigation }) {
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);
  const { addReminder, token } = useHealthStore();
  const { token: authToken } = useAuthStore();
  const useToken = authToken || token;

  const [image,   setImage]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [saved,   setSaved]   = useState(false);

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') { Alert.alert('Permission needed'); return; }

    const picked = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

    if (!picked.canceled && picked.assets[0]) {
      setImage(picked.assets[0].uri);
      setResult(null); setSaved(false);
      analyzeRx(picked.assets[0].uri);
    }
  };

  const analyzeRx = async (uri) => {
    setLoading(true);
    try {
      const res = await extractAndParseRx(uri);
      setResult(res);
    } catch (e) {
      Alert.alert('Could not read prescription', 'Try a clearer photo with good lighting.');
    }
    setLoading(false);
  };

  const saveReminders = () => {
    if (!result?.medicines?.length) return;
    const reminder = {
      id:         `rx_${Date.now()}`,
      memberName: 'Me',
      medicines:  result.medicines.map(m => ({
        name:      m.name,
        dosage:    m.dosage,
        frequency: m.frequency,
        times:     m.times || ['08:00'],
        with_food: m.with_food,
      })),
      notes:      result.doctor_notes,
      source:     'prescription',
    };
    addReminder(reminder, useToken);
    setSaved(true);
    Alert.alert('✅ Reminders Created', `${result.medicines.length} medicine reminder${result.medicines.length > 1 ? 's' : ''} added!`);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <LinearGradient colors={['#064E3B','#065F46','#16A34A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.hIcon}><Ionicons name="document-text" size={28} color="#fff" /></View>
        <Text style={styles.hTitle}>Prescription Reader</Text>
        <Text style={styles.hSub}>AI reads handwritten prescriptions instantly</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:60 }}>
        {/* Camera / Gallery options */}
        <View style={styles.g2}>
          <TouchableOpacity onPress={() => pickImage(true)} style={[styles.pickBtn, { backgroundColor:T.card }]} activeOpacity={0.85}>
            <View style={[styles.pickIcon, { backgroundColor:'#DCFCE7' }]}>
              <Ionicons name="camera" size={24} color="#16A34A" />
            </View>
            <Text style={[styles.pickLabel, { color:T.text }]}>Take Photo</Text>
            <Text style={[styles.pickSub, { color:T.textSub }]}>Use camera to capture</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(false)} style={[styles.pickBtn, { backgroundColor:T.card }]} activeOpacity={0.85}>
            <View style={[styles.pickIcon, { backgroundColor:'#EDE9FE' }]}>
              <Ionicons name="images" size={24} color="#7C3AED" />
            </View>
            <Text style={[styles.pickLabel, { color:T.text }]}>From Gallery</Text>
            <Text style={[styles.pickSub, { color:T.textSub }]}>Choose existing photo</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor:'#EFF6FF', borderColor:'#93C5FD' }]}>
          <Text style={styles.tipsTitle}>📸 Tips for best results</Text>
          <Text style={styles.tipItem}>• Lay prescription flat on a dark surface</Text>
          <Text style={styles.tipItem}>• Good lighting — avoid shadows</Text>
          <Text style={styles.tipItem}>• Keep the whole prescription in frame</Text>
          <Text style={styles.tipItem}>• Works with Hindi and English prescriptions</Text>
        </View>

        {/* Image preview */}
        {image && (
          <View style={[styles.imageCard, { backgroundColor:T.card }]}>
            <Image source={{ uri:image }} style={styles.rxImage} resizeMode="contain" />
            <TouchableOpacity onPress={() => pickImage(true)} style={styles.retakeBtn}>
              <Ionicons name="refresh" size={16} color="#16A34A" />
              <Text style={{ color:'#16A34A', fontSize:13, fontFamily:'Nunito_700Bold' }}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={[styles.loadCard, { backgroundColor:T.card }]}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={[{ fontSize:14, marginTop:12, fontFamily:'Nunito_600SemiBold' }, { color:T.text }]}>Reading prescription...</Text>
            <Text style={[{ fontSize:12, marginTop:4 }, { color:T.textSub }]}>AI is extracting medicine details</Text>
          </View>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            <View style={[styles.card, { backgroundColor:T.card }]}>
              <View style={styles.resultHeader}>
                <Text style={[styles.secTitle, { color:T.text }]}>Medicines Found</Text>
                <View style={[styles.confBadge, {
                  backgroundColor: result.confidence==='High'?'#DCFCE7':result.confidence==='Medium'?'#FEF3C7':'#FEE2E2'
                }]}>
                  <Text style={{ fontSize:11, fontFamily:'Nunito_700Bold', color: result.confidence==='High'?'#14532D':result.confidence==='Medium'?'#92400E':'#991B1B' }}>
                    {result.confidence} confidence
                  </Text>
                </View>
              </View>

              {result.medicines?.map((med, i) => (
                <View key={i} style={[styles.medCard, { backgroundColor:T.bg }]}>
                  <View style={styles.medHeader}>
                    <Ionicons name="medical" size={16} color="#16A34A" />
                    <Text style={[styles.medName, { color:T.text }]}>{med.name}</Text>
                    {med.dosage && <Text style={[styles.medDose, { color:T.textSub }]}>{med.dosage}</Text>}
                  </View>
                  <View style={styles.medDetails}>
                    <View style={styles.medTag}>
                      <Ionicons name="time-outline" size={12} color="#0EA5E9" />
                      <Text style={styles.medTagText}>{FREQ_LABEL[med.frequency] || med.frequency}</Text>
                    </View>
                    {med.with_food && (
                      <View style={styles.medTag}>
                        <Ionicons name="restaurant-outline" size={12} color="#F59E0B" />
                        <Text style={styles.medTagText}>With food</Text>
                      </View>
                    )}
                    {med.duration_days && (
                      <View style={styles.medTag}>
                        <Ionicons name="calendar-outline" size={12} color="#8B5CF6" />
                        <Text style={styles.medTagText}>{med.duration_days} days</Text>
                      </View>
                    )}
                  </View>
                  {med.notes && <Text style={[{ fontSize:11, marginTop:4 }, { color:T.textSub }]}>⚠️ {med.notes}</Text>}
                </View>
              ))}

              {result.doctor_notes && (
                <View style={[styles.notesBox, { backgroundColor:'#F0FDF4', borderColor:'#86EFAC' }]}>
                  <Text style={{ fontSize:12, color:'#14532D', lineHeight:18 }}>📋 {result.doctor_notes}</Text>
                </View>
              )}
            </View>

            {!saved ? (
              <TouchableOpacity onPress={saveReminders} activeOpacity={0.88}>
                <LinearGradient colors={['#065F46','#16A34A']} style={styles.saveBtn}>
                  <Ionicons name="alarm" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Create Medicine Reminders</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.savedCard, { backgroundColor:'#DCFCE7' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                <Text style={{ color:'#14532D', fontFamily:'Nunito_700Bold', fontSize:14 }}>Reminders created!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { padding:20, paddingTop:16, paddingBottom:28 },
  back:         { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 },
  hIcon:        { width:56, height:56, borderRadius:28, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:10 },
  hTitle:       { color:'#fff', fontSize:22, fontFamily:'Nunito_900Black' },
  hSub:         { color:'rgba(255,255,255,0.75)', fontSize:13, marginTop:4 },
  g2:           { flexDirection:'row', gap:12, marginBottom:12 },
  pickBtn:      { flex:1, borderRadius:16, padding:16, alignItems:'center', gap:8 },
  pickIcon:     { width:52, height:52, borderRadius:26, alignItems:'center', justifyContent:'center' },
  pickLabel:    { fontSize:14, fontFamily:'Nunito_800ExtraBold' },
  pickSub:      { fontSize:11, textAlign:'center' },
  tipsCard:     { borderRadius:14, padding:14, borderWidth:1, marginBottom:14 },
  tipsTitle:    { fontSize:13, fontFamily:'Nunito_700Bold', color:'#1E40AF', marginBottom:8 },
  tipItem:      { fontSize:12, color:'#1E40AF', paddingVertical:2, lineHeight:18 },
  imageCard:    { borderRadius:16, padding:12, marginBottom:12, alignItems:'center' },
  rxImage:      { width:'100%', height:200, borderRadius:12, marginBottom:8 },
  retakeBtn:    { flexDirection:'row', gap:6, alignItems:'center', padding:8 },
  loadCard:     { borderRadius:16, padding:32, alignItems:'center', marginBottom:12 },
  card:         { borderRadius:16, padding:16, marginBottom:12 },
  resultHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  secTitle:     { fontSize:15, fontFamily:'Nunito_800ExtraBold' },
  confBadge:    { paddingHorizontal:10, paddingVertical:4, borderRadius:10 },
  medCard:      { borderRadius:12, padding:12, marginBottom:8 },
  medHeader:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' },
  medName:      { fontSize:14, fontFamily:'Nunito_800ExtraBold', flex:1 },
  medDose:      { fontSize:12, fontFamily:'Nunito_600SemiBold' },
  medDetails:   { flexDirection:'row', gap:6, flexWrap:'wrap' },
  medTag:       { flexDirection:'row', gap:4, alignItems:'center', backgroundColor:'rgba(0,0,0,0.04)', paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
  medTagText:   { fontSize:11, fontFamily:'Nunito_600SemiBold', color:'#555' },
  notesBox:     { borderRadius:10, padding:10, borderWidth:1, marginTop:8 },
  saveBtn:      { borderRadius:14, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 },
  saveBtnText:  { color:'#fff', fontSize:15, fontFamily:'Nunito_900Black' },
  savedCard:    { borderRadius:14, padding:16, flexDirection:'row', alignItems:'center', gap:10, justifyContent:'center', marginBottom:12 },
});
