import type { ThemeId, ThemeDefinition } from './types';

export const DEFAULT_THEME_ID: ThemeId = 'dark';

const LEGACY_THEME_ID_ALIASES: Record<string, ThemeId> = {
  midnight: 'dark',
  newsprint: 'light'
};

export const THEME_OPTIONS: readonly ThemeDefinition[] = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'High-contrast dark command deck styling.',
    colorScheme: 'dark'
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Warm light briefing paper styling.',
    colorScheme: 'light'
  }
];

export function isSupportedThemeId(themeId: unknown): themeId is ThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === themeId);
}

export function normalizeThemeId(themeId: unknown): ThemeId {
  const normalizedThemeId: unknown = LEGACY_THEME_ID_ALIASES[themeId as string] || themeId;
  return isSupportedThemeId(normalizedThemeId) ? normalizedThemeId : DEFAULT_THEME_ID;
}

export function getThemeDefinition(themeId: ThemeId): ThemeDefinition {
  const normalizedThemeId = normalizeThemeId(themeId);
  return THEME_OPTIONS.find((theme) => theme.id === normalizedThemeId) || THEME_OPTIONS[0];
}
