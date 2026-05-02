## Title
Onboarding step progression drops focus between steps and interrupts keyboard continuity

## Severity
Should

## Affects
- First-run onboarding on mobile
- First-run onboarding on desktop when used by keyboard or switch users
- Replay Walkthrough progression

## Source
- README.md first-run onboarding behavior
- documentation/post-v1-roadmap.md Milestone 1 onboarding usability goals
- documentation/post-v1-epics.md Epic 17 onboarding scope
- Runtime audit with Playwright on 2026-04-10
- Source inspection in src/app/browser-entry.mjs

## Where it appears
- Next step action in the onboarding shell
- Previous step action in the onboarding shell
- Likely final completion transition for the same reason

## Evidence
- In src/app/browser-entry.mjs, previousOnboardingStep() and nextOnboardingStep() rerender the shell but do not restore focus to the equivalent control in the updated step.
- Runtime mobile check focused the Next button, activated it, and then returned activeTag BODY while the walkthrough advanced to Step 2 of 5.
- The onboarding actions do not use the existing focus helper paths that are already applied to modal open and modal cancel flows.

## Why it matters
The walkthrough is intended to reduce first-run uncertainty, but keyboard and switch users have to rediscover the active control after every step. That turns a guided sequence into repeated orientation work, especially on mobile where the viewport is tighter and the onboarding panel is a primary navigation aid.

## Recommended change
- After moving to the next or previous step, restore focus to the equivalent onboarding control in the refreshed step.
- If step content changes substantially, move focus to the new step heading with tabindex="-1" and then allow the next Tab press to continue naturally.
- Apply the same focus-preservation treatment to Replay Walkthrough and completion transitions.

## Expected UX improvement
The walkthrough will behave like a continuous guided flow rather than a series of disconnected screen updates. Users can progress step by step without losing their place or re-scanning the interface after every action.
