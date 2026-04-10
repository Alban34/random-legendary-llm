export const GAME_RESULT_STATUS_PENDING = 'pending';
export const GAME_RESULT_STATUS_COMPLETED = 'completed';

export const GAME_OUTCOME_OPTIONS = [
  { id: 'win', label: 'Win' },
  { id: 'loss', label: 'Loss' }
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

export function formatGameResultStatus(result) {
  if (!isCompletedGameResult(result)) {
    return 'Pending result';
  }

  return result.score === null
    ? formatGameOutcomeLabel(result.outcome)
    : `${formatGameOutcomeLabel(result.outcome)} · Score ${result.score}`;
}

export function createCompletedGameResult({ outcome, score, notes = '', updatedAt = new Date().toISOString() }) {
  if (!GAME_OUTCOME_LABELS[outcome]) {
    throw new Error('Choose a valid outcome before saving the game result.');
  }

  const normalizedScore = normalizeScore(score);
  if (outcome === 'win' && normalizedScore === null) {
    throw new Error('Enter a whole-number score that is 0 or greater before saving the game result.');
  }

  if (outcome === 'loss' && score !== null && score !== undefined && normalizedScore === null) {
    throw new Error('If you enter a score for a loss, it must be a whole number that is 0 or greater.');
  }

  return {
    status: GAME_RESULT_STATUS_COMPLETED,
    outcome,
    score: normalizedScore,
    notes: trimNotes(notes),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date().toISOString()
  };
}

export function sanitizeStoredGameResult(candidate) {
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

export function normalizeGameResultDraft(result) {
  return {
    outcome: isCompletedGameResult(result) ? result.outcome : '',
    score: isCompletedGameResult(result) && result.score !== null ? String(result.score) : '',
    notes: typeof result?.notes === 'string' ? result.notes : ''
  };
}

export function validateGameResultDraft(draft) {
  const outcome = typeof draft?.outcome === 'string' ? draft.outcome : '';
  const scoreValue = typeof draft?.score === 'string' ? draft.score.trim() : '';
  const notes = trimNotes(draft?.notes);
  const errors = [];

  if (!GAME_OUTCOME_LABELS[outcome]) {
    errors.push('Choose Win or Loss before saving the result.');
  }

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