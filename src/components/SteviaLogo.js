// ─── Stevia Care — Premium Leaf Logo ──────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

export default function SteviaLogo({ size = 80, showText = true, animate = true }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) { scaleAnim.setValue(1); glowAnim.setValue(1); return; }
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(glowAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const leafSize  = size;
  const crossSize = size * 0.28;

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <Animated.View style={[
        styles.outerRing,
        {
          width: leafSize + 20, height: leafSize + 20, borderRadius: (leafSize + 20) / 2,
          opacity: glowAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        {/* Inner circle */}
        <View style={[styles.innerCircle, { width: leafSize, height: leafSize, borderRadius: leafSize / 2 }]}>

          {/* ── Leaf shape made from overlapping circles ── */}
          <View style={[styles.leafPetal, {
            width: leafSize * 0.62, height: leafSize * 0.62,
            borderRadius: leafSize * 0.31,
            top: leafSize * 0.1,
            left: leafSize * 0.16,
            transform: [{ rotate: '-35deg' }],
          }]} />
          <View style={[styles.leafPetal, {
            width: leafSize * 0.62, height: leafSize * 0.62,
            borderRadius: leafSize * 0.31,
            top: leafSize * 0.1,
            left: leafSize * 0.22,
            transform: [{ rotate: '35deg' }],
          }]} />

          {/* ── Leaf midrib (centre vein) ── */}
          <View style={[styles.midrib, {
            width: leafSize * 0.06,
            height: leafSize * 0.52,
            borderRadius: leafSize * 0.04,
            top: leafSize * 0.18,
            left: leafSize * 0.47,
          }]} />

          {/* ── Medical cross overlay ── */}
          <View style={[styles.crossH, {
            width: crossSize, height: crossSize * 0.3,
            borderRadius: crossSize * 0.08,
            top: leafSize * 0.56,
            left: (leafSize - crossSize) / 2,
          }]} />
          <View style={[styles.crossV, {
            width: crossSize * 0.3, height: crossSize,
            borderRadius: crossSize * 0.08,
            top: leafSize * 0.56 - crossSize * 0.35,
            left: (leafSize - crossSize * 0.3) / 2,
          }]} />

          {/* ── Small sparkles ── */}
          <View style={[styles.sparkle, { top: leafSize * 0.12, right: leafSize * 0.1, width: 5, height: 5, borderRadius: 3 }]} />
          <View style={[styles.sparkle, { top: leafSize * 0.22, right: leafSize * 0.06, width: 3, height: 3, borderRadius: 2 }]} />
        </View>
      </Animated.View>

      {showText && (
        <Animated.View style={{ opacity: glowAnim, alignItems: 'center', gap: 2 }}>
          <Text style={styles.appName}>Stevia Care</Text>
          <Text style={styles.tagline}>🌿 Your Family's Health AI</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  innerCircle: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  leafPetal: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  midrib: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  crossH: {
    position: 'absolute',
    backgroundColor: '#fff',
    opacity: 0.95,
  },
  crossV: {
    position: 'absolute',
    backgroundColor: '#fff',
    opacity: 0.95,
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  appName: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'Nunito_900Black',
    letterSpacing: 0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    letterSpacing: 0.3,
  },
});
