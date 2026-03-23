import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { analyzeLabReport } from '../../services/aiService';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';
import { API_BASE_URL } from '../../constants/config';
import { format } from 'date-fns';

export default function LabAnalyzerScreen({ navigation }) {
  const [loading, setLoading]       = useState(false);
  const [manualText, setManualText] = useState('');
  const [showManual, setShowManual] = useState(false);
  const { labReports, addLabReport, removeLabReport } = useHealthStore();
  const { user, token } = useAuthStore();
  const { isDark } = useThemeStore();
  const T = getTheme(isDark);

  // ── Analyze ──────────────────────────────────────────────────────────
  const handleAnalyze = async (reportText, source) => {
    if (!reportText.trim()) {
      Alert.alert('No Content', 'Please enter or upload a lab report first.');
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeLabReport({
        reportText,
        age:        user?.age       || 30,
        gender:     user?.gender    || 'unknown',
        conditions: user?.conditions || '',
        medications: user?.medications || '',
      });
      const report = {
        id:         `lab_${Date.now()}`,
        source,
        rawText:    reportText,
        result,
        memberName: user?.name,
        date:       new Date().toISOString(),
      };
      addLabReport(report, token);
      navigation.navigate('LabResult', { report });
    } catch (e) {
      Alert.alert('Analysis Failed', e.message || 'Please check your Groq API key in config.js');
    } finally {
      setLoading(false);
    }
  };

  // ── Upload PDF ────────────────────────────────────────────────────────
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        const fileName = file.name || '';

        // Plain text file — read directly via fetch
        if (fileName.endsWith('.txt')) {
          setLoading(true);
          try {
            const res = await fetch(file.uri);
            const content = await res.text();
            if (content?.trim().length > 10) {
              await handleAnalyze(content, 'file');
              return;
            }
          } catch (e) {}
          finally { setLoading(false); }
        }

        // PDF — send to backend for text extraction
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', {
            uri:  file.uri,
            name: fileName,
            type: 'application/pdf',
          });

          const res = await fetch(`${API_BASE_URL}/pdf/extract`, {
            method:  'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body:    formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.text && data.text.trim().length > 20) {
              // Successfully extracted — auto analyze!
              await handleAnalyze(data.text, 'pdf');
              return;
            }
          } else {
            console.log('[PDF] Backend error:', res.status);
          }
        } catch (netErr) {
          console.log('[PDF] Network error:', netErr.message);
        } finally {
          setLoading(false);
        }

        // Backend unavailable or extraction failed — fallback to manual
        setShowManual(true);
        Alert.alert(
          '📋 Type your lab values',
          `PDF selected: "${fileName}"\n\nOpen your PDF and type the key values below:\n\nExample:\nHemoglobin: 11.2\nHbA1c: 5.6%\nTSH: 6.2\nCholesterol: 218`,
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Could not open file.');
    }
  };

  // ── Camera ────────────────────────────────────────────────────────────
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'Please allow camera access in your phone Settings to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.[0]) {
      Alert.alert(
        '📸 Photo Taken',
        'Great! Now paste the report text below or type it manually for AI analysis.\n\nNote: OCR text extraction from images requires the backend OCR service.',
        [{ text: 'OK', onPress: () => setShowManual(true) }]
      );
    }
  };

  // ── Gallery ───────────────────────────────────────────────────────────
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.[0]) {
      setShowManual(true);
      Alert.alert('Image Selected', 'Now paste or type the report values below for analysis.');
    }
  };

  // ── Delete Report ─────────────────────────────────────────────────────
  const deleteReport = (report, index) => {
    Alert.alert(
      'Delete Report',
      `Delete report from ${format(new Date(report.date), 'dd MMM yyyy')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (removeLabReport) {
              removeLabReport(report.id || index, token);
            }
          },
        },
      ]
    );
  };

  const statusColor = (s) => s === 'Normal' ? '#16A34A' : s === 'Borderline' ? '#F59E0B' : '#EF4444';
  const statusBg    = (s) => s === 'Normal' ? '#F0FDF4' : s === 'Borderline' ? '#FFFBEB' : '#FFF5F5';

  return (
    <SafeAreaView style={[{ flex: 1 }, { backgroundColor: T.bg }]} edges={['top']}>

      {/* ── Header with back button ── */}
      <LinearGradient colors={['#14532D', '#16A34A', '#4ADE80']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Lab Report Analyzer</Text>
          <Text style={styles.headerSub}>AI-powered blood test & report analysis</Text>
        </View>
      </LinearGradient>

      {/* ── Loading overlay ── */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingBox, { backgroundColor: T.card }]}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={[styles.loadingText, { color: T.text }]}>AI is analyzing your report...</Text>
            <Text style={[{ fontSize: 12 }, { color: T.textMuted }]}>This takes 10-20 seconds</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Upload options ── */}
        <View style={[styles.card, { backgroundColor: T.card }]}>
          <Text style={[styles.cardTitle, { color: T.text }]}>Upload Your Report</Text>
          <Text style={[styles.cardSub, { color: T.textMuted }]}>Take photo, upload PDF, or type the values manually</Text>

          {/* 3 upload options */}
          <View style={styles.uploadRow}>
            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: T.cardAlt || T.bg, borderColor: T.border }]}
              onPress={openCamera} activeOpacity={0.8}>
              <View style={[styles.uploadIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="camera" size={26} color="#16A34A" />
              </View>
              <Text style={[styles.uploadBtnTitle, { color: T.text }]}>Camera</Text>
              <Text style={[styles.uploadBtnSub, { color: T.textMuted }]}>Take a photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: T.cardAlt || T.bg, borderColor: T.border }]}
              onPress={openGallery} activeOpacity={0.8}>
              <View style={[styles.uploadIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="images" size={26} color="#7C3AED" />
              </View>
              <Text style={[styles.uploadBtnTitle, { color: T.text }]}>Gallery</Text>
              <Text style={[styles.uploadBtnSub, { color: T.textMuted }]}>From photos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: T.cardAlt || T.bg, borderColor: T.border }]}
              onPress={pickDocument} activeOpacity={0.8}>
              <View style={[styles.uploadIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={26} color="#F59E0B" />
              </View>
              <Text style={[styles.uploadBtnTitle, { color: T.text }]}>PDF</Text>
              <Text style={[styles.uploadBtnSub, { color: T.textMuted }]}>Upload file</Text>
            </TouchableOpacity>
          </View>

          {/* Manual input toggle */}
          <TouchableOpacity style={styles.manualToggle} onPress={() => setShowManual(!showManual)}>
            <Ionicons name="create-outline" size={16} color="#16A34A" />
            <Text style={styles.manualToggleText}>
              {showManual ? 'Hide text input' : 'Type or paste report values'}
            </Text>
            <Ionicons name={showManual ? 'chevron-up' : 'chevron-down'} size={14} color="#16A34A" />
          </TouchableOpacity>

          {showManual && (
            <>
              <TextInput
                style={[styles.manualInput, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
                value={manualText}
                onChangeText={setManualText}
                placeholder={"Type your lab values here. Example:\n\nHemoglobin: 11.2 g/dL\nWBC: 8500 cells/μL\nPlatelets: 180000\nHbA1c: 5.6%\nFasting Sugar: 98 mg/dL\nTotal Cholesterol: 218 mg/dL\nTSH: 6.2 mIU/L\nVitamin D: 18 ng/mL\n\nEven 3-4 values work!"}
                placeholderTextColor={T.textMuted}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity onPress={() => handleAnalyze(manualText, 'manual')}
                activeOpacity={0.85} style={{ marginTop: 12 }}>
                <LinearGradient colors={['#14532D', '#16A34A']} style={styles.analyzeBtn}>
                  <Ionicons name="flask" size={18} color="#fff" />
                  <Text style={styles.analyzeBtnText}>Analyze Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Past Reports ── */}
        {labReports.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: T.text }]}>
              Past Reports ({labReports.length})
            </Text>
            {labReports.map((report, i) => (
              <View key={report.id || i} style={[styles.reportRow, { backgroundColor: T.card, borderColor: T.border }]}>
                {/* Tap to view */}
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  onPress={() => navigation.navigate('LabResult', { report })} activeOpacity={0.85}>
                  <View style={[styles.reportIconBox, { backgroundColor: statusBg(report.result?.overall_status) }]}>
                    <Ionicons name="flask" size={20} color={statusColor(report.result?.overall_status)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 14, fontWeight: '700' }, { color: T.text }]}>
                      {format(new Date(report.date), 'dd MMM yyyy · hh:mm a')}
                    </Text>
                    <Text style={[{ fontSize: 12, marginTop: 2 }, { color: T.textMuted }]}>
                      {report.result?.overall_status || 'Complete'} · {report.memberName || 'Me'}
                    </Text>
                    {report.result?.key_findings?.[0] && (
                      <Text style={[{ fontSize: 11, marginTop: 3, fontStyle: 'italic' }, { color: T.textMuted }]}
                        numberOfLines={1}>
                        {report.result.key_findings[0]}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={T.textMuted} />
                </TouchableOpacity>

                {/* Delete button */}
                <TouchableOpacity onPress={() => deleteReport(report, i)}
                  style={styles.deleteBtn} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ── Empty state ── */}
        {labReports.length === 0 && !showManual && (
          <View style={[styles.emptyBox, { backgroundColor: T.card }]}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#14532D33' : '#DCFCE7' }]}>
              <Ionicons name="flask-outline" size={44} color="#16A34A" />
            </View>
            <Text style={[styles.emptyTitle, { color: T.text }]}>No Reports Yet</Text>
            <Text style={[styles.emptySub, { color: T.textMuted }]}>
              Upload your first lab report and get an instant AI-powered analysis
            </Text>
            <TouchableOpacity onPress={() => setShowManual(true)}
              style={[styles.startBtn, { backgroundColor: '#16A34A' }]} activeOpacity={0.85}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Type Report Values</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:         { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerSub:      { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, alignItems: 'center', justifyContent: 'center' },
  loadingBox:     { borderRadius: 20, padding: 32, alignItems: 'center', gap: 12, minWidth: 200 },
  loadingText:    { fontSize: 14, fontWeight: '600' },
  card:           { borderRadius: 20, padding: 18, marginBottom: 16, elevation: 3 },
  cardTitle:      { fontSize: 17, fontWeight: '800' },
  cardSub:        { fontSize: 12, marginTop: 4, marginBottom: 18 },
  uploadRow:      { flexDirection: 'row', gap: 10, marginBottom: 14 },
  uploadBtn:      { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  uploadIcon:     { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  uploadBtnTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  uploadBtnSub:   { fontSize: 10, textAlign: 'center', marginTop: 2 },
  manualToggle:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  manualToggleText:{ color: '#16A34A', fontSize: 13, fontWeight: '600' },
  manualInput:    { borderRadius: 14, borderWidth: 1.5, padding: 14, minHeight: 180, fontSize: 13, lineHeight: 20 },
  analyzeBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  analyzeBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionTitle:   { fontSize: 16, fontWeight: '800', marginBottom: 12, marginTop: 4 },
  reportRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1 },
  reportIconBox:  { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  emptyBox:       { borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 8 },
  emptyIcon:      { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle:     { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySub:       { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  startBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
});
