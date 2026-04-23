let _browseSearchTerm = $state('');
let _browseTypeFilter = $state('all');
let _expandedBrowseSetId = $state(null);

export function getBrowseSearchTerm() { return _browseSearchTerm; }
export function setBrowseSearchTerm(v) { _browseSearchTerm = v; }

export function getBrowseTypeFilter() { return _browseTypeFilter; }
export function setBrowseTypeFilter(v) { _browseTypeFilter = v; }

export function getExpandedBrowseSetId() { return _expandedBrowseSetId; }
export function setExpandedBrowseSetId(v) { _expandedBrowseSetId = v; }
