import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Your Family\'s\nHealth Guardian',
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
    colors: ['#92400E', '#D97706', '#FBBF24'],
    features: ['Smart medicine reminders', 'Adherence tracking', 'Prescription scanner'],
  },
  {
    id: '4',
    title: 'Complete\nWellness Tracking',
    subtitle: 'Monitor vitals, BMI, period cycles and more. Your health journey, beautifully visualized.',
    icon: '📊',
    colors: ['#065F46', '#059669', '#34D399'],
    features: ['BMI & vitals tracker', 'Period cycle tracking', 'Health score & trends'],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { demoLogin } = useAuthStore();

  const finishOnboarding = async () => {
    try {
      await SecureStore.setItemAsync('onboarding_done', 'true');
    } catch (e) {
      console.log('SecureStore error:', e);
    }
    demoLogin();
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
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
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <LinearGradient
            colors={item.colors}
            style={styles.slide}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            {/* Skip button */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={finishOnboarding}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>

            {/* Text */}
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
              {item.features.map((f, i) => (
                <View key={i} style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Bottom */}
            <View style={styles.bottomCard}>
              {/* Dots */}
              <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        width: i === currentIndex ? 24 : 8,
                        backgroundColor: i === currentIndex ? item.colors[1] : '#CBD5E1',
                        opacity: i === currentIndex ? 1 : 0.4,
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Button */}
              {isLast ? (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: item.colors[1] }]}
                  onPress={finishOnboarding}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnText}>Get Started 🚀</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: item.colors[1] }]}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnText}>Next</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              )}

              <Text style={styles.terms}>
                By continuing you agree to our{' '}
                <Text style={{ fontWeight: '700' }}>Terms & Privacy Policy</Text>
              </Text>
            </View>
          </LinearGradient>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  slide:       { width, height, paddingTop: 60, paddingHorizontal: 28, overflow: 'hidden' },
  orb1:        { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.06)', top: -120, right: -80 },
  orb2:        { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)', bottom: 200, left: -80 },
  skipBtn:     { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, marginBottom: 10 },
  skipText:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  iconWrap:    { alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 28 },
  icon:        { fontSize: 80 },
  textWrap:    { marginBottom: 24 },
  title:       { color: '#fff', fontSize: 34, fontWeight: '900', lineHeight: 42, marginBottom: 12 },
  subtitle:    { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 23 },
  features:    { gap: 10, marginBottom: 28 },
  featurePill: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  featureText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  bottomCard:  { backgroundColor: '#fff', borderRadius: 28, padding: 24, gap: 16 },
  dotsRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot:         { height: 8, borderRadius: 4 },
  btn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '800' },
  terms:       { textAlign: 'center', color: '#94A3B8', fontSize: 11, lineHeight: 16 },
});
