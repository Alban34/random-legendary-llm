## Epic UX2 — Global Interaction Continuity and Accessible Recovery

**Objective**
Make the app's highest-frequency and highest-value interactions feel anchored, accessible, and recoverable across desktop and mobile.

**In scope**
- focus continuity for shared header preferences
- same-surface confirmation for theme and locale changes
- onboarding step-to-step focus continuity
- result-entry focus management
- accessible validation, error recovery, and focus return

**Stories**
1. **Preserve focus when theme and locale preferences rerender the shell**
2. **Add dependable status confirmation for header preference changes on every tab**
3. **Keep onboarding progression keyboard-continuous across next, previous, replay, and completion transitions**
4. **Move focus into result entry when it opens from Accept & Log or History**
5. **Announce result-entry validation errors accessibly and return focus to a meaningful recovery target**

**Acceptance criteria**
- Theme and locale changes do not drop focus to the document body after rerender.
- Users receive a clear confirmation of successful theme or locale changes from any tab, not only Collection.
- Onboarding progression preserves a meaningful focus target on desktop and mobile.
- Opening result entry places focus inside the editor or on a clear editor heading.
- Invalid result saves expose field-level invalid state plus a semantically announced error message.
- Closing result entry after save, skip, or cancel returns focus to the originating action.

---
