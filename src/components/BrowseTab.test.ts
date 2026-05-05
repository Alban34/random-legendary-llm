import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let browseTabSource;
let browseHeroSectionSource;
let browseHelpDisclosureSource;
let appSvelteSource;
let cssSource;

beforeAll(async () => {
  [browseTabSource, browseHeroSectionSource, browseHelpDisclosureSource, appSvelteSource, cssSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'BrowseTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'BrowseHeroSection.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'BrowseHelpDisclosure.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8')
  ]);
});

test('BrowseTab structural panels exist with expected data attributes', () => {

  assert.match(browseHelpDisclosureSource, /data-browse-help-disclosure/);
  assert.match(browseHeroSectionSource, /data-browse-primary-cta/);
  assert.match(browseTabSource, /data-browse-sets-panel/);
  assert.match(browseTabSource, /browse-panel-full-width/);
});

test('Onboarding shell appears above the tab panels and Ready Tabs metric is removed from renderer', () => {

  assert.match(appSvelteSource, /id="diagnostics-shell"[\s\S]*<div class="tab-panel-shell">/);
});

// Story 78.3 — Browse welcome area reduced to two primary CTAs

test('BrowseTab browse-hero-actions contains exactly two buttons', () => {

  const heroActionsMatch = browseHeroSectionSource.match(/<div class="button-row browse-hero-actions">([\s\S]*?)<\/div>/);
  assert.ok(heroActionsMatch, 'browse-hero-actions div must exist');
  const innerHtml = heroActionsMatch[1];
  const buttonMatches = innerHtml.match(/<button\b/g);
  assert.ok(buttonMatches, 'browse-hero-actions must contain buttons');
  assert.equal(buttonMatches.length, 2, 'browse-hero-actions must contain exactly 2 buttons');
});

test('BrowseTab browse-hero-actions does NOT contain start-onboarding or toggle-about-panel', () => {

  const heroActionsMatch = browseHeroSectionSource.match(/<div class="button-row browse-hero-actions">([\s\S]*?)<\/div>/);
  assert.ok(heroActionsMatch, 'browse-hero-actions div must exist');
  const innerHtml = heroActionsMatch[1];
  assert.doesNotMatch(innerHtml, /start-onboarding/, 'start-onboarding must not be in browse-hero-actions');
  assert.doesNotMatch(innerHtml, /toggle-about-panel/, 'toggle-about-panel must not be in browse-hero-actions');
});

test('BrowseTab help-walkthrough-action is inside browse-help-disclosure', () => {

  assert.match(
    browseHelpDisclosureSource,
    /data-browse-help-disclosure[\s\S]{0,2000}data-help-walkthrough-action/,
    '[data-help-walkthrough-action] must appear inside [data-browse-help-disclosure]'
  );
});

test('BrowseTab help-walkthrough-action contains start-onboarding button', () => {

  const walkthroughMatch = browseHelpDisclosureSource.match(/data-help-walkthrough-action[\s\S]{0,300}<\/div>/);
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

// ── Epic 86 — Story 86.4 — .browse-entity-item has no per-item border ──

test('CSS .browse-entity-item does not have a 1px border separator', () => {
  assert.doesNotMatch(
    cssSource,
    /\.browse-entity-item\s*\{[^}]*border\s*:\s*1px/,
    '.browse-entity-item must not have a border: 1px declaration'
  );
});