import { describe, it } from 'vitest';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const newGameTabSource = readFileSync(
  join(process.cwd(), 'src/components/NewGameTab.svelte'),
  'utf8'
);

describe('Epic 80 — Active Expansions Layout Alignment', () => {
  describe('Story 80.1 — Apply the Forced Picks collapsible pattern to Active Expansions', () => {
    it('Active Expansions outer element is a <details data-active-filter-panel>', () => {
      assert.match(newGameTabSource, /<details[^>]*data-active-filter-panel/);
    });

    it('activeExpansionsPanelOpen state variable is removed', () => {
      assert.doesNotMatch(
        newGameTabSource,
        /let\s+activeExpansionsPanelOpen\s*=\s*\$state\(false\)/
      );
    });

    it('Manual toggle button with data-action="toggle-active-filter-panel" is removed', () => {
      assert.doesNotMatch(
        newGameTabSource,
        /data-action="toggle-active-filter-panel"/
      );
    });

    it('{#if activeExpansionsPanelOpen} guard is removed', () => {
      assert.doesNotMatch(newGameTabSource, /\{#if activeExpansionsPanelOpen\}/);
    });
  });

  describe('Story 80.2 — Reorder Active Expansions below Forced Picks', () => {
    it('Active Expansions block appears after Forced Picks in source order', () => {
      assert.ok(
        newGameTabSource.indexOf('data-active-filter-panel') >
          newGameTabSource.indexOf('data-forced-picks-panel'),
        'data-active-filter-panel must appear after data-forced-picks-panel in NewGameTab.svelte'
      );
    });
  });
});
