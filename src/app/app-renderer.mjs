import { APP_TABS, normalizeSelectedTab } from './app-tabs.mjs';
import { BROWSE_TYPE_OPTIONS, filterBrowseSets, getBrowseTypeLabel, summarizeBrowseSet } from './browse-utils.mjs';
import { COLLECTION_TYPE_GROUPS, getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection } from './collection-utils.mjs';
import { buildFullResetPreview, formatHistorySummary, summarizeUsageIndicators } from './history-utils.mjs';
import { formatHeroTeamLabel, formatMastermindLeadLabel, getDisplayedSetupRequirements, isAdvancedSoloAvailable } from './new-game-utils.mjs';

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
        ${record.advancedSolo ? '<span class="pill">Advanced Solo</span>' : ''}
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
      ${group.forced ? `<span class="pill">Forced by ${group.forcedBy === 'mastermind' ? 'Mastermind lead' : 'Scheme'}</span>` : ''}
    </li>
  `).join('');
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

function formatSetCountLabel(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
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
    ['Sets', bundle.counts.sets],
    ['Heroes', bundle.counts.heroes],
    ['Masterminds', bundle.counts.masterminds],
    ['Villain Groups', bundle.counts.villainGroups],
    ['Henchman Groups', bundle.counts.henchmanGroups],
    ['Schemes', bundle.counts.schemes],
    ['Owned Sets', state.collection.ownedSetIds.length],
    ['History Records', state.history.length]
  ];
  const browseSets = filterBrowseSets(bundle.runtime.sets, {
    searchTerm: ui.browseSearchTerm,
    typeFilter: ui.browseTypeFilter
  });

  return `
    <section class="stack gap-md">
      <section class="grid">${metrics.map(([label, value]) => `
        <article class="panel metric-card">
          <div class="muted">${label}</div>
          <div class="metric">${value}</div>
        </article>
      `).join('')}</section>
      <section class="two-col">
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
        <section class="panel">
          <h2>Duplicate-name QC samples</h2>
          ${formatDuplicateEntries(bundle).map((entry) => `
            <details>
              <summary>${entry.name} <span class="pill">${entry.all.length} entries</span></summary>
              <pre>${entry.all.map((entity) => `${entity.id}  ←  ${entity.setId}`).join('\n')}</pre>
            </details>
          `).join('')}
        </section>
      </section>
      <section class="panel">
        <h2>Epic 1 Test Results</h2>
        <p class="muted">These checks validate dataset presence, ID generation, duplicate-name safety, reference resolution, runtime indexes, and representative invalid-data failure handling.</p>
        <ul class="clean">${bundle.tests.map((test) => `
          <li class="test ${test.status}">
            <strong class="status-${test.status}">${test.status === 'pass' ? 'PASS' : 'FAIL'}</strong>
            — ${test.name}
            ${test.error ? `<div class="error">${test.error}</div>` : ''}
          </li>
        `).join('')}</ul>
      </section>
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
          ${ui.confirmResetOwnedCollection ? `
            <div class="notice warning" id="collection-reset-confirmation">
              <strong>Clear all collection selections?</strong>
              <div class="muted">This clears owned sets only. Usage statistics, history, and preferences will stay intact.</div>
              <div class="button-row confirmation-actions">
                <button class="button button-danger" data-action="confirm-reset-owned-collection">Confirm reset</button>
                <button class="button button-secondary" data-action="cancel-reset-owned-collection">Cancel</button>
              </div>
            </div>
          ` : ''}
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
  const advancedSoloAvailable = isAdvancedSoloAvailable(ui.selectedPlayerCount);
  const displayedRequirements = getDisplayedSetupRequirements({
    playerCount: ui.selectedPlayerCount,
    advancedSolo: ui.advancedSolo,
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

  return `
    <div class="stack gap-md">
      <div>
        <h3>Player count</h3>
        <div class="button-row">${playerButtons}</div>
      </div>
      <div class="row wrap gap-sm align-center">
        <button class="button ${ui.advancedSolo ? 'button-primary' : 'button-secondary'} ${advancedSoloAvailable ? '' : 'button-disabled'}" data-action="toggle-advanced-solo" ${advancedSoloAvailable ? '' : 'disabled'}>
          ${ui.advancedSolo ? 'Advanced Solo ✓' : 'Advanced Solo'}
        </button>
        <button class="button button-secondary" data-action="clear-setup-controls">Reset controls</button>
      </div>
      <div class="muted">${advancedSoloAvailable ? 'Advanced Solo is available only in 1-player mode.' : 'Advanced Solo is disabled until you switch back to 1 player.'}</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="muted">Selected mode</div>
          <div class="metric-sm">${ui.advancedSolo ? 'Advanced Solo' : ui.selectedPlayerCount === 1 ? 'Standard Solo' : 'Standard'}</div>
        </div>
        <div class="summary-card">
          <div class="muted">Owned sets</div>
          <div class="metric-sm">${state.collection.ownedSetIds.length}</div>
        </div>
        <div class="summary-card">
          <div class="muted">Last persisted mode</div>
          <div class="metric-sm">${state.preferences.lastPlayerCount}P${state.preferences.lastAdvancedSolo ? ' + AS' : ''}</div>
        </div>
      </div>
      <div class="result-card current-requirements-card" id="setup-requirements-card">
        <h3>Setup requirements</h3>
        <div class="muted">${formatSetCountLabel(displayedRequirements.heroCount, 'Hero', 'Heroes')} · ${formatSetCountLabel(displayedRequirements.villainGroupCount, 'Villain Group')} · ${formatSetCountLabel(displayedRequirements.henchmanGroupCount, 'Henchman Group')} · ${formatSetCountLabel(displayedRequirements.wounds, 'Wound', 'Wounds')}</div>
      </div>
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
        ${ui.confirmResetAllState ? `
          <div class="notice warning" id="history-full-reset-confirmation">
            <strong>This will delete all game history and reset all card tracking. Are you sure?</strong>
            <div class="muted">Preview after reset: ${resetPreview.history.length} history entries, ${resetPreview.collection.ownedSetIds.length} owned sets, and clean usage buckets.</div>
            <div class="button-row confirmation-actions">
              <button class="button button-danger" data-action="confirm-reset-all-state">Confirm full reset</button>
              <button class="button button-secondary" data-action="cancel-reset-all-state">Cancel</button>
            </div>
          </div>
        ` : `
          <div class="button-row">
            <button class="button button-danger" data-action="request-reset-all-state">Full Reset — Clear all data</button>
          </div>
        `}
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

function renderDiagnosticsPanel(viewModel) {
  const { bundle, state, persistence, ui } = viewModel;
  const failed = bundle.tests.filter((test) => test.status === 'fail');

  return `
    <section class="panel">
      <h2>Initialization status</h2>
      <div id="status-message">${failed.length
        ? `<p class="error">Foundation loaded with ${failed.length} failing Epic 1 test(s).</p>`
        : '<p class="status-pass">Epic 1 data foundation, Epic 2 persistence, Epic 3 setup generation, Epic 4 shell/navigation, Epic 5 browse extensions, Epic 6 collection management, Epic 7 new-game experience, and Epic 8 history/reset flows are loaded successfully.</p>'}</div>
    </section>
    <section class="panel">
      <h2>Developer diagnostics</h2>
      <details>
        <summary>Show runtime diagnostics</summary>
        <pre>${JSON.stringify({
          sampleLeadResolution: bundle.runtime.indexes.allMasterminds.filter((entity) => entity.lead).slice(0, 5),
          sampleForcedSchemes: bundle.runtime.indexes.allSchemes.filter((entity) => entity.forcedGroups.length || entity.modifiers.length).slice(0, 8),
          storageState: {
            storageAvailable: persistence.storageAvailable,
            recoveredOnLoad: persistence.recoveredOnLoad,
            ownedSetIds: state.collection.ownedSetIds,
            historyCount: state.history.length,
            selectedTab: ui.selectedTab
          },
          currentSetup: ui.currentSetup ? ui.currentSetup.setupSnapshot : null
        }, null, 2)}</pre>
      </details>
      <details>
        <summary>Show persisted state snapshot</summary>
        <pre>${JSON.stringify(state, null, 2)}</pre>
      </details>
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

  doc.querySelectorAll('[data-action="select-tab"]').forEach((button) => {
    button.addEventListener('click', () => actions.selectTab(button.dataset.tabId));
    button.addEventListener('keydown', (event) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        actions.handleTabKeydown(button.dataset.tabId, event.key);
      }
    });
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
    'toggle-advanced-solo': actions.toggleAdvancedSolo,
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
}

export function renderBundle(doc, viewModel, actions) {
  const activeTabId = normalizeSelectedTab(viewModel.ui.selectedTab);
  const panelMarkup = renderTabPanels(viewModel);

  doc.getElementById('app-title').textContent = 'Legendary: Marvel Randomizer — Epic 8 History, Usage, and Reset';
  doc.getElementById('app-subtitle').textContent = 'The current milestone completes the History tab with readable usage indicators, expandable accepted-game summaries, per-category resets, and a confirmation-gated full reset on top of the Epic 1–7 foundations.';
  doc.getElementById('desktop-tabs').innerHTML = renderTabButtons(activeTabId, 'desktop');
  doc.getElementById('mobile-tabs').innerHTML = renderTabButtons(activeTabId, 'mobile');

  APP_TABS.forEach((tab) => {
    const panel = doc.getElementById(`panel-${tab.id}`);
    panel.innerHTML = panelMarkup[tab.id];
    panel.hidden = tab.id !== activeTabId;
    panel.setAttribute('aria-labelledby', `tab-desktop-${tab.id}`);
  });

  doc.getElementById('diagnostics-shell').innerHTML = renderDiagnosticsPanel(viewModel);

  bindActionButtons(doc, actions);
}

export function renderInitializationError(doc, error) {
  doc.getElementById('diagnostics-shell').innerHTML = `
    <section class="panel">
      <h2>Initialization status</h2>
      <p class="error">Initialization failed: ${error.message}</p>
      <pre>${error.stack || String(error)}</pre>
    </section>
  `;
}
