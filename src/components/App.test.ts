import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let htmlSource;
let tabNavSource;
let modalRootSource;
let appSvelteSource;
let viteConfigSource;

beforeAll(async () => {
  [htmlSource, tabNavSource, modalRootSource, appSvelteSource, viteConfigSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'TabNav.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'ModalRoot.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'vite.config.ts'), 'utf8')
  ]);
});

test('Ships semantic tab, toast, and modal markup', () => {

  assert.match(htmlSource, /role="tablist"/);
  assert.match(tabNavSource, /role="tab"/);
  assert.match(modalRootSource, /role="dialog"[\s\S]*?aria-modal="true"[\s\S]*?aria-labelledby="modal-title"[\s\S]*?aria-describedby="modal-description"/);
  assert.match(htmlSource, /aria-labelledby=\{"tab-desktop-" \+ tab\.id \+ " tab-mobile-" \+ tab\.id\}/);
});

test('Renderer exposes app-version element for version display in header', () => {

  assert.match(appSvelteSource, /app-version/, 'renderer must reference app-version (class or id)');
  assert.match(appSvelteSource, /APP_VERSION/, 'renderer must define or use APP_VERSION constant');
});

test('App.svelte uses injected __APP_VERSION__ global', () => {

  assert.match(
    appSvelteSource,
    /__APP_VERSION__/,
    'App.svelte must reference the injected __APP_VERSION__ global'
  );
});

test('App.svelte has /* global __APP_VERSION__ */ comment for linters', () => {

  assert.match(
    appSvelteSource,
    /\/\*\s*global\s+__APP_VERSION__\s*\*\//,
    'App.svelte must declare __APP_VERSION__ as a known global via a /* global */ comment'
  );
});

test('App.svelte does not contain a hardcoded APP_VERSION const', () => {

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

test('App-version element renders the injected global in App.svelte', () => {

  assert.match(
    appSvelteSource,
    /class="app-version"[^>]*>v\{__APP_VERSION__\}/,
    'app-version span must interpolate __APP_VERSION__'
  );
});

test('Vite.config.js imports package.json to read version', () => {

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

test('Vite.config.js exposes __APP_VERSION__ via define using pkg.version', () => {

  assert.match(viteConfigSource, /define/, 'vite config must contain a define block');
  assert.match(viteConfigSource, /__APP_VERSION__/, 'vite config must define __APP_VERSION__');
  assert.ok(
    viteConfigSource.includes('JSON.stringify(pkg.version)'),
    'vite config must set __APP_VERSION__ to JSON.stringify(pkg.version)'
  );
});

test('App.svelte contains an anchor pointing to the GitHub repository', () => {

  assert.match(
    appSvelteSource,
    /href="https:\/\/github\.com\/Alban34\/random-legendary-llm"/,
    'App.svelte must contain a link to the GitHub repository'
  );
});

test('GitHub anchor has rel="noopener noreferrer"', () => {

  assert.match(
    appSvelteSource,
    /rel="noopener noreferrer"/,
    'GitHub link must carry rel="noopener noreferrer"'
  );
});

test('GitHub anchor has an accessible aria-label', () => {

  assert.match(
    appSvelteSource,
    /aria-label="View source on GitHub"/,
    'GitHub link must have aria-label="View source on GitHub"'
  );
});

test('GitHub anchor opens in a new tab', () => {

  assert.match(
    appSvelteSource,
    /target="_blank"/,
    'GitHub link must have target="_blank"'
  );
});

test('GitHub link appears inside header-icon-strip in the loaded header', () => {

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

test('GitHub link is inside header-icon-strip, not in the loading-shell header', () => {

  const loadingShellStart = appSvelteSource.lastIndexOf('Loading shell');
  assert.ok(loadingShellStart > -1, 'Loading shell comment must be present');
  const loadingShellRegion = appSvelteSource.slice(loadingShellStart);
  assert.doesNotMatch(
    loadingShellRegion,
    /github-link/,
    'Loading-shell header must not contain the GitHub link'
  );
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

test('Vite.config.js uses the callback form of defineConfig', () => {

  assert.match(
    viteConfigSource,
    /defineConfig\s*\(\s*\(\s*\{[^}]*command[^}]*\}\s*\)/,
    'vite.config.js must use the callback form defineConfig(({ command }) => ...) to expose the command argument'
  );
});

test('Vite.config.js sets base conditionally based on command', () => {

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

// ── From epic36-version-storage-disclosure (App.svelte/vite.config.ts assertions) ─

test('Vite.config.js imports package.json to read version', () => {

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

test('Vite.config.js exposes __APP_VERSION__ via define using pkg.version', () => {

  assert.match(viteConfigSource, /define/, 'vite config must contain a define block');
  assert.match(viteConfigSource, /__APP_VERSION__/, 'vite config must define __APP_VERSION__');
  assert.ok(
    viteConfigSource.includes('JSON.stringify(pkg.version)'),
    'vite config must set __APP_VERSION__ to JSON.stringify(pkg.version)'
  );
});

test('App.svelte does not contain a hardcoded APP_VERSION const', () => {

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

test('App.svelte uses injected __APP_VERSION__ global', () => {

  assert.match(
    appSvelteSource,
    /__APP_VERSION__/,
    'App.svelte must reference the injected __APP_VERSION__ global'
  );
});

test('App.svelte has /* global __APP_VERSION__ */ comment for linters', () => {

  assert.match(
    appSvelteSource,
    /\/\*\s*global\s+__APP_VERSION__\s*\*\//,
    'App.svelte must declare __APP_VERSION__ as a known global via a /* global */ comment'
  );
});

test('App-version element renders the injected global in App.svelte', () => {

  assert.match(
    appSvelteSource,
    /class="app-version"[^>]*>v\{__APP_VERSION__\}/,
    'app-version span must interpolate __APP_VERSION__'
  );
});

test('App.svelte contains an anchor pointing to the GitHub repository', () => {

  assert.match(
    appSvelteSource,
    /href="https:\/\/github\.com\/Alban34\/random-legendary-llm"/,
    'App.svelte must contain a link to the GitHub repository'
  );
});

test('GitHub anchor has rel="noopener noreferrer"', () => {

  assert.match(
    appSvelteSource,
    /rel="noopener noreferrer"/,
    'GitHub link must carry rel="noopener noreferrer"'
  );
});

test('GitHub anchor has an accessible aria-label', () => {

  assert.match(
    appSvelteSource,
    /aria-label="View source on GitHub"/,
    'GitHub link must have aria-label="View source on GitHub"'
  );
});

test('GitHub anchor opens in a new tab', () => {

  assert.match(
    appSvelteSource,
    /target="_blank"/,
    'GitHub link must have target="_blank"'
  );
});
