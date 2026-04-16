## Epic 45 — MyLudo Collection Import


**Objective**
Let a user upload a collection export file from MyLudo and have the app parse it client-side, match the game names against the Legendary: Marvel expansion catalog, and pre-populate their owned collection — without requiring any server round-trip or MyLudo account credentials.

**In scope**
- a file-upload control in the Collection tab that accepts a MyLudo collection export file
- client-side parsing of the uploaded file (CSV or equivalent format MyLudo provides) to extract owned game names — no data is transmitted to any server
- matching extracted game names against the app's expansion catalog (case-insensitive, alias-aware) to resolve catalog expansion IDs
- merging matched expansions into the user's existing owned set in localStorage without removing manually selected sets
- surfacing a post-import summary: how many expansions were matched, which MyLudo titles had no catalog match
- graceful handling of invalid, empty, or unrecognised file formats

**Out of scope**
- fetching data directly from MyLudo via any API or network call
- authenticating with a MyLudo account
- automatic or scheduled background sync with MyLudo
- adding MyLudo ID fields to the canonical game-data schema
- BGG import (covered by Epic 42)

**Stories**
1. **Research and document the MyLudo collection export file format**
2. **Add a MyLudo file-upload import control to the Collection tab**
3. **Parse the uploaded MyLudo export file client-side and extract owned game names**
4. **Match extracted game names to the app's expansion catalog using name and alias lookup**
5. **Merge matched expansions into the owned collection and display a post-import summary**

**Acceptance Criteria**
- Story 1: The MyLudo export file format (field names, delimiters, encoding, and which field contains the game name) is documented before any implementation begins; if the format cannot be confirmed from public sources, the story produces a spike report with findings and a recommended parsing strategy.
- Story 2: A labeled file-upload button for MyLudo appears in the Collection tab alongside or near the BGG import controls; the control is keyboard-accessible; selecting a file triggers parsing immediately without a separate submit step; no layout change affects the existing set-ownership controls.
- Story 3: The selected file is read entirely client-side using the browser File API; game names are extracted from the correct field identified in Story 1; malformed, empty, or unrecognised files surface a user-readable error message and leave the existing owned set unchanged.
- Story 4: Each extracted game name is tested against the app's expansion catalog using case-insensitive comparison and the catalog's `aliases` array; every catalog expansion that can be matched is returned as a resolved catalog expansion ID; unresolvable names are collected separately.
- Story 5: All resolved catalog expansion IDs are marked owned in the persisted collection slice; any expansion already marked owned before the import remains owned; the import is idempotent; after a successful import the UI displays matched expansions and lists any MyLudo titles that could not be matched; the user can dismiss the summary and retry without losing their existing owned set.
