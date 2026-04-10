## Title
Shared header personalization and first-run guidance are underdocumented in the primary UI contract

## Severity
Should change

## Affects
Both

## Source
Senior UX Strategist

## Where it appears
`documentation/ui-design.md`, compared against `README.md`, `documentation/data-model.md`, `documentation/styling-architecture.md`, `documentation/post-v1-roadmap.md`, and Epic 17, 18, 19, and 21 test coverage

## Evidence
`README.md` tells users to choose their preferred language and theme from shared header controls as an early step in the normal product flow.

`documentation/data-model.md` persists `themeId`, `localeId`, selected tab, and onboarding completion, showing that personalization and first-run guidance are part of the baseline experience rather than optional polish.

`documentation/styling-architecture.md` defines the shipped theme contract, and `documentation/post-v1-roadmap.md` defines onboarding and About access as usability improvements intended to shape the default welcome experience.

Repository tests treat these surfaces as current contracts. Examples include header locale and theme controls in `test/playwright/epic4-qc.spec.mjs`, onboarding persistence in `test/epic17-onboarding-information-architecture.test.mjs`, and onboarding placement and translation coverage in `test/playwright/epic21-qc.spec.mjs`.

`documentation/ui-design.md` does not show or describe the shared header theme controls, locale selector, onboarding shell states, or About entry point in its shell and landing-page guidance.

## Why it matters
These surfaces shape first-run comprehension, personalization, and accessibility expectations before users ever complete their first setup. Leaving them out of the main UI spec makes header density, responsive placement, focus order, and welcome-page hierarchy hard to review systematically.

## Recommended change
Expand the shell and landing-page sections of the UI specification to show the shared header controls, their responsive behavior, and the intended first-run guidance model. Document when onboarding appears, how it is dismissed or replayed, and where About-style project context lives so the repo has a clear information-architecture contract for first-time and returning users.

## Expected UX improvement
First-run and personalization UX can be reviewed and evolved intentionally, which should improve consistency, reduce accidental header clutter, and keep guidance flows aligned with the product’s actual onboarding strategy.