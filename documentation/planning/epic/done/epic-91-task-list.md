# Epic 91 — Task List

## Story 91.1 — Data layer: buildExpansionUsageInsights

- [x] 91.1.1 Add `buildExpansionUsageInsights(runtime, history, totalGames)` to `src/app/stats-utils.ts`
- [x] 91.1.2 Wire `expansionUsage` into `buildInsightsDashboard` return value
- [x] 91.1.3 Test: write unit tests for `buildExpansionUsageInsights` in `src/app/stats-utils.test.ts`
- [x] 91.1.4 QC (Automated): run `npm run lint` then `npm test` and confirm all pass

## Story 91.2 — Locale keys

- [x] 91.2.1 Add 4 locale keys to `src/app/locales/en.ts`
- [x] 91.2.2 Add translated keys to `src/app/locales/fr.ts`
- [x] 91.2.3 Add translated keys to `src/app/locales/de.ts`
- [x] 91.2.4 Add translated keys to `src/app/locales/es.ts`
- [x] 91.2.5 Add translated keys to `src/app/locales/ja.ts`
- [x] 91.2.6 Add translated keys to `src/app/locales/ko.ts`
- [x] 91.2.7 QC (Automated): run `npm run lint` and confirm no errors

## Story 91.3 — UI: expansion usage panel

- [x] 91.3.1 Add expansion usage `<details>` panel to `src/components/HistoryTab.svelte` after the existing card-type panels
- [x] 91.3.2 Test: structural test in `src/components/HistoryTab.test.ts` confirms locale key references
- [x] 91.3.3 QC (Automated): run `npm run lint` then `npm test` and confirm all pass

## Story 91.4 — Full regression gate

- [x] 91.4.1 QC (Automated): run full regression suite (`npm run lint` + `npm test` + `npx playwright test`) and confirm all pass
