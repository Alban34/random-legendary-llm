import { APP_TABS, normalizeSelectedTab } from './app-tabs.mjs';
import { BROWSE_TYPE_OPTIONS, filterBrowseSets, getBrowseTypeLabel, summarizeBrowseSet } from './browse-utils.mjs';
import { COLLECTION_TYPE_GROUPS, getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection } from './collection-utils.mjs';
import { TOAST_VARIANTS } from './feedback-utils.mjs';
import { FORCED_PICK_FIELD_CONFIGS, hasForcedPicks } from './forced-picks-utils.mjs';
import { buildFullResetPreview, formatHistorySummary, summarizeUsageIndicators } from './history-utils.mjs';
import { formatHeroTeamLabel, formatMastermindLeadLabel, formatPersistedPlayMode, getAvailablePlayModes, getDisplayedSetupRequirements, getPlayModeHelpText } from './new-game-utils.mjs';
import { buildOwnedPools } from './setup-generator.mjs';

function formatDuplicateEntries(bundle) {
  return ['Black Widow', 'Loki', 'Thor', 'Nova', 'Venom']
    .map((name) => {
      const heroes = bundle.runtime.indexes.allHeroes.filter((entity) => entity.name === name);
      const masterminds = bundle.runtime.indexes.allMasterminds.filter((entity) => entity.name === name);
      return { name, all: [...heroes, ...masterminds] };
    })
    .filter((entry) => entry.all.length > 1);
}

function formatHistoryEntry(record, bundle) {
  const summary = formatHistorySummary(record, bundle.runtime.indexes);

  return `
    <details class="history-item" data-history-record-id="${summary.id}">
      <summary>
        <strong>${summary.mastermindName}</strong>
        <span class="pill">${summary.playerLabel}</span>
        <span class="pill">${summary.modeLabel}</span>
      </summary>
      <div class="history-meta muted">Accepted ${new Date(summary.createdAt).toLocaleString()} · ${summary.modeLabel}</div>
      <div class="history-meta"><strong>Scheme:</strong> ${summary.schemeName}</div>
      <div class="history-meta"><strong>Heroes:</strong> ${summary.heroNames.join(', ')}</div>
      <div class="history-meta"><strong>Villain Groups:</strong> ${summary.villainGroupNames.join(', ')}</div>
      <div class="history-meta"><strong>Henchman Groups:</strong> ${summary.henchmanGroupNames.join(', ')}</div>
    </details>
  `;
}

function formatGeneratorNotices(currentSetup, generatorNotices, generatorError) {
  if (generatorError) {
    return `<div class="notice warning">${generatorError}</div>`;
  }

  if (!currentSetup) {
    return '<div class="notice info">Generate a setup to preview the Epic 3 engine. Regenerate stays ephemeral until you accept.</div>';
  }

  if (!generatorNotices.length) {
    return '<div class="notice success">This setup used fully fresh items in every category.</div>';
  }

  return generatorNotices.map((notice) => `<div class="notice info">${notice}</div>`).join('');
}

function formatSetupGroupList(groups) {
  return groups.map((group) => `
    <li class="result-list-item">
      <span>${group.name}</span>
      ${group.forced ? `<span class="pill">Forced by ${Array.isArray(group.forcedBy)
        ? group.forcedBy.map((value) => value === 'mastermind' ? 'Mastermind lead' : value === 'scheme' ? 'Scheme' : 'Forced pick').join(' + ')
        : group.forcedBy === 'mastermind'
          ? 'Mastermind lead'
          : group.forcedBy === 'scheme'
            ? 'Scheme'
            : 'Forced pick'}</span>` : ''}
    </li>
  `).join('');
}

function getForcedPickEntityIndexes(indexes) {
  return {
    schemeId: indexes.schemesById,
    mastermindId: indexes.mastermindsById,
    heroIds: indexes.heroesById,
    villainGroupIds: indexes.villainGroupsById,
    henchmanGroupIds: indexes.henchmanGroupsById
  };
}

function getOwnedForcedPickOptions(viewModel) {
  const pools = buildOwnedPools(viewModel.bundle.runtime, viewModel.state.collection.ownedSetIds);
  return {
    schemeId: [...pools.schemes].sort((left, right) => left.name.localeCompare(right.name)),
    mastermindId: [...pools.masterminds].sort((left, right) => left.name.localeCompare(right.name)),
    heroIds: [...pools.heroes].sort((left, right) => left.name.localeCompare(right.name)),
    villainGroupIds: [...pools.villainGroups].sort((left, right) => left.name.localeCompare(right.name)),
    henchmanGroupIds: [...pools.henchmanGroups].sort((left, right) => left.name.localeCompare(right.name))
  };
}

function renderForcedPickControls(viewModel) {
  const options = getOwnedForcedPickOptions(viewModel);
  const entityIndexes = getForcedPickEntityIndexes(viewModel.bundle.runtime.indexes);
  const hasActiveForcedPicks = hasForcedPicks(viewModel.ui.forcedPicks);

  const controlMarkup = FORCED_PICK_FIELD_CONFIGS.map((config) => {
    const activeIds = config.multi
      ? viewModel.ui.forcedPicks[config.field]
      : viewModel.ui.forcedPicks[config.field] ? [viewModel.ui.forcedPicks[config.field]] : [];
    const availableOptions = config.multi
      ? options[config.field].filter((entity) => !activeIds.includes(entity.id))
      : options[config.field];

    return `
      <div class="stack gap-sm">
        <label for="forced-pick-${config.field}"><strong>${config.label}</strong></label>
        <div class="button-row wrap">
          <select id="forced-pick-${config.field}" data-forced-pick-select="${config.field}" ${availableOptions.length ? '' : 'disabled'}>
            <option value="">Choose ${config.label.toLowerCase()}</option>
            ${availableOptions.map((entity) => `<option value="${entity.id}">${escapeHtml(entity.name)}</option>`).join('')}
          </select>
          <button
            type="button"
            class="button button-secondary"
            data-action="add-forced-pick"
            data-field="${config.field}"
            ${availableOptions.length ? '' : 'disabled'}
          >
            ${config.multi ? `Add ${config.label}` : `Set ${config.label}`}
          </button>
        </div>
      </div>
    `;
  }).join('');

  const activeMarkup = FORCED_PICK_FIELD_CONFIGS.flatMap((config) => {
    const activeIds = config.multi
      ? viewModel.ui.forcedPicks[config.field]
      : viewModel.ui.forcedPicks[config.field] ? [viewModel.ui.forcedPicks[config.field]] : [];

    return activeIds.map((id) => {
      const entity = entityIndexes[config.field][id];
      const label = entity ? entity.name : `${id} (not currently owned)`;
      return `
        <li class="result-list-item" data-forced-pick-field="${config.field}" data-forced-pick-id="${id}">
          <span><strong>${config.label}:</strong> ${escapeHtml(label)}</span>
          <button type="button" class="button button-secondary" data-action="remove-forced-pick" data-field="${config.field}" data-entity-id="${id}">Remove</button>
        </li>
      `;
    });
  }).join('');

  return `
    <section class="result-card" data-forced-picks-panel>
      <h3>Forced picks</h3>
      <div class="muted">Force owned Schemes, Masterminds, Heroes, Villain Groups, or Henchman Groups into the next generated setup when legal. These one-shot constraints stay active for Generate and Regenerate, then clear after a successful Accept &amp; Log or a reload.</div>
      <div class="stack gap-md">${controlMarkup}</div>
      <div class="stack gap-sm">
        <div class="row space-between wrap gap-sm align-center">
          <strong>Active constraints</strong>
          <button type="button" class="button button-secondary" data-action="clear-forced-picks" ${hasActiveForcedPicks ? '' : 'disabled'}>Clear all</button>
        </div>
        ${hasActiveForcedPicks
          ? `<ul class="clean result-list">${activeMarkup}</ul>`
          : '<p class="muted empty-state">No forced picks are active.</p>'}
      </div>
    </section>
  `;
}

function formatEntityCards(entities) {
  return entities.map((entity) => `<span class="entity-chip">${entity.name}</span>`).join('');
}

function renderHeroResultCards(heroes) {
  return heroes.map((hero) => `
    <article class="result-card hero-result-card" data-hero-id="${hero.id}">
      <h3>${hero.name}</h3>
      <div class="muted">${formatHeroTeamLabel(hero)}</div>
    </article>
  `).join('');
}

function renderTabButtons(activeTabId, variant = 'desktop') {
  return APP_TABS.map((tab) => `
    <button
      type="button"
      class="tab-button ${variant} ${activeTabId === tab.id ? 'active' : ''}"
      role="tab"
      id="tab-${variant}-${tab.id}"
      aria-selected="${activeTabId === tab.id}"
      aria-controls="panel-${tab.id}"
      data-action="select-tab"
      data-tab-id="${tab.id}"
      tabindex="${activeTabId === tab.id ? '0' : '-1'}"
      title="${tab.description}"
    >
      <span class="tab-icon" aria-hidden="true">${tab.icon}</span>
      <span class="tab-label">${variant === 'mobile' ? tab.shortLabel : tab.label}</span>
    </button>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatBrowseMastermind(mastermind, indexes) {
  if (!mastermind.lead) {
    return mastermind.name;
  }

  const leadEntity = mastermind.lead.category === 'villains'
    ? indexes.villainGroupsById[mastermind.lead.id]
    : indexes.henchmanGroupsById[mastermind.lead.id];

  return `${mastermind.name} → ${leadEntity?.name || mastermind.lead.id}`;
}

function formatBrowseEntityList(items, emptyLabel, formatter = (item) => item.name) {
  if (!items.length) {
    return `<p class="muted browse-empty-copy">${emptyLabel}</p>`;
  }

  return `
    <ul class="clean browse-entity-list">
      ${items.map((item) => `<li class="browse-entity-item">${formatter(item)}</li>`).join('')}
    </ul>
  `;
}

function renderBrowseTypeFilters(activeTypeFilter) {
  return BROWSE_TYPE_OPTIONS.map((option) => `
    <button
      type="button"
      class="button ${activeTypeFilter === option.id ? 'button-primary' : 'button-secondary'} browse-filter-button"
      data-action="set-browse-type-filter"
      data-type-filter="${option.id}"
      aria-pressed="${activeTypeFilter === option.id}"
    >
      ${option.label}
    </button>
  `).join('');
}

const ONBOARDING_STEPS = [
  {
    id: 'browse',
    tabId: 'browse',
    eyebrow: 'Step 1',
    title: 'Browse the full catalog first',
    description: 'Search by set name or alias, filter by product type, and expand cards to inspect heroes, masterminds, villain groups, henchmen, and schemes.',
    actionLabel: 'Stay in Browse'
  },
  {
    id: 'collection',
    tabId: 'collection',
    eyebrow: 'Step 2',
    title: 'Mark what you actually own',
    description: 'Use Browse or Collection to toggle owned sets, then confirm the collection totals and player-count feasibility before generating setups.',
    actionLabel: 'Open Collection'
  },
  {
    id: 'new-game',
    tabId: 'new-game',
    eyebrow: 'Step 3',
    title: 'Generate a legal setup',
    description: 'Choose the player mode, generate a setup, and only use Accept & Log once you want the app to update history and freshness tracking.',
    actionLabel: 'Open New Game'
  },
  {
    id: 'history',
    tabId: 'history',
    eyebrow: 'Step 4',
    title: 'Review history and resets',
    description: 'History shows accepted games and category freshness, while reset controls let you clear usage or restart the app state intentionally.',
    actionLabel: 'Open History'
  }
];

function formatSetCountLabel(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function renderOnboardingShell(viewModel) {
  if (!viewModel.ui.onboardingVisible) {
    return '';
  }

  const currentStep = ONBOARDING_STEPS[Math.max(0, Math.min(viewModel.ui.onboardingStep, ONBOARDING_STEPS.length - 1))];
  const isLastStep = currentStep.id === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1].id;

  return `
    <section class="panel onboarding-shell" id="onboarding-shell" aria-live="polite">
      <div class="row space-between wrap gap-md align-center">
        <div>
          <div class="eyebrow">First-run walkthrough</div>
          <h2>Get comfortable with the app in under a minute</h2>
          <p class="muted">This walkthrough is shown on first launch, can be skipped without trapping navigation, and can be replayed anytime from the Browse tab.</p>
        </div>
        <div class="onboarding-progress" aria-label="Walkthrough progress">
          ${ONBOARDING_STEPS.map((step, index) => `
            <span class="onboarding-step-pill ${index === viewModel.ui.onboardingStep ? 'active' : index < viewModel.ui.onboardingStep ? 'complete' : ''}">${step.eyebrow}</span>
          `).join('')}
        </div>
      </div>
      <div class="result-card onboarding-step-card" data-onboarding-step="${currentStep.id}">
        <div class="eyebrow">${currentStep.eyebrow} of ${ONBOARDING_STEPS.length}</div>
        <h3>${currentStep.title}</h3>
        <p>${currentStep.description}</p>
        <div class="button-row">
          <button type="button" class="button button-secondary" data-action="open-onboarding-tab" data-tab-id="${currentStep.tabId}">${currentStep.actionLabel}</button>
        </div>
      </div>
      <div class="button-row onboarding-actions">
        <button type="button" class="button button-secondary" data-action="previous-onboarding-step" ${viewModel.ui.onboardingStep === 0 ? 'disabled' : ''}>Previous</button>
        ${isLastStep
          ? '<button type="button" class="button button-success" data-action="complete-onboarding">Finish walkthrough</button>'
          : '<button type="button" class="button button-primary" data-action="next-onboarding-step">Next step</button>'}
        <button type="button" class="button button-secondary" data-action="skip-onboarding">Skip for now</button>
      </div>
    </section>
  `;
}

function renderAboutPanel(viewModel) {
  const { bundle, state, persistence, ui } = viewModel;
  const failed = bundle.tests.filter((test) => test.status === 'fail');

  return `
    <section class="panel about-panel" id="about-panel">
      <div class="row space-between wrap gap-md align-center">
        <div>
          <div class="eyebrow">About this project</div>
          <h2>Project details and developer diagnostics</h2>
          <p class="muted">This section keeps implementation-oriented details available without putting them in front of players who only want to use the app.</p>
        </div>
        <div class="button-row">
          <button type="button" class="button button-secondary" data-action="toggle-about-panel">Hide About</button>
        </div>
      </div>
      <section class="two-col about-layout">
        <section class="stack gap-md">
          <details class="about-card">
            <summary>
              <h3>Initialization status</h3>
            </summary>
            <div>${failed.length
              ? `<p class="error">Foundation loaded with ${failed.length} failing Epic 1 test(s).</p>`
              : '<p class="status-pass">Legendary: Marvel Randomizer is loaded successfully with Epic 1–10 implementation, documentation alignment, and automated release-readiness coverage.</p>'}</div>
          </details>
          <details class="about-card">
            <summary>
              <h3>Data-quality samples</h3>
            </summary>
            <div class="stack gap-sm">
              ${formatDuplicateEntries(bundle).map((entry) => `
                <details>
                  <summary>${entry.name} <span class="pill">${entry.all.length} entries</span></summary>
                  <pre>${entry.all.map((entity) => `${entity.id}  ←  ${entity.setId}`).join('\n')}</pre>
                </details>
              `).join('')}
            </div>
          </details>
          <details class="about-card">
            <summary>
              <h3>Epic 1 test results</h3>
            </summary>
            <ul class="clean">${bundle.tests.map((test) => `
              <li class="test ${test.status}">
                <strong class="status-${test.status}">${test.status === 'pass' ? 'PASS' : 'FAIL'}</strong>
                — ${test.name}
                ${test.error ? `<div class="error">${test.error}</div>` : ''}
              </li>
            `).join('')}</ul>
          </details>
        </section>
        <section class="stack gap-md">
          <details class="about-card">
            <summary>
              <h3>Runtime diagnostics</h3>
            </summary>
            <pre>${JSON.stringify({
              sampleLeadResolution: bundle.runtime.indexes.allMasterminds.filter((entity) => entity.lead).slice(0, 5),
              sampleForcedSchemes: bundle.runtime.indexes.allSchemes.filter((entity) => entity.forcedGroups.length || entity.modifiers.length).slice(0, 8),
              storageState: {
                storageAvailable: persistence.storageAvailable,
                recoveredOnLoad: persistence.recoveredOnLoad,
                ownedSetIds: state.collection.ownedSetIds,
                historyCount: state.history.length,
                selectedTab: ui.selectedTab,
                onboardingCompleted: state.preferences.onboardingCompleted
              },
              currentSetup: ui.currentSetup ? ui.currentSetup.setupSnapshot : null
            }, null, 2)}</pre>
          </details>
          <details class="about-card">
            <summary>
              <h3>Persisted state snapshot</h3>
            </summary>
            <pre>${JSON.stringify(state, null, 2)}</pre>
          </details>
        </section>
      </section>
    </section>
  `;
}

function getActiveModalConfig(viewModel) {
  if (viewModel.ui.confirmResetOwnedCollection) {
    return {
      title: '⚠️ Are you sure?',
      description: 'This will clear all owned collection selections. Usage statistics, history, and preferences will stay intact.',
      confirmAction: 'confirm-reset-owned-collection',
      cancelAction: 'cancel-reset-owned-collection',
      confirmLabel: 'Yes, Clear Collection'
    };
  }

  if (viewModel.ui.confirmResetAllState) {
    return {
      title: '⚠️ Are you sure?',
      description: 'This will delete all game history and reset all card tracking. This cannot be undone.',
      confirmAction: 'confirm-reset-all-state',
      cancelAction: 'cancel-reset-all-state',
      confirmLabel: 'Yes, Reset All'
    };
  }

  return null;
}

function renderToastRegion(viewModel) {
  if (!viewModel.ui.toasts.length) {
    return '';
  }

  return `
    <div class="toast-stack" role="region" aria-label="Notifications">
      ${viewModel.ui.toasts.map((toast) => `
        <article class="toast toast-${toast.variant} toast-${toast.behavior}" role="${toast.live === 'assertive' ? 'alert' : 'status'}" aria-live="${toast.live}" data-toast-id="${toast.id}" data-toast-dismiss-on-click="${toast.dismissOnClick ? 'true' : 'false'}" data-toast-auto-dismiss="${toast.autoDismissMs ? 'true' : 'false'}" data-toast-behavior="${toast.behavior}">
          <div class="toast-copy">
            <div class="toast-title">${toast.icon} ${toast.label}</div>
            ${toast.isPersistent ? '<div class="toast-meta">Persistent alert</div>' : ''}
            <div>${toast.message}</div>
          </div>
          ${toast.dismissible
            ? `<button type="button" class="button button-secondary toast-dismiss" data-action="dismiss-toast" data-toast-id="${toast.id}" aria-label="${toast.isPersistent ? 'Acknowledge' : 'Dismiss'} ${toast.label} notification">${toast.isPersistent ? 'Acknowledge' : 'Dismiss'}</button>`
            : ''}
        </article>
      `).join('')}
    </div>
  `;
}

function renderActiveModal(viewModel) {
  const modal = getActiveModalConfig(viewModel);
  if (!modal) {
    return '';
  }

  return `
    <div class="modal-backdrop">
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" tabindex="-1">
        <h2 id="modal-title">${modal.title}</h2>
        <p id="modal-description">${modal.description}</p>
        <div class="button-row confirmation-actions">
          <button type="button" class="button button-secondary" data-action="${modal.cancelAction}" data-modal-focus="cancel">Cancel</button>
          <button type="button" class="button button-danger" data-action="${modal.confirmAction}" data-modal-focus="confirm">${modal.confirmLabel}</button>
        </div>
      </section>
    </div>
  `;
}

function renderCollectionFeasibility(viewModel) {
  const feasibility = getCollectionFeasibility(viewModel.bundle.runtime, viewModel.state);

  return feasibility.map((mode) => `
    <article class="summary-card feasibility-card ${mode.ok ? 'is-ok' : 'is-warning'}" data-feasibility-mode="${mode.id}">
      <div class="row space-between gap-sm wrap align-center">
        <strong>${mode.label}</strong>
        <span class="pill ${mode.ok ? 'feasibility-pill-ok' : 'feasibility-pill-warning'}">${mode.ok ? '✓ Legal' : '⚠ Warning'}</span>
      </div>
      <div class="muted feasibility-copy">${mode.ok
        ? 'Collection currently supports this setup mode.'
        : (mode.reasons[0] || 'Collection cannot currently support this setup mode.')}</div>
    </article>
  `).join('');
}

function renderCollectionGroups(viewModel) {
  const ownedSetIds = new Set(viewModel.state.collection.ownedSetIds);
  const groupedSets = groupSetsByType(viewModel.bundle.runtime.sets);

  return groupedSets.map((group) => `
    <section class="panel collection-group" data-collection-group="${group.id}">
      <h3>${COLLECTION_TYPE_GROUPS.find((entry) => entry.id === group.id)?.label || group.label}</h3>
      <div class="stack gap-sm">
        ${group.sets.map((set) => {
          const counts = summarizeBrowseSet(set);
          return `
            <label class="collection-row ${ownedSetIds.has(set.id) ? 'owned' : ''}" data-set-id="${set.id}" data-set-name="${set.name}">
              <span class="row gap-sm align-center collection-row-main">
                <input
                  type="checkbox"
                  class="collection-checkbox"
                  data-action="toggle-owned-set"
                  data-set-id="${set.id}"
                  ${ownedSetIds.has(set.id) ? 'checked' : ''}
                />
                <span>
                  <strong>${set.name}</strong>
                  <span class="muted"> (${set.year})</span>
                </span>
              </span>
              <span class="muted collection-row-meta">
                ${formatSetCountLabel(counts.heroCount, 'hero', 'heroes')} · ${formatSetCountLabel(counts.mastermindCount, 'mastermind')} · ${formatSetCountLabel(counts.villainGroupCount, 'villain group')} · ${formatSetCountLabel(counts.henchmanGroupCount, 'henchman group')} · ${formatSetCountLabel(counts.schemeCount, 'scheme')}
              </span>
            </label>
          `;
        }).join('')}
      </div>
    </section>
  `).join('');
}

function renderBrowseSetCard(set, viewModel) {
  const { bundle, state, ui } = viewModel;
  const indexes = bundle.runtime.indexes;
  const counts = summarizeBrowseSet(set);
  const owned = state.collection.ownedSetIds.includes(set.id);
  const expanded = ui.expandedBrowseSetId === set.id;

  return `
    <article class="panel panel-inline set-card ${owned ? 'owned' : ''}" data-set-id="${set.id}" data-set-name="${set.name}" data-set-type="${set.type}">
      <div class="stack gap-md">
        <div class="row space-between gap-md wrap align-center">
          <div class="stack gap-sm browse-card-copy">
            <button
              type="button"
              class="set-card-toggle"
              data-action="toggle-browse-set-expanded"
              data-set-id="${set.id}"
              aria-expanded="${expanded}"
              aria-controls="browse-details-${set.id}"
            >
              <span class="set-card-title">${set.name}</span>
              <span class="set-card-toggle-copy">${expanded ? 'Hide details' : 'Show details'}</span>
            </button>
            <div class="row wrap gap-sm align-center browse-badge-row">
              <span class="pill set-year-badge">${set.year}</span>
              <span class="pill set-type-badge">${getBrowseTypeLabel(set.type)}</span>
              ${owned ? '<span class="pill set-owned-badge">In Collection</span>' : ''}
            </div>
            ${set.aliases.length ? `<div class="muted browse-aliases">Also listed as: ${set.aliases.map((alias) => escapeHtml(alias)).join(', ')}</div>` : ''}
          </div>
          <div class="stack gap-sm browse-card-actions">
            <button class="button ${owned ? 'button-success' : 'button-secondary'}" data-action="toggle-owned-set" data-set-id="${set.id}">
              ${owned ? '✓ In Collection' : 'Add to Collection'}
            </button>
            <div class="muted browse-ownership-copy">${owned ? 'Owned and available for setup generation.' : 'Not currently owned.'}</div>
          </div>
        </div>

        <div class="browse-count-grid">
          <div class="summary-card"><div class="muted">Heroes</div><div class="metric-sm">${counts.heroCount}</div></div>
          <div class="summary-card"><div class="muted">Masterminds</div><div class="metric-sm">${counts.mastermindCount}</div></div>
          <div class="summary-card"><div class="muted">Villain Groups</div><div class="metric-sm">${counts.villainGroupCount}</div></div>
          <div class="summary-card"><div class="muted">Henchman Groups</div><div class="metric-sm">${counts.henchmanGroupCount}</div></div>
          <div class="summary-card"><div class="muted">Schemes</div><div class="metric-sm">${counts.schemeCount}</div></div>
        </div>

        <div id="browse-details-${set.id}" class="browse-details" ${expanded ? '' : 'hidden'}>
          <div class="browse-details-grid">
            <section class="summary-card">
              <h3>Heroes</h3>
              ${formatBrowseEntityList(set.heroes, 'No heroes in this set.')}
            </section>
            <section class="summary-card">
              <h3>Masterminds</h3>
              ${formatBrowseEntityList(set.masterminds, 'No masterminds in this set.', (mastermind) => formatBrowseMastermind(mastermind, indexes))}
            </section>
            <section class="summary-card">
              <h3>Villain Groups</h3>
              ${formatBrowseEntityList(set.villainGroups, 'No villain groups in this set.')}
            </section>
            <section class="summary-card">
              <h3>Henchman Groups</h3>
              ${formatBrowseEntityList(set.henchmanGroups, 'No henchman groups in this set.')}
            </section>
            <section class="summary-card browse-detail-section-full">
              <h3>Schemes</h3>
              ${formatBrowseEntityList(set.schemes, 'No schemes in this set.')}
            </section>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderBrowsePanel(viewModel) {
  const { bundle, state, ui } = viewModel;
  const metrics = [
    ['Included Sets', bundle.counts.sets],
    ['Owned Sets', state.collection.ownedSetIds.length],
    ['History Records', state.history.length],
    ['Ready Tabs', 4]
  ];
  const browseSets = filterBrowseSets(bundle.runtime.sets, {
    searchTerm: ui.browseSearchTerm,
    typeFilter: ui.browseTypeFilter
  });

  return `
    <section class="stack gap-md">
      <section class="panel browse-hero">
        <div class="row space-between wrap gap-md align-center">
          <div class="browse-hero-copy">
            <div class="eyebrow">Welcome</div>
            <h2>Plan the next Legendary session without the clutter</h2>
            <p class="muted">Browse every set, mark the collection you own, generate a legal setup, and review play history from one static browser app.</p>
            <div class="button-row browse-hero-actions">
              <button type="button" class="button button-primary" data-action="jump-tab" data-tab-id="collection">Manage Collection</button>
              <button type="button" class="button button-secondary" data-action="jump-tab" data-tab-id="new-game">Generate a Game</button>
              <button type="button" class="button button-secondary" data-action="start-onboarding">Replay Walkthrough</button>
              <button type="button" class="button button-secondary" data-action="toggle-about-panel" aria-expanded="${ui.aboutPanelOpen}">About this project</button>
            </div>
          </div>
          <div class="summary-grid browse-hero-metrics">${metrics.map(([label, value]) => `
            <article class="summary-card metric-card">
              <div class="muted">${label}</div>
              <div class="metric">${value}</div>
            </article>
          `).join('')}</div>
        </div>
      </section>
      <section class="two-col">
        <section class="panel">
          <div class="row space-between wrap gap-md align-center">
            <div>
              <h2>Start here</h2>
              <p class="muted">Use this page as the landing zone: check what the app contains, jump into the workflow, and only open project details when you want them.</p>
            </div>
          </div>
          <div class="stack gap-sm browse-priority-list">
            <article class="summary-card browse-priority-item">
              <strong>1. Confirm your collection</strong>
              <div class="muted">Use Browse or Collection to add owned sets before generating games.</div>
            </article>
            <article class="summary-card browse-priority-item">
              <strong>2. Generate a legal setup</strong>
              <div class="muted">New Game respects player mode, collection size, mandatory leads, and freshness history.</div>
            </article>
            <article class="summary-card browse-priority-item">
              <strong>3. Track what you played</strong>
              <div class="muted">History and usage reset tools stay available without getting in the way of first-time users.</div>
            </article>
          </div>
        </section>
        <section class="panel">
          <div class="row space-between wrap gap-md align-center">
            <div>
              <h2>Browse sets</h2>
              <p class="muted">Search by set name or alias, filter by product type, expand a card for contents, and toggle ownership directly from the Browse tab.</p>
            </div>
            <div class="summary-card browse-results-summary">
              <div class="muted">Visible sets</div>
              <div class="metric-sm">${browseSets.length}</div>
              <div class="muted">of ${bundle.runtime.sets.length}</div>
            </div>
          </div>
          <div class="browse-toolbar">
            <label class="browse-search-shell" for="browse-search-input">
              <span class="muted">Search sets</span>
              <input
                id="browse-search-input"
                class="text-input"
                type="search"
                placeholder="Search by set name or alias"
                value="${escapeHtml(ui.browseSearchTerm)}"
              />
            </label>
            <div class="stack gap-sm">
              <span class="muted">Type filter</span>
              <div class="button-row" role="group" aria-label="Browse set type filters">
                ${renderBrowseTypeFilters(ui.browseTypeFilter)}
              </div>
            </div>
          </div>
          ${browseSets.length
            ? `<div class="grid collection-grid browse-set-grid">${browseSets.map((set) => renderBrowseSetCard(set, viewModel)).join('')}</div>`
            : `<div id="browse-empty-state" class="notice info">No sets match the current search and filter combination.</div>`}
        </section>
      </section>
      ${ui.aboutPanelOpen ? renderAboutPanel(viewModel) : ''}
    </section>
  `;
}

function renderCollectionPanel(viewModel) {
  const { bundle, state, persistence, ui } = viewModel;
  const totals = summarizeOwnedCollection(bundle.runtime, state.collection.ownedSetIds);
  const persistenceNotices = [
    ...persistence.hydrateNotices,
    ...persistence.updateNotices
  ];

  return `
    <section class="stack gap-md">
      <section class="panel">
        <div class="row space-between wrap gap-md align-center">
          <div>
            <h2>My Collection</h2>
            <p class="muted">Manage owned sets here with the same persisted ownership state used by Browse and setup generation.</p>
          </div>
          <div class="button-row">
            <button class="button button-secondary" data-action="request-reset-owned-collection">Reset All Selections</button>
          </div>
        </div>
        <div class="stack gap-sm">
          <div class="summary-grid">
            <div class="summary-card">
              <div class="muted">Owned sets</div>
              <div class="metric-sm">${totals.setCount}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Heroes</div>
              <div class="metric-sm">${totals.heroCount}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Masterminds</div>
              <div class="metric-sm">${totals.mastermindCount}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Villain Groups</div>
              <div class="metric-sm">${totals.villainGroupCount}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Henchman Groups</div>
              <div class="metric-sm">${totals.henchmanGroupCount}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Schemes</div>
              <div class="metric-sm">${totals.schemeCount}</div>
            </div>
          </div>
          <div class="summary-card">
            <div><strong>Storage:</strong> ${persistence.storageAvailable ? 'Available' : 'Unavailable'} · ${persistence.hydratedFromStorage ? 'Hydrated from storage' : 'Using defaults'} · ${persistence.recoveredOnLoad ? 'Recovered on load' : 'No recovery needed'}</div>
            ${ui.lastActionNotice ? `<div class="muted">Latest action: ${ui.lastActionNotice}</div>` : ''}
          </div>
          ${persistenceNotices.length
            ? persistenceNotices.map((notice) => `<div class="notice warning">${notice}</div>`).join('')
            : '<div class="notice success">No storage recovery issues are currently active.</div>'}
        </div>
      </section>
      <section class="two-col">
        <section class="panel">
          <h2>Total available from selected collection</h2>
          <p class="muted">These totals update immediately as ownership changes from either the Browse tab or this Collection tab.</p>
          <div class="summary-grid collection-totals-grid">
            <div class="summary-card"><div class="muted">Heroes</div><div class="metric-sm">${totals.heroCount}</div></div>
            <div class="summary-card"><div class="muted">Masterminds</div><div class="metric-sm">${totals.mastermindCount}</div></div>
            <div class="summary-card"><div class="muted">Villain Groups</div><div class="metric-sm">${totals.villainGroupCount}</div></div>
            <div class="summary-card"><div class="muted">Henchman Groups</div><div class="metric-sm">${totals.henchmanGroupCount}</div></div>
            <div class="summary-card"><div class="muted">Schemes</div><div class="metric-sm">${totals.schemeCount}</div></div>
          </div>
        </section>
        <section class="panel">
          <h2>Capacity</h2>
          <p class="muted">Warnings use the same legality checks as the setup generator, so thin or uneven collections surface immediately here.</p>
          <div class="summary-grid collection-feasibility-grid">
            ${renderCollectionFeasibility(viewModel)}
          </div>
        </section>
      </section>
      ${renderCollectionGroups(viewModel)}
    </section>
  `;
}

function renderSetupControls(viewModel) {
  const { state, ui } = viewModel;
  const availablePlayModes = getAvailablePlayModes(ui.selectedPlayerCount);
  const displayedRequirements = getDisplayedSetupRequirements({
    playerCount: ui.selectedPlayerCount,
    advancedSolo: ui.advancedSolo,
    playMode: ui.selectedPlayMode,
    currentSetup: ui.currentSetup
  });
  const playerButtons = [1, 2, 3, 4, 5].map((playerCount) => `
    <button
      class="button ${ui.selectedPlayerCount === playerCount ? 'button-primary' : 'button-secondary'}"
      data-action="set-player-count"
      data-player-count="${playerCount}"
    >
      ${playerCount}P
    </button>
  `).join('');
  const playModeButtons = availablePlayModes.map((mode) => `
    <button
      class="button ${ui.selectedPlayMode === mode.id ? 'button-primary' : 'button-secondary'}"
      data-action="set-play-mode"
      data-play-mode="${mode.id}"
      aria-pressed="${ui.selectedPlayMode === mode.id}"
      title="${mode.description}"
    >
      ${ui.selectedPlayMode === mode.id ? `${mode.label} ✓` : mode.label}
    </button>
  `).join('');

  return `
    <div class="stack gap-md">
      <div>
        <h3>Player count</h3>
        <div class="button-row">${playerButtons}</div>
      </div>
      <div>
        <h3>Play mode</h3>
        <div class="button-row">${playModeButtons}</div>
      </div>
      <div class="row wrap gap-sm align-center">
        <button class="button button-secondary" data-action="clear-setup-controls">Reset controls</button>
      </div>
      <div class="muted">${getPlayModeHelpText(ui.selectedPlayerCount, ui.selectedPlayMode)}</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="muted">Selected mode</div>
          <div class="metric-sm">${availablePlayModes.find((mode) => mode.id === ui.selectedPlayMode)?.label || 'Standard'}</div>
        </div>
        <div class="summary-card">
          <div class="muted">Owned sets</div>
          <div class="metric-sm">${state.collection.ownedSetIds.length}</div>
        </div>
        <div class="summary-card">
          <div class="muted">Last persisted mode</div>
          <div class="metric-sm">${formatPersistedPlayMode(state.preferences.lastPlayerCount, state.preferences.lastPlayMode)}</div>
        </div>
      </div>
      <div class="result-card current-requirements-card" id="setup-requirements-card">
        <h3>Setup requirements</h3>
        <div class="muted">${formatSetCountLabel(displayedRequirements.heroCount, 'Hero', 'Heroes')} · ${formatSetCountLabel(displayedRequirements.villainGroupCount, 'Villain Group')} · ${formatSetCountLabel(displayedRequirements.henchmanGroupCount, 'Henchman Group')} · ${formatSetCountLabel(displayedRequirements.wounds, 'Wound', 'Wounds')}</div>
        ${ui.selectedPlayMode === 'two-handed-solo'
          ? '<div class="muted">Two-Handed Solo uses the standard 2-player setup counts while keeping history labeled as a solo game.</div>'
          : ''}
      </div>
      ${renderForcedPickControls(viewModel)}
      <div class="button-row">
        <button class="button button-primary" data-action="generate-setup">Generate Setup</button>
        <button class="button button-secondary" data-action="regenerate-setup">Regenerate</button>
        <button class="button button-success" data-action="accept-current-setup" ${ui.currentSetup ? '' : 'disabled'}>Accept &amp; Log</button>
      </div>
      <div class="muted">Generate and Regenerate keep the current setup ephemeral. Only Accept &amp; Log updates usage stats and history.</div>
    </div>
  `;
}

function renderSetupResult(viewModel) {
  const { ui } = viewModel;
  const currentSetup = ui.currentSetup;

  if (!currentSetup) {
    return `
      <div class="stack gap-md">
        ${formatGeneratorNotices(currentSetup, ui.generatorNotices, ui.generatorError)}
        <div class="summary-grid">
          <div class="summary-card"><div class="muted">Heroes</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">Villain Groups</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">Henchman Groups</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">Wounds</div><div class="metric-sm">—</div></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="stack gap-md">
      ${formatGeneratorNotices(currentSetup, ui.generatorNotices, ui.generatorError)}
      <div class="summary-grid">
        <div class="summary-card"><div class="muted">Heroes</div><div class="metric-sm">${currentSetup.requirements.heroCount}</div></div>
        <div class="summary-card"><div class="muted">Villain Groups</div><div class="metric-sm">${currentSetup.requirements.villainGroupCount}</div></div>
        <div class="summary-card"><div class="muted">Henchman Groups</div><div class="metric-sm">${currentSetup.requirements.henchmanGroupCount}</div></div>
        <div class="summary-card"><div class="muted">Wounds</div><div class="metric-sm">${currentSetup.requirements.wounds}</div></div>
      </div>
      <div class="result-card" data-result-section="mastermind">
        <h3>Mastermind</h3>
        <div><strong>${currentSetup.mastermind.name}</strong></div>
        <div class="muted">${formatMastermindLeadLabel(currentSetup.mastermind)}</div>
        ${currentSetup.mastermind.leadEntity ? '<div class="pill">★ Mandatory lead</div>' : ''}
        ${currentSetup.mastermind.notes.length ? `<div class="muted">${currentSetup.mastermind.notes.join(' ')}</div>` : ''}
      </div>
      <div class="result-card" data-result-section="scheme">
        <h3>Scheme</h3>
        <div><strong>${currentSetup.scheme.name}</strong></div>
        <div class="muted">Mode: ${currentSetup.template.modeLabel} · Bystanders: ${currentSetup.requirements.bystanders}</div>
        ${currentSetup.scheme.notes.length ? `<div class="notice info">⚠ Special: ${currentSetup.scheme.notes.join(' ')}</div>` : ''}
      </div>
      <div class="result-card" data-result-section="heroes">
        <h3>Heroes</h3>
        <div class="new-game-hero-grid">${renderHeroResultCards(currentSetup.heroes)}</div>
      </div>
      <div class="result-card" data-result-section="villain-groups">
        <h3>Villain Groups</h3>
        <ul class="clean result-list">${formatSetupGroupList(currentSetup.villainGroups)}</ul>
      </div>
      <div class="result-card" data-result-section="henchman-groups">
        <h3>Henchman Groups</h3>
        <ul class="clean result-list">${formatSetupGroupList(currentSetup.henchmanGroups)}</ul>
      </div>
      <details>
        <summary>Show history-ready setup snapshot</summary>
        <pre>${JSON.stringify(currentSetup.setupSnapshot, null, 2)}</pre>
      </details>
    </div>
  `;
}

function renderHistoryPanel(viewModel) {
  const { bundle, state, ui } = viewModel;
  const indicators = summarizeUsageIndicators(bundle.runtime, state);
  const resetPreview = buildFullResetPreview();
  return `
    <section class="stack gap-md">
      <section class="panel">
        <h2>Used card tracking</h2>
        <div class="stack gap-sm history-usage-indicators">
          ${indicators.map((indicator) => `
            <article class="summary-card history-usage-row" data-usage-category="${indicator.category}">
              <div>
                <strong>${indicator.label}</strong>
                <div class="muted">Never played: ${indicator.neverPlayed}/${indicator.total}</div>
              </div>
              <button class="button button-secondary" data-action="reset-usage" data-category="${indicator.category}">Reset ${indicator.label}</button>
            </article>
          `).join('')}
        </div>
        <p class="muted">Lowest-play reuse activates automatically when a category runs out of never-played options.</p>
        <div class="muted">Reset preview: ${resetPreview.history.length} history entries, ${resetPreview.collection.ownedSetIds.length} owned sets, and clean usage buckets after a full reset.</div>
        <div class="button-row">
          <button class="button button-danger" data-action="request-reset-all-state">Full Reset — Clear all data</button>
        </div>
      </section>
      <section class="panel">
        <h2>Game history</h2>
        ${state.history.length
          ? state.history.map((record) => formatHistoryEntry(record, bundle)).join('')
          : '<p class="muted empty-state">No accepted games have been logged yet.</p>'}
      </section>
    </section>
  `;
}

function renderTabPanels(viewModel) {
  return {
    browse: renderBrowsePanel(viewModel),
    collection: renderCollectionPanel(viewModel),
    'new-game': `
      <section class="two-col shell-two-col">
        <section class="panel">
          <h2>Setup engine preview</h2>
          ${renderSetupControls(viewModel)}
        </section>
        <section class="panel">
          <h2>Generated setup result</h2>
          ${renderSetupResult(viewModel)}
        </section>
      </section>
    `,
    history: renderHistoryPanel(viewModel)
  };
}

function bindActionButtons(doc, actions) {
  doc.querySelectorAll('[data-action="toggle-owned-set"]').forEach((button) => {
    button.addEventListener('click', () => actions.toggleOwnedSet(button.dataset.setId));
  });

  doc.querySelectorAll('[data-action="reset-usage"]').forEach((button) => {
    button.addEventListener('click', () => actions.resetUsageCategory(button.dataset.category));
  });

  doc.querySelectorAll('[data-action="set-browse-type-filter"]').forEach((button) => {
    button.addEventListener('click', () => actions.setBrowseTypeFilter(button.dataset.typeFilter));
  });

  doc.querySelectorAll('[data-action="toggle-browse-set-expanded"]').forEach((button) => {
    button.addEventListener('click', () => actions.toggleBrowseSetExpanded(button.dataset.setId));
  });

  doc.querySelectorAll('[data-action="set-player-count"]').forEach((button) => {
    button.addEventListener('click', () => actions.setPlayerCount(Number(button.dataset.playerCount)));
  });

  doc.querySelectorAll('[data-action="set-play-mode"]').forEach((button) => {
    button.addEventListener('click', () => actions.setPlayMode(button.dataset.playMode));
  });

  doc.querySelectorAll('[data-action="add-forced-pick"]').forEach((button) => {
    button.addEventListener('click', () => {
      const select = doc.querySelector(`[data-forced-pick-select="${button.dataset.field}"]`);
      actions.addForcedPick(button.dataset.field, select?.value || '');
    });
  });

  doc.querySelectorAll('[data-action="remove-forced-pick"]').forEach((button) => {
    button.addEventListener('click', () => actions.removeForcedPick(button.dataset.field, button.dataset.entityId));
  });

  doc.querySelectorAll('[data-action="select-tab"]').forEach((button) => {
    button.addEventListener('click', () => actions.selectTab(button.dataset.tabId));
    button.addEventListener('keydown', (event) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        actions.handleTabKeydown(button.dataset.tabId, event.key);
      }
    });
  });

  doc.querySelectorAll('[data-action="jump-tab"]').forEach((button) => {
    button.addEventListener('click', () => actions.selectTab(button.dataset.tabId));
  });

  doc.querySelectorAll('[data-action="open-onboarding-tab"]').forEach((button) => {
    button.addEventListener('click', () => actions.openOnboardingTab(button.dataset.tabId));
  });

  const browseSearchInput = doc.getElementById('browse-search-input');
  if (browseSearchInput) {
    browseSearchInput.addEventListener('input', (event) => actions.setBrowseSearchTerm(event.target.value));
  }

  const buttonHandlers = {
    'request-reset-owned-collection': actions.requestResetOwnedCollection,
    'cancel-reset-owned-collection': actions.cancelResetOwnedCollection,
    'confirm-reset-owned-collection': actions.confirmResetOwnedCollection,
    'request-reset-all-state': actions.requestResetAllState,
    'cancel-reset-all-state': actions.cancelResetAllState,
    'confirm-reset-all-state': actions.resetAllState,
    'toggle-about-panel': actions.toggleAboutPanel,
    'start-onboarding': actions.startOnboarding,
    'previous-onboarding-step': actions.previousOnboardingStep,
    'next-onboarding-step': actions.nextOnboardingStep,
    'skip-onboarding': actions.skipOnboarding,
    'complete-onboarding': actions.completeOnboarding,
    'clear-forced-picks': actions.clearForcedPicks,
    'generate-setup': actions.generateSetup,
    'regenerate-setup': actions.regenerateSetup,
    'accept-current-setup': actions.acceptCurrentSetup,
    'clear-setup-controls': actions.clearToDefaults,
    'corrupt-saved-state': actions.corruptSavedState,
    'inject-invalid-owned-set': actions.injectInvalidOwnedSet
  };

  doc.querySelectorAll('[data-action]').forEach((button) => {
    const handler = buttonHandlers[button.dataset.action];
    if (handler) {
      button.addEventListener('click', () => handler());
    }
  });

  const dismissButtons = [...doc.querySelectorAll('[data-action="dismiss-toast"]')];
  dismissButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const fallbackButton = dismissButtons[index + 1] || dismissButtons[index - 1] || null;
      actions.dismissToast(button.dataset.toastId, {
        focusToastId: fallbackButton?.dataset.toastId || null
      });
    });
  });

  doc.querySelectorAll('[data-toast-dismiss-on-click="true"]').forEach((toast) => {
    toast.addEventListener('click', (event) => {
      if (event.target.closest('[data-action="dismiss-toast"]')) {
        return;
      }
      actions.dismissToast(toast.dataset.toastId);
    });
  });

  doc.querySelectorAll('[data-toast-auto-dismiss="true"]').forEach((toast) => {
    toast.addEventListener('mouseenter', () => actions.pauseToastDismissal(toast.dataset.toastId));
    toast.addEventListener('mouseleave', () => actions.resumeToastDismissal(toast.dataset.toastId));
    toast.addEventListener('focusin', () => actions.pauseToastDismissal(toast.dataset.toastId));
    toast.addEventListener('focusout', () => actions.resumeToastDismissal(toast.dataset.toastId));
  });

  const modalDialog = doc.querySelector('#modal-root [role="dialog"]');
  if (modalDialog) {
    modalDialog.addEventListener('keydown', (event) => {
      const focusables = [...modalDialog.querySelectorAll('button:not([disabled])')];
      if (event.key === 'Escape') {
        event.preventDefault();
        const cancelButton = modalDialog.querySelector('[data-modal-focus="cancel"]');
        cancelButton?.click();
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const confirmButton = modalDialog.querySelector('[data-modal-focus="confirm"]');
        confirmButton?.click();
        return;
      }
      if (event.key === 'Tab' && focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
}

export function renderBundle(doc, viewModel, actions) {
  const activeTabId = normalizeSelectedTab(viewModel.ui.selectedTab);
  const panelMarkup = renderTabPanels(viewModel);
  const onboardingMarkup = renderOnboardingShell(viewModel);

  doc.getElementById('app-title').textContent = 'Legendary: Marvel Randomizer';
  doc.getElementById('app-subtitle').textContent = 'Browse sets, manage your collection, generate legal setups, and track history with browser-based persistence.';
  doc.getElementById('desktop-tabs').innerHTML = renderTabButtons(activeTabId, 'desktop');
  doc.getElementById('mobile-tabs').innerHTML = renderTabButtons(activeTabId, 'mobile');

  APP_TABS.forEach((tab) => {
    const panel = doc.getElementById(`panel-${tab.id}`);
    panel.innerHTML = panelMarkup[tab.id];
    panel.hidden = tab.id !== activeTabId;
    panel.setAttribute('aria-labelledby', `tab-desktop-${tab.id} tab-mobile-${tab.id}`);
  });

  doc.getElementById('diagnostics-shell').innerHTML = onboardingMarkup;
  doc.getElementById('diagnostics-shell').hidden = !onboardingMarkup;
  doc.getElementById('toast-region').innerHTML = renderToastRegion(viewModel);
  doc.getElementById('modal-root').innerHTML = renderActiveModal(viewModel);

  bindActionButtons(doc, actions);
}

export function renderInitializationError(doc, error) {
  doc.getElementById('diagnostics-shell').hidden = false;
  doc.getElementById('diagnostics-shell').innerHTML = `
    <section class="panel">
      <h2>Initialization status</h2>
      <p class="error">Initialization failed: ${error.message}</p>
      <pre>${error.stack || String(error)}</pre>
    </section>
  `;
}
