// src/app/browse-vm.svelte.ts
// Svelte 5 reactive view-model for the Browse tab.

export type BrowseTypeFilter = 'all' | 'base' | 'large-expansion' | 'small-expansion';
export type BrowseSortKey = 'name' | 'releaseYear' | 'collection';

export const browseVm = $state<{
  searchTerm: string;
  typeFilter: BrowseTypeFilter;
  expandedSetId: string | null;
  sortKey: BrowseSortKey;
}>({
  searchTerm: '',
  typeFilter: 'all',
  expandedSetId: null,
  sortKey: 'name'
});

export function createBrowseActions() {
  return {
    setBrowseSearchTerm(term: string) {
      browseVm.searchTerm = term;
    },
    setBrowseTypeFilter(filter: string) {
      browseVm.typeFilter = filter as BrowseTypeFilter;
    },
    toggleBrowseSetExpanded(setId: string) {
      browseVm.expandedSetId = browseVm.expandedSetId === setId ? null : setId;
    }
  };
}
