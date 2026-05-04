# Epic 92 — Task List

## Story 92.1 — Global base rule

- [x] 92.1.1 Update `details summary` rule in `src/app/app-shell.css`: add `list-style: none`, `display: flex`, `align-items: center`, `gap: var(--space-2)`
- [x] 92.1.2 Add `details summary::-webkit-details-marker { display: none; }` rule
- [x] 92.1.3 Add `details summary::after` rule with rotating arrow
- [x] 92.1.4 Add `details[open] summary::after { transform: rotate(270deg); }` rule
- [x] 92.1.5 Add `@media (prefers-reduced-motion: reduce)` guard for `details summary::after`
- [x] 92.1.6 QC (Automated): run `npm run lint` and confirm no errors

## Story 92.2 — Deduplication and exclusion

- [x] 92.2.1 Remove `::after` block from `.maintenance-accordion-summary` in `src/app/app-shell.css`
- [x] 92.2.2 Remove `details[open].maintenance-accordion .maintenance-accordion-summary::after` rule
- [x] 92.2.3 Remove reduced-motion block that only contained the `.maintenance-accordion-summary::after` transition guard
- [x] 92.2.4 Remove `::after` block from `.stats-category-summary` in `src/app/app-shell.css`
- [x] 92.2.5 Remove `details[open] .stats-category-summary::after` rule
- [x] 92.2.6 Remove reduced-motion block that only contained the `.stats-category-summary::after` transition guard
- [x] 92.2.7 Add `.history-item summary::after { content: none; }` override
- [x] 92.2.8 QC (Automated): run `npm run lint` and confirm no errors

## Story 92.3 — Layout audit and fixes

- [x] 92.3.1 Audit `.history-group summary` — fix if `flex-wrap` causes arrow to wrap to second line
- [x] 92.3.2 Audit `.about-card summary` — fix if `<h3>` child interacts badly with global flex
- [x] 92.3.3 Audit bare `<details>` summaries (forced picks, active filter, solo rules, BGG import, MyLudo) — fix any layout issues
- [x] 92.3.4 Audit `.browse-help-disclosure summary` — fix if needed
- [x] 92.3.5 QC (Automated): run `npm run lint` then `npm test` and confirm all pass

## Story 92.4 — Full regression gate

- [x] 92.4.1 QC (Automated): run full regression suite (`npm run lint` + `npm test` + `npx playwright test`) and confirm all pass
