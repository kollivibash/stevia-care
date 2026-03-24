// ─── Stevia Care — Premium Design System ──────────────────────────────────

export const COLORS = {
  // ── Brand Greens ──────────────────────────────────────────────────────
  primary:       '#14532D',   // Deep forest green (brand)
  primaryMid:    '#16A34A',   // Vibrant green (CTA)
  primaryLight:  '#4ADE80',   // Lime green (accents)
  primaryBg:     '#F0FDF4',   // Mint background
  primaryFaint:  '#DCFCE7',   // Very light green tint

  // ── Semantic ──────────────────────────────────────────────────────────
  success:       '#10B981',
  successBg:     '#D1FAE5',
  warning:       '#F59E0B',
  warningBg:     '#FEF3C7',
  danger:        '#EF4444',
  dangerBg:      '#FEE2E2',
  info:          '#3B82F6',
  infoBg:        '#EFF6FF',

  // ── Lab Status ────────────────────────────────────────────────────────
  green:         '#10B981',
  greenBg:       '#D1FAE5',
  yellow:        '#F59E0B',
  yellowBg:      '#FEF3C7',
  red:           '#EF4444',
  redBg:         '#FEE2E2',

  // ── Neutrals ──────────────────────────────────────────────────────────
  white:         '#FFFFFF',
  black:         '#0A0A0A',
  background:    '#F7FBF8',
  card:          '#FFFFFF',
  border:        '#E8F0E9',
  inputBg:       '#F5FAF6',
  divider:       '#E2E8F0',

  // ── Text ──────────────────────────────────────────────────────────────
  textPrimary:   '#0D1F12',
  textSecondary: '#4B6B52',
  textMuted:     '#8BA58D',
  textOnPrimary: '#FFFFFF',

  // ── Module Colours ────────────────────────────────────────────────────
  labColor:      '#7C3AED',
  labLight:      '#EDE9FE',
  chatColor:     '#6366F1',
  chatLight:     '#EEF2FF',
  reminderColor: '#F59E0B',
  reminderLight: '#FEF3C7',
  familyColor:   '#10B981',
  familyLight:   '#D1FAE5',
  trackerColor:  '#EC4899',
  trackerLight:  '#FCE7F3',
  sosColor:      '#EF4444',
  sosLight:      '#FEE2E2',
};

// ── Typography — Nunito ────────────────────────────────────────────────────
export const FONTS = {
  regular:    'Nunito_400Regular',
  semiBold:   'Nunito_600SemiBold',
  bold:       'Nunito_700Bold',
  extraBold:  'Nunito_800ExtraBold',
  black:      'Nunito_900Black',
};

// ── Sizes ─────────────────────────────────────────────────────────────────
export const SIZES = {
  xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30, huge: 38,
  padding: 20, paddingLg: 28,
  radius: 16, radiusMd: 20, radiusLg: 28, radiusFull: 999,
};

// ── Shadows ───────────────────────────────────────────────────────────────
export const SHADOWS = {
  small: {
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  large: {
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  glow: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
};
