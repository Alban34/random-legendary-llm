export const DEFAULT_THEME_ID = 'midnight';

export const THEME_OPTIONS = [
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'High-contrast dark command deck styling.',
    colorScheme: 'dark'
  },
  {
    id: 'newsprint',
    label: 'Newsprint',
    description: 'Warm light briefing paper styling.',
    colorScheme: 'light'
  }
];

export function isSupportedThemeId(themeId) {
  return THEME_OPTIONS.some((theme) => theme.id === themeId);
}

export function normalizeThemeId(themeId) {
  return isSupportedThemeId(themeId) ? themeId : DEFAULT_THEME_ID;
}

export function getThemeDefinition(themeId) {
  return THEME_OPTIONS.find((theme) => theme.id === themeId) || THEME_OPTIONS[0];
}
