# Epic 78 — UI Layout and Navigation Polish: Task List

## Story 1 — Convert the History grouping button row to a horizontally-scrollable single-line pill row

- [ ] In `src/components/HistoryTab.svelte`: inside the `<div class="row space-between wrap gap-sm align-center" data-history-grouping-controls>`, change the first inner `<div class="button-row wrap">` (the one that iterates `HISTORY_GROUPING_MODES`) to `<div class="button-row button-row-scroll" role="group" aria-label={locale.t('history.groupBy')}>`. Remove the `wrap` class. Do **not** change the second inner `<div class="button-row wrap" data-outcome-filter-row>`.
- [ ] In `src/app/app-shell.css`: after the `.button-row > *` rule (around line 987), add the following two rules:
  ```css
  .button-row-scroll {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px; /* clearance for scrollbar on Windows */
  }

  .button-row-scroll > * {
    flex-shrink: 0;
  }
  ```
- [ ] Test: verify that at every breakpoint (320 px, 390 px, 733 px, 1280 px) all 6 grouping-mode buttons render on a single line inside `[data-history-grouping-controls] .button-row-scroll`, no button wraps to a second line, the container has `overflow-x: auto` and `flex-wrap: nowrap`, and the active `aria-pressed="true"` state is preserved on the selected button. Verify `npm run lint` passes.
- [ ] QC (Automated): run `npm run lint` and story-1 targeted tests in `test/epic78-ui-layout-polish.test.mjs`

---

## Story 2 — Collapse the three New Game status cards into a single compact metadata summary

- [ ] In `src/components/NewGameTab.svelte`: replace the entire `<div class="summary-grid">` block (which contains three `<div class="summary-card">` elements for `newGame.selectedMode`, `newGame.ownedSets`, and `newGame.lastPersistedMode`) with the following single compact element, preserving all three locale keys and all three data values:
  ```svelte
  <div class="summary-card new-game-status-summary" data-new-game-status-summary>
    <span class="muted" data-status-field="selected-mode">{locale.t('newGame.selectedMode')}: <strong>{availablePlayModes.some((m) => m.id === selectedPlayMode) ? locale.getPlayModeLabel(selectedPlayMode, selectedPlayerCount) : locale.getPlayModeLabel('standard', selectedPlayerCount)}</strong></span>
    <span aria-hidden="true" class="muted"> · </span>
    <span class="muted" data-status-field="owned-sets">{locale.t('newGame.ownedSets')}: <strong>{appState.collection.ownedSetIds.length}</strong></span>
    <span aria-hidden="true" class="muted"> · </span>
    <span class="muted" data-status-field="last-persisted">{locale.t('newGame.lastPersistedMode')}: <strong>{locale.formatPersistedPlayMode(appState.preferences.lastPlayerCount, appState.preferences.lastPlayMode)}</strong></span>
  </div>
  ```
- [ ] Test: verify `[data-new-game-status-summary]` is present and replaces the old `summary-grid`; verify all three `data-status-field` spans are rendered and contain non-empty text; verify element height is ≤ 80 px at a 664 px viewport (one compact line of text); verify no `summary-grid` with three separate cards remains; verify `npm run lint` passes.
- [ ] QC (Automated): run `npm run lint` and story-2 targeted tests in `test/epic78-ui-layout-polish.test.mjs`

---

## Story 3 — Reduce the Browse welcome area to two primary CTAs and relocate utility links

- [ ] In `src/components/BrowseTab.svelte`: inside `<div class="button-row browse-hero-actions">`, remove the third button entirely (the one with `data-action="start-onboarding"` and label `locale.t('browse.hero.replayWalkthrough')`).
- [ ] In `src/components/BrowseTab.svelte`: inside `<div class="button-row browse-hero-actions">`, remove the fourth button entirely (the one with `data-action="toggle-about-panel"` and label `locale.t('browse.hero.aboutProject')`). After this change, `browse-hero-actions` must contain exactly two buttons: the primary CTA (`data-browse-primary-cta`) and the secondary CTA.
- [ ] In `src/components/BrowseTab.svelte`: inside the `<details class="panel browse-help-disclosure" data-browse-help-disclosure>`, after the closing `</article>` of the third and final `browse-priority-item`, add a "Replay Walkthrough" button:
  ```svelte
  <div class="button-row" data-help-walkthrough-action>
    <button
      type="button"
      class="button button-secondary"
      data-action="start-onboarding"
      onclick={onStartOnboarding}
    >{locale.t('browse.hero.replayWalkthrough')}</button>
  </div>
  ```
- [ ] In `src/components/BrowseTab.svelte`: at the very end of the outer `<section class="page-flow stack gap-md">`, immediately before the closing `</section>` tag (after the `{/if}` that closes the `aboutPanelOpen` block), add a footer element:
  ```svelte
  <footer class="browse-footer" data-browse-footer>
    <button
      type="button"
      class="button-link"
      data-action="toggle-about-panel"
      aria-expanded={aboutPanelOpen}
      onclick={onToggleAboutPanel}
    >{locale.t('browse.hero.aboutProject')}</button>
  </footer>
  ```
- [ ] In `src/app/app-shell.css`: add the following two rules (e.g. after the `.button-row-scroll` rules added in Story 1):
  ```css
  .browse-footer {
    padding: var(--space-3) 0 var(--space-2);
    text-align: center;
  }

  .button-link {
    appearance: none;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: var(--type-body-sm-size);
    padding: 0;
    text-decoration: underline;
  }

  .button-link:hover,
  .button-link:focus-visible {
    color: var(--text-default);
  }
  ```
- [ ] Test: verify `[data-browse-hero-actions]` or `.browse-hero-actions` contains exactly 2 `<button>` elements; verify `[data-help-walkthrough-action]` is present inside `[data-browse-help-disclosure]` and contains a button triggering `onStartOnboarding`; verify `[data-browse-footer]` is present and its button triggers `onToggleAboutPanel`; verify no content for "Replay Walkthrough" or "About this project" has been removed — only relocated; verify `npm run lint` passes.
- [ ] QC (Automated): run `npm run lint` and story-3 targeted tests in `test/epic78-ui-layout-polish.test.mjs`

---

## Story 4 — Move the Collection "Reset All Selections" button to the bottom of the Sets list

- [ ] In `src/app/locales/en.ts`: after the `'collection.resetSelections': 'Reset All Selections'` key, add:
  `'collection.resetSelections.consequence': 'This will clear all owned set selections — export a backup first if you want to restore them.'`
- [ ] In `src/app/locales/fr.ts`: add translated value for `'collection.resetSelections.consequence'`.
- [ ] In `src/app/locales/de.ts`: add translated value for `'collection.resetSelections.consequence'`.
- [ ] In `src/app/locales/ja.ts`: add translated value for `'collection.resetSelections.consequence'`.
- [ ] In `src/app/locales/ko.ts`: add translated value for `'collection.resetSelections.consequence'`.
- [ ] In `src/app/locales/es.ts`: add translated value for `'collection.resetSelections.consequence'`.
- [ ] In `src/components/CollectionTab.svelte`: remove the `<div class="button-row">` element (and its child `<button data-action="request-reset-owned-collection">`) from inside the `<div class="row space-between wrap gap-md align-center">` panel header. After this change, the panel header row contains only the `panel-copy` div (h2 + description paragraph).
- [ ] In `src/components/CollectionTab.svelte`: inside the `{#if collectionView === 'sets'}` block, after the `{/each}` loop that renders `groupedSets` (i.e., after the last `</section>` of the `collection-group` panels) and before the `{/if}` that closes the sets view, add:
  ```svelte
  <section class="panel collection-reset-section" data-collection-reset-section>
    <p class="muted">{locale.t('collection.resetSelections.consequence')}</p>
    <div class="button-row">
      <button
        class="button button-secondary"
        data-action="request-reset-owned-collection"
        onclick={collectionActions.requestResetOwnedCollection}
      >{locale.t('collection.resetSelections')}</button>
    </div>
  </section>
  ```
- [ ] Test: verify `[data-collection-reset-section]` renders below all `[data-collection-group]` elements when the sets view is active; verify the consequence text (`collection.resetSelections.consequence`) is rendered inside `[data-collection-reset-section]`; verify the Reset button is no longer present in the panel header; verify clicking the button still triggers `collectionActions.requestResetOwnedCollection` (confirmation dialog preserved); verify `npm run lint` passes.
- [ ] QC (Automated): run `npm run lint` and story-4 targeted tests in `test/epic78-ui-layout-polish.test.mjs`
