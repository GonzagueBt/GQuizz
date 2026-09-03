import { useColorScheme } from 'react-native';

import { darkColors, lightColors, radius, spacing, typography, type ThemeColors } from '@/theme';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  dark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return {
    colors: dark ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    dark,
  };
}
