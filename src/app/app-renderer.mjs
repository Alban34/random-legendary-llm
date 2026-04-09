import { APP_TABS, normalizeSelectedTab } from './app-tabs.mjs';

const USAGE_LABELS = {
  heroes: 'Heroes',
  masterminds: 'Masterminds',
  villainGroups: 'Villain Groups',
  henchmanGroups: 'Henchman Groups',
  schemes: 'Schemes'
};

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
  const indexes = bundle.runtime.indexes;
  const heroNames = record.setupSnapshot.heroIds.map((id) => indexes.heroesById[id].name).join(', ');
  const villainNames = record.setupSnapshot.villainGroupIds.map((id) => indexes.villainGroupsById[id].name).join(', ');
  const henchmanNames = record.setupSnapshot.henchmanGroupIds.map((id) => indexes.henchmanGroupsById[id].name).join(', ');

  return `
    <details class="history-item">
      <summary>
        <strong>${indexes.mastermindsById[record.setupSnapshot.mastermindId].name}</strong>
        <span class="pill">${record.playerCount} player${record.playerCount === 1 ? '' : 's'}</span>
        ${record.advancedSolo ? '<span class="pill">Advanced Solo</span>' : ''}
      </summary>
      <div class="history-meta muted">Accepted ${new Date(record.createdAt).toLocaleString()}</div>
      <div class="history-meta"><strong>Scheme:</strong> ${indexes.schemesById[record.setupSnapshot.schemeId].name}</div>
      <div class="history-meta"><strong>Heroes:</strong> ${heroNames}</div>
      <div class="history-meta"><strong>Villain Groups:</strong> ${villainNames}</div>
      <div class="history-meta"><strong>Henchman Groups:</strong> ${henchmanNames}</div>
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

function renderBrowsePanel(viewModel) {
  const { bundle, state } = viewModel;
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
  const ownedSetIds = new Set(state.collection.ownedSetIds);

  return `
    <section class="stack gap-md">
      <section class="grid">${metrics.map(([label, value]) => `
        <article class="panel metric-card">
          <div class="muted">${label}</div>
          <div class="metric">${value}</div>
        </article>
      `).join('')}</section>
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
      <section class="two-col">
        <section class="panel">
          <h2>Browse sets</h2>
          <p class="muted">This foundation shell already uses the normalized runtime data to render collection-ready set cards.</p>
          <div class="grid collection-grid">
            ${bundle.source.sets.map((set) => `
              <article class="panel panel-inline set-card ${ownedSetIds.has(set.id) ? 'owned' : ''}">
                <div class="row space-between gap-sm wrap">
                  <div>
                    <strong>${set.name}</strong>
                    <div class="muted">${set.year} · ${set.type}</div>
                    <div class="muted">${set.heroes.length} heroes · ${set.masterminds.length} masterminds · ${set.schemes.length} schemes</div>
                  </div>
                  <button class="button ${ownedSetIds.has(set.id) ? 'button-success' : 'button-secondary'}" data-action="toggle-owned-set" data-set-id="${set.id}">
                    ${ownedSetIds.has(set.id) ? 'Owned' : 'Add to owned'}
                  </button>
                </div>
              </article>
            `).join('')}
          </div>
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
    </section>
  `;
}

function renderCollectionPanel(viewModel) {
  const { bundle, state, persistence, ui } = viewModel;
  const persistenceNotices = [
    ...persistence.hydrateNotices,
    ...persistence.updateNotices
  ];

  return `
    <section class="stack gap-md">
      <section class="panel">
        <h2>Collection and persistence status</h2>
        <div class="stack gap-sm">
          <div class="summary-grid">
            <div class="summary-card">
              <div class="muted">Storage availability</div>
              <div class="metric-sm">${persistence.storageAvailable ? 'Available' : 'Unavailable'}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Hydrated from storage</div>
              <div class="metric-sm">${persistence.hydratedFromStorage ? 'Yes' : 'Defaults'}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Recovered on load</div>
              <div class="metric-sm">${persistence.recoveredOnLoad ? 'Yes' : 'No'}</div>
            </div>
            <div class="summary-card">
              <div class="muted">Owned sets</div>
              <div class="metric-sm">${state.collection.ownedSetIds.length}</div>
            </div>
          </div>
          <div class="summary-card">
            <div><strong>Last save result:</strong> ${persistence.lastSaveMessage || 'No write attempted yet.'}</div>
            ${ui.lastActionNotice ? `<div class="muted">Latest action: ${ui.lastActionNotice}</div>` : ''}
          </div>
          ${persistenceNotices.length
            ? persistenceNotices.map((notice) => `<div class="notice warning">${notice}</div>`).join('')
            : '<div class="notice success">No storage recovery issues are currently active.</div>'}
        </div>
      </section>
      <section class="two-col">
        <section class="panel">
          <h2>Usage statistics summary</h2>
          <div class="summary-grid">
            ${Object.entries(USAGE_LABELS).map(([category, label]) => {
              const usedCount = Object.keys(state.usage[category]).length;
              const totalCount = category === 'heroes'
                ? bundle.runtime.indexes.allHeroes.length
                : category === 'masterminds'
                  ? bundle.runtime.indexes.allMasterminds.length
                  : category === 'villainGroups'
                    ? bundle.runtime.indexes.allVillainGroups.length
                    : category === 'henchmanGroups'
                      ? bundle.runtime.indexes.allHenchmanGroups.length
                      : bundle.runtime.indexes.allSchemes.length;
              return `
                <div class="summary-card">
                  <div class="muted">${label}</div>
                  <div class="metric-sm">${usedCount}</div>
                  <div class="muted">tracked · ${totalCount - usedCount} never-played</div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
        <section class="panel">
          <h2>Collection notes</h2>
          <p class="muted">Epic 5 and Epic 6 will deepen this tab with grouped collection controls, filters, and richer capacity indicators. For now, it already reflects the live persisted owned-set state from Epic 2.</p>
          <ul class="clean note-list">
            <li class="summary-card">Selected-tab persistence is active through <code>state.preferences.selectedTab</code>.</li>
            <li class="summary-card">Owned-set toggles stay synchronized because all tabs read from the same hydrated root state.</li>
            <li class="summary-card">Usage totals already reflect accepted setups from Epic 2 and Epic 3.</li>
          </ul>
        </section>
      </section>
    </section>
  `;
}

function renderSetupControls(viewModel) {
  const { state, ui } = viewModel;
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
        <button class="button ${ui.advancedSolo ? 'button-primary' : 'button-secondary'}" data-action="toggle-advanced-solo">
          ${ui.advancedSolo ? 'Advanced Solo ✓' : 'Advanced Solo'}
        </button>
        <button class="button button-secondary" data-action="clear-setup-controls">Reset controls</button>
      </div>
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
      <div class="button-row">
        <button class="button button-primary" data-action="generate-setup">Generate Setup</button>
        <button class="button button-secondary" data-action="regenerate-setup">Regenerate</button>
        <button class="button button-success" data-action="accept-current-setup">Accept &amp; Log</button>
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
      <div class="result-card">
        <h3>Mastermind</h3>
        <div><strong>${currentSetup.mastermind.name}</strong></div>
        <div class="muted">${currentSetup.mastermind.leadEntity ? `Lead: ${currentSetup.mastermind.leadEntity.name} (${currentSetup.mastermind.lead.category})` : 'No mandatory lead'}</div>
        ${currentSetup.mastermind.notes.length ? `<div class="muted">${currentSetup.mastermind.notes.join(' ')}</div>` : ''}
      </div>
      <div class="result-card">
        <h3>Scheme</h3>
        <div><strong>${currentSetup.scheme.name}</strong></div>
        <div class="muted">Mode: ${currentSetup.template.modeLabel} · Bystanders: ${currentSetup.requirements.bystanders}</div>
        ${currentSetup.scheme.notes.length ? `<div class="muted">${currentSetup.scheme.notes.join(' ')}</div>` : ''}
      </div>
      <div class="result-card">
        <h3>Heroes</h3>
        <div class="entity-chip-row">${formatEntityCards(currentSetup.heroes)}</div>
      </div>
      <div class="result-card">
        <h3>Villain Groups</h3>
        <ul class="clean result-list">${formatSetupGroupList(currentSetup.villainGroups)}</ul>
      </div>
      <div class="result-card">
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
  const { bundle, state } = viewModel;
  return `
    <section class="stack gap-md">
      <section class="panel">
        <h2>Accepted game history</h2>
        ${state.history.length
          ? state.history.map((record) => formatHistoryEntry(record, bundle)).join('')
          : '<p class="muted empty-state">No accepted games have been logged yet.</p>'}
      </section>
      <section class="panel">
        <h2>Usage and reset actions</h2>
        <div class="stack gap-md">
          <div>
            <h3>Persistence demo actions</h3>
            <div class="button-row">
              <button class="button button-secondary" data-action="corrupt-saved-state">Write corrupted JSON</button>
              <button class="button button-secondary" data-action="inject-invalid-owned-set">Write invalid owned set ID</button>
              <button class="button button-danger" data-action="reset-all-state">Reset all state</button>
            </div>
          </div>
          <div>
            <h3>Per-category usage resets</h3>
            <div class="button-row">
              ${Object.entries(USAGE_LABELS).map(([category, label]) => `
                <button class="button button-secondary" data-action="reset-usage" data-category="${category}">${label}</button>
              `).join('')}
            </div>
          </div>
          <p class="muted">Use the storage corruption actions, then reload the page, to verify the Epic 2 recovery behavior. Use Generate / Regenerate / Accept &amp; Log in the New Game tab to exercise the Epic 3 engine.</p>
        </div>
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
        : '<p class="status-pass">Epic 1 data foundation, Epic 2 persistence, Epic 3 setup generation, and Epic 4 shell/navigation are loaded successfully.</p>'}</div>
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

  const buttonHandlers = {
    'toggle-advanced-solo': actions.toggleAdvancedSolo,
    'generate-setup': actions.generateSetup,
    'regenerate-setup': actions.regenerateSetup,
    'accept-current-setup': actions.acceptCurrentSetup,
    'clear-setup-controls': actions.clearToDefaults,
    'reset-all-state': actions.resetAllState,
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

  doc.getElementById('app-title').textContent = 'Legendary: Marvel Randomizer — Epic 4 Foundation';
  doc.getElementById('app-subtitle').textContent = 'This milestone expands the current implementation into a real tabbed application shell with responsive navigation, persistent active-tab state, reusable UI primitives, and a developer diagnostics area outside the main workflow tabs.';
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
