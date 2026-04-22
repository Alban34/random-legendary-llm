import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let appSvelteSource;
let viteConfigSource;
let localizationSource;
let backupTabSource;
let pkgJson;

before(async () => {
  [appSvelteSource, viteConfigSource, localizationSource, backupTabSource, pkgJson] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'vite.config.js'), 'utf8'),
    Promise.all([
      fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8'),
      fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'fr.ts'), 'utf8')
    ]).then(([en, fr]) => en + '\n' + fr),
    fs.readFile(path.join(rootDir, 'src', 'components', 'BackupTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'package.json'), 'utf8').then(JSON.parse),
  ]);
});

// ── Story 36.1 — Version from package.json ─────────────────────────────────

test('Story 36.1: vite.config.js imports package.json to read version', () => {
  assert.match(
    viteConfigSource,
    /package\.json/,
    'vite.config.js must reference package.json'
  );
  assert.match(
    viteConfigSource,
    /createRequire|import.*package\.json/,
    'vite.config.js must load package.json via createRequire or a JSON import'
  );
});

test('Story 36.1: vite.config.js exposes __APP_VERSION__ via define using pkg.version', () => {
  assert.match(viteConfigSource, /define/, 'vite config must contain a define block');
  assert.match(viteConfigSource, /__APP_VERSION__/, 'vite config must define __APP_VERSION__');
  assert.ok(
    viteConfigSource.includes('JSON.stringify(pkg.version)'),
    'vite config must set __APP_VERSION__ to JSON.stringify(pkg.version)'
  );
});

test('Story 36.1: package.json has a version field', () => {
  assert.ok(pkgJson.version, 'package.json must have a non-empty version field');
});

test('Story 36.1: App.svelte does not contain a hardcoded APP_VERSION const', () => {
  assert.doesNotMatch(
    appSvelteSource,
    /const APP_VERSION\s*=/,
    'App.svelte must not declare a hardcoded APP_VERSION constant'
  );
  assert.doesNotMatch(
    appSvelteSource,
    /'1\.0\.\d+'|"1\.0\.\d+"/,
    'App.svelte must not contain a hardcoded version string literal'
  );
});

test('Story 36.1: App.svelte uses injected __APP_VERSION__ global', () => {
  assert.match(
    appSvelteSource,
    /__APP_VERSION__/,
    'App.svelte must reference the injected __APP_VERSION__ global'
  );
});

test('Story 36.1: App.svelte has /* global __APP_VERSION__ */ comment for linters', () => {
  assert.match(
    appSvelteSource,
    /\/\*\s*global\s+__APP_VERSION__\s*\*\//,
    'App.svelte must declare __APP_VERSION__ as a known global via a /* global */ comment'
  );
});

test('Story 36.1: app-version element renders the injected global in App.svelte', () => {
  assert.match(
    appSvelteSource,
    /class="app-version"[^>]*>v\{__APP_VERSION__\}/,
    'app-version span must interpolate __APP_VERSION__'
  );
});

// ── Story 36.2 — localStorage disclosure ───────────────────────────────────

test('Story 36.2: EN_MESSAGES contains storage.disclosureTitle', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  assert.match(enBlock, /storage\.disclosureTitle/, 'EN_MESSAGES must have storage.disclosureTitle');
});

test('Story 36.2: EN_MESSAGES contains storage.disclosureBody', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  assert.match(enBlock, /storage\.disclosureBody/, 'EN_MESSAGES must have storage.disclosureBody');
});

test('Story 36.2: FR_MESSAGES contains storage.disclosureTitle and storage.disclosureBody', () => {
  const frStart = localizationSource.indexOf('const FR_MESSAGES');
  const frEnd = localizationSource.indexOf('\nconst ', frStart + 10);
  const frBlock = localizationSource.slice(frStart, frEnd > -1 ? frEnd : undefined);
  assert.match(frBlock, /storage\.disclosureTitle/, 'FR_MESSAGES must have storage.disclosureTitle');
  assert.match(frBlock, /storage\.disclosureBody/, 'FR_MESSAGES must have storage.disclosureBody');
});

test('Story 36.2: EN disclosure body mentions localStorage', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
  assert.ok(keyIdx > -1, 'EN_MESSAGES must have storage.disclosureBody key');
  const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400);
  assert.match(bodyCtx, /localStorage/i, 'EN disclosure must mention localStorage');
});

test('Story 36.2: EN disclosure body mentions collection ownership', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
  const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400).toLowerCase();
  assert.ok(bodyCtx.includes('collection'), 'EN disclosure must mention collection ownership');
});

test('Story 36.2: EN disclosure body mentions game history', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
  const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400).toLowerCase();
  assert.ok(bodyCtx.includes('history'), 'EN disclosure must mention game history');
});

test('Story 36.2: EN disclosure body mentions user preferences', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
  const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400).toLowerCase();
  assert.ok(bodyCtx.includes('preference'), 'EN disclosure must mention user preferences');
});

test('Story 36.2: EN disclosure body confirms data is never transmitted', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
  const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400).toLowerCase();
  assert.ok(
    bodyCtx.includes('never transmitted') || bodyCtx.includes('never sent'),
    'EN disclosure must state data is never transmitted'
  );
});

test('Story 36.2: EN disclosure does not mention cookies', () => {
  const enStart = localizationSource.indexOf('const EN_MESSAGES');
  const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
  const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
  const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
  const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400);
  assert.doesNotMatch(bodyCtx, /cookie/i, 'EN disclosure must not mention cookie or cookies');
});

test('Story 36.2: FR disclosure does not mention cookies', () => {
  const frStart = localizationSource.indexOf('const FR_MESSAGES');
  const frEnd = localizationSource.indexOf('\nconst ', frStart + 10);
  const frBlock = localizationSource.slice(frStart, frEnd > -1 ? frEnd : undefined);
  const keyIdx = frBlock.indexOf("'storage.disclosureBody'");
  assert.ok(keyIdx > -1, 'FR_MESSAGES must have storage.disclosureBody key');
  const bodyCtx = frBlock.slice(keyIdx, keyIdx + 500);
  assert.doesNotMatch(bodyCtx, /cookie/i, 'FR disclosure must not mention cookie or cookies');
});

test('Story 36.2: FR disclosure mentions localStorage', () => {
  const frStart = localizationSource.indexOf('const FR_MESSAGES');
  const frEnd = localizationSource.indexOf('\nconst ', frStart + 10);
  const frBlock = localizationSource.slice(frStart, frEnd > -1 ? frEnd : undefined);
  const keyIdx = frBlock.indexOf("'storage.disclosureBody'");
  const bodyCtx = frBlock.slice(keyIdx, keyIdx + 500);
  assert.match(bodyCtx, /localStorage/i, 'FR disclosure must mention localStorage');
});

test('Story 36.2: BackupTab renders storage disclosure element', () => {
  assert.match(
    backupTabSource,
    /data-storage-disclosure/,
    'BackupTab must render an element with data-storage-disclosure attribute'
  );
});

test('Story 36.2: BackupTab references both disclosure locale keys', () => {
  assert.match(
    backupTabSource,
    /storage\.disclosureTitle/,
    'BackupTab must reference storage.disclosureTitle locale key'
  );
  assert.match(
    backupTabSource,
    /storage\.disclosureBody/,
    'BackupTab must reference storage.disclosureBody locale key'
  );
});

// ── Story 36.3 — GitHub repository link in the header ──────────────────────

test('Story 36.3: App.svelte contains an anchor pointing to the GitHub repository', () => {
  assert.match(
    appSvelteSource,
    /href="https:\/\/github\.com\/Alban34\/random-legendary-llm"/,
    'App.svelte must contain a link to the GitHub repository'
  );
});

test('Story 36.3: GitHub anchor has rel="noopener noreferrer"', () => {
  assert.match(
    appSvelteSource,
    /rel="noopener noreferrer"/,
    'GitHub link must carry rel="noopener noreferrer"'
  );
});

test('Story 36.3: GitHub anchor has an accessible aria-label', () => {
  assert.match(
    appSvelteSource,
    /aria-label="View source on GitHub"/,
    'GitHub link must have aria-label="View source on GitHub"'
  );
});

test('Story 36.3: GitHub anchor opens in a new tab', () => {
  assert.match(
    appSvelteSource,
    /target="_blank"/,
    'GitHub link must have target="_blank"'
  );
});

test('Story 36.3: GitHub link appears inside header-icon-strip in the loaded header', () => {
  // The loaded header (isLoaded branch) must have the github-link anchor inside header-icon-strip
  const loadedHeaderRegion = appSvelteSource.slice(
    appSvelteSource.indexOf('isLoaded}'),
    appSvelteSource.indexOf('{:else}', appSvelteSource.indexOf('isLoaded}'))
  );
  assert.match(
    loadedHeaderRegion,
    /class="header-icon-strip"[\s\S]*?github-link/,
    'Loaded header must have the GitHub link inside header-icon-strip'
  );
});

test('Story 36.3: GitHub link is inside header-icon-strip, not in the loading-shell header', () => {
  // The loading shell is the {:else} branch at the end of the template — it should NOT have a github-link
  const loadingShellStart = appSvelteSource.lastIndexOf('Loading shell');
  assert.ok(loadingShellStart > -1, 'Loading shell comment must be present');
  const loadingShellRegion = appSvelteSource.slice(loadingShellStart);
  assert.doesNotMatch(
    loadingShellRegion,
    /github-link/,
    'Loading-shell header must not contain the GitHub link'
  );
  // The github-link must be inside header-icon-strip in the loaded-state header
  const loadedHeaderRegion = appSvelteSource.slice(
    appSvelteSource.indexOf('isLoaded}'),
    appSvelteSource.indexOf('{:else}', appSvelteSource.indexOf('isLoaded}'))
  );
  assert.match(
    loadedHeaderRegion,
    /class="header-icon-strip"[\s\S]*?github-link/,
    'Loaded header must have the GitHub link inside header-icon-strip'
  );
});

// ── Story 36.4 — Fix Vite base path for local dev vs. GitHub Pages ──────────

test('Story 36.4: vite.config.js uses the callback form of defineConfig', () => {
  assert.match(
    viteConfigSource,
    /defineConfig\s*\(\s*\(\s*\{[^}]*command[^}]*\}\s*\)/,
    'vite.config.js must use the callback form defineConfig(({ command }) => ...) to expose the command argument'
  );
});

test('Story 36.4: vite.config.js sets base conditionally based on command', () => {
  assert.match(
    viteConfigSource,
    /command\s*===\s*['"]build['"]/,
    "vite.config.js must branch on command === 'build' to apply the production base path"
  );
  assert.match(
    viteConfigSource,
    /\/random-legendary-llm\//,
    "vite.config.js must still reference the '/random-legendary-llm/' production base path"
  );
});
;
