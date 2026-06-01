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
};

export const typography = {
  studioLabel: { fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  title: { fontSize: 46, fontWeight: '900' as const },
  subtitle: { fontSize: 16 },
  body: { fontSize: 15 },
  button: { fontSize: 16, fontWeight: '800' as const },
  tileText: { fontSize: 22, fontWeight: '800' as const },
  cardLabel: { fontSize: 12, fontWeight: '800' as const, textTransform: 'uppercase' as const },
  verse: { fontSize: 18, fontWeight: '700' as const },
  heading: { fontSize: 30, fontWeight: '900' as const },
  sectionTitle: { fontSize: 22, fontWeight: '800' as const },
};

export const spacing = { xs: 4, sm: 8, md: 14, lg: 20, xl: 24, xxl: 32 };
export const radii = { sm: 8, md: 10, lg: 12, xl: 18 };

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
};
