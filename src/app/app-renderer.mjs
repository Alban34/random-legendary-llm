import { APP_TABS, normalizeSelectedTab } from './app-tabs.mjs';
import { BROWSE_TYPE_OPTIONS, filterBrowseSets, getBrowseTypeLabel, summarizeBrowseSet } from './browse-utils.mjs';
import { COLLECTION_TYPE_GROUPS, getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection } from './collection-utils.mjs';
import { TOAST_VARIANTS } from './feedback-utils.mjs';
import { FORCED_PICK_FIELD_CONFIGS, hasForcedPicks } from './forced-picks-utils.mjs';
import {
  buildFullResetPreview,
  buildHistoryGroups,
  DEFAULT_HISTORY_GROUPING_MODE,
  formatHistorySummary,
  HISTORY_GROUPING_MODES,
  summarizeUsageIndicators
} from './history-utils.mjs';
import { getSelectableLocales } from './localization-utils.mjs';
import { formatHeroTeamLabel, formatMastermindLeadLabel, formatPersistedPlayMode, getAvailablePlayModes, getDisplayedSetupRequirements, getPlayModeHelpText } from './new-game-utils.mjs';
import { GAME_OUTCOME_OPTIONS, isCompletedGameResult } from './result-utils.mjs';
import { buildInsightsDashboard } from './stats-utils.mjs';
import { buildOwnedPools } from './setup-generator.mjs';
import { getThemeDefinition, normalizeThemeId, THEME_OPTIONS } from './theme-utils.mjs';

function formatDuplicateEntries(bundle) {
  return ['Black Widow', 'Loki', 'Thor', 'Nova', 'Venom']
    .map((name) => {
      const heroes = bundle.runtime.indexes.allHeroes.filter((entity) => entity.name === name);
      const masterminds = bundle.runtime.indexes.allMasterminds.filter((entity) => entity.name === name);
      return { name, all: [...heroes, ...masterminds] };
    })
    .filter((entry) => entry.all.length > 1);
}

function getLocale(viewModel) {
  return viewModel.locale;
}

// Legacy source markers kept for source-inspection tests:
// First-run walkthrough
// Replay Walkthrough
// About this project
// Persistent alert
// role="region" aria-label="Notifications"

function renderHistoryResultEditor(summary, ui) {
  const locale = ui.locale;
  const isPending = !isCompletedGameResult(summary.result);
  const errorMarkup = ui.resultFormError
    ? `<div class="notice warning" data-result-form-error>${escapeHtml(ui.resultFormError)}</div>`
    : '';

  return `
    <section class="result-card history-result-editor" data-result-editor="${summary.id}">
      <h3>${isPending ? locale.t('history.resultEditor.addTitle') : locale.t('history.resultEditor.editTitle')}</h3>
      <p class="muted">${isPending
        ? locale.t('history.resultEditor.pendingDescription')
        : locale.t('history.resultEditor.editDescription')}</p>
      ${errorMarkup}
      <div class="stack gap-sm">
        <label for="result-outcome-${summary.id}"><strong>${locale.t('history.resultEditor.outcome')}</strong></label>
        <select id="result-outcome-${summary.id}" class="text-input" data-result-field="outcome">
          <option value="">${locale.t('history.resultEditor.chooseOutcome')}</option>
          ${GAME_OUTCOME_OPTIONS.map((option) => `<option value="${option.id}" ${ui.resultDraft.outcome === option.id ? 'selected' : ''}>${locale.getOutcomeLabel(option.id)}</option>`).join('')}
        </select>
      </div>
      <div class="stack gap-sm">
        <label for="result-score-${summary.id}"><strong>${locale.t('history.resultEditor.score')}</strong> <span class="muted">${locale.t('history.resultEditor.scoreHint')}</span></label>
        <input id="result-score-${summary.id}" class="text-input" data-result-field="score" type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(ui.resultDraft.score)}" placeholder="0" />
      </div>
      <div class="stack gap-sm">
        <label for="result-notes-${summary.id}"><strong>${locale.t('history.resultEditor.notes')}</strong> <span class="muted">${locale.t('history.resultEditor.optional')}</span></label>
        <textarea id="result-notes-${summary.id}" class="text-input result-notes-input" data-result-field="notes" rows="3" maxlength="500" placeholder="${locale.t('history.resultEditor.notesPlaceholder')}">${escapeHtml(ui.resultDraft.notes)}</textarea>
      </div>
      <div class="button-row">
        <button type="button" class="button button-success" data-action="save-game-result">${locale.t('history.resultEditor.save')}</button>
        ${isPending ? `<button type="button" class="button button-secondary" data-action="skip-game-result">${locale.t('history.resultEditor.skip')}</button>` : ''}
        <button type="button" class="button button-secondary" data-action="cancel-result-entry">${locale.t('history.resultEditor.cancel')}</button>
      </div>
    </section>
  `;
}

function formatHistoryEntry(record, bundle, ui) {
  const locale = ui.locale;
  const summary = formatHistorySummary(record, bundle.runtime.indexes);
  const isEditing = ui.resultEditorRecordId === summary.id;
  const resultPillClass = isCompletedGameResult(summary.result)
    ? `result-pill-${summary.result.outcome}`
    : 'result-pill-pending';
  const playerLabel = locale.formatPlayerLabel(summary.playerCount);
  const modeLabel = locale.getPlayModeLabel(summary.playMode, summary.playerCount);
  const resultLabel = locale.formatResultStatus(summary.result);

  return `
    <details class="history-item" data-history-record-id="${summary.id}" ${isEditing ? 'open' : ''}>
      <summary>
        <strong>${summary.mastermindName}</strong>
        <span class="pill">${playerLabel}</span>
        <span class="pill">${modeLabel}</span>
        <span class="pill ${resultPillClass}" data-history-result-status="${summary.result.status}">${resultLabel}</span>
      </summary>
      <div class="history-meta muted">${locale.t('history.acceptedAt', { date: locale.formatDateTime(summary.createdAt), mode: modeLabel })}</div>
      <div class="history-meta"><strong>${locale.t('history.result')}</strong> ${resultLabel}</div>
      ${summary.resultNotes ? `<div class="history-meta"><strong>${locale.t('history.notes')}</strong> ${escapeHtml(summary.resultNotes)}</div>` : ''}
      ${summary.resultUpdatedAt ? `<div class="history-meta muted">${locale.t('history.lastUpdated', { date: locale.formatDateTime(summary.resultUpdatedAt) })}</div>` : ''}
      <div class="history-meta"><strong>${locale.t('history.scheme')}</strong> ${summary.schemeName}</div>
      <div class="history-meta"><strong>${locale.t('history.heroes')}</strong> ${locale.formatList(summary.heroNames)}</div>
      <div class="history-meta"><strong>${locale.t('history.villainGroups')}</strong> ${locale.formatList(summary.villainGroupNames)}</div>
      <div class="history-meta"><strong>${locale.t('history.henchmanGroups')}</strong> ${locale.formatList(summary.henchmanGroupNames)}</div>
      <div class="button-row history-result-actions">
        <button type="button" class="button button-secondary" data-action="edit-game-result" data-record-id="${summary.id}">${isCompletedGameResult(summary.result) ? locale.t('history.editResult') : locale.t('history.addResult')}</button>
      </div>
      ${isEditing ? renderHistoryResultEditor(summary, { ...ui, locale }) : ''}
    </details>
  `;
}

function renderHistoryGroupingControls(activeMode, locale) {
  return `
    <div class="stack gap-sm" data-history-grouping-controls>
      <div class="row space-between wrap gap-sm align-center">
        <strong>${locale.t('history.groupBy')}</strong>
        <span class="muted">${locale.t('history.groupingNotice')}</span>
      </div>
      <div class="button-row wrap">
        ${HISTORY_GROUPING_MODES.map((mode) => `
          <button
            type="button"
            class="button ${activeMode === mode.id ? 'button-primary' : 'button-secondary'}"
            data-action="set-history-grouping"
            data-history-grouping-mode="${mode.id}"
            aria-pressed="${activeMode === mode.id}"
          >
            ${locale.getHistoryGroupingLabel(mode.id)}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function getLocalizedHistoryGroupLabel(group, locale) {
  if (group.mode === 'player-count') {
    return locale.formatPlayerLabel(Number(group.id.split(':')[1] || 0));
  }

  if (group.mode === 'play-mode') {
    const playMode = group.id.split(':')[1] || 'standard';
    return locale.getPlayModeLabel(playMode, playMode === 'standard' ? 2 : 1);
  }

  if (group.mode === 'none') {
    return locale.t('history.group.allGames');
  }

  return group.label;
}

function renderGroupedHistory(viewModel) {
  const { bundle, state, ui } = viewModel;
  const locale = getLocale(viewModel);
  const groupingMode = ui.historyGroupingMode || DEFAULT_HISTORY_GROUPING_MODE;
  const groups = buildHistoryGroups(state.history, bundle.runtime.indexes, { mode: groupingMode });

  if (!state.history.length) {
    return `<p class="muted empty-state">${locale.t('history.empty')}</p>`;
  }

  if (groupingMode === 'none') {
    return groups[0].records.map((summary) => {
      const record = state.history.find((entry) => entry.id === summary.id);
      return formatHistoryEntry(record, bundle, { ...ui, locale });
    }).join('');
  }

  return groups.map((group, index) => `
    <details class="history-group" data-history-group-id="${group.id}" data-history-grouping-mode="${group.mode}" ${index === 0 || group.records.some((record) => record.id === ui.resultEditorRecordId) ? 'open' : ''}>
      <summary>
        <span class="history-group-title">${escapeHtml(getLocalizedHistoryGroupLabel(group, locale))}</span>
        <span class="pill">${locale.formatGameCount(group.count)}</span>
      </summary>
      <div class="stack gap-sm history-group-records">
        ${group.records.map((summary) => {
          const record = state.history.find((entry) => entry.id === summary.id);
          return formatHistoryEntry(record, bundle, { ...ui, locale });
        }).join('')}
      </div>
    </details>
  `).join('');
}

function formatGeneratorNotices(currentSetup, generatorNotices, generatorError, locale) {
  if (generatorError) {
    return `<div class="notice warning">${generatorError}</div>`;
  }

  if (!currentSetup) {
    return `<div class="notice info">${locale.t('newGame.generator.previewNotice')}</div>`;
  }

  if (!generatorNotices.length) {
    return `<div class="notice success">${locale.t('newGame.generator.freshNotice')}</div>`;
  }

  return generatorNotices.map((notice) => `<div class="notice info">${notice}</div>`).join('');
}

function formatForcedBy(forcedBy, locale) {
  const values = Array.isArray(forcedBy) ? forcedBy : [forcedBy];
  return locale.formatList(values.map((value) => {
    if (value === 'mastermind') {
      return locale.t('newGame.forcedPicks.reason.mastermind');
    }
    if (value === 'scheme') {
      return locale.t('newGame.forcedPicks.reason.scheme');
    }
    return locale.t('newGame.forcedPicks.reason.default');
  }));
}

function formatSetupGroupList(groups, locale) {
  return groups.map((group) => `
    <li class="result-list-item">
      <span>${group.name}</span>
      ${group.forced ? `<span class="pill">${locale.t('newGame.forcedPicks.forcedBy', { value: formatForcedBy(group.forcedBy, locale) })}</span>` : ''}
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
  const locale = getLocale(viewModel);
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
        <label for="forced-pick-${config.field}"><strong>${locale.t(`newGame.forcedPicks.field.${config.field}`)}</strong></label>
        <div class="button-row wrap">
          <select id="forced-pick-${config.field}" data-forced-pick-select="${config.field}" ${availableOptions.length ? '' : 'disabled'}>
            <option value="">${locale.t('newGame.forcedPicks.choose', { label: locale.t(`newGame.forcedPicks.field.${config.field}`).toLowerCase() })}</option>
            ${availableOptions.map((entity) => `<option value="${entity.id}">${escapeHtml(entity.name)}</option>`).join('')}
          </select>
          <button
            type="button"
            class="button button-secondary"
            data-action="add-forced-pick"
            data-field="${config.field}"
            ${availableOptions.length ? '' : 'disabled'}
          >
            ${config.multi
              ? locale.t('newGame.forcedPicks.add', { label: locale.t(`newGame.forcedPicks.field.${config.field}`) })
              : locale.t('newGame.forcedPicks.set', { label: locale.t(`newGame.forcedPicks.field.${config.field}`) })}
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
          <span><strong>${locale.t(`newGame.forcedPicks.field.${config.field}`)}:</strong> ${escapeHtml(label)}</span>
          <button type="button" class="button button-secondary" data-action="remove-forced-pick" data-field="${config.field}" data-entity-id="${id}">${locale.t('newGame.forcedPicks.remove')}</button>
        </li>
      `;
    });
  }).join('');

  return `
    <section class="result-card" data-forced-picks-panel>
      <h3>${locale.t('newGame.forcedPicks.title')}</h3>
      <div class="muted">${locale.t('newGame.forcedPicks.description')}</div>
      <div class="stack gap-md">${controlMarkup}</div>
      <div class="stack gap-sm">
        <div class="row space-between wrap gap-sm align-center">
          <strong>${locale.t('newGame.forcedPicks.activeConstraints')}</strong>
          <button type="button" class="button button-secondary" data-action="clear-forced-picks" ${hasActiveForcedPicks ? '' : 'disabled'}>${locale.t('newGame.forcedPicks.clearAll')}</button>
        </div>
        ${hasActiveForcedPicks
          ? `<ul class="clean result-list">${activeMarkup}</ul>`
          : `<p class="muted empty-state">${locale.t('newGame.forcedPicks.none')}</p>`}
      </div>
    </section>
  `;
}

function formatEntityCards(entities) {
  return entities.map((entity) => `<span class="entity-chip">${entity.name}</span>`).join('');
}

function renderHeroResultCards(heroes, locale) {
  return heroes.map((hero) => `
    <article class="result-card hero-result-card" data-hero-id="${hero.id}">
      <h3>${hero.name}</h3>
      <div class="muted">${hero.teams && hero.teams.length ? hero.teams.join(' · ') : locale.t('common.noTeamListed')}</div>
    </article>
  `).join('');
}

function formatInsightMetric(value, { suffix = '', fallback = '—' } = {}) {
  if (value === null || value === undefined) {
    return fallback;
  }

  return `${value}${suffix}`;
}

function renderInsightRankingList(entries, emptyCopy, locale) {
  if (!entries.length) {
    return `<p class="muted empty-state">${emptyCopy}</p>`;
  }

  return `
    <ul class="clean result-list insight-ranking-list">
      ${entries.map((entry) => `
        <li class="result-list-item insight-ranking-item">
          <span>
            <strong>${escapeHtml(entry.label)}</strong>
            <span class="muted insight-ranking-meta">${entry.lastPlayedAt
              ? locale.t('history.insights.lastUsed', { date: locale.formatDate(entry.lastPlayedAt) })
              : locale.t('history.insights.noPlayDate')}</span>
          </span>
          <span class="pill">${locale.formatPlayCount(entry.plays)}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderCoverageList(entries, percentKey, locale) {
  return `
    <ul class="clean result-list insight-coverage-list">
      ${entries.map((entry) => `
        <li class="result-list-item insight-coverage-item" data-insight-coverage-category="${entry.category}">
          <span>
            <strong>${entry.label}</strong>
            <span class="muted insight-ranking-meta">${locale.t('history.coverage.playedSummary', { played: locale.formatNumber(entry.played), total: locale.formatNumber(entry.total) })}</span>
          </span>
          <span class="pill">${formatInsightMetric(entry[percentKey], { suffix: '%' })}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderBackupPreview(ui, locale) {
  if (ui.backupImportError) {
    return `
      <div class="notice warning" data-backup-import-error>
        ${escapeHtml(ui.backupImportError)}
      </div>
    `;
  }

  if (!ui.stagedBackup) {
    return '';
  }

  const { summary, fileName, payload } = ui.stagedBackup;
  const usageLines = [
    ['Heroes', summary.usageCounts.heroes],
    ['Masterminds', summary.usageCounts.masterminds],
    ['Villain Groups', summary.usageCounts.villainGroups],
    ['Henchman Groups', summary.usageCounts.henchmanGroups],
    ['Schemes', summary.usageCounts.schemes]
  ];

  return `
    <article class="result-card" data-backup-preview>
      <div class="row space-between wrap gap-sm align-center">
        <div>
          <h3>${locale.t('backup.previewTitle')}</h3>
          <div class="muted">${escapeHtml(fileName)} · ${locale.t('backup.exportedAt', { date: locale.formatDateTime(payload.exportedAt) })}</div>
        </div>
        <span class="pill">v${payload.version}</span>
      </div>
      <div class="summary-grid">
        <div class="summary-card"><div class="muted">${locale.t('backup.summary.ownedSets')}</div><div class="metric-sm">${summary.ownedSetCount}</div></div>
        <div class="summary-card"><div class="muted">${locale.t('backup.summary.historyRecords')}</div><div class="metric-sm">${summary.historyCount}</div></div>
        <div class="summary-card"><div class="muted">${locale.t('backup.summary.theme')}</div><div class="metric-sm">${escapeHtml(summary.themeId)}</div></div>
        <div class="summary-card"><div class="muted">${locale.t('backup.summary.lastMode')}</div><div class="metric-sm">${escapeHtml(summary.playMode)}</div></div>
      </div>
      <div class="muted">${locale.t('backup.summary.usageEntries', { value: usageLines.map(([label, count]) => `${label} ${count}`).join(' · ') })}</div>
      <div class="muted">${locale.t('backup.mergeReplaceDescription')}</div>
      <div class="button-row">
        <button type="button" class="button button-primary" data-action="request-merge-backup">${locale.t('backup.merge')}</button>
        <button type="button" class="button button-danger" data-action="request-replace-backup">${locale.t('backup.replace')}</button>
        <button type="button" class="button button-secondary" data-action="cancel-backup-preview">${locale.t('backup.discardPreview')}</button>
      </div>
    </article>
  `;
}

function renderInsightsDashboard(viewModel) {
  const locale = getLocale(viewModel);
  const dashboard = buildInsightsDashboard(viewModel.bundle.runtime, viewModel.state, { limit: 3 });
  const { outcome, usage, freshness, collectionCoverage } = dashboard;
  const scoredWindow = Math.min(outcome.scoredGames, 5);

  let helperCopy = locale.t('history.insights.helper.unlockTrends');
  if (outcome.totalGames === 0) {
    helperCopy = locale.t('history.insights.helper.noGames');
  } else if (outcome.completedResults === 0) {
    helperCopy = locale.t('history.insights.helper.pendingOnly');
  } else if (outcome.scoredGames === 0) {
    helperCopy = locale.t('history.insights.helper.noScores');
  } else if (outcome.scoredGames === 1) {
    helperCopy = locale.t('history.insights.helper.oneScore');
  } else {
    helperCopy = locale.t('history.insights.helper.recentAverage', {
      count: locale.formatNumber(scoredWindow),
      gameWord: scoredWindow === 1 ? locale.t('common.game') : locale.t('common.games'),
      score: formatInsightMetric(outcome.recentAverageScore)
    });
  }

  return `
    <section class="panel" data-history-insights>
      <div class="row space-between wrap gap-md align-center">
        <div>
          <h2>${locale.t('history.insights.title')}</h2>
          <p class="muted">${locale.t('history.insights.description')}</p>
        </div>
        <div class="muted insight-outcome-summary">${locale.t('history.insights.summary', { wins: locale.formatNumber(outcome.wins), losses: locale.formatNumber(outcome.losses), pending: locale.formatNumber(outcome.pendingResults), scored: locale.formatNumber(outcome.scoredGames) })}</div>
      </div>
      <div class="summary-grid insight-summary-grid">
        <article class="summary-card" data-insight-card="games-logged">
          <div class="muted">${locale.t('history.insights.gamesLogged')}</div>
          <div class="metric-sm">${outcome.totalGames}</div>
        </article>
        <article class="summary-card" data-insight-card="win-rate">
          <div class="muted">${locale.t('history.insights.winRate')}</div>
          <div class="metric-sm">${formatInsightMetric(outcome.winRate, { suffix: '%' })}</div>
        </article>
        <article class="summary-card" data-insight-card="pending-results">
          <div class="muted">${locale.t('history.insights.pendingResults')}</div>
          <div class="metric-sm">${outcome.pendingResults}</div>
        </article>
        <article class="summary-card" data-insight-card="average-score">
          <div class="muted">${locale.t('history.insights.averageScore')}</div>
          <div class="metric-sm">${formatInsightMetric(outcome.averageScore)}</div>
        </article>
        <article class="summary-card" data-insight-card="best-score">
          <div class="muted">${locale.t('history.insights.bestScore')}</div>
          <div class="metric-sm">${formatInsightMetric(outcome.bestScore)}</div>
        </article>
        <article class="summary-card" data-insight-card="fresh-pool">
          <div class="muted">${locale.t('history.insights.freshPool')}</div>
          <div class="metric-sm">${freshness.totalNeverPlayed}/${freshness.totalEntitiesTracked}</div>
        </article>
        <article class="summary-card" data-insight-card="user-collection-played">
          <div class="muted">${locale.t('history.insights.userCollectionPlayed')}</div>
          <div class="metric-sm">${formatInsightMetric(collectionCoverage.userCollection.playedPercent, { suffix: '%' })}</div>
          <div class="muted">${collectionCoverage.userCollection.played}/${collectionCoverage.userCollection.total}</div>
        </article>
        <article class="summary-card" data-insight-card="overall-collection-played">
          <div class="muted">${locale.t('history.insights.overallCollectionPlayed')}</div>
          <div class="metric-sm">${formatInsightMetric(collectionCoverage.overallCollection.playedPercent, { suffix: '%' })}</div>
          <div class="muted">${collectionCoverage.overallCollection.played}/${collectionCoverage.overallCollection.total}</div>
        </article>
        <article class="summary-card" data-insight-card="missing-extensions">
          <div class="muted">${locale.t('history.insights.missingExtensions')}</div>
          <div class="metric-sm">${formatInsightMetric(collectionCoverage.missingExtensions.missingPercent, { suffix: '%' })}</div>
          <div class="muted">${collectionCoverage.missingExtensions.missing}/${collectionCoverage.missingExtensions.total} ${locale.t('history.insights.notOwned')}</div>
        </article>
      </div>
      <div class="notice info">${helperCopy}</div>
      <div class="two-col insight-coverage-grid">
        <article class="result-card insight-ranking-card" data-insight-coverage-group="user-collection">
          <h3>${locale.t('history.insights.userCoverage')}</h3>
          <div class="muted">${locale.t('history.insights.userCoverageDescription')}</div>
          ${renderCoverageList(collectionCoverage.userCollection.byType, 'playedPercent', locale)}
        </article>
        <article class="result-card insight-ranking-card" data-insight-coverage-group="overall-collection">
          <h3>${locale.t('history.insights.overallCoverage')}</h3>
          <div class="muted">${locale.t('history.insights.overallCoverageDescription')}</div>
          ${renderCoverageList(collectionCoverage.overallCollection.byType, 'playedPercent', locale)}
        </article>
      </div>
      <div class="two-col insight-ranking-grid">
        ${usage.map((category) => `
          <article class="result-card insight-ranking-card" data-insight-ranking-category="${category.category}">
            <h3>${category.label}</h3>
            <div class="muted">${locale.t('history.insights.playedSummary', { used: locale.formatNumber(category.used), total: locale.formatNumber(category.total), neverPlayed: locale.formatNumber(category.neverPlayed) })}</div>
            <div class="stack gap-sm insight-ranking-section">
              <strong>${locale.t('history.insights.mostPlayed')}</strong>
              ${renderInsightRankingList(category.mostPlayed, locale.t('history.insights.noneMostPlayed', { label: category.label.toLowerCase() }), locale)}
            </div>
            <div class="stack gap-sm insight-ranking-section">
              <strong>${locale.t('history.insights.leastPlayed')}</strong>
              ${renderInsightRankingList(category.leastPlayed, locale.t('history.insights.noneLeastPlayed', { label: category.label.toLowerCase() }), locale)}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderTabButtons(activeTabId, locale, variant = 'desktop') {
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
      title="${locale.getTabDescription(tab.id)}"
    >
      <span class="tab-icon" aria-hidden="true">${tab.icon}</span>
      <span class="tab-label">${variant === 'mobile' ? locale.getTabShortLabel(tab.id) : locale.getTabLabel(tab.id)}</span>
    </button>
  `).join('');
}

function renderThemeControls(activeThemeId, locale) {
  return `
    <section class="theme-switcher" aria-label="${locale.t('header.theme.groupLabel')}" data-theme-switcher>
      <div class="theme-switcher-copy">
        <span class="theme-switcher-label">${locale.t('header.theme.label')}</span>
        <span class="muted theme-switcher-caption">${locale.t('header.theme.caption')}</span>
      </div>
      <div class="theme-switcher-buttons" role="group" aria-label="${locale.t('header.theme.groupLabel')}">
        ${THEME_OPTIONS.map((theme) => `
          <button
            type="button"
            class="button theme-button ${activeThemeId === theme.id ? 'theme-button-active' : 'button-secondary'}"
            data-action="set-theme"
            data-theme-id="${theme.id}"
            aria-pressed="${activeThemeId === theme.id}"
            title="${locale.getThemeDescription(theme.id)}"
          >
            ${locale.getThemeLabel(theme.id)}
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderLocaleControls(activeLocaleId, locale) {
  return `
    <section class="theme-switcher" aria-label="${locale.t('header.locale.groupLabel')}" data-locale-switcher>
      <div class="theme-switcher-copy">
        <span class="theme-switcher-label">${locale.t('header.locale.label')}</span>
        <span class="muted theme-switcher-caption">${locale.t('header.locale.caption')}</span>
      </div>
      <label class="stack gap-sm" for="header-locale-select">
        <select
          id="header-locale-select"
          class="text-input"
          data-action="set-locale-select"
          aria-label="${locale.t('header.locale.groupLabel')}"
        >
          ${getSelectableLocales().map((option) => `
            <option value="${option.id}" ${activeLocaleId === option.id ? 'selected' : ''}>${option.nativeLabel}</option>
          `).join('')}
        </select>
      </label>
      ${locale.hasFallbacks ? `<div class="muted" data-locale-fallback-notice>${locale.t('header.locale.fallbackNotice')}</div>` : ''}
    </section>
  `;
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

function renderBrowseTypeFilters(activeTypeFilter, locale) {
  return BROWSE_TYPE_OPTIONS.map((option) => `
    <button
      type="button"
      class="button ${activeTypeFilter === option.id ? 'button-primary' : 'button-secondary'} browse-filter-button"
      data-action="set-browse-type-filter"
      data-type-filter="${option.id}"
      aria-pressed="${activeTypeFilter === option.id}"
    >
      ${locale.getBrowseTypeFilterLabel(option.id)}
    </button>
  `).join('');
}

const ONBOARDING_STEPS = [
  {
    id: 'browse',
    tabId: 'browse'
  },
  {
    id: 'collection',
    tabId: 'collection'
  },
  {
    id: 'new-game',
    tabId: 'new-game'
  },
  {
    id: 'history',
    tabId: 'history'
  }
];

function formatSetCountLabel(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function renderOnboardingShell(viewModel) {
  if (!viewModel.ui.onboardingVisible) {
    return '';
  }

  const locale = getLocale(viewModel);
  const currentStep = ONBOARDING_STEPS[Math.max(0, Math.min(viewModel.ui.onboardingStep, ONBOARDING_STEPS.length - 1))];
  const isLastStep = currentStep.id === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1].id;
  const currentStepNumber = viewModel.ui.onboardingStep + 1;

  return `
    <section class="panel onboarding-shell" id="onboarding-shell" aria-live="polite">
      <div class="row space-between wrap gap-md align-center">
        <div>
          <div class="eyebrow">${locale.t('onboarding.titleEyebrow')}</div>
          <h2>${locale.t('onboarding.title')}</h2>
          <p class="muted">${locale.t('onboarding.description')}</p>
        </div>
        <div class="onboarding-progress" aria-label="${locale.t('onboarding.progress')}">
          ${ONBOARDING_STEPS.map((step, index) => `
            <span class="onboarding-step-pill ${index === viewModel.ui.onboardingStep ? 'active' : index < viewModel.ui.onboardingStep ? 'complete' : ''}">${locale.t(`onboarding.step${index + 1}.eyebrow`)}</span>
          `).join('')}
        </div>
      </div>
      <div class="result-card onboarding-step-card" data-onboarding-step="${currentStep.id}">
        <div class="eyebrow">${locale.t('onboarding.stepPrefix', { current: currentStepNumber, total: ONBOARDING_STEPS.length })}</div>
        <h3>${locale.t(`onboarding.step${currentStepNumber}.title`)}</h3>
        <p>${locale.t(`onboarding.step${currentStepNumber}.description`)}</p>
        <div class="button-row">
          <button type="button" class="button button-secondary" data-action="open-onboarding-tab" data-tab-id="${currentStep.tabId}">${locale.t(`onboarding.step${currentStepNumber}.action`)}</button>
        </div>
      </div>
      <div class="button-row onboarding-actions">
        <button type="button" class="button button-secondary" data-action="previous-onboarding-step" ${viewModel.ui.onboardingStep === 0 ? 'disabled' : ''}>${locale.t('onboarding.previous')}</button>
        ${isLastStep
          ? `<button type="button" class="button button-success" data-action="complete-onboarding">${locale.t('onboarding.finish')}</button>`
          : `<button type="button" class="button button-primary" data-action="next-onboarding-step">${locale.t('onboarding.next')}</button>`}
        <button type="button" class="button button-secondary" data-action="skip-onboarding">${locale.t('onboarding.skip')}</button>
      </div>
    </section>
  `;
}

function renderAboutPanel(viewModel) {
  const { bundle, state, persistence, ui } = viewModel;
  const locale = getLocale(viewModel);
  const failed = bundle.tests.filter((test) => test.status === 'fail');

  return `
    <section class="panel about-panel" id="about-panel">
      <div class="row space-between wrap gap-md align-center">
        <div>
          <div class="eyebrow">${locale.t('about.eyebrow')}</div>
          <h2>${locale.t('about.title')}</h2>
          <p class="muted">${locale.t('about.description')}</p>
        </div>
        <div class="button-row">
          <button type="button" class="button button-secondary" data-action="toggle-about-panel">${locale.t('about.hide')}</button>
        </div>
      </div>
      <section class="two-col about-layout">
        <section class="stack gap-md">
          <details class="about-card">
            <summary>
              <h3>${locale.t('about.initStatus')}</h3>
            </summary>
            <div>${failed.length
              ? `<p class="error">${locale.t('about.failedInit', { count: locale.formatNumber(failed.length) })}</p>`
              : `<p class="status-pass">${locale.t('about.loadedOk')}</p>`}</div>
          </details>
          <details class="about-card">
            <summary>
              <h3>${locale.t('about.dataSamples')}</h3>
            </summary>
            <div class="stack gap-sm">
              ${formatDuplicateEntries(bundle).map((entry) => `
                <details>
                  <summary>${entry.name} <span class="pill">${locale.formatNumber(entry.all.length)} ${locale.t('about.entries')}</span></summary>
                  <pre>${entry.all.map((entity) => `${entity.id}  ←  ${entity.setId}`).join('\n')}</pre>
                </details>
              `).join('')}
            </div>
          </details>
          <details class="about-card">
            <summary>
              <h3>${locale.t('about.testResults')}</h3>
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
              <h3>${locale.t('about.runtimeDiagnostics')}</h3>
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
              <h3>${locale.t('about.persistedState')}</h3>
            </summary>
            <pre>${JSON.stringify(state, null, 2)}</pre>
          </details>
        </section>
      </section>
    </section>
  `;
}

function getActiveModalConfig(viewModel) {
  const locale = getLocale(viewModel);
  if (viewModel.ui.confirmResetOwnedCollection) {
    return {
      title: locale.t('modal.reset.title'),
      description: locale.t('modal.resetCollection.description'),
      confirmAction: 'confirm-reset-owned-collection',
      cancelAction: 'cancel-reset-owned-collection',
      confirmLabel: locale.t('modal.resetCollection.confirm')
    };
  }

  if (viewModel.ui.confirmResetAllState) {
    return {
      title: locale.t('modal.reset.title'),
      description: locale.t('modal.resetAll.description'),
      confirmAction: 'confirm-reset-all-state',
      cancelAction: 'cancel-reset-all-state',
      confirmLabel: locale.t('modal.resetAll.confirm')
    };
  }

  if (viewModel.ui.confirmBackupRestoreMode && viewModel.ui.stagedBackup) {
    const { summary } = viewModel.ui.stagedBackup;
    if (viewModel.ui.confirmBackupRestoreMode === 'merge') {
      return {
        title: locale.t('modal.merge.title'),
        description: locale.t('modal.merge.description', { ownedSetCount: locale.formatNumber(summary.ownedSetCount), historyCount: locale.formatNumber(summary.historyCount) }),
        confirmAction: 'confirm-merge-backup',
        cancelAction: 'cancel-backup-restore',
        confirmLabel: locale.t('modal.merge.confirm')
      };
    }

    return {
      title: locale.t('modal.replace.title'),
      description: locale.t('modal.replace.description', { historyCount: locale.formatNumber(summary.historyCount) }),
      confirmAction: 'confirm-replace-backup',
      cancelAction: 'cancel-backup-restore',
      confirmLabel: locale.t('modal.replace.confirm')
    };
  }

  return null;
}

function renderToastRegion(viewModel) {
  if (!viewModel.ui.toasts.length) {
    return '';
  }

  const locale = getLocale(viewModel);
  return `
    <div class="toast-stack" role="region" aria-label="${locale.t('toast.region')}">
      ${viewModel.ui.toasts.map((toast) => `
        <article class="toast toast-${toast.variant} toast-${toast.behavior}" role="${toast.live === 'assertive' ? 'alert' : 'status'}" aria-live="${toast.live}" data-toast-id="${toast.id}" data-toast-dismiss-on-click="${toast.dismissOnClick ? 'true' : 'false'}" data-toast-auto-dismiss="${toast.autoDismissMs ? 'true' : 'false'}" data-toast-behavior="${toast.behavior}">
          <div class="toast-copy">
            <div class="toast-title">${toast.icon} ${toast.label}</div>
            ${toast.isPersistent ? `<div class="toast-meta">${locale.t('toast.persistent')}</div>` : ''}
            <div>${toast.message}</div>
          </div>
          ${toast.dismissible
            ? `<button type="button" class="button button-secondary toast-dismiss" data-action="dismiss-toast" data-toast-id="${toast.id}" aria-label="${toast.isPersistent ? locale.t('toast.acknowledge') : locale.t('toast.dismiss')} ${toast.label} notification">${toast.isPersistent ? locale.t('toast.acknowledge') : locale.t('toast.dismiss')}</button>`
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

  const locale = getLocale(viewModel);
  return `
    <div class="modal-backdrop">
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" tabindex="-1">
        <h2 id="modal-title">${modal.title}</h2>
        <p id="modal-description">${modal.description}</p>
        <div class="button-row confirmation-actions">
          <button type="button" class="button button-secondary" data-action="${modal.cancelAction}" data-modal-focus="cancel">${locale.t('modal.cancel')}</button>
          <button type="button" class="button button-danger" data-action="${modal.confirmAction}" data-modal-focus="confirm">${modal.confirmLabel}</button>
        </div>
      </section>
    </div>
  `;
}

function renderCollectionFeasibility(viewModel) {
  const feasibility = getCollectionFeasibility(viewModel.bundle.runtime, viewModel.state);
  const locale = getLocale(viewModel);

  return feasibility.map((mode) => `
    <article class="summary-card feasibility-card ${mode.ok ? 'is-ok' : 'is-warning'}" data-feasibility-mode="${mode.id}">
      <div class="row space-between gap-sm wrap align-center">
        <strong>${mode.playerCount === 1 ? locale.getPlayModeLabel(mode.playMode, mode.playerCount) : locale.formatPlayerLabel(mode.playerCount)}</strong>
        <span class="pill ${mode.ok ? 'feasibility-pill-ok' : 'feasibility-pill-warning'}">${mode.ok ? `✓ ${locale.t('collection.feasibility.legal')}` : `⚠ ${locale.t('collection.feasibility.warning')}`}</span>
      </div>
      <div class="muted feasibility-copy">${mode.ok
        ? locale.t('collection.feasibility.okCopy')
        : (mode.reasons[0] || locale.t('collection.feasibility.badCopy'))}</div>
    </article>
  `).join('');
}

function renderCollectionGroups(viewModel) {
  const locale = getLocale(viewModel);
  const ownedSetIds = new Set(viewModel.state.collection.ownedSetIds);
  const groupedSets = groupSetsByType(viewModel.bundle.runtime.sets);

  return groupedSets.map((group) => `
    <section class="panel collection-group" data-collection-group="${group.id}">
      <h3>${locale.getCollectionGroupLabel(group.id)}</h3>
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
                ${locale.formatEntityCount(counts.heroCount, 'common.hero', 'common.heroesLower')} · ${locale.formatEntityCount(counts.mastermindCount, 'common.mastermind', 'common.mastermindsLower')} · ${locale.formatEntityCount(counts.villainGroupCount, 'common.villainGroup', 'common.villainGroupsLower')} · ${locale.formatEntityCount(counts.henchmanGroupCount, 'common.henchmanGroup', 'common.henchmanGroupsLower')} · ${locale.formatEntityCount(counts.schemeCount, 'common.scheme', 'common.schemesLower')}
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
  const locale = getLocale(viewModel);
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
              <span class="set-card-toggle-copy">${expanded ? locale.t('browse.set.hideDetails') : locale.t('browse.set.showDetails')}</span>
            </button>
            <div class="row wrap gap-sm align-center browse-badge-row">
              <span class="pill set-year-badge">${set.year}</span>
              <span class="pill set-type-badge">${locale.getBrowseTypeLabel(set.type)}</span>
              ${owned ? `<span class="pill set-owned-badge">${locale.t('browse.set.inCollection')}</span>` : ''}
            </div>
            ${set.aliases.length ? `<div class="muted browse-aliases">${locale.t('browse.set.aliases')} ${set.aliases.map((alias) => escapeHtml(alias)).join(', ')}</div>` : ''}
          </div>
          <div class="stack gap-sm browse-card-actions">
            <button class="button ${owned ? 'button-success' : 'button-secondary'}" data-action="toggle-owned-set" data-set-id="${set.id}">
              ${owned ? `✓ ${locale.t('browse.set.inCollection')}` : locale.t('browse.set.addToCollection')}
            </button>
            <div class="muted browse-ownership-copy">${owned ? locale.t('browse.set.ownedAvailable') : locale.t('browse.set.notOwned')}</div>
          </div>
        </div>

        <div class="browse-count-grid">
          <div class="summary-card"><div class="muted">${locale.t('common.heroes')}</div><div class="metric-sm">${counts.heroCount}</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.masterminds')}</div><div class="metric-sm">${counts.mastermindCount}</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.villainGroups')}</div><div class="metric-sm">${counts.villainGroupCount}</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.henchmanGroups')}</div><div class="metric-sm">${counts.henchmanGroupCount}</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.schemes')}</div><div class="metric-sm">${counts.schemeCount}</div></div>
        </div>

        <div id="browse-details-${set.id}" class="browse-details" ${expanded ? '' : 'hidden'}>
          <div class="browse-details-grid">
            <section class="summary-card">
              <h3>${locale.t('common.heroes')}</h3>
              ${formatBrowseEntityList(set.heroes, locale.t('browse.noHeroes'))}
            </section>
            <section class="summary-card">
              <h3>${locale.t('common.masterminds')}</h3>
              ${formatBrowseEntityList(set.masterminds, locale.t('browse.noMasterminds'), (mastermind) => formatBrowseMastermind(mastermind, indexes))}
            </section>
            <section class="summary-card">
              <h3>${locale.t('common.villainGroups')}</h3>
              ${formatBrowseEntityList(set.villainGroups, locale.t('browse.noVillainGroups'))}
            </section>
            <section class="summary-card">
              <h3>${locale.t('common.henchmanGroups')}</h3>
              ${formatBrowseEntityList(set.henchmanGroups, locale.t('browse.noHenchmanGroups'))}
            </section>
            <section class="summary-card browse-detail-section-full">
              <h3>${locale.t('common.schemes')}</h3>
              ${formatBrowseEntityList(set.schemes, locale.t('browse.noSchemes'))}
            </section>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderBrowsePanel(viewModel) {
  const { bundle, state, ui } = viewModel;
  const locale = getLocale(viewModel);
  const metrics = [
    [locale.t('browse.metrics.includedSets'), bundle.counts.sets],
    [locale.t('browse.metrics.ownedSets'), state.collection.ownedSetIds.length],
    [locale.t('browse.metrics.historyRecords'), state.history.length],
    [locale.t('browse.metrics.readyTabs'), 5]
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
            <div class="eyebrow">${locale.t('browse.hero.eyebrow')}</div>
            <h2>${locale.t('browse.hero.title')}</h2>
            <p class="muted">${locale.t('browse.hero.description')}</p>
            <div class="button-row browse-hero-actions">
              <button type="button" class="button button-primary" data-action="jump-tab" data-tab-id="collection">${locale.t('browse.hero.manageCollection')}</button>
              <button type="button" class="button button-secondary" data-action="jump-tab" data-tab-id="new-game">${locale.t('browse.hero.generateGame')}</button>
              <button type="button" class="button button-secondary" data-action="start-onboarding">${locale.t('browse.hero.replayWalkthrough')}</button>
              <button type="button" class="button button-secondary" data-action="toggle-about-panel" aria-expanded="${ui.aboutPanelOpen}">${locale.t('browse.hero.aboutProject')}</button>
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
              <h2>${locale.t('browse.startHere.title')}</h2>
              <p class="muted">${locale.t('browse.startHere.description')}</p>
            </div>
          </div>
          <div class="stack gap-sm browse-priority-list">
            <article class="summary-card browse-priority-item">
              <strong>${locale.t('browse.startHere.step1Title')}</strong>
              <div class="muted">${locale.t('browse.startHere.step1Body')}</div>
            </article>
            <article class="summary-card browse-priority-item">
              <strong>${locale.t('browse.startHere.step2Title')}</strong>
              <div class="muted">${locale.t('browse.startHere.step2Body')}</div>
            </article>
            <article class="summary-card browse-priority-item">
              <strong>${locale.t('browse.startHere.step3Title')}</strong>
              <div class="muted">${locale.t('browse.startHere.step3Body')}</div>
            </article>
          </div>
        </section>
        <section class="panel">
          <div class="row space-between wrap gap-md align-center">
            <div>
              <h2>${locale.t('browse.panel.title')}</h2>
              <p class="muted">${locale.t('browse.panel.description')}</p>
            </div>
            <div class="summary-card browse-results-summary">
              <div class="muted">${locale.t('browse.visibleSets')}</div>
              <div class="metric-sm">${browseSets.length}</div>
              <div class="muted">of ${bundle.runtime.sets.length}</div>
            </div>
          </div>
          <div class="browse-toolbar">
            <label class="browse-search-shell" for="browse-search-input">
              <span class="muted">${locale.t('browse.searchLabel')}</span>
              <input
                id="browse-search-input"
                class="text-input"
                type="search"
                placeholder="${locale.t('browse.searchPlaceholder')}"
                value="${escapeHtml(ui.browseSearchTerm)}"
              />
            </label>
            <div class="stack gap-sm">
              <span class="muted">${locale.t('browse.typeFilter')}</span>
              <div class="button-row" role="group" aria-label="${locale.t('browse.typeFilter')}">
                ${renderBrowseTypeFilters(ui.browseTypeFilter, locale)}
              </div>
            </div>
          </div>
          ${browseSets.length
            ? `<div class="grid collection-grid browse-set-grid">${browseSets.map((set) => renderBrowseSetCard(set, viewModel)).join('')}</div>`
            : `<div id="browse-empty-state" class="notice info">${locale.t('browse.emptyFiltered')}</div>`}
        </section>
      </section>
      ${ui.aboutPanelOpen ? renderAboutPanel(viewModel) : ''}
    </section>
  `;
}

function renderCollectionPanel(viewModel) {
  const { bundle, state, persistence, ui } = viewModel;
  const locale = getLocale(viewModel);
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
            <h2>${locale.t('collection.title')}</h2>
            <p class="muted">${locale.t('collection.description')}</p>
          </div>
          <div class="button-row">
            <button class="button button-secondary" data-action="request-reset-owned-collection">${locale.t('collection.resetSelections')}</button>
          </div>
        </div>
        <div class="stack gap-sm">
          <div class="summary-grid">
            <div class="summary-card">
              <div class="muted">${locale.t('collection.ownedSets')}</div>
              <div class="metric-sm">${totals.setCount}</div>
            </div>
            <div class="summary-card"><div class="muted">${locale.t('common.heroes')}</div><div class="metric-sm">${totals.heroCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.masterminds')}</div><div class="metric-sm">${totals.mastermindCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.villainGroups')}</div><div class="metric-sm">${totals.villainGroupCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.henchmanGroups')}</div><div class="metric-sm">${totals.henchmanGroupCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.schemes')}</div><div class="metric-sm">${totals.schemeCount}</div></div>
          </div>
          <div class="summary-card">
            <div><strong>${locale.t('collection.storage')}:</strong> ${persistence.storageAvailable ? locale.t('collection.storage.available') : locale.t('collection.storage.unavailable')} · ${persistence.hydratedFromStorage ? locale.t('collection.storage.hydrated') : locale.t('collection.storage.defaults')} · ${persistence.recoveredOnLoad ? locale.t('collection.storage.recovered') : locale.t('collection.storage.clean')}</div>
            ${ui.lastActionNotice ? `<div class="muted">${locale.t('collection.latestAction')} ${ui.lastActionNotice}</div>` : ''}
          </div>
          ${persistenceNotices.length
            ? persistenceNotices.map((notice) => `<div class="notice warning">${notice}</div>`).join('')
            : `<div class="notice success">${locale.t('collection.noRecoveryIssues')}</div>`}
        </div>
      </section>
      <section class="two-col">
        <section class="panel">
          <h2>${locale.t('collection.totals.title')}</h2>
          <p class="muted">${locale.t('collection.totals.description')}</p>
          <div class="summary-grid collection-totals-grid">
            <div class="summary-card"><div class="muted">${locale.t('common.heroes')}</div><div class="metric-sm">${totals.heroCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.masterminds')}</div><div class="metric-sm">${totals.mastermindCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.villainGroups')}</div><div class="metric-sm">${totals.villainGroupCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.henchmanGroups')}</div><div class="metric-sm">${totals.henchmanGroupCount}</div></div>
            <div class="summary-card"><div class="muted">${locale.t('common.schemes')}</div><div class="metric-sm">${totals.schemeCount}</div></div>
          </div>
        </section>
        <section class="panel">
          <h2>${locale.t('collection.capacity.title')}</h2>
          <p class="muted">${locale.t('collection.capacity.description')}</p>
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
  const locale = getLocale(viewModel);
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
      title="${locale.getPlayModeDescription(mode.id, ui.selectedPlayerCount)}"
    >
      ${ui.selectedPlayMode === mode.id ? `${locale.getPlayModeLabel(mode.id, ui.selectedPlayerCount)} ✓` : locale.getPlayModeLabel(mode.id, ui.selectedPlayerCount)}
    </button>
  `).join('');

  return `
    <div class="stack gap-md">
      <div>
        <h3>${locale.t('newGame.playerCount')}</h3>
        <div class="button-row">${playerButtons}</div>
      </div>
      <div>
        <h3>${locale.t('newGame.playMode')}</h3>
        <div class="button-row">${playModeButtons}</div>
      </div>
      <div class="row wrap gap-sm align-center">
        <button class="button button-secondary" data-action="clear-setup-controls">${locale.t('newGame.resetControls')}</button>
      </div>
      <div class="muted">${locale.getPlayModeHelpText(ui.selectedPlayerCount, ui.selectedPlayMode)}</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="muted">${locale.t('newGame.selectedMode')}</div>
          <div class="metric-sm">${availablePlayModes.find((mode) => mode.id === ui.selectedPlayMode) ? locale.getPlayModeLabel(ui.selectedPlayMode, ui.selectedPlayerCount) : locale.getPlayModeLabel('standard', ui.selectedPlayerCount)}</div>
        </div>
        <div class="summary-card">
          <div class="muted">${locale.t('newGame.ownedSets')}</div>
          <div class="metric-sm">${state.collection.ownedSetIds.length}</div>
        </div>
        <div class="summary-card">
          <div class="muted">${locale.t('newGame.lastPersistedMode')}</div>
          <div class="metric-sm">${locale.formatPersistedPlayMode(state.preferences.lastPlayerCount, state.preferences.lastPlayMode)}</div>
        </div>
      </div>
      <div class="result-card current-requirements-card" id="setup-requirements-card">
        <h3>${locale.t('newGame.setupRequirements')}</h3>
        <div class="muted">${locale.formatEntityCount(displayedRequirements.heroCount, 'common.heroTitle', 'common.heroes')} · ${locale.formatEntityCount(displayedRequirements.villainGroupCount, 'common.villainGroupTitle', 'common.villainGroups')} · ${locale.formatEntityCount(displayedRequirements.henchmanGroupCount, 'common.henchmanGroupTitle', 'common.henchmanGroups')} · ${locale.formatEntityCount(displayedRequirements.wounds, 'common.wound', 'common.wounds')}</div>
        ${ui.selectedPlayMode === 'two-handed-solo'
          ? `<div class="muted">${locale.t('newGame.twoHandedHelp')}</div>`
          : ''}
      </div>
      ${renderForcedPickControls(viewModel)}
      <div class="button-row">
        <button class="button button-primary" data-action="generate-setup">${locale.t('newGame.generate')}</button>
        <button class="button button-secondary" data-action="regenerate-setup">${locale.t('newGame.regenerate')}</button>
        <button class="button button-success" data-action="accept-current-setup" ${ui.currentSetup ? '' : 'disabled'}>${locale.t('newGame.acceptLog')}</button>
      </div>
      <div class="muted">${locale.t('newGame.ephemeralNotice')}</div>
    </div>
  `;
}

function renderSetupResult(viewModel) {
  const { ui } = viewModel;
  const locale = getLocale(viewModel);
  const currentSetup = ui.currentSetup;

  if (!currentSetup) {
    return `
      <div class="stack gap-md">
        ${formatGeneratorNotices(currentSetup, ui.generatorNotices, ui.generatorError, locale)}
        <div class="summary-grid">
          <div class="summary-card"><div class="muted">${locale.t('common.heroes')}</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.villainGroups')}</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.henchmanGroups')}</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">${locale.t('common.wounds')}</div><div class="metric-sm">—</div></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="stack gap-md">
      ${formatGeneratorNotices(currentSetup, ui.generatorNotices, ui.generatorError, locale)}
      <div class="summary-grid">
        <div class="summary-card"><div class="muted">${locale.t('common.heroes')}</div><div class="metric-sm">${currentSetup.requirements.heroCount}</div></div>
        <div class="summary-card"><div class="muted">${locale.t('common.villainGroups')}</div><div class="metric-sm">${currentSetup.requirements.villainGroupCount}</div></div>
        <div class="summary-card"><div class="muted">${locale.t('common.henchmanGroups')}</div><div class="metric-sm">${currentSetup.requirements.henchmanGroupCount}</div></div>
        <div class="summary-card"><div class="muted">${locale.t('common.wounds')}</div><div class="metric-sm">${currentSetup.requirements.wounds}</div></div>
      </div>
      <div class="result-card" data-result-section="mastermind">
        <h3>${locale.t('newGame.result.mastermind')}</h3>
        <div><strong>${currentSetup.mastermind.name}</strong></div>
        <div class="muted">${currentSetup.mastermind.leadEntity ? locale.t('common.alwaysLeads', { name: currentSetup.mastermind.leadEntity.name }) : locale.t('common.noMandatoryLead')}</div>
        ${currentSetup.mastermind.leadEntity ? `<div class="pill">★ ${locale.t('common.mandatoryLead')}</div>` : ''}
        ${currentSetup.mastermind.notes.length ? `<div class="muted">${currentSetup.mastermind.notes.join(' ')}</div>` : ''}
      </div>
      <div class="result-card" data-result-section="scheme">
        <h3>${locale.t('newGame.result.scheme')}</h3>
        <div><strong>${currentSetup.scheme.name}</strong></div>
        <div class="muted">${locale.t('newGame.result.modeBystanders', { mode: currentSetup.template.modeLabel, count: locale.formatNumber(currentSetup.requirements.bystanders) })}</div>
        ${currentSetup.scheme.notes.length ? `<div class="notice info">⚠ ${locale.t('newGame.result.special', { notes: currentSetup.scheme.notes.join(' ') })}</div>` : ''}
      </div>
      <div class="result-card" data-result-section="heroes">
        <h3>${locale.t('newGame.result.heroes')}</h3>
        <div class="new-game-hero-grid">${renderHeroResultCards(currentSetup.heroes, locale)}</div>
      </div>
      <div class="result-card" data-result-section="villain-groups">
        <h3>${locale.t('newGame.result.villainGroups')}</h3>
        <ul class="clean result-list">${formatSetupGroupList(currentSetup.villainGroups, locale)}</ul>
      </div>
      <div class="result-card" data-result-section="henchman-groups">
        <h3>${locale.t('newGame.result.henchmanGroups')}</h3>
        <ul class="clean result-list">${formatSetupGroupList(currentSetup.henchmanGroups, locale)}</ul>
      </div>
      <details>
        <summary>${locale.t('newGame.result.snapshot')}</summary>
        <pre>${JSON.stringify(currentSetup.setupSnapshot, null, 2)}</pre>
      </details>
    </div>
  `;
}

function renderHistoryPanel(viewModel) {
  const { ui } = viewModel;
  const locale = getLocale(viewModel);
  return `
    <section class="stack gap-md">
      <section class="panel">
        <h2>${locale.t('history.title')}</h2>
        <div class="muted">${locale.t('history.description')}</div>
        ${renderHistoryGroupingControls(ui.historyGroupingMode || DEFAULT_HISTORY_GROUPING_MODE, locale)}
        ${renderGroupedHistory(viewModel)}
      </section>
      ${renderInsightsDashboard(viewModel)}
    </section>
  `;
}

function renderBackupPanel(viewModel) {
  const { bundle, state, ui } = viewModel;
  const locale = getLocale(viewModel);
  const indicators = summarizeUsageIndicators(bundle.runtime, state);
  const resetPreview = buildFullResetPreview();
  return `
    <section class="stack gap-md">
      <section class="panel" data-backup-panel>
        <h2>${locale.t('backup.title')}</h2>
        <div class="muted">${locale.t('backup.description')}</div>
        <div class="button-row">
          <button class="button button-secondary" data-action="export-backup">${locale.t('backup.export')}</button>
          <button class="button button-primary" data-action="open-import-backup">${locale.t('backup.import')}</button>
        </div>
        <input id="backup-import-input" class="visually-hidden" type="file" accept=".json,application/json" />
        ${renderBackupPreview(ui, locale)}
      </section>
      <section class="panel">
        <h2>${locale.t('backup.usedCardTracking')}</h2>
        <div class="muted">${locale.t('backup.usedCardDescription')}</div>
        <div class="stack gap-sm history-usage-indicators">
          ${indicators.map((indicator) => `
            <article class="summary-card history-usage-row" data-usage-category="${indicator.category}">
              <div>
                <strong>${locale.getUsageLabel(indicator.category)}</strong>
                <div class="muted">${locale.t('backup.neverPlayed', { value: `${locale.formatNumber(indicator.neverPlayed)}/${locale.formatNumber(indicator.total)}` })}</div>
              </div>
              <button class="button button-secondary" data-action="reset-usage" data-category="${indicator.category}">${locale.t('backup.resetCategory', { label: locale.getUsageLabel(indicator.category) })}</button>
            </article>
          `).join('')}
        </div>
        <p class="muted">${locale.t('backup.lowestPlayReuse')}</p>
        <div class="muted">${locale.t('backup.resetPreview', { historyCount: locale.formatNumber(resetPreview.history.length), ownedSetCount: locale.formatNumber(resetPreview.collection.ownedSetIds.length) })}</div>
        <div class="button-row">
          <button class="button button-danger" data-action="request-reset-all-state">${locale.t('backup.fullReset')}</button>
        </div>
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
          <h2>${getLocale(viewModel).t('newGame.panel.setupTitle')}</h2>
          ${renderSetupControls(viewModel)}
        </section>
        <section class="panel">
          <h2>${getLocale(viewModel).t('newGame.panel.resultTitle')}</h2>
          ${renderSetupResult(viewModel)}
        </section>
      </section>
    `,
    history: renderHistoryPanel(viewModel),
    backup: renderBackupPanel(viewModel)
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

  doc.querySelectorAll('[data-action="set-theme"]').forEach((button) => {
    button.addEventListener('click', () => actions.setTheme(button.dataset.themeId));
  });

  doc.querySelectorAll('[data-action="set-locale-select"]').forEach((select) => {
    select.addEventListener('change', () => actions.setLocale(select.value));
  });

  const backupImportInput = doc.getElementById('backup-import-input');
  if (backupImportInput) {
    backupImportInput.addEventListener('change', (event) => {
      const [file] = [...(event.target.files || [])];
      actions.importBackupFile(file);
      event.target.value = '';
    });
  }

  doc.querySelectorAll('[data-action="add-forced-pick"]').forEach((button) => {
    button.addEventListener('click', () => {
      const select = doc.querySelector(`[data-forced-pick-select="${button.dataset.field}"]`);
      actions.addForcedPick(button.dataset.field, select?.value || '');
    });
  });

  doc.querySelectorAll('[data-action="remove-forced-pick"]').forEach((button) => {
    button.addEventListener('click', () => actions.removeForcedPick(button.dataset.field, button.dataset.entityId));
  });

  doc.querySelectorAll('[data-action="edit-game-result"]').forEach((button) => {
    button.addEventListener('click', () => actions.editGameResult(button.dataset.recordId));
  });

  doc.querySelectorAll('[data-action="set-history-grouping"]').forEach((button) => {
    button.addEventListener('click', () => actions.setHistoryGrouping(button.dataset.historyGroupingMode));
  });

  doc.querySelectorAll('[data-result-field="outcome"]').forEach((input) => {
    input.addEventListener('change', (event) => actions.setResultOutcome(event.target.value));
  });

  doc.querySelectorAll('[data-result-field="score"]').forEach((input) => {
    input.addEventListener('input', (event) => actions.setResultScore(event.target.value));
  });

  doc.querySelectorAll('[data-result-field="notes"]').forEach((input) => {
    input.addEventListener('input', (event) => actions.setResultNotes(event.target.value));
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
    'open-import-backup': actions.openImportBackup,
    'export-backup': actions.exportBackup,
    'request-merge-backup': actions.requestMergeBackup,
    'request-replace-backup': actions.requestReplaceBackup,
    'cancel-backup-preview': actions.cancelBackupPreview,
    'cancel-backup-restore': actions.cancelBackupRestore,
    'confirm-merge-backup': actions.confirmMergeBackup,
    'confirm-replace-backup': actions.confirmReplaceBackup,
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
    'save-game-result': actions.saveGameResult,
    'skip-game-result': actions.skipGameResultEntry,
    'cancel-result-entry': actions.cancelResultEntry,
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
  const activeThemeId = normalizeThemeId(viewModel.state.preferences.themeId);
  const activeTheme = getThemeDefinition(activeThemeId);
  const locale = getLocale(viewModel);
  const panelMarkup = renderTabPanels(viewModel);
  const onboardingMarkup = renderOnboardingShell(viewModel);

  doc.documentElement.dataset.theme = activeThemeId;
  doc.documentElement.lang = locale.documentLang;
  doc.documentElement.style.colorScheme = activeTheme.colorScheme;
  doc.title = locale.t('app.documentTitle');
  doc.getElementById('app-title').textContent = locale.t('app.title');
  doc.getElementById('app-subtitle').textContent = locale.t('app.subtitle');
  doc.getElementById('header-theme-controls').innerHTML = renderThemeControls(activeThemeId, locale);
  doc.getElementById('header-locale-controls').innerHTML = renderLocaleControls(viewModel.state.preferences.localeId, locale);
  doc.getElementById('desktop-tabs').setAttribute('aria-label', locale.t('header.primaryNav'));
  doc.getElementById('mobile-tabs').setAttribute('aria-label', locale.t('header.primaryNavMobile'));
  doc.getElementById('desktop-tabs').innerHTML = renderTabButtons(activeTabId, locale, 'desktop');
  doc.getElementById('mobile-tabs').innerHTML = renderTabButtons(activeTabId, locale, 'mobile');

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
