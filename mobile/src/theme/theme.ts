export const THEME = {
  colors: {
    primary: '#0F172A',      // Slate 900
    secondary: '#3B82F6',    // Blue 500
    accent: '#10B981',       // Emerald 500 (Growth)
    expense: '#F43F5E',      // Rose 500 (Spend)
    background: '#F8FAFC',    // Slate 50 (Very light gray/blue)
    surface: '#FFFFFF',      // White
    text: '#0F172A',         // Slate 900
    textSecondary: '#475569', // Slate 600
    textTertiary: '#94A3B8',  // Slate 400
    border: '#E2E8F0',       // Slate 200
    card: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.7)',
    white: '#FFFFFF',
    shadow: '#000000',
    chart: ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#6366F1', '#EC4899', '#14B8A6']
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  roundness: {
    sm: 8,
    md: 12,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 34, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
    h3: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
    body: { fontSize: 16, fontWeight: '500', color: '#334155' },
    sub: { fontSize: 14, fontWeight: '600', color: '#475569' },
    caption: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    label: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, textTransform: 'uppercase' as const },
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 6,
    },
    strong: {
      shadowColor: '#1E3B8A',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.15,
      shadowRadius: 30,
      elevation: 12,
    },
  }
};
