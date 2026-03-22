import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

// ── CARD ────────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.85}>{content}</TouchableOpacity>;
  return content;
}

// ── GRADIENT CARD ───────────────────────────────────────────────────
export function GradientCard({ children, colors, style, onPress }) {
  const content = (
    <LinearGradient colors={colors || [COLORS.primary, COLORS.primaryMid]} style={[styles.gradientCard, style]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {children}
    </LinearGradient>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.85}>{content}</TouchableOpacity>;
  return content;
}

// ── BUTTON ──────────────────────────────────────────────────────────
export function Button({ title, onPress, loading, variant = 'primary', icon, style, disabled }) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        isOutline && styles.buttonOutline,
        isDanger && styles.buttonDanger,
        (loading || disabled) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} size="small" />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <Ionicons name={icon} size={18} color={isOutline ? COLORS.primary : COLORS.white} style={{ marginRight: 8 }} />}
          <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline, isDanger && styles.buttonTextDanger]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── INPUT ───────────────────────────────────────────────────────────
export function Input({ label, icon, error, style, ...props }) {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ── SCREEN HEADER ───────────────────────────────────────────────────
export function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryMid]}
      style={styles.screenHeader}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerRow}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View style={styles.headerRight}>{rightAction}</View>}
      </View>
    </LinearGradient>
  );
}

// ── STATUS BADGE ────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    GREEN: { bg: COLORS.greenBg, color: COLORS.green, label: 'Normal' },
    YELLOW: { bg: COLORS.yellowBg, color: COLORS.warning, label: 'Borderline' },
    RED: { bg: COLORS.redBg, color: COLORS.danger, label: 'Abnormal' },
    Normal: { bg: COLORS.greenBg, color: COLORS.green, label: 'Normal' },
    Borderline: { bg: COLORS.yellowBg, color: COLORS.warning, label: 'Borderline' },
    Abnormal: { bg: COLORS.redBg, color: COLORS.danger, label: 'Abnormal' },
    Good: { bg: COLORS.greenBg, color: COLORS.green, label: 'Good' },
    Fair: { bg: COLORS.yellowBg, color: COLORS.warning, label: 'Fair' },
    'Needs Attention': { bg: COLORS.redBg, color: COLORS.danger, label: 'Needs Attention' },
  };
  const cfg = map[status] || { bg: COLORS.primaryLight, color: COLORS.primary, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ── LOADING OVERLAY ─────────────────────────────────────────────────
export function LoadingOverlay({ message }) {
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{message || 'AI is thinking...'}</Text>
        <Text style={styles.loadingSubtext}>Powered by Claude AI</Text>
      </View>
    </View>
  );
}

// ── MODULE CARD ─────────────────────────────────────────────────────
export function ModuleCard({ icon, title, subtitle, color, lightColor, onPress, badge }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.moduleCard, SHADOWS.small]}>
      <View style={[styles.moduleIconBg, { backgroundColor: lightColor }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.moduleInfo}>
        <Text style={styles.moduleTitle}>{title}</Text>
        <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      </View>
      {badge && (
        <View style={[styles.moduleBadge, { backgroundColor: color }]}>
          <Text style={styles.moduleBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

// ── EMPTY STATE ─────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action, actionLabel }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Ionicons name={icon} size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action && (
        <Button title={actionLabel || 'Get Started'} onPress={action} style={{ marginTop: 20, width: 180 }} />
      )}
    </View>
  );
}

// ── SECTION TITLE ───────────────────────────────────────────────────
export function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── HEALTH SCORE RING ────────────────────────────────────────────────
export function HealthScoreRing({ score, size = 80 }) {
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.warning : COLORS.danger;
  return (
    <View style={[styles.scoreRing, { width: size, height: size, borderColor: color, borderRadius: size / 2 }]}>
      <Text style={[styles.scoreNumber, { color, fontSize: size * 0.28 }]}>{score}</Text>
      <Text style={[styles.scoreLabel, { fontSize: size * 0.12 }]}>/ 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  gradientCard: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextDanger: {
    color: COLORS.white,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.textPrimary,
  },
  errorText: {
    fontSize: SIZES.xs,
    color: COLORS.danger,
    marginTop: 4,
  },
  screenHeader: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 32,
    alignItems: 'center',
    ...SHADOWS.large,
    minWidth: 200,
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtext: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    marginTop: 4,
  },
  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  moduleSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
    marginRight: 8,
  },
  moduleBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scoreRing: {
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontWeight: '800',
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
