import { Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'caption';

interface Props extends TextProps {
  variant?: Variant;
  muted?: boolean;
  color?: string;
}

export function Text({ variant = 'body', muted, color, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <RNText
      style={[
        theme.typography[variant],
        { color: color ?? (muted ? theme.colors.textMuted : theme.colors.text) },
        style,
      ]}
      {...rest}
    />
  );
}
