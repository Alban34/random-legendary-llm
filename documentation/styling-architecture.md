# Styling Architecture Decision

STATUS: Approved

## Decision summary

Epic 18 keeps the project on **hand-authored CSS custom properties** rather than adopting a third-party styling framework.

The shipped theme model now supports two built-in themes:
- `dark` (`Dark`) — the default high-contrast dark theme that preserves the app's established look
- `light` (`Light`) — a warm light theme for brighter environments

The app applies the active theme by setting `data-theme` on `document.documentElement`, and `index.html` performs an early browser-storage read so the saved preference is applied before the main stylesheet paints.

## Why the current approach stays in place

The project constraints still matter more than raw styling ergonomics:
- the app is fully static
- there is no required build step for CSS today
- runtime dependency loading is intentionally avoided
- the current UI already depends heavily on semantic CSS custom properties and a small, predictable selector surface

Because Epic 18's main goal was maintainable theming, extending the existing token model delivered the needed flexibility without introducing a new pipeline or changing how the app ships.

## Candidate evaluation

### Open Props

Pros:
- works well with CSS custom properties
- can be vendored or bundled statically
- light-touch adoption path for tokens and utilities

Cons:
- adds another token vocabulary on top of an already project-specific one
- would still leave most component selectors hand-authored
- limited payoff unless the team wants a broader primitive system refresh

Decision:
- not adopted now

### Pico CSS

Pros:
- ships as static CSS with no runtime loader
- gives decent defaults quickly
- could help if the app moved toward more semantic HTML-first forms and content pages

Cons:
- the current UI is intentionally bespoke and card-heavy
- default component opinions would require extensive overrides
- the resulting cascade would likely be harder to reason about than the current single-file shell CSS

Decision:
- not adopted now

### Tailwind CSS

Pros:
- strong design-token and utility story
- build-time output can remain static with no runtime fetches
- scales well if the app eventually grows a larger component surface

Cons:
- requires introducing a CSS build pipeline the project does not currently need
- would move styling decisions from semantic selectors into markup at a time when the UI is still small enough to manage directly
- migration cost is high relative to the size of the current app

Decision:
- not adopted now

## Implemented contract

The supported theme contract is:
- preferences persist `themeId`
- supported values are `dark` and `light`
- legacy persisted values `midnight` and `newsprint` normalize to `dark` and `light`
- invalid or unknown stored values recover to `dark`
- component rules consume semantic tokens rather than per-theme duplicated blocks
- the startup path avoids runtime CSS fetches beyond the local stylesheet already shipped with the app

## Migration constraints and non-goals

Current non-goals:
- no external runtime theme packages
- no CSS-in-JS migration
- no utility-framework rollout
- no system-theme auto-follow mode yet

Constraints for any future styling-library adoption:
- the app must still ship as static files
- first paint must continue to work without runtime network fetches for styling assets
- the `themeId` preference and `data-theme` contract should remain stable unless a deliberate migration is documented
- semantic tokens should stay available so gameplay-state colors remain consistent across screens

## Recommended future trigger for reconsideration

Revisit the decision only if at least one of these becomes true:
- the app adds a formal CSS build pipeline for other reasons
- the component surface grows enough that selector maintenance becomes a bottleneck
- future localization or import/export screens introduce enough layout variation to justify a utility layer
