# MessageKey Type Safety — Task List

Narrow the `t()` function signature to compile-time-checked keys derived from `EN_MESSAGES`.  
Zero runtime change. Applies to 3 files.

---

## Task 1 — Add `MessageKey` export to `en.ts`

- [x] Append `export type MessageKey = keyof typeof EN_MESSAGES;` at the end of `src/app/locales/en.ts`

---

## Task 2 — Narrow `LocaleTools.t()` in `types.ts`

- [x] Import `MessageKey` at the top of `src/app/types.ts`
- [x] Change `t(key: string, …)` to `t(key: MessageKey, …)` in the `LocaleTools` type
- [x] Change `formatEntityCount(count, singularKey: string, pluralKey?: string)` to use `MessageKey` for both key params

---

## Task 3 — Update `localization-utils.ts`

- [x] Import `MessageKey` at the top of `src/app/localization-utils.ts`
- [x] Narrow the internal `t` closure: `(key: string, …)` → `(key: MessageKey, …)`
- [x] Cast 15 dynamic template literals to `as MessageKey`:
  - [x] early `getOutcomeLabel` — `` `common.outcome.${outcomeId}` ``
  - [x] early `getHistoryGroupingLabel` — `` `history.group.${modeId}` ``
  - [x] `getTabLabel` — `` `tabs.${tabId}.label` ``
  - [x] `getTabShortLabel` — `` `tabs.${tabId}.shortLabel` ``
  - [x] `getTabDescription` — `` `tabs.${tabId}.description` ``
  - [x] `getThemeLabel` — `` `theme.${themeId}.label` ``
  - [x] `getThemeDescription` — `` `theme.${themeId}.description` ``
  - [x] `getHistoryGroupingLabel` (return block) — `` `history.group.${modeId}` ``
  - [x] `getUsageLabel` — `` `common.${category}` ``
  - [x] `getOutcomeLabel` (return block) — `` `common.outcome.${outcomeId}` ``
  - [x] `getBrowseTypeLabel` — `` `browse.typeLabel.${type}` ``
  - [x] `getBrowseTypeFilterLabel` — `` `browse.type.${type}` ``
  - [x] `getBrowseSortLabel` — `` `browse.sort.${sortKey}` ``
  - [x] `getCollectionGroupLabel` — `` `collection.group.${type}` ``
  - [x] `getToastVariantLabel` — `` `toast.variant.${variant}` ``

---

## Task 4 — Lint gate

- [x] Run `npm run lint` and resolve any static `t('...')` call sites in components that now fail type-checking (these are genuine bugs caught by the new type)
