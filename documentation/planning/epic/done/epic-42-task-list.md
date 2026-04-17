# Epic 42 — BGG Collection Import: Task List

## Story 42.1 — Add a BGG username input and import trigger to the Collection tab

- [x] Add a `bggUsername` local reactive variable (string) and an `importStatus` reactive variable (`'idle' | 'loading' | 'error' | 'done'`) inside `src/components/CollectionTab.svelte`
- [x] Add an `onImportBggCollection` prop to `CollectionTab.svelte` alongside the existing `onToggleOwnedSet` and `onRequestResetOwnedCollection` props
- [x] Render a new `<section class="panel">` block inside `CollectionTab.svelte` above the existing set-ownership groups, containing a `<label>` with `for="bgg-username"`, a `<input type="text" id="bgg-username">` bound to `bggUsername`, and a submit `<button>` labelled "Import from BGG"
- [x] Disable the submit button (`disabled={importStatus === 'loading'}`) and render an inline loading indicator (e.g. `aria-busy="true"` on the button, visible spinner text) while `importStatus === 'loading'`
- [x] Allow keyboard submission by wrapping input and button in a `<form>` with `onsubmit` that calls `onImportBggCollection(bggUsername)` and prevents default; also handle the button's `onclick` for pointer users
- [x] Trim the `bggUsername` value before passing it to `onImportBggCollection`; keep the button disabled when the trimmed value is empty
- [x] Add a stub `actions.importBggCollection` handler in `src/components/App.svelte` (no-op initially) and pass it as `onImportBggCollection` to the `CollectionTab` mount in the same way `onToggleOwnedSet` is passed
- [x] Test: in a browser, navigate to the Collection tab; confirm the BGG username label, input, and "Import from BGG" button are visible; confirm submitting with an empty input does not trigger the action; confirm the button becomes disabled while `importStatus` is `'loading'`; confirm existing set-ownership checkboxes remain unaffected
- [x] QC (Automated): add `test/epic42-bgg-import.test.mjs`; assert that `CollectionTab.svelte` exports a component that accepts the `onImportBggCollection` prop without error (smoke-render via a headless DOM or JSDOM stub); assert the submit button has `disabled` when `bggUsername` is empty

---

## Story 42.2 — Fetch and parse the BGG public collection XML API, handling queued and error states

- [x] Create `src/app/bgg-import-utils.mjs` and export `fetchBggCollection(username, { maxRetries = 5, retryDelayMs = 2000, fetchFn = globalThis.fetch } = {})` — accepting an injectable `fetchFn` for testability
- [x] Inside `fetchBggCollection`, construct the request URL as `https://www.boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&own=1`; make no other query parameters
- [x] On a 202 response, wait `retryDelayMs` milliseconds and retry up to `maxRetries` times; if retries are exhausted return `{ ok: false, error: 'BGG collection request timed out after queuing — please try again.' }`
- [x] On a 4xx or 5xx response (excluding 202), return `{ ok: false, error: \`BGG returned an error (HTTP ${response.status}). Check the username and try again.\` }`
- [x] On a network error (fetch throws), catch and return `{ ok: false, error: 'Network error — check your connection and try again.' }`
- [x] On a 200 response, parse the response body as XML using `new DOMParser().parseFromString(text, 'text/xml')`; extract all `<item>` elements; for each item read the `<name sortindex="1">` text content as the BGG game name
- [x] If the parsed item list is empty, return `{ ok: true, gameNames: [] }` (valid but empty — caller handles the empty-collection message)
- [x] Return `{ ok: true, gameNames: string[] }` on success
- [x] Wire `fetchBggCollection` into the `actions.importBggCollection` handler in `src/components/App.svelte`: set `importStatus` to `'loading'`, call `fetchBggCollection`, on failure set `importStatus` to `'error'` and surface the error message via the existing toast system (`pushToast`)
- [x] Test: with a real BGG username (e.g. "Antistone") in the running dev build, trigger the import and confirm in DevTools Network that the correct URL is requested; confirm a 202 from BGG causes the UI to continue showing the loading state; confirm a network-disabled scenario shows a user-readable error toast
- [x] QC (Automated): in `test/epic42-bgg-import.test.mjs`, unit-test `fetchBggCollection` by injecting a mock `fetchFn`; cover: (a) 200 with valid XML returns the correct `gameNames` array, (b) 202 followed by 200 on retry returns the names, (c) 202 exhausting retries returns `ok: false`, (d) network throw returns `ok: false`, (e) 404 returns `ok: false` with an HTTP error message

---

## Story 42.3 — Match BGG game names to the app's expansion catalog using name and alias lookup

- [x] Export `matchBggNamesToSets(bggGameNames, sets)` from `src/app/bgg-import-utils.mjs`, where `sets` is the `runtime.sets` array from the loaded `bundle`
- [x] Before matching, build a lookup `Map<string, setId>` keyed on the lowercase version of each set's `name` and each string in its `aliases` array, mapping to `set.id`; build this map once per call, not per name
- [x] For each `bggGameName` in `bggGameNames`, normalise to lowercase (`bggGameName.trim().toLowerCase()`) and look it up in the map; collect the resolved `set.id` when found
- [x] Collect unresolvable BGG game names (those not matching any catalog entry) into a separate `unmatched` array
- [x] Return `{ matched: Array<{ setId: string, setName: string, bggName: string }>, unmatched: string[] }`
- [x] Wire `matchBggNamesToSets` into `actions.importBggCollection` in `src/components/App.svelte`: call it after `fetchBggCollection` succeeds, passing `bundle.runtime.sets`
- [x] Test: using the dev console, call `matchBggNamesToSets(["Legendary: A Marvel Deck Building Game", "Dark City", "Unknown Expansion"], bundle.runtime.sets)` and verify "Core Set" is matched via its alias, "Dark City" is matched by name, and "Unknown Expansion" appears in `unmatched`
- [x] QC (Automated): in `test/epic42-bgg-import.test.mjs`, load the real `canonical-game-data.json` seed via `createEpic1Bundle`; assert that `matchBggNamesToSets(["Legendary: A Marvel Deck Building Game"], sets)` returns `matched[0].setId === 'core-set'`; assert that a correctly cased canonical name like `"Dark City"` also matches; assert that a completely unknown name lands in `unmatched`; assert the function is case-insensitive by passing `"dark city"` in lowercase

---

## Story 42.4 — Merge matched expansions into the owned collection in localStorage without removing prior selections

- [x] Export `mergeOwnedSets(state, newSetIds)` from `src/app/bgg-import-utils.mjs`; it takes the current `appState` object and an array of catalog set IDs; returns a new state object (deep clone via `structuredClone`) with `collection.ownedSetIds` set to the sorted, deduplicated union of the existing IDs and `newSetIds`
- [x] Ensure `mergeOwnedSets` is idempotent: calling it twice with the same `newSetIds` produces the same `ownedSetIds` as calling it once
- [x] In `src/components/App.svelte`, call `mergeOwnedSets(appState, matchedSetIds)` after `matchBggNamesToSets` to produce a merged state candidate, then persist it using the existing `updateState({ storageAdapter, indexes, currentState: appState, updater: (draft) => mergeOwnedSets(draft, matchedSetIds) })` pattern; assign the returned `state` back to `appState`
- [x] Do not call `toggleOwnedSet` per item — write the full merged set in a single `updateState` call
- [x] Test: with a pre-existing owned set ("core-set"), trigger a BGG import that resolves "Dark City"; confirm after import that both "core-set" and "dark-city" are checked in the collection list; reload the page and confirm both remain checked (localStorage persisted)
- [x] QC (Automated): in `test/epic42-bgg-import.test.mjs`, test `mergeOwnedSets` directly: (a) given a state with `ownedSetIds: ['core-set']` and `newSetIds: ['dark-city']`, the result has `['core-set', 'dark-city']` sorted; (b) given overlapping IDs `newSetIds: ['core-set']`, the result is still `['core-set']` (no duplicates); (c) given `newSetIds: []`, the original `ownedSetIds` is unchanged

---

## Story 42.5 — Display a post-import summary listing matched expansions and unresolved BGG titles

- [x] Add a `bggImportSummary` local reactive variable to `CollectionTab.svelte`, initialised to `null`; its shape when set is `{ matched: Array<{ setId, setName, bggName }>, unmatched: string[] }`
- [x] Add an `onSetBggImportSummary` prop to `CollectionTab.svelte` so `App.svelte` can push the summary result into the component after a completed import; alternatively, pass the summary data as a prop directly (consistent with how `lastActionNotice` is passed)
- [x] After a successful `mergeOwnedSets` call in `src/components/App.svelte`, store `{ matched, unmatched }` and pass it down to `CollectionTab` so the summary becomes visible
- [x] In `CollectionTab.svelte`, render the summary panel only when `bggImportSummary !== null`; include: a heading ("BGG Import Summary"), a count sentence ("X expansion(s) added to your collection"), a list of matched expansion names, and — if `unmatched.length > 0` — a section listing each unmatched BGG title under a "Not found in catalog" heading
- [x] Render a "Dismiss" button inside the summary panel that sets `bggImportSummary` to `null` (local dismiss); the owned collection must not change on dismiss
- [x] When `bggImportSummary !== null` and `matched.length === 0`, show a distinct "No matching expansions found" message instead of the matched list
- [x] When `importStatus === 'error'`, render the error message inline below the input (not just as a toast) so it persists for re-reading without the username input being cleared
- [x] Set `importStatus` back to `'idle'` after the summary is populated so the button re-enables and the user can retry without refreshing
- [x] Test: trigger a successful import that matches at least one expansion and leaves at least one name unmatched; verify the summary panel appears, shows the correct matched name(s), shows the unmatched title(s), and that clicking "Dismiss" removes the panel; verify the matched sets remain owned after dismissal; trigger a second identical import and verify the collection size does not grow (idempotent)
- [x] QC (Automated): in `test/epic42-bgg-import.test.mjs`, assert that `CollectionTab.svelte` renders the summary section when `bggImportSummary` prop is set to a non-null value with at least one matched entry; assert the summary section is absent when `bggImportSummary` is `null`; assert a Dismiss interaction results in the summary being hidden; run `npm run lint` and confirm no new ESLint errors in `src/app/bgg-import-utils.mjs` or `src/components/CollectionTab.svelte`
