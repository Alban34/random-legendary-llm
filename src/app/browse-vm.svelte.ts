// src/app/browse-vm.svelte.ts
// Svelte 5 reactive view-model for the Browse tab.

export type BrowseTypeFilter = 'all' | 'base' | 'large-expansion' | 'small-expansion';
export type BrowseSortKey = 'name' | 'releaseYear' | 'collection';

let _browseSearchTerm: string = $state<string>('');
let _browseTypeFilter: BrowseTypeFilter = $state<BrowseTypeFilter>('all');
let _expandedBrowseSetId: string | null = $state<string | null>(null);
let _browseSortKey: BrowseSortKey = $state<BrowseSortKey>('name');

export function getBrowseSearchTerm(): string { return _browseSearchTerm; }
export function setBrowseSearchTerm(v: string): void { _browseSearchTerm = v; }

export function getBrowseTypeFilter(): BrowseTypeFilter { return _browseTypeFilter; }
export function setBrowseTypeFilter(v: BrowseTypeFilter): void { _browseTypeFilter = v; }

export function getExpandedBrowseSetId(): string | null { return _expandedBrowseSetId; }
export function setExpandedBrowseSetId(v: string | null): void { _expandedBrowseSetId = v; }

export function getBrowseSortKey(): BrowseSortKey { return _browseSortKey; }
export function setBrowseSortKey(v: BrowseSortKey): void { _browseSortKey = v; }
