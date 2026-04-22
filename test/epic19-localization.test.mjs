import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultState, createStorageAdapter, loadState, saveState } from '../src/app/state-store.ts';
import { DEFAULT_LOCALE_ID, createLocaleTools, getSelectableLocales, normalizeLocaleId } from '../src/app/localization-utils.ts';

function createMemoryStorage(initialEntries = {}) {
  const store = new Map(Object.entries(initialEntries));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

const minimalIndexes = {
  setsById: {},
  heroesById: {},
  mastermindsById: {},
  villainGroupsById: {},
  henchmanGroupsById: {},
  schemesById: {}
};

test('Epic 19 defaults locale preferences safely and persists supported locale selections', () => {
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

test('Epic 19 locale helpers expose the six production locales and translated UI copy', () => {
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