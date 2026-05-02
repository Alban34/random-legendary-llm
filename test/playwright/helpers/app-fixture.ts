import { expect } from '@playwright/test';

export const STORAGE_KEY = 'legendary_state_v1';

export async function gotoApp(page) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__EPIC1) && Boolean(window.__APP_STATE__));
  await expect(page.locator('#app-title')).toBeVisible();
}

export async function reloadApp(page) {
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__EPIC1) && Boolean(window.__APP_STATE__));
}

export async function readAppState(page) {
  return page.evaluate((storageKey) => {
    const rawState = localStorage.getItem(storageKey);
    if (!rawState) {
      return JSON.parse(JSON.stringify(window.__APP_STATE__));
    }

    try {
      return JSON.parse(rawState);
    } catch {
      return null;
    }
  }, STORAGE_KEY);
}

export async function writeAppState(page, state) {
  await page.evaluate(([storageKey, nextState]) => {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  }, [STORAGE_KEY, state]);
}

export async function updateAppState(page, updater) {
  const current = await readAppState(page);
  const nextState = await updater(current);
  await writeAppState(page, nextState);
}

export async function selectTab(page, tabId) {
  const desktopTab = page.locator(`#tab-desktop-${tabId}`);
  if (await desktopTab.isVisible()) {
    await desktopTab.click();
    return;
  }
  await page.locator(`#tab-mobile-${tabId}`).click();
}

async function ensurePreferenceControlsVisible(page) {
  // With the new icon strip, preference controls are always visible.
  // No toggle action needed.
}

export async function selectTheme(page, themeId) {
  await ensurePreferenceControlsVisible(page);
  await page.locator(`[data-action="set-theme"][data-theme-id="${themeId}"]`).click();
}

export async function selectLocale(page, localeId) {
  await ensurePreferenceControlsVisible(page);
  await page.locator('#header-locale-select').selectOption(localeId);
}

export async function readDocumentTheme(page) {
  return page.evaluate(() => ({
    themeId: document.documentElement.dataset.theme,
    colorScheme: getComputedStyle(document.documentElement).colorScheme
  }));
}

export async function readDocumentLocale(page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title
  }));
}

export async function getRuntimeSnapshot(page) {
  return page.evaluate(() => ({
    sets: window.__EPIC1.source.sets,
    runtime: window.__EPIC1.runtime,
    counts: window.__EPIC1.counts
  }));
}

export async function setViewport(page, kind) {
  if (kind === 'mobile') {
    await page.setViewportSize({ width: 390, height: 844 });
    return;
  }
  await page.setViewportSize({ width: 1440, height: 1080 });
}

export async function seedAllOwnedState(page) {
  const setIds = await page.evaluate(() => window.__EPIC1.runtime.sets.map((set) => set.id));
  const state = await readAppState(page);
  state.collection.ownedSetIds = setIds;
  await writeAppState(page, state);
  await reloadApp(page);
}


