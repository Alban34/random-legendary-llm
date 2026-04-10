## Title
History result entry opens out of context and validation errors are not announced as recoverable form guidance

## Severity
Must

## Affects
- New Game to Accept and Log follow-up result entry
- History result editing for pending and completed records
- Desktop and mobile result editing flows

## Source
- README.md logged-game and History workflow
- documentation/post-v1-roadmap.md Milestone 3 acceptance criteria for safe result entry and correction
- documentation/post-v1-epics.md Epic 12 result-editing scope
- Runtime audit with Playwright on 2026-04-10
- Source inspection in src/app/browser-entry.mjs and src/app/app-renderer.mjs

## Where it appears
- The inline result editor opened after Accept and Log
- The inline result editor opened from History
- The invalid-save path when required result fields are missing

## Evidence
- In src/app/browser-entry.mjs, acceptCurrentSetup() opens the result editor and rerenders, but does not move focus into the newly opened form.
- Runtime check after Accept and Log returned activeTag BODY while a result editor and first outcome field were present.
- In src/app/browser-entry.mjs, saveGameResult() rerenders on validation failure without focusing the error or the invalid field.
- In src/app/app-renderer.mjs, the validation message renders only as <div class="notice warning" data-result-form-error>...</div> with no role, no aria-live behavior, and no field-level aria-invalid or aria-describedby wiring.
- Runtime check after saving an empty result returned activeTag BODY and an error string of "Choose Win or Loss before saving the result." with errorRole null.

## Why it matters
This flow asks the user for a follow-up action immediately after logging a game, but the app leaves focus behind and provides silent validation failures that are not attached to the fields that need correction. That is a high-friction pattern for keyboard and assistive technology users, and it weakens the "safe to skip now, easy to fix later" contract documented for result history.

## Recommended change
- Move focus into the result editor when it opens, preferably to the outcome select or the editor heading.
- On validation failure, move focus to the error summary or first invalid field.
- Give the validation message a form-error announcement mechanism such as role="alert" or an aria-live region.
- Mark invalid controls with aria-invalid and connect them to the error copy with aria-describedby or aria-errormessage.
- When the editor closes after save, skip, or cancel, restore focus to the originating History action button.

## Expected UX improvement
Result logging will feel like a guided continuation of the Accept and Log flow instead of a hidden side effect. Users will land in the right place, understand exactly what needs fixing, and recover from mistakes without losing orientation.