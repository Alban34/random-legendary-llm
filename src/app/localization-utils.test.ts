import { test } from 'vitest';
import assert from 'node:assert/strict';

import { createDefaultState, createStorageAdapter, loadState, saveState } from './state-store.ts';
import { DEFAULT_LOCALE_ID, createLocaleTools, getLocaleFlag, getSelectableLocales, normalizeLocaleId } from './localization-utils.ts';
import { createMemoryStorage, minimalIndexes } from './test-utils.ts';

test('Defaults locale preferences safely and persists supported locale selections', () => {

  const state = createDefaultState();
  assert.equal(state.preferences.localeId, DEFAULT_LOCALE_ID);
  assert.equal(normalizeLocaleId('fr-FR'), 'fr-FR');
  assert.equal(normalizeLocaleId('not-a-locale'), DEFAULT_LOCALE_ID);

  state.preferences.localeId = 'fr-FR';
  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

  const loaded = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(loaded.state.preferences.localeId, 'fr-FR');

  storage.setItem('legendary_state_v1', JSON.stringify({
    ...state,
    preferences: {
      ...state.preferences,
      localeId: 'xx-INVALID'
    }
  }));

  const recovered = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(recovered.state.preferences.localeId, DEFAULT_LOCALE_ID);
  assert.equal(recovered.notices.some((notice) => notice.includes('Recovered invalid preference values during state hydration.')), true);
});

test('Locale helpers expose the six production locales and translated UI copy', () => {

  assert.deepEqual(getSelectableLocales().map((locale) => locale.id), ['en-US', 'fr-FR', 'de-DE', 'ja-JP', 'ko-KR', 'es-ES']);

  const frenchLocale = createLocaleTools('fr-FR');
  assert.equal(frenchLocale.t('app.title'), 'Randomiseur Legendary: Marvel');
  assert.equal(frenchLocale.formatPlayerLabel(2), '2 joueurs');
  assert.equal(frenchLocale.t('onboarding.stepPrefix', { current: 1, total: 5 }), 'Étape 1 sur 5');
  assert.equal(frenchLocale.t('onboarding.step1.title'), "Parcourez d'abord tout le catalogue");
  assert.equal(frenchLocale.t('onboarding.step5.title'), 'Protégez votre collection avec Sauvegarde');

  const germanLocale = createLocaleTools('de-DE');
  assert.equal(germanLocale.t('browse.hero.manageCollection'), 'Sammlung verwalten');
  assert.equal(germanLocale.t('onboarding.titleEyebrow'), 'Erststart-Einführung');
  assert.equal(germanLocale.t('onboarding.stepPrefix', { current: 1, total: 5 }), 'Schritt 1 von 5');
  assert.equal(germanLocale.t('onboarding.step1.title'), 'Durchsuche zuerst den gesamten Katalog');
  assert.equal(germanLocale.t('onboarding.step5.title'), 'Schütze deine Sammlung mit Backup');

  const japaneseLocale = createLocaleTools('ja-JP');
  assert.equal(japaneseLocale.t('backup.title'), 'バックアップと復元');
  assert.equal(japaneseLocale.t('onboarding.titleEyebrow'), '初回起動ガイド');
  assert.equal(japaneseLocale.t('onboarding.stepPrefix', { current: 1, total: 5 }), 'ステップ 1 / 5');
  assert.equal(japaneseLocale.t('onboarding.step1.title'), 'まずは全カタログを確認');
  assert.equal(japaneseLocale.t('onboarding.step5.title'), 'バックアップでコレクションを守る');

  const koreanLocale = createLocaleTools('ko-KR');
  assert.equal(koreanLocale.t('collection.title'), '내 컬렉션');
  assert.equal(koreanLocale.t('onboarding.titleEyebrow'), '첫 실행 안내');
  assert.equal(koreanLocale.t('onboarding.stepPrefix', { current: 1, total: 5 }), '5단계 중 1단계');
  assert.equal(koreanLocale.t('onboarding.step1.title'), '먼저 전체 카탈로그 둘러보기');
  assert.equal(koreanLocale.t('onboarding.step5.title'), '백업으로 컬렉션 보호하기');

  const spanishLocale = createLocaleTools('es-ES');
  assert.equal(spanishLocale.t('newGame.acceptLog'), 'Aceptar y registrar');
  assert.equal(spanishLocale.t('onboarding.titleEyebrow'), 'Guía de primer uso');
  assert.equal(spanishLocale.t('onboarding.stepPrefix', { current: 1, total: 5 }), 'Paso 1 de 5');
  assert.equal(spanishLocale.t('onboarding.step1.title'), 'Explora primero el catálogo completo');
  assert.equal(spanishLocale.t('onboarding.step5.title'), 'Protege tu colección con Copia');
});

test('getLocaleFlag returns the correct flag emoji for each supported locale and a globe for unknown locales', () => {
  assert.equal(getLocaleFlag('en-US'), '🇺🇸');
  assert.equal(getLocaleFlag('fr-FR'), '🇫🇷');
  assert.equal(getLocaleFlag('de-DE'), '🇩🇪');
  assert.equal(getLocaleFlag('ja-JP'), '🇯🇵');
  assert.equal(getLocaleFlag('ko-KR'), '🇰🇷');
  assert.equal(getLocaleFlag('es-ES'), '🇪🇸');
  assert.equal(getLocaleFlag('xx-XX'), '🌐');
  assert.equal(getLocaleFlag(''), '🌐');
});

test('createLocaleTools formatNumber returns fallback for null, undefined, and empty string and formats valid numbers', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatNumber(null), '—');
  assert.equal(locale.formatNumber(undefined), '—');
  assert.equal(locale.formatNumber(''), '—');
  assert.equal(locale.formatNumber(null, 'N/A'), 'N/A');
  assert.equal(locale.formatNumber(42), '42');
  assert.equal(locale.formatNumber(0), '0');
});

test('createLocaleTools formatDate and formatDateTime return fallback for falsy values and format valid date strings', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatDate(null), '—');
  assert.equal(locale.formatDate(undefined), '—');
  assert.equal(locale.formatDate(false), '—');
  assert.equal(locale.formatDate(''), '—');
  assert.equal(locale.formatDate(null, 'n/a'), 'n/a');
  const formattedDate = locale.formatDate('2025-01-15T00:00:00.000Z');
  assert.ok(typeof formattedDate === 'string' && formattedDate.length > 0);

  assert.equal(locale.formatDateTime(null), '—');
  assert.equal(locale.formatDateTime(false), '—');
  const formattedDt = locale.formatDateTime('2025-01-15T12:00:00.000Z');
  assert.ok(typeof formattedDt === 'string' && formattedDt.length > 0);
});

test('createLocaleTools formatList returns fallback for empty array and formats non-empty arrays', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatList([]), '');
  assert.equal(locale.formatList([], 'none'), 'none');
  const formatted = locale.formatList(['Alpha', 'Beta']);
  assert.ok(formatted.includes('Alpha') && formatted.includes('Beta'));
});

test('createLocaleTools formatPlayerLabel returns singular form for count 1', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatPlayerLabel(1), '1 Player');
});

test('createLocaleTools formatGameCount returns singular and plural forms', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatGameCount(1), '1 game');
  assert.equal(locale.formatGameCount(3), '3 games');
});

test('createLocaleTools formatPlayCount returns singular and plural forms', () => {
  const locale = createLocaleTools('en-US');
  assert.ok(locale.formatPlayCount(1).includes('play'));
  assert.ok(locale.formatPlayCount(5).includes('plays'));
});

test('createLocaleTools formatEntityCount returns singular and plural noun forms', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatEntityCount(1, 'common.hero', 'common.heroesLower'), '1 hero');
  assert.equal(locale.formatEntityCount(3, 'common.hero', 'common.heroesLower'), '3 heroes');
  assert.ok(locale.formatEntityCount(2, 'common.game').length > 0);
});

test('createLocaleTools tab and theme label helpers return translated strings', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.getTabLabel('browse'), 'Browse');
  assert.equal(locale.getTabShortLabel('history'), 'History');
  assert.equal(locale.getTabDescription('new-game'), 'Generate, regenerate, and accept setups.');
  assert.equal(locale.getThemeLabel('dark'), 'Dark');
  assert.equal(locale.getThemeDescription('light'), 'Warm light briefing paper styling.');
});

test('createLocaleTools grouping, usage, and outcome label helpers return translated strings', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.getHistoryGroupingLabel('mastermind'), 'Mastermind');
  assert.equal(locale.getUsageLabel('heroes'), 'Heroes');
  assert.equal(locale.getOutcomeLabel('win'), 'Win');
  assert.equal(locale.getOutcomeLabel('loss'), 'Loss');
});

test('createLocaleTools formatResultStatus covers all outcome branches', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatResultStatus({ status: 'pending' }), 'Pending result');
  assert.equal(locale.formatResultStatus(null), 'Pending result');
  assert.equal(locale.formatResultStatus({ status: 'completed', outcome: 'win', score: null }), 'Win');
  const withScore = locale.formatResultStatus({ status: 'completed', outcome: 'win', score: 100 });
  assert.ok(withScore.includes('Win') && withScore.includes('100'));
});

test('createLocaleTools getPlayModeLabel returned method covers all mode branches', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.getPlayModeLabel('advanced-solo'), 'Advanced Solo');
  assert.equal(locale.getPlayModeLabel('two-handed-solo'), 'Two-Handed Solo');
  assert.equal(locale.getPlayModeLabel('standard-solo-v2'), 'Standard Solo v2');
  assert.equal(locale.getPlayModeLabel('standard', 1), 'Standard Solo v1');
  assert.equal(locale.getPlayModeLabel('standard', 2), 'Standard');
});

test('createLocaleTools getPlayModeDescription covers all mode branches', () => {
  const locale = createLocaleTools('en-US');
  assert.ok(locale.getPlayModeDescription('advanced-solo').length > 0);
  assert.ok(locale.getPlayModeDescription('two-handed-solo').length > 0);
  assert.ok(locale.getPlayModeDescription('standard-solo-v2').length > 0);
  assert.ok(locale.getPlayModeDescription('standard', 1).length > 0);
  assert.ok(locale.getPlayModeDescription('standard', 2).length > 0);
});

test('createLocaleTools getPlayModeHelpText covers multiplayer-disabled, two-handed, and choose-solo branches', () => {
  const locale = createLocaleTools('en-US');
  assert.ok(locale.getPlayModeHelpText(2, 'standard').includes('disabled'));
  assert.ok(locale.getPlayModeHelpText(1, 'two-handed-solo').length > 0);
  assert.ok(locale.getPlayModeHelpText(1, 'standard').length > 0);
});

test('createLocaleTools browse, collection, toast, and format helpers return translated strings', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.getBrowseTypeLabel('base'), 'Base Game');
  assert.equal(locale.getBrowseTypeFilterLabel('all'), 'All');
  assert.equal(locale.getBrowseSortLabel('name'), 'Name');
  assert.equal(locale.getCollectionGroupLabel('base'), 'Base');
  assert.equal(locale.getToastVariantLabel('success'), 'Success');
  assert.ok(typeof locale.formatPersistedPlayMode(2, 'standard') === 'string');
});

test('createLocaleTools localizeNotice translates the known hydration notice and passes through unknown notices', () => {
  const locale = createLocaleTools('en-US');
  const known = locale.localizeNotice('Recovered invalid preference values during state hydration.');
  assert.ok(typeof known === 'string' && known.length > 0);
  assert.equal(locale.localizeNotice('Some other notice'), 'Some other notice');
});

test('createLocaleTools localizeValidationMessage translates all three known messages and passes through unknown messages', () => {
  const locale = createLocaleTools('en-US');
  assert.ok(locale.localizeValidationMessage('Choose Win or Loss before saving the result.').length > 0);
  assert.ok(locale.localizeValidationMessage('Enter a score before saving the result.').length > 0);
  assert.ok(locale.localizeValidationMessage('Score must be a whole number that is 0 or greater.').length > 0);
  assert.equal(locale.localizeValidationMessage('Custom message'), 'Custom message');
});

test('createLocaleTools formatGroupingModeLabel title-cases the grouping label', () => {
  const locale = createLocaleTools('en-US');
  assert.equal(locale.formatGroupingModeLabel('mastermind'), 'Mastermind');
  assert.ok(locale.formatGroupingModeLabel('play-mode').length > 0);
});

test('interpolate substitutes empty string for missing template params', () => {
  const locale = createLocaleTools('en-US');
  // 'common.alwaysLeads' = 'Always leads: {name}' — call without the param
  assert.equal(locale.t('common.alwaysLeads', {}), 'Always leads: ');
});