import type { MessageKey } from './locales/en.ts';
import type { LocaleId } from './types-app-state.ts';

// =============================================================================
// Section 7: Localization
// =============================================================================

export type LocaleTools = {
  localeId: LocaleId;
  documentLang: string;
  localeLabel: string;
  t(key: MessageKey, params?: Record<string, unknown>): string;
  formatNumber(value: number | null | undefined | '', fallback?: string): string;
  formatDate(value: string | null | undefined | false, fallback?: string): string;
  formatDateTime(value: string | null | undefined | false, fallback?: string): string;
  formatList(values: string[], fallback?: string): string;
  formatPlayerLabel(count: number): string;
  formatGameCount(count: number): string;
  formatPlayCount(count: number): string;
  formatEntityCount(count: number, singularKey: MessageKey, pluralKey?: MessageKey): string;
  formatResultStatus(result: unknown): string;
  formatPersistedPlayMode(playerCount: number, playMode: string): string;
  formatGroupingModeLabel(modeId: string): string;
  getTabLabel(tabId: string): string;
  getTabShortLabel(tabId: string): string;
  getTabDescription(tabId: string): string;
  getThemeLabel(themeId: string): string;
  getThemeDescription(themeId: string): string;
  getHistoryGroupingLabel(modeId: string): string;
  getUsageLabel(category: string): string;
  getOutcomeLabel(outcomeId: string): string;
  getPlayModeLabel(playMode: string, playerCount?: number): string;
  getPlayModeDescription(playMode: string, playerCount?: number): string;
  getPlayModeHelpText(playerCount: number, playMode: string): string;
  getBrowseTypeLabel(type: string): string;
  getBrowseTypeFilterLabel(type: string): string;
  getBrowseSortLabel(sortKey: string): string;
  getCollectionGroupLabel(type: string): string;
  getToastVariantLabel(variant: string): string;
  localizeNotice(notice: string): string;
  localizeValidationMessage(message: string): string;
  [key: string]: unknown;
};
