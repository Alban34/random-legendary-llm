# Epic 77 — Documentation Refresh for Features Added in Epics 70–74: Task List

## Story 1 — Update README.md to describe the five game-facing features added in Epics 70–74

- [x] In `README.md`, immediately after the `### Your history, your insights` sub-section and before the `### All play modes covered` sub-section, insert the following three new `###` sub-sections (preserving one blank line between each):

  ```markdown
  ### Fine-tune your active pool
  Pick any subset of your shelf as tonight's active pool — the generator draws only from those expansions. Designate one as **preferred** and its cards get drawn first when filling unclaimed slots, without overriding the fairness system or your individual forced picks.

  ### Go Epic
  Enable **Epic Mastermind** mode to restrict the mastermind draw to the most powerful boss cards from supported expansions (currently X-Men). The rest of the setup is generated normally — only the mastermind slot changes.

  ### Smarter solo, team control
  Lock in a **hero team affiliation** before rolling and the generator always picks from that team first. In all solo modes the app automatically drops the mastermind "Always Leads" constraint, so villain groups are always drawn randomly — no house-rule needed.
  ```

- [x] In `README.md` `### All play modes covered` sub-section, add the following sentence as a new paragraph immediately after the last existing bullet (`- **Two-Handed Solo** — 1 player playing both sides`):

  ```markdown
  In Standard Solo, Advanced Solo, and Standard Solo v2, the mastermind "Always Leads" villain group constraint is automatically suppressed — the generator draws villain groups randomly in every solo mode.
  ```

- [x] Test: open `README.md` in a Markdown previewer and verify: (a) all five features are mentioned — Preferred Expansion Priority, Epic Mastermind mode, Active Expansions filter, Solo Always Leads suppression, and Forced Hero Team; (b) the three new `###` sub-sections appear between `### Your history, your insights` and `### All play modes covered`; (c) the `### All play modes covered` sentence appears after the bullet list and references all three solo modes; (d) no existing `###` sub-sections or bullets are removed; (e) the document renders as valid GFM with no broken links.
- [x] QC (Automated): run `npm run lint`

---

## Story 2 — Expand the ui-design.md result-view spec to document solo-mode Always Leads suppression

- [x] In `documentation/ux/ui-design.md`, Tab 3 — New Game, `**Interactions:**` list: add the following bullet immediately after the `- ★ marks the forced Mastermind villain group` line (currently line 312):

  ```markdown
  - The ★ villain-group marker and the "Always leads: [name]" sub-line on the mastermind card are rendered **in multiplayer modes only**; in Standard Solo (play mode `standard`, player count 1), Advanced Solo, and Standard Solo v2, neither element is present in the result — the generator does not enforce the mastermind lead constraint in solo modes and the villain group is always drawn randomly (Epic 73)
  ```

- [x] Test: read the `**Interactions:**` list in `documentation/ux/ui-design.md` and verify: (a) the new bullet is present and immediately follows the `★ marks the forced Mastermind villain group` line; (b) the bullet explicitly names multiplayer as the context where ★ and "Always leads" appear; (c) the bullet explicitly names all three affected solo modes — Standard Solo, Advanced Solo, and Standard Solo v2 — as the contexts where neither element appears; (d) the surrounding bullets are unchanged; (e) the mockup ASCII art above the Interactions list is unchanged.
- [x] QC (Automated): run `npm run lint`

---

## Story 3 — Document the .ts-only runtime locale authoring convention in the architecture documentation

- [x] Create a new file `documentation/architecture/localization.md` with the following content:

  ```markdown
  # Locale Authoring Convention

  STATUS: Approved

  ## Overview

  The project maintains locale message catalogs in two file formats under `src/app/locales/`:

  | File type | Purpose |
  |---|---|
  | `*.ts` (e.g. `en.ts`, `fr.ts`) | **Runtime source.** Imported by `src/app/localization-utils.ts`. These files are what the browser executes. |
  | `*.mjs` (e.g. `en.mjs`, `fr.mjs`) | **Translator working copies.** Read and written by translator agents. Not imported by any runtime module. |

  ## Authoring rule: add new keys to `.ts` files first

  When adding a new locale key to the app:

  1. Add the key and its English value to `src/app/locales/en.ts` (the canonical key schema, marked at the top of the file).
  2. Add the same key with translated values to each of `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, and `es.ts`.
  3. Mirror the same additions to the corresponding `.mjs` files so translator agents can read the current English source.

  **Do not add keys only to `.mjs` files.** The runtime imports exclusively from `.ts`. Keys missing from `.ts` fall through to the raw key string, which appears verbatim in the live UI.

  ## Constraint: `.mjs` files must never diverge from `.ts` files

  The `.mjs` and `.ts` locale files for the same locale must always carry the same set of keys with the same translated values. If they diverge:

  - Translator agents produce translations for keys that the runtime never uses.
  - Keys added only to `.mjs` files are invisible to the app and appear as raw key strings in the browser.

  Keep the two formats in sync manually. The locale-completeness test in `npm test` catches missing keys across locale files but does not currently compare `.mjs` against `.ts` — cross-format sync is a code-review responsibility.

  ## Where to add new keys

  Add new locale keys at the bottom of the relevant message group within `en.ts`, above the closing `}`. Follow the existing grouping conventions (e.g. `newGame.forcedPicks.*`, `history.*`, `backup.*`). After adding to `en.ts`, propagate to the other five `.ts` locale files before committing.
  ```

- [x] In `documentation/README.md`, under the `## Architecture` section, add the following line after `- [Setup Rules](architecture/setup-rules.md) — Player-count table, 10-step sequence, legality-first policy`:

  ```markdown
  - [Locale Authoring Convention](architecture/localization.md) — Runtime locale source (`.ts`), translator working copies (`.mjs`), key-addition workflow, and divergence constraint
  ```

- [x] Test: verify `documentation/architecture/localization.md` exists and is non-empty; verify `documentation/README.md` contains the new link and the path resolves to the new file; read `localization.md` and confirm it contains all three required elements: (a) explicit statement that `.ts` files are the runtime source imported by `localization-utils.ts`, (b) instruction to add new keys to `.ts` files first, (c) constraint that `.mjs` and `.ts` must never diverge with an explanation of the failure mode.
- [x] QC (Automated): run `npm run lint`
