## Epic 19 — Interface Localization

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 19 work complete

### Story 19.1 — Define the localization architecture, supported locales, and fallback rules
- [x] Decide the initial supported locales and fallback chain
- [x] Define how UI copy, labels, helper text, and validation messages are keyed and stored
- [x] Decide whether canonical game names stay source-accurate while UI chrome is localized
- [x] Document locale persistence and first-run default behavior
- [x] **Test:** verify locale configuration, fallback behavior, and persisted preference rules stay aligned with the documented contract
- [x] **QC (Automated):** automate QC coverage for default-locale and fallback-locale startup behavior

### Story 19.2 — Externalize user-facing application strings and formatting rules
- [x] Move app-shell strings, tab labels, onboarding copy, notifications, and modal copy behind locale resources
- [x] Localize number, date, and score formatting where appropriate
- [x] Keep IDs, exported schema fields, and canonical entity names stable where localization should not apply
- [x] Preserve accessible labels and semantic announcements across locales
- [x] **Test:** verify localized string lookup and formatting cover the main UI surfaces without breaking non-localized data
- [x] **QC (Automated):** automate QC coverage for representative screens rendered in at least two locales

### Story 19.3 — Add a language selector and persist the chosen locale
- [x] Add a locale-selection control in an appropriate persistent UI location
- [x] Save and load the selected locale from browser preferences
- [x] Apply the selected locale on startup without leaving mixed-language UI remnants
- [x] Keep the locale switch understandable on desktop and mobile layouts
- [x] **Test:** verify locale switching updates the rendered UI and persists across reloads
- [x] **QC (Automated):** automate QC coverage for switching locales and reloading the app

### Story 19.4 — Verify localized layouts remain readable and accessible
- [x] Audit buttons, cards, panels, toasts, and onboarding steps for longer translated copy
- [x] Prevent clipped labels, broken wrapping, and ambiguous icon-only states in supported locales
- [x] Preserve focus behavior, keyboard navigation, and semantic announcements after translation
- [x] Confirm translated empty states and errors remain actionable
- [x] **Test:** verify localized layouts tolerate representative long-copy strings and preserve accessibility-critical attributes
- [x] **QC (Automated):** automate QC coverage for desktop and mobile layouts in at least one long-text locale

### Story 19.5 — Establish translation maintenance and QA safeguards
- [x] Define how new strings are added without leaving untranslated gaps
- [x] Add consistency checks for missing translation keys or unexpected fallback churn
- [x] Document what content is intentionally not localized in v1 of the feature
- [x] Keep backup, history, and analytics behavior compatible with locale-aware rendering
- [x] **Test:** verify missing or malformed locale entries fail safely back to the default locale
- [x] **QC (Automated):** automate QC coverage for one incomplete locale pack and visible fallback behavior
