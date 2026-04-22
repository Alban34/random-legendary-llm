import { EN_MESSAGES } from './locales/en.ts';
import type { MessageKey } from './locales/en.ts';
import { FR_MESSAGES } from './locales/fr.ts';
import { DE_MESSAGES } from './locales/de.ts';
import { JA_MESSAGES } from './locales/ja.ts';
import { KO_MESSAGES } from './locales/ko.ts';
import { ES_MESSAGES } from './locales/es.ts';

import type { LocaleId, LocaleTools } from './types';

export const DEFAULT_LOCALE_ID: LocaleId = 'en-US';

const SELECTABLE_LOCALES: Array<{ id: LocaleId; label: string; nativeLabel: string }> = [
  { id: 'en-US', label: 'English', nativeLabel: 'English' },
  { id: 'fr-FR', label: 'French', nativeLabel: 'Français' },
  { id: 'de-DE', label: 'German', nativeLabel: 'Deutsch' },
  { id: 'ja-JP', label: 'Japanese', nativeLabel: '日本語' },
  { id: 'ko-KR', label: 'Korean', nativeLabel: '한국어' },
  { id: 'es-ES', label: 'Spanish', nativeLabel: 'Español' }
];

const LOCALE_IDS = new Set<LocaleId>(SELECTABLE_LOCALES.map((locale) => locale.id));

function interpolate(template: string, params?: Record<string, unknown>): string {
  return String(template).replaceAll(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params?.[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

function getMessagesForLocale(localeId: LocaleId): Record<string, string> {
  if (localeId === 'fr-FR') {
    return { ...EN_MESSAGES, ...FR_MESSAGES };
  }

  if (localeId === 'de-DE') {
    return { ...EN_MESSAGES, ...DE_MESSAGES };
  }

  if (localeId === 'ja-JP') {
    return { ...EN_MESSAGES, ...JA_MESSAGES };
  }

  if (localeId === 'ko-KR') {
    return { ...EN_MESSAGES, ...KO_MESSAGES };
  }

  if (localeId === 'es-ES') {
    return { ...EN_MESSAGES, ...ES_MESSAGES };
  }

  return EN_MESSAGES;
}

export function normalizeLocaleId(localeId: unknown): LocaleId {
  return LOCALE_IDS.has(localeId as LocaleId) ? (localeId as LocaleId) : DEFAULT_LOCALE_ID;
}

export function getSelectableLocales(): Array<{ id: LocaleId; label: string; nativeLabel: string }> {
  return [...SELECTABLE_LOCALES];
}

export function getLocaleOption(localeId: LocaleId): { id: LocaleId; label: string; nativeLabel: string } | undefined {
  return SELECTABLE_LOCALES.find((locale) => locale.id === normalizeLocaleId(localeId)) || SELECTABLE_LOCALES[0];
}

function titleCaseWords(value: string): string {
  return String(value)
    .split('-')
    .map((segment) => segment ? segment[0].toUpperCase() + segment.slice(1) : segment)
    .join(' ');
}

export function createLocaleTools(localeId: LocaleId): LocaleTools {
  const normalizedLocaleId = normalizeLocaleId(localeId);
  const messages = getMessagesForLocale(normalizedLocaleId);
  const option = getLocaleOption(normalizedLocaleId);
  const numberFormatter = new Intl.NumberFormat(normalizedLocaleId);
  const dateFormatter = new Intl.DateTimeFormat(normalizedLocaleId, { dateStyle: 'medium' });
  const dateTimeFormatter = new Intl.DateTimeFormat(normalizedLocaleId, { dateStyle: 'medium', timeStyle: 'short' });
  const listFormatter = new Intl.ListFormat(normalizedLocaleId, { style: 'long', type: 'conjunction' });

  const t = (key: MessageKey, params: Record<string, unknown> = {}): string => interpolate(messages[key] ?? EN_MESSAGES[key] ?? key, params);

  const getOutcomeLabel = (outcomeId: string): string => t(`common.outcome.${outcomeId}` as MessageKey);
  const getHistoryGroupingLabel = (modeId: string): string => t(`history.group.${modeId}` as MessageKey);

  const getPlayModeLabel = (playMode: string, playerCount = 1): string => {
    if (playMode === 'advanced-solo') return t('common.playMode.advanced-solo');
    if (playMode === 'two-handed-solo') return t('common.playMode.two-handed-solo');
    if (playMode === 'standard-solo-v2') return t('common.playMode.standard-solo-v2');
    return Number(playerCount) === 1 ? t('common.playMode.standardSolo') : t('common.playMode.standard');
  };

  return {
    localeId: normalizedLocaleId,
    documentLang: normalizedLocaleId,
    localeLabel: option?.nativeLabel ?? normalizedLocaleId,
    t,
    formatNumber(value: number | null | undefined | '', fallback = '—') {
      if (value === null || value === undefined || value === '') {
        return fallback;
      }
      return numberFormatter.format(value);
    },
    formatDate(value: string | null | undefined | false, fallback = '—') {
      if (!value) {
        return fallback;
      }
      return dateFormatter.format(new Date(value));
    },
    formatDateTime(value: string | null | undefined | false, fallback = '—') {
      if (!value) {
        return fallback;
      }
      return dateTimeFormatter.format(new Date(value));
    },
    formatList(values: string[], fallback = '') {
      return Array.isArray(values) && values.length ? listFormatter.format(values) : fallback;
    },
    formatPlayerLabel(count: number) {
      return count === 1 ? t('common.player', { count: numberFormatter.format(count) }) : t('common.players', { count: numberFormatter.format(count) });
    },
    formatGameCount(count: number) {
      return `${numberFormatter.format(count)} ${count === 1 ? t('common.game') : t('common.games')}`;
    },
    formatPlayCount(count: number) {
      return t('history.insights.playCount', {
        count: numberFormatter.format(count),
        playWord: count === 1 ? t('common.play') : t('common.plays')
      });
    },
    formatEntityCount(count: number, singularKey: MessageKey, pluralKey: MessageKey = singularKey) {
      const noun = count === 1 ? t(singularKey) : t(pluralKey);
      return `${numberFormatter.format(count)} ${noun}`;
    },
    getTabLabel(tabId: string) {
      return t(`tabs.${tabId}.label` as MessageKey);
    },
    getTabShortLabel(tabId: string) {
      return t(`tabs.${tabId}.shortLabel` as MessageKey);
    },
    getTabDescription(tabId: string) {
      return t(`tabs.${tabId}.description` as MessageKey);
    },
    getThemeLabel(themeId: string) {
      return t(`theme.${themeId}.label` as MessageKey);
    },
    getThemeDescription(themeId: string) {
      return t(`theme.${themeId}.description` as MessageKey);
    },
    getHistoryGroupingLabel(modeId: string) {
      return t(`history.group.${modeId}` as MessageKey);
    },
    getUsageLabel(category: string) {
      return t(`common.${category}` as MessageKey);
    },
    getOutcomeLabel(outcomeId: string) {
      return t(`common.outcome.${outcomeId}` as MessageKey);
    },
    formatResultStatus(result: unknown) {
      const r = result as { status?: string; outcome?: string; score?: unknown } | null | undefined;
      if (r?.status !== 'completed') {
        return t('common.pendingResult');
      }
      const outcomeLabel = getOutcomeLabel(r.outcome ?? '') || t('common.unknown');
      return r.score === null
        ? outcomeLabel
        : `${outcomeLabel} · ${t('common.score', { score: numberFormatter.format(r.score as number) })}`;
    },
    getPlayModeLabel(playMode: string, playerCount = 1) {
      if (playMode === 'advanced-solo') {
        return t('common.playMode.advanced-solo');
      }
      if (playMode === 'two-handed-solo') {
        return t('common.playMode.two-handed-solo');
      }
      if (playMode === 'standard-solo-v2') {
        return t('common.playMode.standard-solo-v2');
      }
      return Number(playerCount) === 1 ? t('common.playMode.standardSolo') : t('common.playMode.standard');
    },
    getPlayModeDescription(playMode: string, playerCount = 1) {
      if (playMode === 'advanced-solo') {
        return t('common.playMode.advanced-soloDescription');
      }
      if (playMode === 'two-handed-solo') {
        return t('common.playMode.two-handed-soloDescription');
      }
      if (playMode === 'standard-solo-v2') {
        return t('common.playMode.standard-solo-v2Description');
      }
      return Number(playerCount) === 1 ? t('common.playMode.standardSoloDescription') : t('common.playMode.standardDescription');
    },
    getPlayModeHelpText(playerCount: number, playMode: string) {
      if (Number(playerCount) !== 1) {
        return t('common.playMode.multiplayerDisabled');
      }
      if (playMode === 'two-handed-solo') {
        return t('common.playMode.twoHandedHelp');
      }
      return t('common.playMode.chooseSolo');
    },
    formatPersistedPlayMode(playerCount: number, playMode: string) {
      return t('common.format.persistedPlayMode', {
        players: numberFormatter.format(playerCount),
        mode: getPlayModeLabel(playMode, playerCount)
      });
    },
    getBrowseTypeLabel(type: string) {
      return t(`browse.typeLabel.${type}` as MessageKey);
    },
    getBrowseTypeFilterLabel(type: string) {
      return t(`browse.type.${type}` as MessageKey);
    },
    getBrowseSortLabel(sortKey: string) {
      return t(`browse.sort.${sortKey}` as MessageKey);
    },
    getCollectionGroupLabel(type: string) {
      return t(`collection.group.${type}` as MessageKey);
    },
    getToastVariantLabel(variant: string) {
      return t(`toast.variant.${variant}` as MessageKey);
    },
    localizeNotice(notice: string) {
      if (notice === 'Recovered invalid preference values during state hydration.') {
        return t('persistence.invalidPrefs');
      }
      return notice;
    },
    localizeValidationMessage(message: string) {
      if (message === 'Choose Win or Loss before saving the result.') {
        return t('validation.chooseOutcome');
      }
      if (message === 'Enter a score before saving the result.') {
        return t('validation.enterWinScore');
      }
      if (message === 'Score must be a whole number that is 0 or greater.') {
        return t('validation.scoreWholeNumber');
      }
      return message;
    },
    formatGroupingModeLabel(modeId: string) {
      return titleCaseWords(getHistoryGroupingLabel(modeId));
    }
  };
}
