## Epic 54 — PWA Data Import on Installed Safari / iPadOS

**Objective**
Ensure users who have installed the app as a PWA on Safari (iPadOS) can reliably import their JSON backup data, either by fixing the broken file-picker path or by providing one or more alternative import methods that work within iOS/iPadOS PWA sandboxing constraints.

**Background**
The existing import flow in `src/components/BackupTab.svelte` triggers a hidden `<input type="file">` element. On iPadOS, an installed PWA (added to Home Screen via Safari) applies stricter sandboxing that can prevent the system file picker from opening in response to a programmatic `.click()` call on the file input. The fix must remain entirely client-side — there is no backend server.

**In scope**
- Investigate and document exactly which file-input invocation patterns are blocked vs. allowed in installed Safari PWA mode on iPadOS
- Implement a "paste JSON" text-area import path: the user copies their exported JSON, opens a paste dialog in the app, and the app reads directly from the pasted text
- Evaluate and, if feasible, implement Web Share Target registration in the PWA manifest so the app appears as a destination when sharing a `.json` file from the iOS Files app
- Update the import section of `BackupTab.svelte` to surface available import methods with clear affordances; detect when the file-input path is likely to fail and automatically promote the paste fallback
- Add locale strings for any new UI copy in all six supported locales (en, fr, de, es, ja, ko)

**Out of scope**
- Server-side data sync or cloud storage
- Android PWA import behavior (unless the fix is trivially cross-platform)
- Changes to the export (download) flow, which works correctly on all platforms
- Native iOS app wrapper (WKWebView)

**Stories**
1. **Investigate and document file-input restrictions in installed Safari PWA mode on iPadOS**
2. **Implement a paste-from-clipboard import path in the BackupTab**
3. **Evaluate Web Share Target registration and add it to the PWA manifest if feasible**
4. **Update the BackupTab UI to present all available import methods and guide users on iPadOS**
5. **Add and translate locale strings for all new import-method UI copy**

**Acceptance Criteria**
- Story 1: A written findings note (in this epic file or a linked architecture note) documents which invocation patterns fail and why, and confirms the strategy chosen for Stories 2–4.
- Story 2: A user can paste a valid exported JSON string into a textarea in the BackupTab and trigger a restore; the pasted payload is validated and processed by the same import logic used by the file-input path; invalid JSON shows an error message.
- Story 3: Either the PWA manifest includes a `share_target` entry that accepts `application/json` files and routes them to the import flow, with evidence it works from the iOS Files app share sheet — or a note is appended explaining why this approach was ruled out.
- Story 4: On iPadOS in installed PWA mode, the import UI presents the paste method prominently (not hidden behind the broken file-picker button); on desktop and non-PWA contexts the file-picker button remains the primary path; no regression is introduced for users on other platforms.
- Story 5: All new UI strings are present and correctly translated in all six locale files (en, fr, de, es, ja, ko); `npm run lint` passes with no missing-key warnings.
