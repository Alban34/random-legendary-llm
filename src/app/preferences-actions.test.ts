import { test, beforeAll, vi } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toast } from 'svelte-sonner';
import { getAdjacentTabId } from './app-tabs.ts';
import { createPreferencesActions } from './preferences-actions.ts';
import { createDefaultState } from './state-store.ts';
import { createLocaleTools } from './localization-utils.ts';
import type { AppState } from './types.ts';

vi.mock('svelte-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('./app-tabs.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./app-tabs.ts')>();
  return { ...actual, getAdjacentTabId: vi.fn(actual.getAdjacentTabId) };
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let preferencesActionsSource;

beforeAll(async () => {
  preferencesActionsSource = await fs.readFile(path.join(rootDir, 'src', 'app', 'preferences-actions.ts'), 'utf8');
});

// Story 24.2 — theme action must not call toast.*
test('setTheme action does not trigger a toast', () => {
  const setThemeMatch = preferencesActionsSource.match(/setTheme\(themeId[^)]*\)[\s\S]*?focusSelector\(`\[data-action="set-theme"\]/);
  assert.ok(setThemeMatch, 'setTheme handler must be present in preferences-actions.ts');
  assert.doesNotMatch(setThemeMatch[0], /toast\./, 'setTheme must not call toast.* (Story 24.2)');
});

// Story 24.2 — locale action still triggers a toast
test('setLocale action still triggers a toast', () => {
  assert.match(preferencesActionsSource, /setLocale[\s\S]*?toast\./, 'setLocale must still emit a toast');
});

// ── From design-system-rollout (preferences-actions assertions) ─────────────

test('focusSelector is defined in focus-utils.ts', () => {

  assert.match(preferencesActionsSource, /focusSelector\(`\[data-action="set-theme"\]\[data-theme-id="\$\{normalizedThemeId\}"\]`\)/);
  assert.match(preferencesActionsSource, /focusSelector\('#header-locale-select'\)/);
  assert.match(preferencesActionsSource, /focusSelector[\s\S]*?\[data-action="select-tab"\]\[data-tab-id="\$\{normalizeSelectedTab\(tabId\)\}"\]\[aria-selected="true"\]/);
});

// ── Runtime unit tests ──────────────────────────────────────────────────────

function makeMockDeps(overrides: Partial<{
  getLocale: () => ReturnType<typeof createLocaleTools>;
  getAppState: () => AppState;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => void;
  focusSelector: (sel: string) => void;
  ui: {
    lastActionNotice: string | null;
    selectedTab: string;
    aboutPanelOpen: boolean;
    onboardingVisible: boolean;
    onboardingStep: number;
  };
}> = {}) {
  const state = createDefaultState();
  const ui = {
    lastActionNotice: null as string | null,
    selectedTab: 'browse',
    aboutPanelOpen: false,
    onboardingVisible: false,
    onboardingStep: 0
  };
  return {
    getLocale: () => createLocaleTools('en-US'),
    getAppState: () => state,
    applyStateUpdate: (updater: (s: AppState) => AppState) => {
      Object.assign(state, updater(state));
    },
    focusSelector: () => {},
    ui,
    ...overrides
  };
}

test('setTheme with a different theme ID updates state and calls focusSelector', () => {
  const focusCalls: string[] = [];
  const deps = makeMockDeps({ focusSelector: (sel) => { focusCalls.push(sel); } });
  const actions = createPreferencesActions(deps);

  actions.setTheme('light');

  assert.equal(deps.getAppState().preferences.themeId, 'light');
  assert.equal(focusCalls.length, 1);
  assert.match(focusCalls[0], /data-theme-id="light"/);
});

test('setTheme with the same theme ID does not call applyStateUpdate', () => {
  let updateCount = 0;
  const deps = makeMockDeps({
    applyStateUpdate: () => { updateCount++; }
  });
  const actions = createPreferencesActions(deps);

  actions.setTheme('dark'); // 'dark' is the default

  assert.equal(updateCount, 0, 'applyStateUpdate must not be called when theme is unchanged');
});

test('selectTab updates ui.selectedTab and persists to state', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.selectTab('new-game');

  assert.equal(deps.ui.selectedTab, 'new-game');
  assert.equal(deps.getAppState().preferences.selectedTab, 'new-game');
});

test('handleTabKeydown ArrowRight advances to next tab', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('browse', 'ArrowRight');

  assert.equal(deps.ui.selectedTab, 'collection');
});

test('handleTabKeydown ArrowLeft wraps to last tab when on first tab', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('browse', 'ArrowLeft');

  assert.equal(deps.ui.selectedTab, 'backup');
});

test('handleTabKeydown Home selects first tab regardless of current position', () => {
  const deps = makeMockDeps();
  deps.ui.selectedTab = 'history';
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('history', 'Home');

  assert.equal(deps.ui.selectedTab, 'browse');
});

test('handleTabKeydown End selects last tab', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('browse', 'End');

  assert.equal(deps.ui.selectedTab, 'backup');
});

test('toggleAboutPanel flips aboutPanelOpen on each call', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  assert.equal(deps.ui.aboutPanelOpen, false);
  actions.toggleAboutPanel();
  assert.equal(deps.ui.aboutPanelOpen, true);
  actions.toggleAboutPanel();
  assert.equal(deps.ui.aboutPanelOpen, false);
});

test('previousOnboardingStep clamps at 0', () => {
  const deps = makeMockDeps();
  deps.ui.onboardingStep = 0;
  const actions = createPreferencesActions(deps);

  actions.previousOnboardingStep();

  assert.equal(deps.ui.onboardingStep, 0);
});

test('nextOnboardingStep clamps at 4', () => {
  const deps = makeMockDeps();
  deps.ui.onboardingStep = 4;
  const actions = createPreferencesActions(deps);

  actions.nextOnboardingStep();

  assert.equal(deps.ui.onboardingStep, 4);
});

test('setLocale with a different locale updates state and calls toast.success', () => {
  vi.mocked(toast.success).mockClear();
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.setLocale('fr-FR');

  assert.equal(deps.getAppState().preferences.localeId, 'fr-FR');
  assert.equal(vi.mocked(toast.success).mock.calls.length, 1);
});

test('setLocale with the same locale does not call applyStateUpdate', () => {
  let updateCount = 0;
  const deps = makeMockDeps({
    applyStateUpdate: () => { updateCount++; }
  });
  const actions = createPreferencesActions(deps);

  actions.setLocale('en-US'); // 'en-US' is the default

  assert.equal(updateCount, 0, 'applyStateUpdate must not be called when locale is unchanged');
});

test('startOnboarding when on a non-browse tab switches to browse', () => {
  const deps = makeMockDeps();
  deps.ui.selectedTab = 'history';
  const actions = createPreferencesActions(deps);

  actions.startOnboarding();

  assert.equal(deps.ui.onboardingVisible, true);
  assert.equal(deps.ui.onboardingStep, 0);
  assert.equal(deps.ui.aboutPanelOpen, false);
  assert.equal(deps.ui.selectedTab, 'browse');
});

test('startOnboarding when already on browse tab does not call applyStateUpdate', () => {
  let updateCount = 0;
  const deps = makeMockDeps({
    applyStateUpdate: () => { updateCount++; }
  });
  deps.ui.selectedTab = 'browse';
  const actions = createPreferencesActions(deps);

  actions.startOnboarding();

  assert.equal(deps.ui.onboardingVisible, true);
  assert.equal(deps.ui.selectedTab, 'browse');
  assert.equal(updateCount, 0, 'no tab persistence when already on browse');
});

test('openOnboardingTab persists the given tab to state', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.openOnboardingTab('history');

  assert.equal(deps.ui.selectedTab, 'history');
  assert.equal(deps.getAppState().preferences.selectedTab, 'history');
});

test('skipOnboarding resets onboarding state and marks onboardingCompleted', () => {
  const deps = makeMockDeps();
  deps.ui.onboardingVisible = true;
  deps.ui.onboardingStep = 3;
  const actions = createPreferencesActions(deps);

  actions.skipOnboarding();

  assert.equal(deps.ui.onboardingVisible, false);
  assert.equal(deps.ui.onboardingStep, 0);
  assert.equal(deps.getAppState().preferences.onboardingCompleted, true);
});

test('completeOnboarding resets onboarding state and marks onboardingCompleted', () => {
  const deps = makeMockDeps();
  deps.ui.onboardingVisible = true;
  deps.ui.onboardingStep = 4;
  const actions = createPreferencesActions(deps);

  actions.completeOnboarding();

  assert.equal(deps.ui.onboardingVisible, false);
  assert.equal(deps.ui.onboardingStep, 0);
  assert.equal(deps.getAppState().preferences.onboardingCompleted, true);
});

test('handleTabKeydown ArrowDown advances to next tab', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('browse', 'ArrowDown');

  assert.equal(deps.ui.selectedTab, 'collection');
});

test('handleTabKeydown ArrowUp moves to previous tab', () => {
  const deps = makeMockDeps();
  deps.ui.selectedTab = 'collection';
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('collection', 'ArrowUp');

  assert.equal(deps.ui.selectedTab, 'browse');
});

test('handleTabKeydown ignores an unrecognized key', () => {
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('browse', 'Space');

  assert.equal(deps.ui.selectedTab, 'browse');
});

test('handleTabKeydown ArrowRight falls back to DEFAULT_TAB_ID when getAdjacentTabId returns null', () => {
  vi.mocked(getAdjacentTabId).mockReturnValueOnce(null);
  const deps = makeMockDeps();
  const actions = createPreferencesActions(deps);

  actions.handleTabKeydown('browse', 'ArrowRight');

  assert.equal(deps.ui.selectedTab, 'browse'); // DEFAULT_TAB_ID fallback
});

