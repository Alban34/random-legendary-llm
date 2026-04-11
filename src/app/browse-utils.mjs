import { slugify } from './game-data-pipeline.mjs';

// TODO: small/large expansion reclassifications need user-provided corrections before they can be applied
export const BROWSE_TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'base', label: 'Base Game' },
  { id: 'large-expansion', label: 'Large' },
  { id: 'small-expansion', label: 'Small' },
  { id: 'standalone', label: 'Standalone' }
];

const TYPE_LABELS = {
  base: 'Base Game',
  'large-expansion': 'Large Expansion',
  'small-expansion': 'Small Expansion',
  standalone: 'Standalone'
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

export function filterBrowseSets(sets, { searchTerm = '', typeFilter = 'all' } = {}) {
  return sets
    .filter((set) => {
      const matchesType = typeFilter === 'all' || set.type === typeFilter;
      return matchesType && matchesBrowseSearch(set, searchTerm);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

