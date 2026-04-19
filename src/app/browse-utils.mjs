import { slugify } from './game-data-pipeline.mjs';

export const BROWSE_TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'base', label: 'Base Game' },
  { id: 'large-expansion', label: 'Large' },
  { id: 'small-expansion', label: 'Small' }
];

export const BROWSE_SORT_OPTIONS = [
  { id: 'name' },
  { id: 'releaseYear' },
  { id: 'collection' }
];

const TYPE_LABELS = {
  base: 'Base Game',
  'large-expansion': 'Large Expansion',
  'small-expansion': 'Small Expansion'
};

export function getBrowseTypeLabel(type) {
  return TYPE_LABELS[type] || type;
}

export function summarizeBrowseSet(set) {
  return {
    heroCount: set.heroes.length,
    mastermindCount: set.masterminds.length,
    villainGroupCount: set.villainGroups.length,
    henchmanGroupCount: set.henchmanGroups.length,
    schemeCount: set.schemes.length
  };
}

function normalizeBrowseSearchValue(value) {
  return slugify(value || '');
}

export function matchesBrowseSearch(set, searchTerm) {
  const normalizedQuery = normalizeBrowseSearchValue(searchTerm);
  if (!normalizedQuery) {
    return true;
  }

  return [set.name, ...(set.aliases || [])]
    .map((value) => normalizeBrowseSearchValue(value))
    .some((value) => value.includes(normalizedQuery));
}

export function filterBrowseSets(sets, { searchTerm = '', typeFilter = 'all', sortKey = 'name', ownedSetIds = new Set() } = {}) {
  return sets
    .filter((set) => {
      const matchesType = typeFilter === 'all' || set.type === typeFilter;
      return matchesType && matchesBrowseSearch(set, searchTerm);
    })
    .sort((a, b) => {
      if (sortKey === 'releaseYear') {
        return (a.year - b.year) || a.name.localeCompare(b.name);
      }
      if (sortKey === 'collection') {
        const aOwned = ownedSetIds.has(a.id) ? 0 : 1;
        const bOwned = ownedSetIds.has(b.id) ? 0 : 1;
        return (aOwned - bOwned) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
}

