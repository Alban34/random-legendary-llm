# Epics Summary

All completed epics from the `done/` folder.

| # | Title | Description |
|---|-------|-------------|
| 1 | Data Foundation and Normalization | Build the canonical game-data layer from approved BoardGameGeek references, normalize it into runtime-safe entities, and validate all resolved references. |
| 2 | State Management and Persistence | Implement the versioned root browser state and all storage operations required by the app. |
| 3 | Setup Generation Engine | Generate legal game setups from the owned collection using legality-first validation and least-played fallback. |
| 4 | Application Shell and Navigation | Expand the existing single-page shell into the full tabbed application shell, layout system, and shared UI infrastructure. |
| 5 | Browse Extensions Experience | Let users browse included sets, inspect their contents, and add/remove them from the owned collection. |
| 6 | Collection Management Experience | Provide an owned-collection view with grouped selection controls and setup-capacity visibility. |
| 7 | New Game Setup Experience | Provide the full game setup workflow from player-count selection to accepting a generated setup. |
| 8 | History, Usage, and Reset Experience | Show usage freshness, history records, and reset capabilities in a clear and safe way. |
| 9 | Notifications, Error Handling, and Accessibility | Ensure the app behaves clearly and safely in edge cases and remains accessible. |
| 10 | Final Documentation and Release Readiness | Finish all user-facing and developer-facing project documentation and align it with the implemented behavior. |
| 11 | Alternate Solo and Multiplayer Modes | Expand setup generation and game logging to support additional supported play modes beyond the current single-handed flow. |
| 12 | Score Logging and Results History | Capture the outcome of a played game so the app can retain meaningful score and result history instead of setup history alone. |
| 13 | Data Portability and Backup | Allow users to back up and restore their app data so collection progress and play history are portable between browsers or devices. |
| 14 | Insights and Statistics Dashboard | Turn stored play history and usage data into useful gameplay insights that help users understand what they play most and how often they win. |
| 15 | Guided Setup Constraints and Forced Picks | Give users more control over setup generation by allowing them to require specific cards or entities in the next generated setup when legal. |
| 16 | Notification and Feedback Refinements | Reduce noise in the app's feedback model while making transient notifications behave more naturally and accessibly. |
| 17 | Onboarding and Information Architecture | Make the app easier to approach for first-time users by simplifying the welcome experience and moving secondary project details out of the primary flow. |
| 18 | Theme Personalization and Styling Architecture | Improve visual flexibility and long-term maintainability by adding theme controls and evaluating whether the CSS approach should evolve. |
| 19 | Interface Localization | Make the application usable in multiple languages without destabilizing canonical game data, persisted state, or accessibility behavior. |
| 20 | History Grouping and Organization | Improve scanability for larger play histories by organizing records into clearer groups without weakening result editing, insights, or portability guarantees. |
| 21 | Browse and Onboarding Detail Polish | Resolve remaining low-risk UX rough edges in the Browse and onboarding surfaces so the landing experience feels more intentional and less cluttered. |
| 22 | Set Catalog Ordering and Taxonomy Cleanup | Make set browsing and collection management easier to scan by applying consistent alphabetical ordering and correcting the set-type taxonomy used across the app. |
| 23 | Stats and Secondary Information Simplification | Reduce information density in the stats and maintenance surfaces so practical gameplay information stays prominent and low-value technical status copy recedes. |
| 24 | Toast Behavior and Feedback Channel Cleanup | Make feedback quieter and more natural by reserving toasts for meaningful events and refining how the toast stack enters, exits, and anchors to the viewport. |
| 25 | Header and New Game Action Density Refinement | Reduce persistent chrome weight and bring the primary setup action closer to the user so the shell feels more task-focused without losing important context. |
| 26 | Remaining Set Classification Data Corrections | Correct the remaining misclassifications in the set catalog so every set carries the right type, giving users accurate groupings when browsing or building a collection. |
| 27 | Remaining Shell and Debug Polish | Remove a residual developer debug control visible in production and correct the app title presentation so the header feels intentional and complete across all supported themes and locales. |
| 28 | SonarCloud Code Quality Remediation | Address all 61 SonarCloud open findings to restore clean code quality gates without introducing any functional behaviour changes except where a finding identifies an actual bug. |
| 29 | Svelte 5 Build Tooling and Project Foundation | Replace the esbuild-based build pipeline with Vite and `@sveltejs/vite-plugin-svelte` so the project can compile Svelte 5 components while retaining zero runtime dependencies and a working dev server. |
| 30 | Data and State Layer Migration to Svelte 5 | Migrate the app's data pipeline and state management modules to work correctly within the Svelte 5 reactive system without breaking any existing behavioral contract. |
| 31 | UI Shell and Navigation Migration to Svelte Components | Convert the application shell, tab navigation, and shared UI primitives from DOM-manipulation modules into Svelte 5 components so the component hierarchy mirrors the rendered page structure. |
| 32 | Feature Tab Components Migration | Convert each major feature tab from DOM-manipulation rendering functions into Svelte 5 components, completing the full UI layer migration from vanilla JS to Svelte. |
| 33 | Test Suite Alignment for Svelte 5 | Update the Node unit test suite and Playwright end-to-end specs to correctly exercise the Svelte 5 component hierarchy so coverage remains meaningful and no test is silently bypassed by the migration. |
| 34 | History Grouping Expansion | Replace the current limited grouping options with five user-requested dimensions so every game record is explorable from the angles that matter most at the table. |
| 35 | v1.0.1 Release Polish | Correct all translation quality issues across every supported locale, fix a score-input focus regression, and advance the application version to 1.0.1. |
| 36 | Version Source and Storage Disclosure | Ensure the displayed application version is always derived from a single authoritative source, add an accurate browser-storage disclosure for user transparency, and surface a GitHub repository link in the header. |
| 37 | v1.0.2 Small Improvement Release | Close the remaining localization gaps across all six supported locales, make score display locale-aware, remove a stale test script, and ship as v1.0.2. |
| 38 | Data Completeness: Missing Legendary Sets | Identify every Legendary: Marvel expansion currently absent from the app's canonical data and add the missing sets so the app's hero and mastermind counts reach parity with established databases. |
| 39 | Epic Mastermind Variant | Add support for the Epic Mastermind optional variant so players who want a harder challenge can enable it before generating a setup. |
| 40 | PWA Installability | Make the app installable directly from the browser by adding a Web App Manifest and a Service Worker so users can add it to their home screen or app drawer. |
| 41 | Translation Data Model Migration | Restructure the localization layer so each supported language lives in its own dedicated file under `src/app/locales/`, giving every translator agent a single, clearly bounded file to own. |
| 42 | BGG Collection Import | Let a user supply their BoardGameGeek username to have the app fetch their public owned-game list and pre-populate their owned collection, eliminating the need to tick every set manually. |
| 43 | Expansion Attribution in History | Display the source expansion name next to each card entity in a history record so a player can see at a glance which sets were involved in a past game. |
| 44 | Card Browser by Category or Expansion in Collection | Add a card-browser mode to the Collection tab that lists every individual card from the user's owned expansions, grouped either by card category or by expansion. |
| 45 | MyLudo Collection Import | Let a user upload a collection export file from MyLudo and have the app parse it client-side to pre-populate their owned collection without requiring any server round-trip. |
| 46 | Active Expansion Filter ("Play Set") | Let a user choose a subset of their owned expansions to restrict a given randomization session so they can generate a setup using only two tonight, and a different two tomorrow. |
| 47 | History Outcome Filter | Let a user narrow the history list to games with a specific outcome — won, lost, or pending result — so they can focus on a meaningful subset without scrolling through every recorded session. |
| 49 | Clear Selection Regression Fix & E2E Guard | Restore the correct behaviour of the "Clear Selection" button in the setup/generator flow and introduce a dedicated Playwright end-to-end test that reproduces the regression and prevents it from recurring. |
| 50 | PWA Installability Repair | Diagnose why Epic 40's Web App Manifest and Service Worker are not surfacing a browser install prompt and fix the root cause. |
| 51 | Game Catalog Data Audit & Correction | Bring the Marvel Legendary expansion catalog to completeness and accuracy by auditing every entry against BoardGameGeek, adding every missing expansion, and correcting all incorrect release dates. |
| 52 | Translation Coverage Audit & Completion | Achieve full translation coverage across all five supported non-English locales by auditing every key in the English catalog and providing complete translations for all missing keys. |
| 53 | Solo Mode Scheme Eligibility Constraints | Enforce that certain schemes are ineligible when playing in "standard solo" mode so those schemes can never appear in a standard solo game. |
| 55 | Remove Internal Terminology from User-Facing Strings | Replace every occurrence of internal development labels (e.g. "Epic 1", "Epic 3") in user-visible locale strings with plain, meaningful language that makes sense to end users. |
| 56 | Standard v2 Solo Mode (Second Edition) | Add the Second Edition solo mode ("Standard v2") as a selectable play mode in the generator so that players using the Second Edition rulebook can generate correctly configured solo setups. |
| 57 | Solo Mode Rules Reference Panel | After a solo setup is generated, surface a concise, mode-specific rules summary so the player can configure the physical villain deck correctly and apply the right special rules. |
| 58 | Per-Player Scores in Multiplayer | Allow players to record an individual score and optional name for each participant in a multiplayer game, so that the history log reflects who scored what. |
| 59 | Draw Outcome | Add a third game outcome — "draw" — so players can record when the mastermind's scheme completes but all players survive, representing a partial defeat mechanically distinct from a loss. |
| 60 | Sets Browser Sort Order | Let users choose how the sets list in the Browse tab is ordered — by name, by release year, or by whether the set is in their collection. |
| 61 | TypeScript Toolchain Foundation | Wire up TypeScript compilation support across the build, lint, and dev pipelines so that subsequent epics can migrate source files to `.ts` and `.svelte.ts` one module at a time. |
| 62 | Domain Type Declarations | Establish a single, authoritative TypeScript type file that captures every domain concept used across the application — game data shapes, application state slices, setup results, and history records. |
| 63 | Migrate Core Utility Modules to TypeScript | Rename eight pure utility modules from `.mjs` to `.ts`, add explicit TypeScript signatures, and ensure all consumers are updated accordingly. |
| 64 | Migrate Core Game Engine to TypeScript | Rename and fully type the five core game-engine modules, converting them from plain JavaScript to TypeScript while preserving every public API unchanged. |
| 65 | Migrate App Services & Integrations to TypeScript | Rename and fully type the remaining non-reactive, non-Svelte modules in `src/app/` and their integration points. |
| 66 | Migrate Svelte Reactive View Models to TypeScript | Rename all six Svelte 5 reactive module files from `.svelte.js` to `.svelte.ts` and add explicit TypeScript annotations. |
| 67 | Migrate Svelte Components to TypeScript | Add `lang="ts"` to the `<script>` block of every Svelte component and replace all implicit `any`-typed prop declarations with explicit TypeScript types. |
| 68 | Test Runner Upgrade, Type Coverage & 2.0.0 Release | Update the test infrastructure so that test files can import from the migrated `.ts` source modules, integrate `svelte-check` into the type-coverage pipeline, and bump the project to version `2.0.0`. |
| 70 | Preferred Expansion Priority | Allow players to designate one owned expansion as "forced" so the setup generator prefers cards from that expansion when filling unclaimed card slots. |
| 71 | Epic Mastermind Difficulty Mode | Introduce "Epic Mastermind" as a selectable difficulty variant so players can access a separate pool of harder mastermind cards. |
| 72 | Active Expansions Collapsed by Default | Reduce the visual density of the New Game tab by collapsing the Active Expansions section by default. |
| 73 | Solo Mode "Always Leads" Rule Suppression | Ensure the app never applies the "Always Leads" mastermind rule during solo play so the villain group slot is always filled by normal random selection in solo mode. |
| 74 | Forced Hero Team | Let users designate one hero team (affiliation) as "forced" so heroes belonging to that team are always selected first during setup generation. |
| 75 | Locale File Sync and Accessibility Defect Fixes | Repair three regressions that degrade experience for assistive-technology users and non-English speakers. |
| 76 | Forced Picks Panel Cognitive Load Reduction | Reduce the cognitive overhead and scrolling effort in the Forced Picks accordion panel by removing structural redundancies and applying better layout. |
| 77 | Documentation Refresh for Features Added in Epics 70–74 | Bring the project's human-readable documentation into sync with the current product surface. |
| 78 | UI Layout and Navigation Polish | Resolve four independent layout and navigation friction points to improve the user experience across all tabs. |
| 79 | Eliminate .mjs Files: Migrate All Sources to TypeScript and JavaScript | Remove every `.mjs` file from the repository by deleting stale compiled outputs and converting all test files and configurations to TypeScript. |
| 80 | Active Expansions Layout Alignment | Align the "Active Expansions" section visual style with the Forced Picks collapsible pattern and reposition it for visual consistency. |
| 81 | Eliminate All .js Source Files | Remove or convert every `.js` file so that no JavaScript sources remain in the project and add a guardrail to prevent regression. |
| 82 | Co-locate Unit Tests with Their Source Modules | Refactor the test organisation so every source module has a clearly named counterpart test file, making coverage gaps immediately visible. |
| 83 | Setup Tab: Forced Picks Layout Fix and Dropdown UX Improvement | Fix the layout regression triggered when the "Forced Picks" section is expanded and improve the dropdown component's visual appearance. |
| 84 | Category Grouping Fieldsets in Browse Cards | Introduce category grouping in the "Browse Cards" view so cards are visually organised by their type. |
| 85 | My Collection: Remove Noise and Restore Storage Error Notice | Remove noise from the "My Collection" tab and re-introduce the storage notice exclusively as a conditional error message. |
| 86 | UI Polish: Button Spacing, Preview Pane Label, Focus Ring, and Card Separators | Address four small but visible UI inconsistencies that accumulate across the app. |
| 87 | Expansion Usage Percentage in Game History | Add a percentage-of-use figure alongside the raw count for every expansion listed in history statistics. |
| 88 | E2E Test Organisation: Feature-Named Files and Unified npm Script | Rename every end-to-end test file after the feature it exercises and consolidate npm scripts into a single unified command. |
| 89 | Browse Card Grouping Consistency and Default Expanded State | Improve the Browse tab card browser by ensuring all groups are expanded on first render and giving both views consistent visual treatment. |
| 90 | Fix History Grouping Filter Button Hover Clipping | Fix the CSS layout defect where the grouping mode filter buttons have their top edge cut off on hover. |
| UX1 | Documentation and UX Contract Alignment | Restore one trustworthy documentation baseline for the shipped product so design, implementation, QA, and future UX work all reference the same current experience. |
| UX2 | Global Interaction Continuity and Accessible Recovery | Make the app's highest-frequency and highest-value interactions feel anchored, accessible, and recoverable across desktop and mobile. |
| UX3 | Browse and First-Run Hierarchy Refinement | Reduce entry-surface clutter so users reach collection building and setup generation faster, with stronger hierarchy on both desktop and mobile. |
| UX4 | Mobile Shell Compression and Task-First Layout | Recover vertical space on phone-sized screens so the active task panel, not persistent chrome, becomes the dominant surface. |
| UX5 | History as Logbook First, Insights Second | Recenter History on reviewing, editing, and understanding played games before exposing deeper analytics. |
| UX6 | Backup Safety, Maintenance Clarity, and Danger-Zone Separation | Make Backup calmer and safer by separating routine maintenance from destructive actions and reducing repeated reset density. |
| 91 | Per-Expansion Usage Breakdown in History Insights | Add a ranked per-expansion usage panel to the History Insights dashboard showing what percentage of games each expansion appeared in. |
