## Epic 42 — BGG Collection Import


**Objective**
Let a user supply their BoardGameGeek username to have the app fetch their public owned-game list, match it against the Legendary: Marvel expansion catalog, and pre-populate their owned collection — eliminating the need to tick every set manually.

**In scope**
- a BGG username input control and import trigger accessible from the Collection tab
- fetching the BGG public collection XML API (`/xmlapi2/collection?username={user}&own=1`) — read-only, no authentication required
- handling BGG-specific API behaviour: 202 "queued" responses (retry after delay), network errors, and empty result sets
- matching BGG game names against the app's expansion catalog (case-insensitive, alias-aware) to resolve catalog expansion IDs
- merging matched expansions into the user's existing owned set in localStorage without removing manually selected sets
- surfacing a post-import summary: how many expansions were matched, which BGG titles had no catalog match

**Out of scope**
- pushing any data back to BGG or authenticating with a BGG account
- automatic or scheduled background sync with BGG
- adding BGG ID fields to the canonical game-data schema
- MyLudo or any other third-party platform (covered by Epic 45)

**Stories**
1. **Add a BGG username input and import trigger to the Collection tab**
2. **Fetch and parse the BGG public collection XML API response, handling queued and error states**
3. **Match BGG game names to the app's expansion catalog using name and alias lookup**
4. **Merge matched expansions into the owned collection in localStorage without removing prior selections**
5. **Display a post-import summary listing matched expansions and unresolved BGG titles**

**Acceptance Criteria**
- Story 1: A labeled BGG username text input and submit button appear in the Collection tab; the control is keyboard-accessible; the button is disabled and shows a loading indicator while a fetch is in progress; no layout change affects the existing set-ownership controls.
- Story 2: Submitting a valid BGG username triggers a fetch to the BGG XML API endpoint with `own=1`; a 202 response causes the app to retry automatically after a short delay (at least one retry); a network error or non-200 terminal response presents a user-readable error message; no API key or login is required.
- Story 3: Each BGG game name in the XML response is tested against the app's expansion catalog using case-insensitive comparison and the catalog's `aliases` array; every catalog expansion that can be matched is returned as a resolved catalog expansion ID; unresolvable titles are collected separately.
- Story 4: All resolved catalog expansion IDs are marked owned in the persisted collection slice; any expansion already marked owned before the import remains owned regardless of whether it appeared in the BGG response; the import is idempotent (running it twice produces the same result).
- Story 5: After a successful import the UI displays the count and names of matched expansions and lists any BGG titles that could not be matched; the user can dismiss the summary and retry the import without losing their existing owned set.
