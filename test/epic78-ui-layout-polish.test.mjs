import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let historyTabSource;
let newGameTabSource;
let browseTabSource;
let collectionTabSource;
let cssSource;
let enLocaleSource;

beforeAll(async () => {
  [historyTabSource, newGameTabSource, browseTabSource, collectionTabSource, cssSource, enLocaleSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'HistoryTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'NewGameTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'BrowseTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8')
  ]);
});

// Story 1 — History grouping pill row is horizontally scrollable

test('History grouping controls contains button-row-scroll class', () => {
  assert.match(
    historyTabSource,
    /data-history-grouping-controls[\s\S]{0,200}button-row-scroll/,
    '[data-history-grouping-controls] must contain an element with class button-row-scroll'
  );
});

test('History grouping pill row does NOT have the wrap class', () => {
  // The grouping mode row must not have wrap (only the outcome filter row may)
  const groupingSection = historyTabSource.match(/data-history-grouping-controls[\s\S]*?data-outcome-filter-row/);
  assert.ok(groupingSection, 'data-history-grouping-controls section must exist');
  assert.doesNotMatch(
    groupingSection[0].split('data-outcome-filter-row')[0],
    /class="button-row wrap"/,
    'The grouping-mode button row must not have the wrap class'
  );
});

test('History grouping pill row has role="group"', () => {
  assert.match(
    historyTabSource,
    /class="button-row button-row-scroll"\s+role="group"/,
    'grouping pill row must have role="group"'
  );
});

test('CSS contains .button-row-scroll with flex-wrap: nowrap', () => {
  assert.match(cssSource, /\.button-row-scroll\s*\{/, 'CSS must have .button-row-scroll rule');
  assert.match(cssSource, /\.button-row-scroll[^}]*flex-wrap:\s*nowrap/, '.button-row-scroll must set flex-wrap: nowrap');
  assert.match(cssSource, /\.button-row-scroll[^}]*overflow-x:\s*auto/, '.button-row-scroll must set overflow-x: auto');
});

test('CSS contains .button-row-scroll > * with flex-shrink: 0', () => {
  assert.match(cssSource, /\.button-row-scroll\s*>\s*\*\s*\{[^}]*flex-shrink:\s*0/, '.button-row-scroll > * must set flex-shrink: 0');
});

// Story 2 — New Game status summary collapsed to single element

test('NewGameTab contains [data-new-game-status-summary]', () => {
  assert.match(newGameTabSource, /data-new-game-status-summary/, 'NewGameTab must contain data-new-game-status-summary');
});

test('NewGameTab does NOT contain old summary-grid with three separate status cards', () => {
  // The old pattern was: summary-grid containing three summary-cards for selectedMode/ownedSets/lastPersistedMode
  assert.doesNotMatch(
    newGameTabSource,
    /<div class="summary-grid">[\s\S]{0,600}newGame\.selectedMode[\s\S]{0,600}newGame\.ownedSets[\s\S]{0,600}newGame\.lastPersistedMode[\s\S]{0,200}<\/div>\s*<\/div>/,
    'Old summary-grid with three separate status cards must not exist'
  );
});

test('NewGameTab contains all three data-status-field spans', () => {
  assert.match(newGameTabSource, /data-status-field="selected-mode"/, 'must have data-status-field="selected-mode"');
  assert.match(newGameTabSource, /data-status-field="owned-sets"/, 'must have data-status-field="owned-sets"');
  assert.match(newGameTabSource, /data-status-field="last-persisted"/, 'must have data-status-field="last-persisted"');
});

// Story 3 — Browse welcome area reduced to two primary CTAs

test('BrowseTab browse-hero-actions contains exactly two buttons', () => {
  const heroActionsMatch = browseTabSource.match(/<div class="button-row browse-hero-actions">([\s\S]*?)<\/div>/);
  assert.ok(heroActionsMatch, 'browse-hero-actions div must exist');
  const innerHtml = heroActionsMatch[1];
  const buttonMatches = innerHtml.match(/<button\b/g);
  assert.ok(buttonMatches, 'browse-hero-actions must contain buttons');
  assert.equal(buttonMatches.length, 2, 'browse-hero-actions must contain exactly 2 buttons');
});

test('BrowseTab browse-hero-actions does NOT contain start-onboarding or toggle-about-panel', () => {
  const heroActionsMatch = browseTabSource.match(/<div class="button-row browse-hero-actions">([\s\S]*?)<\/div>/);
  assert.ok(heroActionsMatch, 'browse-hero-actions div must exist');
  const innerHtml = heroActionsMatch[1];
  assert.doesNotMatch(innerHtml, /start-onboarding/, 'start-onboarding must not be in browse-hero-actions');
  assert.doesNotMatch(innerHtml, /toggle-about-panel/, 'toggle-about-panel must not be in browse-hero-actions');
});

test('BrowseTab help-walkthrough-action is inside browse-help-disclosure', () => {
  assert.match(
    browseTabSource,
    /data-browse-help-disclosure[\s\S]{0,2000}data-help-walkthrough-action/,
    '[data-help-walkthrough-action] must appear inside [data-browse-help-disclosure]'
  );
});

test('BrowseTab help-walkthrough-action contains start-onboarding button', () => {
  const walkthroughMatch = browseTabSource.match(/data-help-walkthrough-action[\s\S]{0,300}<\/div>/);
  assert.ok(walkthroughMatch, 'data-help-walkthrough-action block must exist');
  assert.match(walkthroughMatch[0], /data-action="start-onboarding"/, 'walkthrough action must trigger start-onboarding');
});

test('BrowseTab contains [data-browse-footer]', () => {
  assert.match(browseTabSource, /data-browse-footer/, 'BrowseTab must contain data-browse-footer');
});

test('BrowseTab footer contains toggle-about-panel button-link', () => {
  const footerMatch = browseTabSource.match(/data-browse-footer[\s\S]{0,400}<\/footer>/);
  assert.ok(footerMatch, 'browse-footer element must exist');
  assert.match(footerMatch[0], /data-action="toggle-about-panel"/, 'browse-footer must contain toggle-about-panel action');
  assert.match(footerMatch[0], /button-link/, 'browse-footer button must use button-link class');
});

test('CSS contains .browse-footer rule', () => {
  assert.match(cssSource, /\.browse-footer\s*\{/, 'CSS must have .browse-footer rule');
});

test('CSS contains .button-link rule', () => {
  assert.match(cssSource, /\.button-link\s*\{/, 'CSS must have .button-link rule');
  assert.match(cssSource, /\.button-link[^}]*appearance:\s*none/, '.button-link must set appearance: none');
});

// Story 4 — Collection Reset button relocated to bottom of Sets list

test('CollectionTab panel header does NOT contain request-reset-owned-collection button', () => {
  // Panel header row is the first row space-between element; reset button must not be there
  const panelHeaderMatch = collectionTabSource.match(/<section class="panel">\s*<div class="row space-between[^>]*">([\s\S]*?)<\/div>/);
  assert.ok(panelHeaderMatch, 'panel header row must exist');
  assert.doesNotMatch(
    panelHeaderMatch[1],
    /request-reset-owned-collection/,
    'Reset button must not be in the panel header row'
  );
});

test('CollectionTab contains [data-collection-reset-section]', () => {
  assert.match(collectionTabSource, /data-collection-reset-section/, 'CollectionTab must contain data-collection-reset-section');
});

test('CollectionTab reset section contains the consequence locale key', () => {
  const resetSectionMatch = collectionTabSource.match(/data-collection-reset-section[\s\S]{0,400}<\/section>/);
  assert.ok(resetSectionMatch, 'data-collection-reset-section must exist');
  assert.match(
    resetSectionMatch[0],
    /collection\.resetSelections\.consequence/,
    'reset section must reference collection.resetSelections.consequence locale key'
  );
});

test('CollectionTab reset section appears after collection-group elements', () => {
  const lastGroupIdx = collectionTabSource.lastIndexOf('data-collection-group');
  const resetSectionIdx = collectionTabSource.indexOf('data-collection-reset-section');
  assert.ok(lastGroupIdx !== -1, 'data-collection-group must exist');
  assert.ok(resetSectionIdx !== -1, 'data-collection-reset-section must exist');
  assert.ok(
    resetSectionIdx > lastGroupIdx,
    `data-collection-reset-section (at ${resetSectionIdx}) must appear after last data-collection-group (at ${lastGroupIdx})`
  );
});

test('en.ts contains collection.resetSelections.consequence key', () => {
  assert.match(
    enLocaleSource,
    /'collection\.resetSelections\.consequence'/,
    "en.ts must contain the 'collection.resetSelections.consequence' key"
  );
});
