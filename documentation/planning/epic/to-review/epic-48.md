## Epic 48 — BGG Collection Import (Authenticated)

**Objective**
Restore the BoardGameGeek collection import feature by replacing the unauthenticated XML API v2 call with a flow that works against BGG's current authentication requirements, so users can import their owned expansions from BGG regardless of their collection privacy settings.

**Background**
Epic 42 implemented a BGG import using the public XML API v2 (`/xmlapi2/collection`). BGG subsequently began returning `401 Unauthorized` with `WWW-Authenticate: Bearer realm="xml api"` for cross-origin requests, making the feature non-functional. The UI and backend utility (`src/app/bgg-import-utils.mjs`) are preserved but hidden behind `{#if false}` in `CollectionTab.svelte` pending a working authentication strategy.

**In scope**
- Investigate BGG's current authentication mechanism (Bearer token, OAuth 2.0, or API key) and determine whether cross-origin use from a static GitHub Pages site is feasible
- If a direct browser call is feasible: update `fetchBggCollection` in `src/app/bgg-import-utils.mjs` to include the required auth headers or token exchange
- If a direct browser call is not feasible: implement a lightweight proxy (e.g. a Cloudflare Worker or GitHub Actions-based server-side step) that fetches the BGG collection server-side and returns it to the client without exposing credentials
- Restore the BGG import panel in `CollectionTab.svelte` by removing the `{#if false}` guard once the fetch reliably returns 200 with collection data
- Update the error messages in `bgg-import-utils.mjs` to reflect the new authentication flow
- Ensure existing unit tests in `test/epic42-bgg-import.test.mjs` continue to pass; add tests for any new auth or proxy logic

**Out of scope**
- Full BGG OAuth login flow with persistent session management
- Writing or reading BGG data beyond the owned-collection list
- Changes to the matching (`matchBggNamesToSets`) or merging (`mergeOwnedSets`) logic, which already work correctly

**Stories**
1. **Investigate BGG authentication requirements and select an implementation strategy**
2. **Implement the chosen strategy and restore the BGG import panel**
3. **Update tests and error messages to reflect the new auth flow**

**Acceptance Criteria**
- Story 1: A written investigation note (in this epic file or a linked decision record) documents the selected strategy and why alternatives were ruled out.
- Story 2: Submitting a valid BGG username in the Collection tab import panel returns the user's owned games without a 401 or 301 error; the existing match-and-merge flow operates as designed by Epic 42.
- Story 3: `npm run lint` and `npm test` pass; any new auth or proxy code is covered by unit or integration tests with injectable dependencies.
