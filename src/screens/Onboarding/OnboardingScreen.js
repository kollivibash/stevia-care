import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: "Your Family's\nHealth Guardian",
    subtitle: 'Track health for your entire family — medicines, reports, and cycles all in one place.',
    icon: '🏥',
    colors: ['#064E3B', '#065F46', '#16A34A'],
    features: ['Family health profiles', 'Shared medicine tracking', 'Emergency health info'],
  },
  {
    id: '2',
    title: 'AI-Powered\nHealth Insights',
    subtitle: 'Upload lab reports and get instant AI analysis. Ask Stevia AI anything about your health.',
    icon: '🤖',
    colors: ['#14532D', '#16A34A', '#22C55E'],
    features: ['Lab report analysis', 'Symptom checker', 'Personalized health tips'],
  },
  {
    id: '3',
    title: 'Never Miss\nA Medicine',
    subtitle: 'Smart reminders ensure you and your family never miss a dose.',
    icon: '💊',
    colors: ['#7C2D12', '#C2410C', '#EA580C'],
    features: ['Smart medicine reminders', 'Adherence tracking', 'Prescription scanner'],
  },
  {
    id: '4',
    title: 'Complete\nWellness Tracking',
    subtitle: 'Monitor vitals, BMI, period cycles and more. Your health journey, beautifully visualized.',
    icon: '📊',
    colors: ['#1E1B4B', '#3730A3', '#4F46E5'],
    features: ['BMI & vitals tracker', 'Period cycle tracking', 'Health score & trends'],
  },
];

export default function OnboardingScreen({ onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finishOnboarding = async () => {
    try {
      await SecureStore.setItemAsync('onboarding_done', 'true');
    } catch (e) {}
    onDone && onDone();
  };

  const handleNext = () => {
    const next = currentIndex + 1;
    if (next < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.colors}
            style={styles.slide}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.orb1} />
            <View style={styles.orb2} />
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <View style={styles.features}>
              {item.features.map((f, i) => (
                <View key={i} style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        )}
      />

      {/* Fixed bottom — outside FlatList so buttons always work */}
      <View style={styles.bottomCard}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: '#16A34A' }]}
              />
            );
          })}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={finishOnboarding}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {isLast ? (
            <TouchableOpacity
              onPress={finishOnboarding}
              style={styles.mainBtn}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#065F46', '#16A34A']} style={styles.mainBtnGrad}>
                <Text style={styles.mainBtnText}>Get Started 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={styles.mainBtn}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#065F46', '#16A34A']} style={styles.mainBtnGrad}>
                <Text style={styles.mainBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#14532D' },
  slide:        { width, height: height - 180, paddingTop: 60, paddingHorizontal: 28, overflow: 'hidden' },
  orb1:         { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.06)', top: -100, right: -80 },
  orb2:         { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)', bottom: 80, left: -80 },
  iconWrap:     { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  icon:         { fontSize: 80 },
  title:        { color: '#fff', fontSize: 32, fontFamily: 'Nunito_900Black', lineHeight: 40, marginBottom: 12 },
  subtitle:     { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 23, marginBottom: 28 },
  features:     { gap: 10 },
  featurePill:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  featureText:  { color: '#fff', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  bottomCard:   { backgroundColor: '#fff', padding: 24, paddingBottom: 44, gap: 20 },
  dotsRow:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot:          { height: 8, borderRadius: 4 },
  btnRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skipBtn:      { flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  skipText:     { color: '#64748B', fontFamily: 'Nunito_700Bold', fontSize: 15 },
  mainBtn:      { flex: 2, borderRadius: 14, overflow: 'hidden' },
  mainBtnGrad:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  mainBtnText:  { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
});
