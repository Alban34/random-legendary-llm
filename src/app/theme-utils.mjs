export const DEFAULT_THEME_ID = 'dark';

const LEGACY_THEME_ID_ALIASES = {
  midnight: 'dark',
  newsprint: 'light'
};

export const THEME_OPTIONS = [
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

export function isSupportedThemeId(themeId) {
  return THEME_OPTIONS.some((theme) => theme.id === themeId);
}

export function normalizeThemeId(themeId) {
  const normalizedThemeId = LEGACY_THEME_ID_ALIASES[themeId] || themeId;
  return isSupportedThemeId(normalizedThemeId) ? normalizedThemeId : DEFAULT_THEME_ID;
}

export function getThemeDefinition(themeId) {
  const normalizedThemeId = normalizeThemeId(themeId);
  return THEME_OPTIONS.find((theme) => theme.id === normalizedThemeId) || THEME_OPTIONS[0];
}
