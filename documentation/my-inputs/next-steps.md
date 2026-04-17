# Ideas of improvements

- [x] Add possibility to do 2-handed solo
- [x] Add possibility to save the score of a given game, and to keep track of the score history across games
- [x] Add possibility to export the collection and score history as a JSON file, and to import it back to the app
- [x] Add stats on games played, win/loss ratio, most played cards, etc.
- [x] Add a "forced" mode where the user can select a card that must be included in the next setup, and the app will generate a setup that includes that card if possible
- [x] Toasts should be floating from the bottom of the screen, not taking space in the layout, and should stack if multiple toasts are triggered at the same time
- [x] Investigate if using 3rd party CSS libs could improve visual and simplify code, while keeping the "no external dependencies at runtime" constraint (e.g. by inlining the CSS in a static file)
- [x] Add a "dark mode" toggle to the UI, and persist the user's preference in browser storage
- [x] No need for a toast when re-using an already played card, as the card list already shows which cards have been used or not.
- [x] Toasts should dismiss automatically after a few seconds, and should also be dismissible by the user (e.g. by clicking on them) unless they are critical errors that require user attention (e.g. "no more cards available for the selected collection and player count")
- [x] Add an introductory tutorial or walkthrough for first-time users, explaining the main features and how to use the app effectively
- [x] Improve the welcome page, it looks too crowded and overwhelming, maybe by adding some spacing, grouping related information, and using a more visually appealing layout
- [x] Do not display developers information by default, it should be hidden behind a "About this project" link or button, to avoid overwhelming users who just want to use the app without being interested in the development details
- [x] Game history should be first in the History page
- [x] Interface localisation
- [x] Group games in history (by mastermind? player count? something else?)
- [x] Move the "Get comfortable with the app in under a minute" on top
- [x] "Browse sets" should be full width
- [x] "Ready Tabs" is not a relevant information, you should remove it
- [x] "First-run walkthrough" is not translated
- [x] Order set in alphabetical order
- [x] Improve layout of stats: I would like heroes, masterminds, etc. tiles being full width and collapsible
- [x] Revisit and remove unecessary technical information (such as "Presentation only. Grouping never changes saved history or backups.")
- [x] Toast is not needed when switching dark/light mode
- [x] Toasts should be displayed on the bottom, raise from "outside" the window and disappear the same way
- [x] Storage issue information should appear only if there is actually an issue, no need to indicate that everything is green
- [x] The classification of expansions should be revisited: Core and Villains should be both "Base games", there are mistakes in small and large expansions, if you need me to fix this, I can help.
- [x] The generate and re-generate buttons do not make sense as they are doing the same thing in the end: there should be only one
- [x] The generate button is too far below, the user needs to scroll down through optional information before reaching this mandatory button, this is not convenient, you should find a better layout
- [x] The version of the app should be displayed in the header
- [x] The header is too big in my opinion (mainly because of the language and theme selections), you should revisit this to improve the usability
- [x] "Show history-ready setup snapshot" should not be there: dev thing
- [x] The title is now too small, it should be bigger and align with the top of the screen (with language and theme basically)
- [x] Revelations is a small extension, there is no standalone at all, only base games
- [x] Refactor the whole project to use the latest Svelte framework
- [x] In history, I want to group by mastermind, schemes, heroes, villains and player mode, only those.
- [x] "Least-played fallback used for Scheme selection" always appears, this is probably a defect
- [x] History grouping should be in alphabetical order

## Code quality findings (2026-04-14 audit)

- [x] **[Security]** `app-renderer.mjs`: `error.message` and `error.stack` are interpolated directly into `.innerHTML` — potential XSS sink if the error string carries user-influenced content. Replace with DOM `textContent` assignments or sanitize before insertion.
- [x] **[Security/Privacy]** `App.svelte` `syncGlobals()` exposes full app state on `globalThis` (`__APP_STATE__`, `__EPIC1__`, etc.) on every reactive render, with no dev-mode guard. Wrap the entire block in `if (import.meta.env.DEV)` so it is stripped from production builds.
- [x] **[Svelte 5 migration debt]** `App.svelte` still imports `onMount` and `tick` from Svelte, which are legacy lifecycle APIs. These should be replaced with `$effect` callbacks (with cleanup returned where needed), consistent with the Svelte 5 migration done in Epics 29–33.
- [x] **[Maintainability]** `App.svelte` is a God Component — it owns all state, all derived values, all event handlers, all tab logic, and all persistence coordination. As features grow this will become a bottleneck. Consider extracting per-tab view-model modules (similar to the existing `state-store.svelte.js` pattern) so `App.svelte` only orchestrates routing and persistence.
- [x] **[Minor]** `setup-generator.mjs` `rankItemsByFreshness`: uses `JSON.stringify`/`JSON.parse` round-trips as composite Map keys. Replace with a lightweight string key built directly (e.g. template literal) to avoid the serialization cost and fragility.
- [x] **[Minor]** `package.json`: every `test:epicX` script has an identical `check:epicX` duplicate — 30+ redundant lines. Consolidate to a single set of script names.
- [x] **[Minor]** `app-renderer.mjs`: the file opens with 7 comment lines that exist solely so string-inspection tests can `grep` for them. Tests should assert on actual rendered output strings, not on dead comment markers in source files.
