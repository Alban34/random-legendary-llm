## Title
README.md does not mention 5 new game-facing features completed in epics 69–74

## Severity
Must change

## Affects
Both

## Source
Senior UX Strategist (review on 2026-05-02)

## Where it appears
`README.md` "Why you'll love it" section and "All play modes covered" section, compared against epics 70–74 task lists and `documentation/ux/ui-design.md` New Game section.

## Evidence
README.md describes the shipped product but omits:
1. **Epic 70 (Preferred Expansion Priority)** — users can designate one owned expansion whose cards the generator prefers within each play-count tier.
2. **Epic 71 (Epic Mastermind)** — opt-in difficulty mode that restricts the mastermind pool to Epic Mastermind cards from supported expansions (currently X-Men).
3. **Epic 72 (Active Expansions)** — users can collapse and expand the active-expansions filter in New Game (now collapsed by default).
4. **Epic 73 (Solo Always Leads)** — mastermind lead villain group no longer auto-included in solo mode result view.
5. **Epic 74 (Forced Hero Team)** — users can force a hero team affiliation so the generator prioritizes heroes from that team.

`documentation/ux/ui-design.md` New Game section documents all five features. README.md still describes an older product surface.

## Why it matters
README.md is the primary entry point for users and contributors. Users discovering the product through README will encounter undocumented features in the live app with no guidance on their purpose. New contributors reading README will not understand the current shipped scope and may make incorrect assumptions when planning further work.

## Recommended change
Update `README.md` "Why you'll love it" section with three new or expanded bullets covering:
1. Preferred Expansion + Forced Hero Team: "Fine-tune your setup further — pick a preferred expansion to prioritize, or force a specific hero team. The generator fills the rest legally around your preferences."
2. Epic Mastermind mode: "Push the difficulty further with Epic Mastermind mode — when supported expansions are in your collection, you can restrict the mastermind pool to the harder Epic tier."
3. Active Expansions filtering: "Focus your randomization — select a subset of your owned expansions to draw from in a given session without changing your permanent collection."

Also add a note to the "All play modes covered" section that solo modes no longer auto-include the mastermind's "Always Leads" group.

## Expected UX improvement
README.md will accurately describe the current shipped product, users will discover new features organically, and contributors will understand the current scope without needing to read all epic task lists.
