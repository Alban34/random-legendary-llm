import { createLocaleTools } from './localization-utils.mjs';

export const GAME_RESULT_STATUS_PENDING = 'pending';
export const GAME_RESULT_STATUS_COMPLETED = 'completed';

export const GAME_OUTCOME_OPTIONS = [
  { id: 'win', label: 'Win' },
  { id: 'loss', label: 'Loss' },
  { id: 'draw', label: 'Draw' }
];

const GAME_OUTCOME_LABELS = Object.fromEntries(GAME_OUTCOME_OPTIONS.map((option) => [option.id, option.label]));
const MAX_RESULT_NOTES_LENGTH = 500;

function trimNotes(notes) {
  return typeof notes === 'string'
    ? notes.trim().slice(0, MAX_RESULT_NOTES_LENGTH)
    : '';
}

function normalizeScore(score) {
  if (score === null || score === undefined) {
    return null;
  }

  if (!Number.isInteger(score) || score < 0) {
    return null;
  }
  return score;
}

export function createPlayerScoreEntry({ playerName = '', score = null } = {}) {
  return {
    playerName: typeof playerName === 'string' ? playerName.trim() : '',
    score: normalizeScore(score)
  };
}

export function createPerPlayerScoreArray(playerCount) {
  return Array.from({ length: playerCount }, () => ({ playerName: '', score: null }));
}

export function createPendingGameResult() {
  return {
    status: GAME_RESULT_STATUS_PENDING,
    outcome: null,
    score: null,
    notes: '',
    updatedAt: null
  };
}

export function isCompletedGameResult(result) {
  return result?.status === GAME_RESULT_STATUS_COMPLETED;
}

export function formatGameOutcomeLabel(outcome) {
  return GAME_OUTCOME_LABELS[outcome] || 'Unknown';
}

export function formatGameResultStatus(result, locale = 'en-US') {
  if (!isCompletedGameResult(result)) {
    return 'Pending result';
  }

  if (Array.isArray(result.score)) {
    const outcomeLabel = formatGameOutcomeLabel(result.outcome);
    const parts = result.score.map((entry, index) => {
      const name = entry.playerName && entry.playerName.trim() !== '' ? entry.playerName : `Player ${index + 1}`;
      const scoreStr = entry.score !== null ? new Intl.NumberFormat(locale).format(entry.score) : '\u2014';
      return `${name}: ${scoreStr}`;
    });
    return `${outcomeLabel} · ${parts.join(' · ')}`;
  }

  if (result.score === null) {
    return formatGameOutcomeLabel(result.outcome);
  }

  const { t } = createLocaleTools(locale);
  const scoreLabel = t('result.scoreLabel');
  const formattedScore = new Intl.NumberFormat(locale).format(result.score);
  return `${formatGameOutcomeLabel(result.outcome)} · ${scoreLabel} ${formattedScore}`;
}

export function createCompletedGameResult({ outcome, score, notes = '', updatedAt = new Date().toISOString(), playerCount = 1 }) {
  if (!GAME_OUTCOME_LABELS[outcome]) {
    throw new Error('Choose a valid outcome before saving the game result.');
  }

  if (playerCount >= 2) {
    if (!Array.isArray(score)) {
      throw new Error('Per-player score array is required for multiplayer games.');
    }
    const normalizedEntries = score.map((entry) => createPlayerScoreEntry(entry));
    if (outcome === 'win' && normalizedEntries.every((entry) => entry.score === null)) {
      throw new Error('Enter a whole-number score that is 0 or greater before saving the game result.');
    }
    return {
      status: GAME_RESULT_STATUS_COMPLETED,
      outcome,
      score: normalizedEntries,
      notes: trimNotes(notes),
      updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date().toISOString()
    };
  }

  const normalizedScore = normalizeScore(score);
  if (outcome === 'win' && normalizedScore === null) {
    throw new Error('Enter a whole-number score that is 0 or greater before saving the game result.');
  }

  if (outcome === 'loss' && score !== null && score !== undefined && normalizedScore === null) {
    throw new Error('If you enter a score for a loss, it must be a whole number that is 0 or greater.');
  }

  if (outcome === 'draw' && score !== null && score !== undefined && normalizedScore === null) {
    throw new Error('If you enter a score for a draw, it must be a whole number that is 0 or greater.');
  }

  return {
    status: GAME_RESULT_STATUS_COMPLETED,
    outcome,
    score: normalizedScore,
    notes: trimNotes(notes),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date().toISOString()
  };
}

export function sanitizeStoredGameResult(candidate, playerCount = 1) {
  if (candidate === undefined) {
    return {
      result: createPendingGameResult(),
      recovered: false
    };
  }

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return {
      result: createPendingGameResult(),
      recovered: true
    };
  }

  if (candidate.status === GAME_RESULT_STATUS_PENDING) {
    if (playerCount >= 2) {
      if (candidate.score !== null && !Array.isArray(candidate.score)) {
        return { result: createPendingGameResult(), recovered: true };
      }
      const pendingResult = createPendingGameResult();
      if (Array.isArray(candidate.score)) {
        pendingResult.score = candidate.score.map((entry) => {
          if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            return { playerName: '', score: null };
          }
          return createPlayerScoreEntry(entry);
        });
      }
      return { result: pendingResult, recovered: false };
    }

    const notes = trimNotes(candidate.notes);
    const updatedAt = candidate.updatedAt === null || typeof candidate.updatedAt === 'string'
      ? candidate.updatedAt
      : null;
    const recovered = candidate.outcome !== null
      || candidate.score !== null
      || notes !== ''
      || updatedAt !== null;

    return {
      result: createPendingGameResult(),
      recovered
    };
  }

  if (candidate.status !== GAME_RESULT_STATUS_COMPLETED) {
    return {
      result: createPendingGameResult(),
      recovered: true
    };
  }

  if (playerCount >= 2 && !Array.isArray(candidate.score)) {
    return {
      result: createPendingGameResult(),
      recovered: true
    };
  }

  if (playerCount >= 2 && Array.isArray(candidate.score)) {
    const sanitizedEntries = candidate.score.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return { playerName: '', score: null };
      }
      return createPlayerScoreEntry(entry);
    });
    try {
      return {
        result: createCompletedGameResult({
          outcome: candidate.outcome,
          score: sanitizedEntries,
          notes: candidate.notes,
          updatedAt: candidate.updatedAt,
          playerCount
        }),
        recovered: false
      };
    } catch {
      return {
        result: createPendingGameResult(),
        recovered: true
      };
    }
  }

  try {
    return {
      result: createCompletedGameResult({
        outcome: candidate.outcome,
        score: candidate.score,
        notes: candidate.notes,
        updatedAt: candidate.updatedAt
      }),
      recovered: false
    };
  } catch {
    return {
      result: createPendingGameResult(),
      recovered: true
    };
  }
}

export function normalizeGameResultDraft(result, playerCount = 1) {
  if (playerCount >= 2 && isCompletedGameResult(result) && Array.isArray(result.score)) {
    return {
      outcome: result.outcome,
      playerScores: result.score.map((e) => ({
        playerName: e.playerName,
        score: e.score !== null ? String(e.score) : ''
      })),
      notes: typeof result?.notes === 'string' ? result.notes : ''
    };
  }
  return {
    outcome: isCompletedGameResult(result) ? result.outcome : '',
    score: isCompletedGameResult(result) && result.score !== null ? String(result.score) : '',
    notes: typeof result?.notes === 'string' ? result.notes : ''
  };
}

export function validateGameResultDraft(draft, playerCount = 1) {
  const outcome = typeof draft?.outcome === 'string' ? draft.outcome : '';
  const notes = trimNotes(draft?.notes);
  const errors = [];

  if (!GAME_OUTCOME_LABELS[outcome]) {
    errors.push('Choose Win or Loss before saving the result.');
  }

  if (playerCount >= 2) {
    const playerScores = Array.isArray(draft?.playerScores) ? draft.playerScores : [];

    if (playerScores.length !== playerCount) {
      errors.push('Player scores are missing or incomplete.');
    }

    for (const entry of playerScores) {
      const scoreStr = typeof entry?.score === 'string' ? entry.score.trim() : '';
      if (scoreStr !== '') {
        const parsed = Number.parseInt(scoreStr, 10);
        if (!/^\d+$/.test(scoreStr) || !Number.isInteger(parsed) || parsed < 0) {
          errors.push('Score must be a whole number that is 0 or greater.');
          break;
        }
      }
    }

    if (outcome === 'win' && !playerScores.some((entry) => {
      const scoreStr = typeof entry?.score === 'string' ? entry.score.trim() : '';
      return scoreStr !== '';
    })) {
      errors.push('Enter a score before saving the result.');
    }

    if (errors.length) {
      return { ok: false, errors, result: null };
    }

    return {
      ok: true,
      errors: [],
      result: createCompletedGameResult({
        outcome,
        score: playerScores.map((entry) => {
          const scoreStr = typeof entry?.score === 'string' ? entry.score.trim() : '';
          return {
            playerName: typeof entry?.playerName === 'string' ? entry.playerName : '',
            score: scoreStr === '' ? null : Number.parseInt(scoreStr, 10)
          };
        }),
        notes,
        playerCount
      })
    };
  }

  const scoreValue = typeof draft?.score === 'string' ? draft.score.trim() : '';

  if (outcome === 'win' && scoreValue === '') {
    errors.push('Enter a score before saving the result.');
  }

  const parsedScore = Number.parseInt(scoreValue, 10);
  if (scoreValue !== '' && (!/^\d+$/.test(scoreValue) || !Number.isInteger(parsedScore) || parsedScore < 0)) {
    errors.push('Score must be a whole number that is 0 or greater.');
  }

  if (errors.length) {
    return {
      ok: false,
      errors,
      result: null
    };
  }

  return {
    ok: true,
    errors: [],
    result: createCompletedGameResult({
      outcome,
      score: scoreValue === '' ? null : parsedScore,
      notes
    })
  };
}