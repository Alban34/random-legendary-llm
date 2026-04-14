import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let browserEntry;
let appShellCss;
let feedbackUtils;
let appRenderer;
let toastStackSource;

before(async () => {
  [browserEntry, appShellCss, feedbackUtils, appRenderer, toastStackSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'feedback-utils.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'ToastStack.svelte'), 'utf8')
  ]);
});

// Story 24.2 — theme action must not call enqueueToast
test('Story 24.2: setTheme action does not call enqueueToast', () => {
  // Isolate the setTheme handler block and confirm enqueueToast is absent
  const setThemeMatch = browserEntry.match(/setTheme\(themeId\)[\s\S]*?focusSelector\(`\[data-action="set-theme"\]/);
  assert.ok(setThemeMatch, 'setTheme handler must be present in App.svelte');
  assert.doesNotMatch(setThemeMatch[0], /enqueueToast/, 'setTheme must not call enqueueToast (Story 24.2)');
});

// Story 24.2 — locale action still uses enqueueToast (unchanged)
test('Story 24.2: setLocale action still calls enqueueToast', () => {
  assert.match(browserEntry, /setLocale[\s\S]*?enqueueToast/, 'setLocale must still emit a toast');
});

// Story 24.3 — toast region is bottom-anchored
test('Story 24.3: #toast-region uses bottom positioning on mobile', () => {
  assert.match(appShellCss, /#toast-region\s*\{[^}]*bottom\s*:[^}]*env\(safe-area-inset-bottom\)/, '#toast-region must use bottom with safe-area-inset-bottom offset');
});

test('Story 24.3: #toast-region does not use top positioning in the base declaration', () => {
  // The base (mobile) declaration must not have a top property; the top property was removed
  const baseRegion = appShellCss.match(/#toast-region\s*\{([^}]*)\}/);
  assert.ok(baseRegion, '#toast-region block must exist');
  assert.doesNotMatch(baseRegion[1], /\btop\s*:/, 'Base #toast-region must not set a top value (Story 24.3)');
});

// Story 24.3 — toast-enter keyframe exists
test('Story 24.3: @keyframes toast-enter is defined', () => {
  assert.match(appShellCss, /@keyframes\s+toast-enter/, '@keyframes toast-enter must be defined in app-shell.css');
});

test('Story 24.3: toast-enter keyframe starts from translateY(120%)', () => {
  assert.match(appShellCss, /toast-enter[\s\S]*?translateY\(120%\)/, 'toast-enter must start from translateY(120%) so toasts enter from below the viewport');
});

// Story 24.3 — enter animation is applied to .toast
test('Story 24.3: .toast receives the toast-enter animation', () => {
  assert.match(appShellCss, /\.toast\s*\{[^}]*animation\s*:[^}]*toast-enter/, '.toast must have animation: toast-enter applied');
});

// Story 24.4 — prefers-reduced-motion wraps the animation
test('Story 24.4: toast-enter animation is wrapped in prefers-reduced-motion: no-preference', () => {
  assert.match(
    appShellCss,
    /@media\s*\(prefers-reduced-motion:\s*no-preference\)[\s\S]*?\.toast[\s\S]*?toast-enter/,
    'The toast-enter animation must be inside a prefers-reduced-motion: no-preference media query'
  );
});

// Story 24.4 — feedback-utils.mjs persistent behavior is unchanged
test('Story 24.4: feedback-utils persistent toast behavior is unchanged', () => {
  assert.match(feedbackUtils, /persistent\s*:\s*\{[\s\S]*?autoDismissMs\s*:\s*null/, 'persistent toast must have autoDismissMs: null in feedback-utils.mjs');
  assert.match(feedbackUtils, /isPersistent\s*:\s*true/, 'persistent toast must have isPersistent: true');
  assert.match(feedbackUtils, /dismissible\s*:\s*true/, 'persistent toast must remain dismissible');
});

// Story 24.4 — toast HTML preserves role and aria-live
test('Story 24.4: toast HTML preserves role="status" or role="alert" and aria-live', () => {
  assert.match(toastStackSource, /role=\{toast\.live === 'assertive' \? 'alert' : 'status'\}/, 'toast must have conditional role attribute');
  assert.match(toastStackSource, /aria-live=\{toast\.live\}/, 'toast must have aria-live attribute');
});

