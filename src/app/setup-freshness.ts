import type { UsageCategoryMap, UsageStat } from './types.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectionResult<T> {
  selected: T[];
  usedFallback: boolean;
  fallbackItems: T[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getUsageStat(usageBucket: UsageCategoryMap | undefined, id: string): UsageStat {
  return usageBucket?.[id] || { plays: 0, lastPlayedAt: null };
}

function getFreshnessKey(usageBucket: UsageCategoryMap | undefined, entity: { id: string }): [number, number, number] {
  const usage = getUsageStat(usageBucket, entity.id);
  const neverPlayed = usage.plays === 0 && usage.lastPlayedAt === null;
  return [
    neverPlayed ? 0 : 1,
    usage.plays,
    usage.lastPlayedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(usage.lastPlayedAt)
  ];
}

function summarizeFallback<T extends { id: string }>(
  selected: T[],
  usageBucket: UsageCategoryMap | undefined
): { usedFallback: boolean; fallbackItems: T[] } {
  const fallbackItems = selected.filter((entity) => getUsageStat(usageBucket, entity.id).plays > 0);
  return {
    usedFallback: fallbackItems.length > 0,
    fallbackItems
  };
}

// ---------------------------------------------------------------------------
// Freshness ranking
// ---------------------------------------------------------------------------

export function rankItemsByFreshness<T extends { id: string }>(
  items: T[],
  usageBucket: UsageCategoryMap | undefined,
  random: () => number = Math.random,
  preferredExpansionId: string | null = null
): T[] {
  const grouped = new Map<string, { key: [number, number, number]; list: T[] }>();

  for (const item of items) {
    const key = getFreshnessKey(usageBucket, item);
    const keyStr = `${key[0]}|${key[1]}`;
    if (!grouped.has(keyStr)) {
      grouped.set(keyStr, { key, list: [] });
    }
    grouped.get(keyStr)!.list.push(item);
  }

  return [...grouped.values()]
    .sort((left, right) => {
      if (left.key[0] !== right.key[0]) return left.key[0] - right.key[0];
      return left.key[1] - right.key[1];
    })
    .flatMap(({ list }) => {
      if (preferredExpansionId) {
        const preferred = shuffle(list.filter((item) => (item as unknown as { setId?: string }).setId === preferredExpansionId), random);
        const others = shuffle(list.filter((item) => (item as unknown as { setId?: string }).setId !== preferredExpansionId), random);
        return [...preferred, ...others];
      }
      return shuffle(list, random);
    });
}

// ---------------------------------------------------------------------------
// Item selection
// ---------------------------------------------------------------------------

export function selectFreshItems<T extends { id: string }>(
  items: T[],
  count: number,
  usageBucket: UsageCategoryMap | undefined,
  random: () => number = Math.random,
  excludeIds: Set<string> = new Set(),
  preferredExpansionId: string | null = null
): SelectionResult<T> {
  const ranked = rankItemsByFreshness(items.filter((entity) => !excludeIds.has(entity.id)), usageBucket, random, preferredExpansionId);
  const selected = ranked.slice(0, count);
  return {
    selected,
    ...summarizeFallback(selected, usageBucket)
  };
}
