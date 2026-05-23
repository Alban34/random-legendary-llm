import { createLocaleTools, normalizeLocaleId } from './localization-utils.ts';
import type { GameResult, GameOutcome, PlayerScoreEntry } from './types.ts';

export const GAME_RESULT_STATUS_PENDING = 'pending' as const;
export const GAME_RESULT_STATUS_COMPLETED = 'completed' as const;

export const GAME_OUTCOME_OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'win', label: 'Win' },
  { id: 'loss', label: 'Loss' },
  { id: 'draw', label: 'Draw' }
];

const GAME_OUTCOME_LABELS: Record<string, string> = Object.fromEntries(
  GAME_OUTCOME_OPTIONS.map((option) => [option.id, option.label])
);
const MAX_RESULT_NOTES_LENGTH = 500;

export interface CreateCompletedGameResultOptions {
  outcome: string;
  score?: number | null | Partial<PlayerScoreEntry>[];
  notes?: string;
  updatedAt?: string;
  playerCount?: number;
}

type GameResultDraft =
  | { outcome: string; playerScores: { playerName: string; score: string }[]; notes: string }
  | { outcome: string; score: string; notes: string };

type ValidationResult =
  | { ok: false; errors: string[]; result: null }
  | { ok: true; errors: string[]; result: GameResult };

function trimNotes(notes: unknown): string {
  return typeof notes === 'string'
    ? notes.trim().slice(0, MAX_RESULT_NOTES_LENGTH)
    : '';
}

function normalizeScore(score: unknown): number | null {
  if (score === null || score === undefined) {
    return null;
  }
  if (!Number.isInteger(score) || (score as number) < 0) {
    return null;
  }
  return score as number;
}

export function createPlayerScoreEntry({ playerName = '', score = null }: Partial<PlayerScoreEntry> = {}): PlayerScoreEntry {
  return {
    playerName: typeof playerName === 'string' ? playerName.trim() : '',
    score: normalizeScore(score)
  };
}

export function createPerPlayerScoreArray(playerCount: number): PlayerScoreEntry[] {
  return Array.from({ length: playerCount }, () => ({ playerName: '', score: null }));
}

export function createPendingGameResult(): GameResult {
  return {
    status: GAME_RESULT_STATUS_PENDING,
    outcome: null,
    score: null,
    notes: '',
    updatedAt: null
  };
}

export function isCompletedGameResult(result: GameResult | null | undefined): result is Extract<GameResult, { status: 'completed' }> {
  return result?.status === GAME_RESULT_STATUS_COMPLETED;
}

export function formatGameOutcomeLabel(outcome: string): string {
  return GAME_OUTCOME_LABELS[outcome] || 'Unknown';
}

export function formatGameResultStatus(result: GameResult | null | undefined, locale = 'en-US'): string {
  if (!isCompletedGameResult(result)) {
    return 'Pending result';
  }

  if (Array.isArray(result.score)) {
    const outcomeLabel = formatGameOutcomeLabel(result.outcome);
    const parts = result.score.map((entry, index) => {
      const name = entry.playerName && entry.playerName.trim() !== '' ? entry.playerName : `Player ${index + 1}`;
      const scoreStr = entry.score === null ? '\u2014' : new Intl.NumberFormat(locale).format(entry.score);
      return `${name}: ${scoreStr}`;
    });
    return `${outcomeLabel} \u00b7 ${parts.join(' \u00b7 ')}`;
  }

  if (result.score === null) {
    return formatGameOutcomeLabel(result.outcome);
  }

  const { t } = createLocaleTools(normalizeLocaleId(locale));
  const scoreLabel = t('result.scoreLabel');
  const formattedScore = new Intl.NumberFormat(locale).format(result.score);
  return `${formatGameOutcomeLabel(result.outcome)} \u00b7 ${scoreLabel} ${formattedScore}`;
}

function createMultiplayerCompletedGameResult(outcome: string, score: unknown, notes: string, updatedAt: string): GameResult {
  if (!Array.isArray(score)) {
    throw new TypeError('Per-player score array is required for multiplayer games.');
  }
  const normalizedEntries = (score as Partial<PlayerScoreEntry>[]).map((entry) => createPlayerScoreEntry(entry));
  if (outcome === 'win' && normalizedEntries.every((entry) => entry.score === null)) {
    throw new Error('Enter a whole-number score that is 0 or greater before saving the game result.');
  }
  return {
    status: GAME_RESULT_STATUS_COMPLETED,
    outcome: outcome as GameOutcome,
    score: normalizedEntries,
    notes: trimNotes(notes),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date().toISOString()
  };
}

export function createCompletedGameResult({ outcome, score, notes = '', updatedAt = new Date().toISOString(), playerCount = 1 }: CreateCompletedGameResultOptions): GameResult {
  if (!GAME_OUTCOME_LABELS[outcome]) {
    throw new Error('Choose a valid outcome before saving the game result.');
  }

  if (playerCount >= 2) {
    return createMultiplayerCompletedGameResult(outcome, score, notes, updatedAt);
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
    outcome: outcome as GameOutcome,
    score: normalizedScore,
    notes: trimNotes(notes),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date().toISOString()
  };
}

function sanitizePendingCandidate(c: Record<string, unknown>, playerCount: number): { result: GameResult; recovered: boolean } {
  if (playerCount >= 2) {
    if (c.score !== null && !Array.isArray(c.score)) {
      return { result: createPendingGameResult(), recovered: true };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingResult = createPendingGameResult() as any;
    if (Array.isArray(c.score)) {
      pendingResult.score = (c.score as unknown[]).map((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          return { playerName: '', score: null };
        }
        return createPlayerScoreEntry(entry as Partial<PlayerScoreEntry>);
      });
    }
    return { result: pendingResult as GameResult, recovered: false };
  }

  const notes = trimNotes(c.notes);
  const updatedAt = c.updatedAt === null || typeof c.updatedAt === 'string'
    ? c.updatedAt
    : null;
  const recovered = c.outcome !== null
    || c.score !== null
    || notes !== ''
    || updatedAt !== null;

  return {
    result: createPendingGameResult(),
    recovered: recovered
  };
}

function sanitizeCompletedMultiplayerResult(c: Record<string, unknown>, playerCount: number): { result: GameResult; recovered: boolean } {
  const sanitizedEntries = (c.score as unknown[]).map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return { playerName: '', score: null };
    }
    return createPlayerScoreEntry(entry as Partial<PlayerScoreEntry>);
  });
  try {
    return {
      result: createCompletedGameResult({
        outcome: c.outcome as string,
        score: sanitizedEntries,
        notes: c.notes as string,
        updatedAt: c.updatedAt as string,
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

export function sanitizeStoredGameResult(candidate: unknown, playerCount = 1): { result: GameResult; recovered: boolean } {
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

  const c = candidate as Record<string, unknown>;

  if (c.status === GAME_RESULT_STATUS_PENDING) {
    return sanitizePendingCandidate(c, playerCount);
  }

  if (c.status !== GAME_RESULT_STATUS_COMPLETED) {
    return {
      result: createPendingGameResult(),
      recovered: true
    };
  }

  if (playerCount >= 2 && !Array.isArray(c.score)) {
    return {
      result: createPendingGameResult(),
      recovered: true
    };
  }

  if (playerCount >= 2 && Array.isArray(c.score)) {
    return sanitizeCompletedMultiplayerResult(c, playerCount);
  }

  try {
    return {
      result: createCompletedGameResult({
        outcome: c.outcome as string,
        score: c.score as number | null,
        notes: c.notes as string,
        updatedAt: c.updatedAt as string
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

export function normalizeGameResultDraft(result: GameResult | null | undefined, playerCount = 1): GameResultDraft {
  if (playerCount >= 2 && isCompletedGameResult(result) && Array.isArray(result.score)) {
    return {
      outcome: result.outcome,
      playerScores: result.score.map((e) => ({
        playerName: e.playerName,
        score: e.score === null ? '' : String(e.score)
      })),
      notes: typeof result.notes === 'string' ? result.notes : ''
    };
  }
  return {
    outcome: isCompletedGameResult(result) ? result.outcome : '',
    score: isCompletedGameResult(result) && typeof result.score === 'number' ? String(result.score) : '',
    notes: typeof result?.notes === 'string' ? result.notes : ''
  };
}

function validateMultiplayerDraft(
  outcome: string,
  notes: string,
  playerScores: unknown[],
  playerCount: number,
  preExistingErrors: string[]
): ValidationResult {
  const errors = [...preExistingErrors];

  if (playerScores.length !== playerCount) {
    errors.push('Player scores are missing or incomplete.');
  }

  for (const entry of playerScores) {
    const e = (entry ?? {}) as Record<string, unknown>;
    const scoreStr = typeof e.score === 'string' ? e.score.trim() : '';
    if (scoreStr !== '') {
      const parsed = Number.parseInt(scoreStr, 10);
      if (!/^\d+$/.test(scoreStr) || !Number.isInteger(parsed) || parsed < 0) {
        errors.push('Score must be a whole number that is 0 or greater.');
        break;
      }
    }
  }

  if (outcome === 'win' && !playerScores.some((entry) => {
    const e = (entry ?? {}) as Record<string, unknown>;
    const scoreStr = typeof e.score === 'string' ? e.score.trim() : '';
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
        const e = (entry ?? {}) as Record<string, unknown>;
        const scoreStr = typeof e.score === 'string' ? e.score.trim() : '';
        return {
          playerName: typeof e.playerName === 'string' ? e.playerName : '',
          score: scoreStr === '' ? null : Number.parseInt(scoreStr, 10)
        };
      }),
      notes,
      playerCount
    })
  };
}

export function validateGameResultDraft(draft: unknown, playerCount = 1): ValidationResult {
  const d = (draft as Record<string, unknown>) ?? {};
  const outcome = typeof d.outcome === 'string' ? d.outcome : '';
  const notes = trimNotes(d.notes);
  const errors: string[] = [];

  if (!GAME_OUTCOME_LABELS[outcome]) {
    errors.push('Choose Win or Loss before saving the result.');
  }

  if (playerCount >= 2) {
    const playerScores = Array.isArray(d.playerScores) ? (d.playerScores as unknown[]) : [];
    return validateMultiplayerDraft(outcome, notes, playerScores, playerCount, errors);
  }

  const scoreValue = typeof d.score === 'string' ? d.score.trim() : '';

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
