# Legendary: Marvel Randomizer

> **Fan-made tool. Not affiliated with Marvel or Upper Deck Entertainment.**
> **Built entirely by AI (GitHub Copilot / Claude) as a demonstration of what modern AI-assisted development can produce from scratch.**

---

**Stop arguing about setup. Start playing.**

Legendary: Marvel Randomizer is a free, browser-based companion app for players of *Legendary: A Marvel Deck-Building Game*. Open a URL. Get a legal, fresh, collection-aware setup in seconds. No install. No account. No tracking. Ever.

**[Try it now →][APP URL]**

---

## Why you'll love it

### It knows the rules so you don't have to
Every generated setup is 100% legal — mandatory mastermind leads, scheme constraints, player-count requirements, all enforced automatically. You'll never accidentally deal an illegal hand again.

### It knows your collection
Mark the sets you own. The randomizer only draws from your shelf. Whether you have just the core box or every expansion ever printed, the generator stays within what you actually have.

### It fights repetition for you
The app tracks what you've played and prioritizes entities you haven't seen recently. Popular heroes and overused masterminds stay fresh instead of dominating every session. Freshness-first randomization, every time.

### Lock in your favorites
Forcing a specific hero, villain group, or scheme before rolling. The generator fills the rest legally around your pick. Great for themed nights, challenges, or just when you really need to play as Spider-Man.

### Your history, your insights
Every accepted game is logged. Track wins, losses, and scores. Regroup your play history by mastermind, scheme, hero, villain group, or play mode. An at-a-glance insights dashboard shows win rate, average score, most-played, and least-played — so you finally know which villain groups you've been avoiding.

### All play modes covered
- **Standard** — 1 to 5 players
- **Advanced Solo** — 1 player, 4 heroes, 2 villain groups
- **Two-Handed Solo** — 1 player playing both sides

### Your data, your device
Export a portable backup anytime. Import it on any other device. Merge two devices' histories without losing a single game record. No cloud required.

### Six languages
The full UI — not just labels — in English, French, German, Japanese, Korean, and Spanish.

### Dark mode. Light mode. Your call.
The built-in theme switcher lets you switch between dark and light themes. Theme preference is remembered across sessions.

### Zero friction, zero compromise
- No install
- No login or account
- No subscription
- No ads
- No server — the app is 100% static and runs entirely in your browser
- Full keyboard navigation and screen-reader support

---

## How to use it

1. **Browse** your sets and add the ones you own to your collection.
2. Go to **New Game**, pick your player count and play mode, then hit **Generate Setup**.
3. **Regenerate** as many times as you like — it's free and doesn't affect your history.
4. Hit **Accept & Log** when you're happy. Log your result after the game.
5. Check **History** to review past games and explore your insights.
6. Use **Backup** to export your data or sync across devices.

---

## For developers and contributors

The full architecture, data model, testing strategy, design system, and development workflow are documented in the [`/documentation`](./documentation/) folder. This is a fully static SPA — no server-side code, no database, no secrets.

State is persisted under the `legendary_state_v1` key in browser localStorage. Epic 10 (documentation and release readiness) is complete.

Run story-level tests with `npm run test:epic10`. Run browser QC with `npm run test:qc:epic10`, or run the full browser QC suite with `npm run test:qc`.

---

*Legendary: Marvel Randomizer is an unofficial, fan-made tool. It is not affiliated with, endorsed by, or connected to Marvel Entertainment or Upper Deck Entertainment in any way. All Marvel character names and likenesses are property of their respective owners.*

*This project was built entirely using AI-assisted development (GitHub Copilot with Claude) as a demonstration of what modern AI tooling can produce end-to-end — from data modeling and business logic through UI, testing, and documentation.*
