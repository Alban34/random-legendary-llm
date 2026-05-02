## Title
No skip-navigation link to bypass header controls for keyboard-only users

## Severity
Should change

## Affects
Both

## Source
Senior Accessibility and Interaction Auditor (review on 2026-05-02)

## Where it appears
Every page on first keyboard Tab press — the header has no "Skip to main content" link before the interactive header controls.

## Evidence
Live keyboard navigation confirmed the tab focus order begins at the locale selector (broken aria-label), proceeds through Dark theme button, Light theme button, GitHub link, then enters the main content area. There is no skip-navigation link to jump directly to the active tab panel.

At the current header (4 interactive elements), the burden is relatively low — a keyboard user reaches main content after 4 Tabs. However, for screen reader and switch-access users, every unnecessary step adds interaction cost.

## Why it matters
WCAG 2.1 SC 2.4.1 (Bypass Blocks) recommends a mechanism to skip repeated navigation content. While the current header is compact, adding the skip link is a low-effort, high-impact improvement that future-proofs against additional header controls being added.

## Recommended change
Add a visually hidden "Skip to main content" anchor as the first focusable element in the document that links to `<main>`. Show it visually on focus so keyboard users can see it. This is a single-line addition to the header component.

## Expected UX improvement
Keyboard and switch-access users can bypass header controls with a single action and reach the active tab panel content immediately. Brings the app into alignment with WCAG 2.4.1 guidelines.
