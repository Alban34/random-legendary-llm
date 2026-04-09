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

function bindActionButtons(doc, actions) {
  doc.querySelectorAll('[data-action="toggle-owned-set"]').forEach((button) => {
    button.addEventListener('click', () => actions.toggleOwnedSet(button.dataset.setId));
  });

  doc.querySelectorAll('[data-action="reset-usage"]').forEach((button) => {
    button.addEventListener('click', () => actions.resetUsageCategory(button.dataset.category));
  });

  const buttonHandlers = {
    'log-sample-game': actions.logSampleAcceptedGame,
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
  const { bundle, state, persistence, ui } = viewModel;
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

  doc.getElementById('metrics').innerHTML = metrics.map(([label, value]) => `
    <article class="panel">
      <div class="muted">${label}</div>
      <div class="metric">${value}</div>
    </article>
  `).join('');

  doc.getElementById('tests').innerHTML = bundle.tests.map((test) => `
    <li class="test ${test.status}">
      <strong class="status-${test.status}">${test.status === 'pass' ? 'PASS' : 'FAIL'}</strong>
      — ${test.name}
      ${test.error ? `<div class="error">${test.error}</div>` : ''}
    </li>
  `).join('');

  doc.getElementById('duplicates').innerHTML = formatDuplicateEntries(bundle).map((entry) => `
    <details>
      <summary>${entry.name} <span class="pill">${entry.all.length} entries</span></summary>
      <pre>${entry.all.map((entity) => `${entity.id}  ←  ${entity.setId}`).join('\n')}</pre>
    </details>
  `).join('');

  const ownedSetIds = new Set(state.collection.ownedSetIds);
  doc.getElementById('collection-demo').innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="muted">Owned set count</div>
        <div class="metric-sm">${state.collection.ownedSetIds.length}</div>
      </div>
      <div class="summary-card">
        <div class="muted">Collection mode</div>
        <div class="metric-sm">${state.collection.ownedSetIds.length ? 'Persisted' : 'Using defaults'}</div>
      </div>
    </div>
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
  `;

  const persistenceNotices = [
    ...persistence.hydrateNotices,
    ...persistence.updateNotices
  ];

  doc.getElementById('persistence-summary').innerHTML = `
    <div class="stack gap-sm">
      <div class="summary-card">
        <div><strong>Storage availability:</strong> ${persistence.storageAvailable ? '<span class="status-pass">Available</span>' : '<span class="error">Unavailable</span>'}</div>
        <div class="muted">Hydrated from storage: ${persistence.hydratedFromStorage ? 'yes' : 'no (defaults)'}</div>
        <div class="muted">Recovered on load: ${persistence.recoveredOnLoad ? 'yes' : 'no'}</div>
        <div class="muted">Last save result: ${persistence.lastSaveMessage || 'No write attempted yet.'}</div>
      </div>
      ${ui.lastActionNotice ? `<div class="notice info">${ui.lastActionNotice}</div>` : ''}
      ${persistenceNotices.length ? persistenceNotices.map((notice) => `<div class="notice warning">${notice}</div>`).join('') : '<div class="notice success">No storage recovery issues are currently active.</div>'}
    </div>
  `;

  doc.getElementById('usage-summary').innerHTML = `
    <div class="summary-grid">
      ${Object.entries(USAGE_LABELS).map(([category, label]) => {
        const usedCount = Object.keys(state.usage[category]).length;
        return `
          <div class="summary-card">
            <div class="muted">${label}</div>
            <div class="metric-sm">${usedCount}</div>
            <div class="muted">tracked items</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  doc.getElementById('state-actions').innerHTML = `
    <div class="stack gap-md">
      <div>
        <h3>Persistence demo actions</h3>
        <div class="button-row">
          <button class="button button-primary" data-action="log-sample-game">Log sample accepted game</button>
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
      <p class="muted">Use the two storage corruption buttons, then reload the page, to verify Epic 2 recovery behavior in the UI.</p>
    </div>
  `;

  doc.getElementById('history-preview').innerHTML = state.history.length
    ? state.history.map((record) => formatHistoryEntry(record, bundle)).join('')
    : '<p class="muted empty-state">No accepted games have been logged yet.</p>';

  doc.getElementById('state-snapshot').textContent = JSON.stringify(state, null, 2);

  doc.getElementById('diagnostics').textContent = JSON.stringify({
    sampleLeadResolution: bundle.runtime.indexes.allMasterminds.filter((entity) => entity.lead).slice(0, 5),
    sampleForcedSchemes: bundle.runtime.indexes.allSchemes.filter((entity) => entity.forcedGroups.length || entity.modifiers.length).slice(0, 8),
    storageState: {
      storageAvailable: persistence.storageAvailable,
      recoveredOnLoad: persistence.recoveredOnLoad,
      ownedSetIds: state.collection.ownedSetIds,
      historyCount: state.history.length
    }
  }, null, 2);

  const failed = bundle.tests.filter((test) => test.status === 'fail');
  doc.getElementById('status').innerHTML = failed.length
    ? `<p class="error">Foundation loaded with ${failed.length} failing Epic 1 test(s).</p>`
    : '<p class="status-pass">Epic 1 data foundation and Epic 2 state layer loaded successfully.</p>';

  bindActionButtons(doc, actions);
}

export function renderInitializationError(doc, error) {
  doc.getElementById('status').innerHTML = `<p class="error">Initialization failed: ${error.message}</p>`;
  doc.getElementById('diagnostics').textContent = error.stack || String(error);
}
