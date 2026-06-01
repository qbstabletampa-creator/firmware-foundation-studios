export const colors = {
  background: '#FFFBF0',
  surface: '#FFFFFF',
  surfaceBorder: '#E8E4DC',

  textPrimary: '#1A1A1A',
  textSecondary: '#5A5A5A',
  textMuted: '#9A9A9A',

  gold: '#D4C36A',
  goldMuted: '#B8A94E',

  correct: '#4CAF79',
  present: '#F5A623',
  absent: '#D2D2D2',

  coral: '#FF6B6B',
  teal: '#4ECDC4',
  sky: '#5BA4E6',

  verseCard: '#FFF8E7',
  verseCardText: '#2D2D2D',

  danger: '#E74C3C',
  success: '#4CAF79',

  keyDefault: '#E8E4DC',
  keyText: '#1A1A1A',

  dark: '#10100E',
  darkSurface: '#1A1A18',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 18,
} as const;

export const typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  studioLabel: { fontSize: 12, letterSpacing: '1.4px', textTransform: 'uppercase' as const, fontWeight: 700 },
  title: { fontSize: 46, fontWeight: 900 },
  subtitle: { fontSize: 16, fontWeight: 400 },
  body: { fontSize: 15, fontWeight: 400 },
  button: { fontSize: 16, fontWeight: 800 },
  tileText: { fontSize: 22, fontWeight: 800 },
  cardLabel: { fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  verse: { fontSize: 18, fontWeight: 700 },
  heading: { fontSize: 30, fontWeight: 900 },
  sectionTitle: { fontSize: 22, fontWeight: 800 },
} as const;

export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  button: '0 1px 4px rgba(0, 0, 0, 0.04)',
} as const;
