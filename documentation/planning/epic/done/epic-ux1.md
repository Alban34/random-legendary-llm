## Epic UX1 — Documentation and UX Contract Alignment

**Objective**
Restore one trustworthy documentation baseline for the shipped product so design, implementation, QA, and future UX work all reference the same current experience.

**In scope**
- current shell information architecture
- five-tab navigation contract
- shared header controls and onboarding contract
- current New Game and History flow documentation
- archival framing for outdated planning references

**Stories**
1. **Align the primary shell documentation with the shipped five-tab product**
2. **Document the shared header theme and locale controls plus their responsive behavior**
3. **Document the current first-run onboarding, replay, and About-entry behavior**
4. **Rewrite the primary New Game and History UI specs to match the shipped flows**
5. **Mark outdated four-tab or pre-alignment planning language as historical and non-authoritative**

**Acceptance criteria**
- `README.md`, `documentation/ux/ui-design.md`, `documentation/planning/roadmap.md`, and related UX-facing references describe the same five-tab shell.
- The documentation explicitly covers onboarding, About access, theme switching, locale switching, play modes, forced picks, result entry, grouped history, and insights.
- Older planning references that remain in the repo are clearly framed as historical where they no longer describe the shipped UX.
- Documentation-based release-readiness checks can use the UX docs as the current source of truth without reverse-engineering behavior from tests.

---
