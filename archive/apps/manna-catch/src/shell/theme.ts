export const colors = {
  background: '#10100E',
  surface: '#1C1C1A',
  surfaceBorder: '#2A2A28',

  textPrimary: '#F5F5F0',
  textSecondary: '#B0B0A8',
  textMuted: '#6A6A64',

  gold: '#D4C36A',
  goldMuted: '#C5A600',

  correct: '#00E676',
  present: '#FFB347',
  absent: '#3A3A38',

  coral: '#FF6B9D',
  teal: '#00E5FF',
  sky: '#00E5FF',

  verseCard: '#1C1C1A',
  verseCardText: '#F5F5F0',

  danger: '#FF3D3D',
  success: '#00E676',

  hearts: '#FF4081',
  stone: '#8B8B8B',
  scroll: '#E8D5B7',
  honey: '#FFB347',
  fruit: '#FF6B9D',

  powerGlow1: '#00FF88',
  powerGlow2: '#B388FF',
  powerGlow3: '#FF8A65',

  keyDefault: '#2A2A28',
  keyText: '#F5F5F0',
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
  score: { fontSize: 36, fontWeight: '900' as const },
  combo: { fontSize: 20, fontWeight: '800' as const },
  hud: { fontSize: 14, fontWeight: '700' as const },
};

export const spacing = { xs: 4, sm: 8, md: 14, lg: 20, xl: 24, xxl: 32 };
export const radii = { sm: 8, md: 10, lg: 12, xl: 18 };

export const shadows = {
  card: {
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
};
