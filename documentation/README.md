# Documentation

## Stack

The v2.0.0 baseline uses TypeScript for all runtime source modules (`src/app/*.ts`). The migration from plain JavaScript (`.mjs`) to TypeScript was completed across Epics 61–68. All test files import from `.ts` source paths and run via `tsx` (`node --import tsx/esm --test`). `svelte-check` is integrated as a type-coverage gate in `npm run lint`.

## Architecture
- [Overview](architecture/overview.md) — Runtime stack, layers, entry points, shipped tab IDs
- [Setup Rules](architecture/setup-rules.md) — Player-count table, 10-step sequence, legality-first policy

## Data
- [Data Model](data/data-model.md) — Canonical data structures and persisted browser state shape
- [Game Data](data/game-data.md) — Scope decisions and included product lines
- [Game Data Normalized](data/game-data-normalized.md) — Normalized format spec and ID rules
- [Sources](data/sources.md) — External reference policy (BGG)
- [MyLudo Export Format](data/myludo-export-format.md) — Spike report: MyLudo CSV format, parsing strategy, and fallback assumptions (Epic 45)

## Design System
- [Overview](design-system/overview.md) — Brand direction, principles, semantic tokens, component guidelines
- [Styling Architecture](design-system/styling-architecture.md) — CSS custom-property approach and theme contract
- [Adoption Plan](design-system/adoption-plan.md) — Rollout order across screens
- [Epics](design-system/epics.md) — DS1–DS4 implementation epics
- [Task List](design-system/task-list.md) — Design-system story checklist

## Planning
- [Epics](planning/epics.md) — Full product backlog Epics 1–28+
- [Task List](planning/task-list.md) — Implementation checklist Epics 1–28
- [Migration Task List](planning/migration-task-list.md) — Svelte 5 migration Epics 29–33
- [Roadmap](planning/roadmap.md) — Delivery milestones and acceptance criteria

## Testing
- [Strategy](testing/strategy.md) — Quality policy, test pyramid, done definition
- [Error Audit Log](testing/error-audit.log) — Open findings from tech-writer audits

## UX
- [UI Design](ux/ui-design.md) — Screen-level layout contracts and per-tab specifications
- [UX Review](ux/review.md) — Executive review: Browse, History, Backup, accessibility findings
- [UX Alignment Epics](ux/alignment/epics.md) — UX-specific epics UX1–UX6
- [UX Alignment Task List](ux/alignment/task-list.md) — UX story checklist
- [UX Reports](ux/reports/) — Detailed per-auditor findings (desktop, mobile, accessibility, strategist)

## Archive
- [Clarifications](archive/clarifications.md) — Resolved pre-implementation Q&A
- [Correction Manifest Epic 26](archive/correction-manifest-26.md) — Set-type corrections applied in Epic 26
- [Create Project](archive/create-project.md) — Original project-creation brief (active version in `prompts/`)
- [Next Steps](archive/next-steps.md) — Completed improvement backlog (all items done)
