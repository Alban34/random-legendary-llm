function formatDuplicateEntries(bundle) {
  return ['Black Widow', 'Loki', 'Thor', 'Nova', 'Venom']
    .map((name) => {
      const heroes = bundle.runtime.indexes.allHeroes.filter((entity) => entity.name === name);
      const masterminds = bundle.runtime.indexes.allMasterminds.filter((entity) => entity.name === name);
      return { name, all: [...heroes, ...masterminds] };
    })
    .filter((entry) => entry.all.length > 1);
}

export function renderBundle(doc, bundle) {
  const metrics = [
    ['Sets', bundle.counts.sets],
    ['Heroes', bundle.counts.heroes],
    ['Masterminds', bundle.counts.masterminds],
    ['Villain Groups', bundle.counts.villainGroups],
    ['Henchman Groups', bundle.counts.henchmanGroups],
    ['Schemes', bundle.counts.schemes]
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

  doc.getElementById('sets-preview').innerHTML = bundle.source.sets.slice(0, 12).map((set) => `
    <div class="panel panel-inline">
      <strong>${set.name}</strong>
      <div class="muted">${set.year} · ${set.type}</div>
      <div class="muted">${set.heroes.length} heroes · ${set.masterminds.length} masterminds · ${set.schemes.length} schemes</div>
    </div>
  `).join('');

  doc.getElementById('diagnostics').textContent = JSON.stringify({
    sampleLeadResolution: bundle.runtime.indexes.allMasterminds.filter((entity) => entity.lead).slice(0, 5),
    sampleForcedSchemes: bundle.runtime.indexes.allSchemes.filter((entity) => entity.forcedGroups.length || entity.modifiers.length).slice(0, 8)
  }, null, 2);

  const failed = bundle.tests.filter((test) => test.status === 'fail');
  doc.getElementById('status').innerHTML = failed.length
    ? `<p class="error">Epic 1 foundation loaded with ${failed.length} failing test(s).</p>`
    : '<p class="status-pass">Epic 1 foundation loaded successfully. All internal data checks passed.</p>';
}

export function renderInitializationError(doc, error) {
  doc.getElementById('status').innerHTML = `<p class="error">Initialization failed: ${error.message}</p>`;
  doc.getElementById('diagnostics').textContent = error.stack || String(error);
}

