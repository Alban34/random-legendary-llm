# Epic 56 Task List — Standard v2 Solo Mode (Second Edition)

**Epic objective:** Add the Second Edition solo mode ("Standard v2", key `standard-solo-v2`) as a selectable play mode and fix the inaccurate Advanced Solo description that incorrectly states "4 Heroes and 2 Villain Groups" throughout the codebase and all locale files.

**Key files involved:**
- `src/app/setup-rules.mjs` — `SETUP_RULES`, `PLAY_MODE_OPTIONS`, `resolvePlayMode`, `getPlayModeLabel`, `resolveSetupTemplate`
- `src/app/new-game-utils.mjs` — `getAvailablePlayModes`, `getPlayModeHelpText`
- `src/app/localization-utils.mjs` — `getPlayModeLabel`, `getPlayModeDescription`, `getPlayModeHelpText`
- `src/app/locales/en.mjs`, `fr.mjs`, `de.mjs`, `es.mjs`, `ja.mjs`, `ko.mjs`
- `test/epic11-play-modes.test.mjs` — update existing assertion
- `test/epic56-standard-v2-solo.test.mjs` — new test file

**Epic 53 note:** The scheme eligibility restriction added by Epic 53 derives the effective mode key as `'standard-solo'` only when `template.playMode === 'standard' && template.playerCount === 1`. Because `standard-solo-v2` has its own distinct `playMode` key, it will never match that condition. No change is needed in `src/app/setup-generator.mjs`; the absence of the restriction must be verified in the new test file.

---

## Story 1 — Add the Standard v2 play mode to the data layer and extend mode resolution and template logic

### Task 1 — Add the `'1-standard-v2'` setup template to `SETUP_RULES` in `src/app/setup-rules.mjs`

In `src/app/setup-rules.mjs`, `SETUP_RULES` is defined starting at line 1. The current entries are `1`, `'1-advanced'`, `'1-two-handed'`, `2`, `3`, `4`, `5`. Add a new entry immediately after `'1-two-handed'`:

```js
'1-standard-v2': { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 },
```

This mirrors the Standard Solo (`1`) and Advanced Solo (`'1-advanced'`) counts, which are identical for those two modes.

### Task 2 — Add the `'standard-solo-v2'` entry to `PLAY_MODE_OPTIONS` in `src/app/setup-rules.mjs`

In `PLAY_MODE_OPTIONS` (line 11), the current entries are `standard`, `'advanced-solo'`, `'two-handed-solo'`. Add a new entry after `'two-handed-solo'`:

```js
'standard-solo-v2': {
  label: 'Standard v2',
  soloLabel: 'Standard v2',
  description: 'Use the Second Edition solo setup counts — 3 Heroes, 1 Villain Group, 1 Henchman Group.'
},
```

### Task 3 — Add a player-count guard for `standard-solo-v2` in `resolvePlayMode` in `src/app/setup-rules.mjs`

`resolvePlayMode` is defined at line 37. After the existing guard for `two-handed-solo`:

```js
if (playMode === 'two-handed-solo' && normalizedPlayerCount !== 1) {
  throw new Error('Two-Handed Solo is only available for 1 player.');
}
```

Add an analogous guard immediately after:

```js
if (playMode === 'standard-solo-v2' && normalizedPlayerCount !== 1) {
  throw new Error('Standard v2 is only available for 1 player.');
}
```

### Task 4 — Add a `standard-solo-v2` case to `getPlayModeLabel` in `src/app/setup-rules.mjs`

`getPlayModeLabel` is defined at line 62. The current logic handles `advanced-solo` and `two-handed-solo` explicitly and falls back to standard. Add a new `if` branch before the final `return`:

```js
if (playMode === 'standard-solo-v2') {
  return PLAY_MODE_OPTIONS['standard-solo-v2'].label;
}
```

### Task 5 — Add the `standard-solo-v2` → `'1-standard-v2'` key mapping in `resolveSetupTemplate` in `src/app/setup-rules.mjs`

`resolveSetupTemplate` is defined at line 75. The current `let key` block maps `advanced-solo` to `'1-advanced'` and `two-handed-solo` to `'1-two-handed'`. Extend the `else if` chain with:

```js
} else if (playMode === 'standard-solo-v2') {
  key = '1-standard-v2';
}
```

After this task, calling `resolveSetupTemplate(1, { playMode: 'standard-solo-v2' })` must return a template object that includes `{ heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25, playMode: 'standard-solo-v2' }`.

### Task 6 — Update the existing `getAvailablePlayModes` assertion in `test/epic11-play-modes.test.mjs`

At line 94 of `test/epic11-play-modes.test.mjs` there is:

```js
assert.deepEqual(getAvailablePlayModes(1).map((mode) => mode.id), ['standard', 'advanced-solo', 'two-handed-solo']);
```

This will fail after Story 2 adds `standard-solo-v2`. Update it now to match the new expected array (order must match the order in `getAvailablePlayModes`):

```js
assert.deepEqual(getAvailablePlayModes(1).map((mode) => mode.id), ['standard', 'advanced-solo', 'two-handed-solo', 'standard-solo-v2']);
```

### Task 7 — Create `test/epic56-standard-v2-solo.test.mjs`

Model the file after `test/epic53-solo-scheme-eligibility.test.mjs`. Import the following:

```js
import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { generateSetup, validateSetupLegality } from '../src/app/setup-generator.mjs';
import { createDefaultState } from '../src/app/state-store.mjs';
import { resolveSetupTemplate, resolvePlayMode } from '../src/app/setup-rules.mjs';
import { getAvailablePlayModes } from '../src/app/new-game-utils.mjs';
```

Assert all of the following in separate `test()` calls:

1. **Template shape:** `resolveSetupTemplate(1, { playMode: 'standard-solo-v2' })` returns an object where `heroCount === 3`, `villainGroupCount === 1`, `henchmanGroupCount === 1`, `wounds === 25`, `playMode === 'standard-solo-v2'`, and `key === '1-standard-v2'`.

2. **Player-count guard:** `resolvePlayMode(2, { playMode: 'standard-solo-v2' })` throws an error whose message matches `/only available for 1 player/`.

3. **Mode selector inclusion:** `getAvailablePlayModes(1).map((m) => m.id)` includes `'standard-solo-v2'`; `getAvailablePlayModes(2).map((m) => m.id)` does **not** include `'standard-solo-v2'`.

4. **Scheme eligibility — no inherited restriction from Epic 53:** Using `validateSetupLegality` with `{ playerCount: 1, playMode: 'standard-solo-v2', ... }` (all sets owned), the returned `eligibleSchemes` **does** contain a scheme with id `core-set-negative-zone-prison-breakout` (the scheme restricted under `standard-solo` is freely available in `standard-solo-v2`).

5. **Scheme eligibility — no inherited restriction from Epic 53 (Super Hero Civil War):** Same legality call, `eligibleSchemes` **does** contain `core-set-super-hero-civil-war` and `marvel-studios-phase-1-super-hero-civil-war`.

6. **Generator respects the template:** `generateSetup({ runtime: bundle.runtime, state: allOwnedState, playerCount: 1, playMode: 'standard-solo-v2', random: () => 0 })` returns a setup whose `template.heroCount === 3`, `template.villainGroupCount === 1`, and `template.playMode === 'standard-solo-v2'`.

- [x] **Task 1 — Add `'1-standard-v2'` to `SETUP_RULES` in `src/app/setup-rules.mjs`** (see specification above)
- [x] **Task 2 — Add `'standard-solo-v2'` to `PLAY_MODE_OPTIONS` in `src/app/setup-rules.mjs`** (see specification above)
- [x] **Task 3 — Add player-count guard for `standard-solo-v2` to `resolvePlayMode` in `src/app/setup-rules.mjs`** (see specification above)
- [x] **Task 4 — Add `standard-solo-v2` case to `getPlayModeLabel` in `src/app/setup-rules.mjs`** (see specification above)
- [x] **Task 5 — Add `standard-solo-v2` → `'1-standard-v2'` mapping to `resolveSetupTemplate` in `src/app/setup-rules.mjs`** (see specification above)
- [x] **Task 6 — Update the `getAvailablePlayModes(1)` assertion at line 94 of `test/epic11-play-modes.test.mjs`** to include `'standard-solo-v2'` in the expected array
- [x] **Task 7 — Create `test/epic56-standard-v2-solo.test.mjs`** with the six assertions specified above
- [x] **Test (Story 1):** Verify manually that `resolveSetupTemplate(1, { playMode: 'standard-solo-v2' })` returns `{ heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 }` and that `resolvePlayMode(2, { playMode: 'standard-solo-v2' })` throws; confirm the new test file covers the Epic 53 non-regression assertions for scheme eligibility
- [x] **QC (Automated):** run `npm run lint && npm test` and confirm all pass

---

## Story 2 — Fix the Advanced Solo description and expose the Standard v2 mode in the mode selector UI

### Task 1 — Fix the `advanced-solo` description in `getAvailablePlayModes` in `src/app/new-game-utils.mjs`

At line 14 of `src/app/new-game-utils.mjs`, the `advanced-solo` entry currently reads:

```js
{ id: 'advanced-solo', label: 'Advanced Solo', description: 'Use the Advanced Solo setup counts with 4 Heroes and 2 Villain Groups.' },
```

The count "4 Heroes and 2 Villain Groups" is factually wrong. Advanced Solo uses 3 Heroes and 1 Villain Group (same counts as Standard Solo). Replace the `description` value with:

```
'Use the Advanced Solo setup counts — same card counts as Standard Solo, with an increased Master Strike deck.'
```

This aligns with the description already stored in `PLAY_MODE_OPTIONS['advanced-solo'].description` in `setup-rules.mjs`.

### Task 2 — Add `standard-solo-v2` to `getAvailablePlayModes` for 1-player games in `src/app/new-game-utils.mjs`

In `getAvailablePlayModes`, the 1-player array currently has three entries. Append a fourth entry at the end of the array:

```js
{ id: 'standard-solo-v2', label: 'Standard v2', description: 'Use the Second Edition solo setup counts — 3 Heroes, 1 Villain Group, 1 Henchman Group.' }
```

The final order must be: `standard`, `advanced-solo`, `two-handed-solo`, `standard-solo-v2`.

### Task 3 — Update the `chooseSolo` fallback text in `getPlayModeHelpText` in `src/app/new-game-utils.mjs`

`getPlayModeHelpText` at line 30 currently returns the hardcoded English string:

```
'Choose between Standard Solo, Advanced Solo, and Two-Handed Solo while staying in 1-player mode.'
```

This does not mention Standard v2. Update it to:

```
'Choose between Standard Solo, Advanced Solo, Two-Handed Solo, and Standard v2 while staying in 1-player mode.'
```

### Task 4 — Add a `standard-solo-v2` case to `getPlayModeLabel` in `src/app/localization-utils.mjs`

`getPlayModeLabel` in `src/app/localization-utils.mjs` (line 157) handles `advanced-solo` and `two-handed-solo` explicitly. Add a new branch before the final `return`:

```js
if (playMode === 'standard-solo-v2') {
  return t('common.playMode.standard-solo-v2');
}
```

Without this, selecting Standard v2 would fall through to `t('common.playMode.standardSolo')` and render the wrong label.

### Task 5 — Add a `standard-solo-v2` case to `getPlayModeDescription` in `src/app/localization-utils.mjs`

`getPlayModeDescription` at line 166 handles `advanced-solo` and `two-handed-solo`. Add a new branch before the final `return`:

```js
if (playMode === 'standard-solo-v2') {
  return t('common.playMode.standard-solo-v2Description');
}
```

Without this, the tooltip rendered via `locale.getPlayModeDescription(mode.id, selectedPlayerCount)` in `NewGameTab.svelte` would show the wrong description for the Standard v2 button.

- [x] **Task 1 — Fix the `advanced-solo` description in `getAvailablePlayModes` in `src/app/new-game-utils.mjs`** (remove "4 Heroes and 2 Villain Groups")
- [x] **Task 2 — Add `standard-solo-v2` entry to `getAvailablePlayModes` for 1-player in `src/app/new-game-utils.mjs`**
- [x] **Task 3 — Update the `chooseSolo` fallback return string in `getPlayModeHelpText` in `src/app/new-game-utils.mjs`** to mention Standard v2
- [x] **Task 4 — Add `standard-solo-v2` case to `getPlayModeLabel` in `src/app/localization-utils.mjs`** returning `t('common.playMode.standard-solo-v2')`
- [x] **Task 5 — Add `standard-solo-v2` case to `getPlayModeDescription` in `src/app/localization-utils.mjs`** returning `t('common.playMode.standard-solo-v2Description')`
- [x] **Test (Story 2):** Load the app in a browser at 1 player; confirm four mode buttons appear (Standard Solo, Advanced Solo, Two-Handed Solo, Standard v2); verify the Advanced Solo button tooltip no longer contains "4 Heroes" or "2 Villain Groups"; select Standard v2 and confirm the requirements summary shows Heroes 3, Villain Groups 1, Henchman Groups 1; switch to 2 players and confirm the Standard v2 button is absent
- [x] **QC (Automated):** run `npm run lint && npm test` and confirm all pass

---

## Story 3 — Update all six locale files with the corrected Advanced Solo description, the new mode strings, and the updated chooseSolo string

**Reference for all six files:**

Each locale file must receive four changes in the `common.playMode` block (all changes are in the same region, around lines 359–370):

1. **Fix** `'common.playMode.advanced-soloDescription'` — remove the incorrect "4 Heroes and 2 Villain Groups" text; use the corrected description in the target language.
2. **Add** `'common.playMode.standard-solo-v2'` — the label string for the new mode button.
3. **Add** `'common.playMode.standard-solo-v2Description'` — the tooltip/description string for the new mode.
4. **Update** `'common.playMode.chooseSolo'` — add the new mode name alongside the existing three.

Place the two new keys immediately after `'common.playMode.two-handed-soloDescription'` (line 366 in en) and before `'common.playMode.multiplayerDisabled'` (line 367 in en) to maintain consistent ordering across all locale files.

### Task 1 — Update `src/app/locales/en.mjs` (canonical reference)

| Key | Current value | New value |
|-----|--------------|-----------|
| `common.playMode.advanced-soloDescription` | `'Use the Advanced Solo setup counts with 4 Heroes and 2 Villain Groups.'` | `'Use the Advanced Solo setup counts — same card counts as Standard Solo, with an increased Master Strike deck.'` |
| `common.playMode.standard-solo-v2` | *(absent)* | `'Standard v2'` |
| `common.playMode.standard-solo-v2Description` | *(absent)* | `'Use the Second Edition solo setup counts — 3 Heroes, 1 Villain Group, 1 Henchman Group.'` |
| `common.playMode.chooseSolo` | `'Choose between Standard Solo, Advanced Solo, and Two-Handed Solo while staying in 1-player mode.'` | `'Choose between Standard Solo, Advanced Solo, Two-Handed Solo, and Standard v2 while staying in 1-player mode.'` |

### Task 2 — Update `src/app/locales/fr.mjs`

| Key | Current value | New value |
|-----|--------------|-----------|
| `common.playMode.advanced-soloDescription` | `'Utilise les quantités du mode Solo avancé avec 4 Héros et 2 Groupes de vilains.'` | `'Utilise les quantités du mode Solo avancé — mêmes effectifs que le Solo standard, avec un paquet de Frappe maîtresse renforcé.'` |
| `common.playMode.standard-solo-v2` | *(absent)* | `'Standard v2'` |
| `common.playMode.standard-solo-v2Description` | *(absent)* | `'Utilise les quantités du mode Solo de la Deuxième Édition — 3 Héros, 1 Groupe de vilains, 1 Groupe de séides.'` |
| `common.playMode.chooseSolo` | `'Choisissez entre Solo standard, Solo avancé et Solo à deux mains en restant à 1 joueur.'` | `'Choisissez entre Solo standard, Solo avancé, Solo à deux mains et Standard v2 en restant à 1 joueur.'` |

### Task 3 — Update `src/app/locales/de.mjs`

| Key | Current value | New value |
|-----|--------------|-----------|
| `common.playMode.advanced-soloDescription` | `'Verwende die Advanced-Solo-Aufstellungswerte mit 4 Helden und 2 Schurkengruppen.'` | `'Verwende die Advanced-Solo-Aufstellungswerte — gleiche Kartenzahlen wie Standard Solo, mit einem verstärkten Meister-Schlag-Stapel.'` |
| `common.playMode.standard-solo-v2` | *(absent)* | `'Standard v2'` |
| `common.playMode.standard-solo-v2Description` | *(absent)* | `'Verwende die Solo-Aufstellungswerte der Zweiten Edition — 3 Helden, 1 Schurkengruppe, 1 Schergengruppe.'` |
| `common.playMode.chooseSolo` | `'Wähle zwischen Standard Solo, Advanced Solo und Two-Handed Solo, während du im 1-Spieler-Modus bleibst.'` | `'Wähle zwischen Standard Solo, Advanced Solo, Two-Handed Solo und Standard v2, während du im 1-Spieler-Modus bleibst.'` |

### Task 4 — Update `src/app/locales/es.mjs`

| Key | Current value | New value |
|-----|--------------|-----------|
| `common.playMode.advanced-soloDescription` | `'Usa los conteos de configuración de Advanced Solo con 4 Héroes y 2 Grupos de villanos.'` | `'Usa los conteos de configuración de Advanced Solo — mismos recuentos que Solitario estándar, con un mazo de Golpe maestro ampliado.'` |
| `common.playMode.standard-solo-v2` | *(absent)* | `'Standard v2'` |
| `common.playMode.standard-solo-v2Description` | *(absent)* | `'Usa los conteos de configuración de Solitario de Segunda Edición — 3 Héroes, 1 Grupo de villanos, 1 Grupo de secuaces.'` |
| `common.playMode.chooseSolo` | `'Elige entre Solitario estándar, Advanced Solo y Two-Handed Solo mientras permaneces en el modo de 1 jugador.'` | `'Elige entre Solitario estándar, Advanced Solo, Two-Handed Solo y Standard v2 mientras permaneces en el modo de 1 jugador.'` |

### Task 5 — Update `src/app/locales/ja.mjs`

| Key | Current value | New value |
|-----|--------------|-----------|
| `common.playMode.advanced-soloDescription` | `'ヒーロー4名とヴィラン・グループ2つのアドバンスド・ソロセットアップ数を使用します。'` | `'アドバンスド・ソロのセットアップ数を使用します（スタンダード・ソロと同じカード枚数、マスター・ストライク強化）。'` |
| `common.playMode.standard-solo-v2` | *(absent)* | `'スタンダード v2'` |
| `common.playMode.standard-solo-v2Description` | *(absent)* | `'第2版ソロのセットアップ数を使用します — ヒーロー3名、ヴィラン・グループ1つ、ヘンチマン・グループ1つ。'` |
| `common.playMode.chooseSolo` | `'1プレイヤーモードのまま、スタンダード・ソロ、アドバンスド・ソロ、ツーハンデッド・ソロから選択します。'` | `'1プレイヤーモードのまま、スタンダード・ソロ、アドバンスド・ソロ、ツーハンデッド・ソロ、スタンダード v2 から選択します。'` |

### Task 6 — Update `src/app/locales/ko.mjs`

| Key | Current value | New value |
|-----|--------------|-----------|
| `common.playMode.advanced-soloDescription` | `'히어로 4명, 빌런 그룹 2개의 Advanced Solo 세팅 수치를 사용합니다.'` | `'Advanced Solo 세팅 수치를 사용합니다 — Standard Solo와 동일한 카드 수, 마스터 스트라이크 덱 강화.'` |
| `common.playMode.standard-solo-v2` | *(absent)* | `'Standard v2'` |
| `common.playMode.standard-solo-v2Description` | *(absent)* | `'2판 솔로 세팅 수치를 사용합니다 — 히어로 3명, 빌런 그룹 1개, 헨치맨 그룹 1개.'` |
| `common.playMode.chooseSolo` | `'1인 플레이어 모드를 유지하면서 일반 솔로, Advanced Solo, Two-Handed Solo 중에서 선택하세요.'` | `'1인 플레이어 모드를 유지하면서 일반 솔로, Advanced Solo, Two-Handed Solo, Standard v2 중에서 선택하세요.'` |

---

- [x] **Task 1 — Update `src/app/locales/en.mjs`:** fix `advanced-soloDescription`, add `standard-solo-v2`, add `standard-solo-v2Description`, update `chooseSolo` (see table above)
- [x] **Task 2 — Update `src/app/locales/fr.mjs`:** fix `advanced-soloDescription`, add `standard-solo-v2`, add `standard-solo-v2Description`, update `chooseSolo` (see table above)
- [x] **Task 3 — Update `src/app/locales/de.mjs`:** fix `advanced-soloDescription`, add `standard-solo-v2`, add `standard-solo-v2Description`, update `chooseSolo` (see table above)
- [x] **Task 4 — Update `src/app/locales/es.mjs`:** fix `advanced-soloDescription`, add `standard-solo-v2`, add `standard-solo-v2Description`, update `chooseSolo` (see table above)
- [x] **Task 5 — Update `src/app/locales/ja.mjs`:** fix `advanced-soloDescription`, add `standard-solo-v2`, add `standard-solo-v2Description`, update `chooseSolo` (see table above)
- [x] **Task 6 — Update `src/app/locales/ko.mjs`:** fix `advanced-soloDescription`, add `standard-solo-v2`, add `standard-solo-v2Description`, update `chooseSolo` (see table above)
- [x] **Test (Story 3):** Grep each locale file to confirm the string "4 Heroes and 2 Villain Groups" (and its translated equivalent) is absent; confirm `standard-solo-v2` and `standard-solo-v2Description` keys are present in all six files; switch the app language to each locale, select Standard v2, and confirm no raw key string appears in the mode button label or tooltip
- [x] **QC (Automated):** run `npm run lint && npm test` and confirm all pass
