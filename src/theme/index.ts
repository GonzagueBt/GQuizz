/**
 * Jetons de thème. Utilisés via `useTheme()` (voir src/hooks/useTheme.ts).
 * Identité : indigo profond + accent ambre.
 */

const palette = {
  indigo950: '#1E1B4B',
  indigo900: '#312E81',
  indigo700: '#4338CA',
  indigo500: '#6366F1',
  indigo200: '#C7D2FE',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  green500: '#22C55E',
  red500: '#EF4444',
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate400: '#94A3B8',
  slate600: '#475569',
  slate800: '#1E293B',
  slate900: '#0F172A',
  black: '#000000',
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  success: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: palette.slate50,
  surface: palette.white,
  surfaceAlt: palette.slate100,
  border: palette.slate200,
  text: palette.slate900,
  textMuted: palette.slate600,
  primary: palette.indigo700,
  primaryText: palette.white,
  accent: palette.amber500,
  success: palette.green500,
  danger: palette.red500,
};

export const darkColors: ThemeColors = {
  background: palette.indigo950,
  surface: palette.indigo900,
  surfaceAlt: '#26235F',
  border: '#3A3780',
  text: palette.white,
  textMuted: palette.indigo200,
  primary: palette.indigo500,
  primaryText: palette.white,
  accent: palette.amber400,
  success: palette.green500,
  danger: palette.red500,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '800' as const },
  heading: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
} as const;

export const MAX_CONTENT_WIDTH = 520;
