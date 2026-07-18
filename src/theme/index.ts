import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from './colors';
import { useSettings } from '../store/useSettings';

export { LightColors, DarkColors };
export type { ThemeColors };

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const { settings } = useSettings();
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && scheme === 'dark');
  return { colors: isDark ? DarkColors : LightColors, isDark };
}

export const Typography = {
  fontFamily: 'System',
  boardNumberSize: 22,
  pencilMarkSize: 9,
  labelSmall: 11,
  labelMedium: 13,
  buttonText: 17,
  screenTitle: 22,
  logoSize: 52,
} as const;

export const Spacing = {
  screenPadding: 24,
  boardRadius: 16,
  cardRadius: 20,
  buttonRadius: 16,
} as const;
