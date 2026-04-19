import { EN_MESSAGES } from './locales/en.mjs';
import { FR_MESSAGES } from './locales/fr.mjs';
import { DE_MESSAGES } from './locales/de.mjs';
import { JA_MESSAGES } from './locales/ja.mjs';
import { KO_MESSAGES } from './locales/ko.mjs';
import { ES_MESSAGES } from './locales/es.mjs';

export const DEFAULT_LOCALE_ID = 'en-US';

const SELECTABLE_LOCALES = [
  { id: 'en-US', label: 'English', nativeLabel: 'English' },
  { id: 'fr-FR', label: 'French', nativeLabel: 'Français' },
  { id: 'de-DE', label: 'German', nativeLabel: 'Deutsch' },
  { id: 'ja-JP', label: 'Japanese', nativeLabel: '日本語' },
  { id: 'ko-KR', label: 'Korean', nativeLabel: '한국어' },
  { id: 'es-ES', label: 'Spanish', nativeLabel: 'Español' }
];

const LOCALE_IDS = new Set(SELECTABLE_LOCALES.map((locale) => locale.id));

function interpolate(template, params) {
  return String(template).replaceAll(/\{([^}]+)\}/g, (_, key) => {
    const value = params?.[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

function getMessagesForLocale(localeId) {
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

export function normalizeLocaleId(localeId) {
  return LOCALE_IDS.has(localeId) ? localeId : DEFAULT_LOCALE_ID;
}

export function getSelectableLocales() {
  return [...SELECTABLE_LOCALES];
}

export function getLocaleOption(localeId) {
  return SELECTABLE_LOCALES.find((locale) => locale.id === normalizeLocaleId(localeId)) || SELECTABLE_LOCALES[0];
}

function titleCaseWords(value) {
  return String(value)
    .split('-')
    .map((segment) => segment ? segment[0].toUpperCase() + segment.slice(1) : segment)
    .join(' ');
}

export function createLocaleTools(localeId) {
  const normalizedLocaleId = normalizeLocaleId(localeId);
  const messages = getMessagesForLocale(normalizedLocaleId);
  const option = getLocaleOption(normalizedLocaleId);
  const numberFormatter = new Intl.NumberFormat(normalizedLocaleId);
  const dateFormatter = new Intl.DateTimeFormat(normalizedLocaleId, { dateStyle: 'medium' });
  const dateTimeFormatter = new Intl.DateTimeFormat(normalizedLocaleId, { dateStyle: 'medium', timeStyle: 'short' });
  const listFormatter = new Intl.ListFormat(normalizedLocaleId, { style: 'long', type: 'conjunction' });

  const t = (key, params = {}) => interpolate(messages[key] ?? EN_MESSAGES[key] ?? key, params);

  return {
    localeId: normalizedLocaleId,
    documentLang: normalizedLocaleId,
    localeLabel: option.nativeLabel,
    t,
    formatNumber(value, fallback = '—') {
      if (value === null || value === undefined || value === '') {
        return fallback;
      }
      return numberFormatter.format(value);
    },
    formatDate(value, fallback = '—') {
      if (!value) {
        return fallback;
      }
      return dateFormatter.format(new Date(value));
    },
    formatDateTime(value, fallback = '—') {
      if (!value) {
        return fallback;
      }
      return dateTimeFormatter.format(new Date(value));
    },
    formatList(values, fallback = '') {
      return Array.isArray(values) && values.length ? listFormatter.format(values) : fallback;
    },
    formatPlayerLabel(count) {
      return count === 1 ? t('common.player', { count: numberFormatter.format(count) }) : t('common.players', { count: numberFormatter.format(count) });
    },
    formatGameCount(count) {
      return `${numberFormatter.format(count)} ${count === 1 ? t('common.game') : t('common.games')}`;
    },
    formatPlayCount(count) {
      return t('history.insights.playCount', {
        count: numberFormatter.format(count),
        playWord: count === 1 ? t('common.play') : t('common.plays')
      });
    },
    formatEntityCount(count, singularKey, pluralKey = singularKey) {
      const noun = count === 1 ? t(singularKey) : t(pluralKey);
      return `${numberFormatter.format(count)} ${noun}`;
    },
    getTabLabel(tabId) {
      return t(`tabs.${tabId}.label`);
    },
    getTabShortLabel(tabId) {
      return t(`tabs.${tabId}.shortLabel`);
    },
    getTabDescription(tabId) {
      return t(`tabs.${tabId}.description`);
    },
    getThemeLabel(themeId) {
      return t(`theme.${themeId}.label`);
    },
    getThemeDescription(themeId) {
      return t(`theme.${themeId}.description`);
    },
    getHistoryGroupingLabel(modeId) {
      return t(`history.group.${modeId}`);
    },
    getUsageLabel(category) {
      return t(`common.${category}`);
    },
    getOutcomeLabel(outcomeId) {
      return t(`common.outcome.${outcomeId}`);
    },
    formatResultStatus(result) {
      if (result?.status !== 'completed') {
        return t('common.pendingResult');
      }
      const outcomeLabel = this.getOutcomeLabel(result.outcome) || t('common.unknown');
      return result.score === null
        ? outcomeLabel
        : `${outcomeLabel} · ${t('common.score', { score: numberFormatter.format(result.score) })}`;
    },
    getPlayModeLabel(playMode, playerCount = 1) {
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
    getPlayModeDescription(playMode, playerCount = 1) {
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
    getPlayModeHelpText(playerCount, playMode) {
      if (Number(playerCount) !== 1) {
        return t('common.playMode.multiplayerDisabled');
      }
      if (playMode === 'two-handed-solo') {
        return t('common.playMode.twoHandedHelp');
      }
      return t('common.playMode.chooseSolo');
    },
    formatPersistedPlayMode(playerCount, playMode) {
      return t('common.format.persistedPlayMode', {
        players: numberFormatter.format(playerCount),
        mode: this.getPlayModeLabel(playMode, playerCount)
      });
    },
    getBrowseTypeLabel(type) {
      return t(`browse.typeLabel.${type}`);
    },
    getBrowseTypeFilterLabel(type) {
      return t(`browse.type.${type}`);
    },
    getCollectionGroupLabel(type) {
      return t(`collection.group.${type}`);
    },
    getToastVariantLabel(variant) {
      return t(`toast.variant.${variant}`);
    },
    localizeNotice(notice) {
      if (notice === 'Recovered invalid preference values during state hydration.') {
        return t('persistence.invalidPrefs');
      }
      return notice;
    },
    localizeValidationMessage(message) {
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
    formatGroupingModeLabel(modeId) {
      return titleCaseWords(this.getHistoryGroupingLabel(modeId));
    }
  };
}