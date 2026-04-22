## Epic 67 — Migrate Svelte Components to TypeScript

**Objective**
Add `lang="ts"` to the `<script>` block of every Svelte component in `src/components/`, replace all implicit `any`-typed prop declarations and event handler signatures with explicit TypeScript types, and resolve any type errors surfaced by `svelte-check` so that the entire component layer compiles under strict TypeScript.

**Background**
All twelve `.svelte` components currently have untyped `<script>` blocks. With Epics 63–66 complete, all imported modules already expose TypeScript types, so adding `lang="ts"` to each component will surface implicit `any` usages (especially `$props()` destructuring, event handler callbacks, and `{@html}` blocks using typed render functions) that need explicit annotations.

The twelve components, grouped by dependency depth (shell components first, then feature tabs, then subcomponents):

**Shell & shared:**
- `App.svelte` — root orchestrator; most complex; imports all view models and routes between tabs
- `TabNav.svelte` — tab navigation; accepts a `tabs` array prop and an `activeTab` string prop
- `ToastStack.svelte` — accepts a `toasts` array prop
- `ModalRoot.svelte` — accepts a `modal` object prop (open, type, confirm callback)
- `OnboardingShell.svelte` — accepts an `onboardingCompleted` bool prop

**Feature tabs:**
- `BrowseTab.svelte` — large; imports `browse-vm.svelte.ts`, `browse-utils.ts`, several render helpers
- `CollectionTab.svelte` — imports `collection-utils.ts`; renders owned-set checklist and card browser
- `NewGameTab.svelte` — imports `new-game-vm.svelte.ts`, `setup-generator.ts`, `solo-rules.ts`
- `HistoryTab.svelte` — imports `history-vm.svelte.ts`, `history-utils.ts`
- `BackupTab.svelte` — imports `backup-vm.svelte.ts`, `backup-utils.ts`

**Subcomponents:**
- `CardBrowserByCategory.svelte` — accepts `pools` and `locale` props; calls `getCardsByCategory`
- `CardBrowserByExpansion.svelte` — accepts `pools` and `locale` props; calls `getCardsByExpansion`

**Migration pattern per component:**
1. Add `lang="ts"` to the `<script>` block.
2. Change `$props()` destructuring to use an explicit inline prop type: `const { propA, propB }: { propA: TypeA; propB: TypeB } = $props();`
3. Add explicit types to all local reactive variables declared with `$state()` and `$derived()`.
4. Add explicit types to all event handler callbacks and any `as unknown as T` casts.
5. Run `svelte-check` after each component to verify no type errors remain.

**In scope**
- Add `lang="ts"` to all twelve `src/components/*.svelte` files
- Annotate `$props()` destructuring with inline prop type objects (no separate `.d.ts` files required)
- Annotate all `$state<T>()` and `$derived<T>()` usages with their TypeScript types
- Annotate all event handler callbacks (`onclick`, `oninput`, etc.) with the correct `Event` subtypes (`MouseEvent`, `InputEvent`, `SubmitEvent`, etc.)
- Resolve all `svelte-check` type errors for each migrated component before moving to the next
- Verify `npm run lint` (which invokes `svelte-check`) passes after each story

**Out of scope**
- Extracting prop types into separate `*.d.ts` files or an exported `Props` type (can be done as a follow-up)
- Changing any component logic, template structure, or visual output
- Adding new props or events
- Migrating test files (covered by Epic 68)

**Stories**
1. **Add `lang="ts"` to shell and shared components: `App.svelte`, `TabNav.svelte`, `ToastStack.svelte`, `ModalRoot.svelte`, `OnboardingShell.svelte`**
2. **Add `lang="ts"` to browse and collection components: `BrowseTab.svelte`, `CollectionTab.svelte`, `CardBrowserByCategory.svelte`, `CardBrowserByExpansion.svelte`**
3. **Add `lang="ts"` to remaining feature tab components: `NewGameTab.svelte`, `HistoryTab.svelte`, `BackupTab.svelte`**

**Acceptance Criteria**
- Story 1: All five shell/shared `.svelte` files have `<script lang="ts">`; `$props()` is typed inline for each; all local `$state` and `$derived` variables are explicitly typed; `svelte-check` reports zero errors for these five files; `npm run lint` passes; `npm run build` succeeds.
- Story 2: `BrowseTab.svelte`, `CollectionTab.svelte`, `CardBrowserByCategory.svelte`, and `CardBrowserByExpansion.svelte` have `<script lang="ts">`; the `pools` prop in `CardBrowserByCategory` and `CardBrowserByExpansion` is typed using the appropriate runtime type from `src/app/types.ts`; `svelte-check` reports zero errors for these four files; `npm run lint` passes.
- Story 3: `NewGameTab.svelte`, `HistoryTab.svelte`, and `BackupTab.svelte` have `<script lang="ts">`; all props and reactive variables are typed; `svelte-check` reports zero errors across the entire `src/` directory; `npm run lint` exits 0; `npm run build` produces a valid bundle; `npm run dev` serves the application with all five tabs functioning correctly; zero TypeScript errors remain in the codebase.
