# Epic 55 Task List

## Story 55.1 — Audit all six locale files

- [x] **Audit finding — `newGame.generator.previewNotice`**
  All six locale files contain "Epic 3" (or "Epic-3") in this key:
  - `src/app/locales/en.mjs` line 120: `'Generate a setup to preview the Epic 3 engine. Regenerate stays ephemeral until you accept.'`
  - `src/app/locales/fr.mjs` line 120: `'Générez une mise en place pour prévisualiser le moteur Epic 3. Régénérer reste éphémère tant que vous n\'acceptez pas.'`
  - `src/app/locales/de.mjs` line 182: `'Generiere eine Aufstellung, um die Epic-3-Engine in der Vorschau zu sehen. Neu generieren bleibt temporär, bis du übernimmst.'`
  - `src/app/locales/es.mjs` line 182: `'Genera una configuración para previsualizar el motor Epic 3. Regenerar se mantiene efímero hasta que aceptes.'`
  - `src/app/locales/ja.mjs` line 182: `'セットアップを生成して Epic 3 エンジンをプレビュー。確定するまで再生成は仮の状態に保たれます。'`
  - `src/app/locales/ko.mjs` line 182: `'Epic 3 엔진을 미리 보려면 세팅을 생성하세요. 재생성은 확정할 때까지 임시 상태로 유지됩니다.'`

- [x] **Audit finding — `about.testResults`**
  All six locale files contain "Epic 1" (or "Epic-1") in this key:
  - `src/app/locales/en.mjs` line 286: `'Epic 1 test results'`
  - `src/app/locales/fr.mjs` line 286: `'Résultats des tests Epic 1'`
  - `src/app/locales/de.mjs` line 310: `'Epic-1-Testergebnisse'`
  - `src/app/locales/es.mjs` line 311: `'Resultados de pruebas de Epic 1'`
  - `src/app/locales/ja.mjs` line 311: `'Epic 1 テスト結果'`
  - `src/app/locales/ko.mjs` line 311: `'Epic 1 테스트 결과'`

- [x] **Audit finding — `about.failedInit`**
  All six locale files contain "Epic 1" (or "Epic-1") in this key:
  - `src/app/locales/en.mjs` line 289: `'Foundation loaded with {count} failing Epic 1 test(s).'`
  - `src/app/locales/fr.mjs` line 289: `'La fondation a été chargée avec {count} test(s) Epic 1 en échec.'`
  - `src/app/locales/de.mjs` line 313: `'Foundation geladen mit {count} fehlschlagenden Epic-1-Test(s).'`
  - `src/app/locales/es.mjs` line 314: `'La base se cargó con {count} prueba(s) fallida(s) de Epic 1.'`
  - `src/app/locales/ja.mjs` line 314: `'フォールバック付きで読み込み: {count}件の Epic 1 テスト失敗。'`
  - `src/app/locales/ko.mjs` line 314: `'Epic 1 테스트 {count}개 실패로 기반이 로드되었습니다.'`

- [x] **Audit finding — `about.loadedOk`**
  Five locale files contain "Epic 1-10" (or "Epic-1-10") in this key. The French locale uses the translated word "épopées 1 à 10" which does not match the `Epic \d` pattern literally but still exposes internal version numbering and must be rewritten.
  - `src/app/locales/en.mjs` line 290: `'Legendary: Marvel Randomizer is loaded successfully with Epic 1-10 implementation, documentation alignment, and automated release-readiness coverage.'`
  - `src/app/locales/fr.mjs` line 290: `'Legendary: Marvel Randomizer est chargé avec succès avec l\'implémentation des épopées 1 à 10, l\'alignement de la documentation et la couverture de disponibilité automatisée.'`
  - `src/app/locales/de.mjs` line 314: `'Legendary: Marvel Randomizer erfolgreich geladen mit Epic-1-10-Implementierung, Dokumentationsabgleich und automatisierter Release-Readiness-Abdeckung.'`
  - `src/app/locales/es.mjs` line 315: `'Legendary: Marvel Randomizer se ha cargado correctamente con la implementación de Epic 1-10, la alineación de documentación y la cobertura de preparación para el lanzamiento automatizada.'`
  - `src/app/locales/ja.mjs` line 315: `'Legendary: Marvel ランダマイザーは Epic 1〜10 の実装、ドキュメント整合、自動リリース準備チェックを含む状態で正常に読み込まれました。'`
  - `src/app/locales/ko.mjs` line 315: `'Legendary: Marvel 랜덤라이저가 Epic 1-10 구현, 문서 정렬, 자동화된 릴리스 준비도 커버리지로 성공적으로 로드되었습니다.'`

- [x] **Test (Story 55.1):** Confirm the audit above is exhaustive by running `grep -rn "Epic[- ]\d" src/app/locales/` and verifying every match is captured in the findings above — no additional keys should appear.

- [x] **QC (Automated) (Story 55.1):** Run `npm run lint` on the unmodified codebase to establish a clean baseline; confirm it exits with code 0.

---

## Story 55.2 — Rewrite each affected string in all six locale files

### Key: `newGame.generator.previewNotice`

The phrase "Epic 3 engine" refers to the setup-generator randomiser logic. Replace with "the randomiser engine" (or its locale equivalent) to convey the same meaning without referencing a development label.

- [x] In `src/app/locales/en.mjs` (line 120), replace the value with:
  `'Generate a setup to preview the randomiser engine. Regenerate stays ephemeral until you accept.'`

- [x] In `src/app/locales/fr.mjs` (line 120), replace the value with:
  `'Générez une mise en place pour prévisualiser le moteur de randomisation. Régénérer reste éphémère tant que vous n\'acceptez pas.'`

- [x] In `src/app/locales/de.mjs` (line 182), replace the value with:
  `'Generiere eine Aufstellung, um den Randomisierungs-Engine in der Vorschau zu sehen. Neu generieren bleibt temporär, bis du übernimmst.'`

- [x] In `src/app/locales/es.mjs` (line 182), replace the value with:
  `'Genera una configuración para previsualizar el motor de aleatorización. Regenerar se mantiene efímero hasta que aceptes.'`

- [x] In `src/app/locales/ja.mjs` (line 182), replace the value with:
  `'セットアップを生成してランダマイザーエンジンをプレビュー。確定するまで再生成は仮の状態に保たれます。'`

- [x] In `src/app/locales/ko.mjs` (line 182), replace the value with:
  `'랜덤라이저 엔진을 미리 보려면 세팅을 생성하세요. 재생성은 확정할 때까지 임시 상태로 유지됩니다.'`

### Key: `about.testResults`

The phrase "Epic 1 test results" refers to the automated test suite results shown in the About panel. Replace with "Automated test results" (or locale equivalent).

- [x] In `src/app/locales/en.mjs` (line 286), replace the value with:
  `'Automated test results'`

- [x] In `src/app/locales/fr.mjs` (line 286), replace the value with:
  `'Résultats des tests automatisés'`

- [x] In `src/app/locales/de.mjs` (line 310), replace the value with:
  `'Automatisierte Testergebnisse'`

- [x] In `src/app/locales/es.mjs` (line 311), replace the value with:
  `'Resultados de pruebas automatizadas'`

- [x] In `src/app/locales/ja.mjs` (line 311), replace the value with:
  `'自動テスト結果'`

- [x] In `src/app/locales/ko.mjs` (line 311), replace the value with:
  `'자동화된 테스트 결과'`

### Key: `about.failedInit`

The phrase "Epic 1 test(s)" refers to automated tests. Replace with "automated test(s)" (or locale equivalent), preserving the `{count}` placeholder exactly.

- [x] In `src/app/locales/en.mjs` (line 289), replace the value with:
  `'Foundation loaded with {count} failing automated test(s).'`

- [x] In `src/app/locales/fr.mjs` (line 289), replace the value with:
  `'La fondation a été chargée avec {count} test(s) automatisé(s) en échec.'`

- [x] In `src/app/locales/de.mjs` (line 313), replace the value with:
  `'Foundation geladen mit {count} fehlschlagenden automatisierten Test(s).'`

- [x] In `src/app/locales/es.mjs` (line 314), replace the value with:
  `'La base se cargó con {count} prueba(s) automatizada(s) fallida(s).'`

- [x] In `src/app/locales/ja.mjs` (line 314), replace the value with:
  `'フォールバック付きで読み込み: {count}件の自動テスト失敗。'`

- [x] In `src/app/locales/ko.mjs` (line 314), replace the value with:
  `'자동화된 테스트 {count}개 실패로 기반이 로드되었습니다.'`

### Key: `about.loadedOk`

The phrase "Epic 1-10 implementation" (and its locale variants) refers to the full set of implemented features. Replace with "full feature implementation" (or locale equivalent) to convey the same sense of completeness.

- [x] In `src/app/locales/en.mjs` (line 290), replace the value with:
  `'Legendary: Marvel Randomizer is loaded successfully with full feature implementation, documentation alignment, and automated release-readiness coverage.'`

- [x] In `src/app/locales/fr.mjs` (line 290), replace the value with:
  `'Legendary: Marvel Randomizer est chargé avec succès avec l\'implémentation complète des fonctionnalités, l\'alignement de la documentation et la couverture de disponibilité automatisée.'`

- [x] In `src/app/locales/de.mjs` (line 314), replace the value with:
  `'Legendary: Marvel Randomizer erfolgreich geladen mit vollständiger Feature-Implementierung, Dokumentationsabgleich und automatisierter Release-Readiness-Abdeckung.'`

- [x] In `src/app/locales/es.mjs` (line 315), replace the value with:
  `'Legendary: Marvel Randomizer se ha cargado correctamente con la implementación completa de funciones, la alineación de documentación y la cobertura de preparación para el lanzamiento automatizada.'`

- [x] In `src/app/locales/ja.mjs` (line 315), replace the value with:
  `'Legendary: Marvel ランダマイザーは全機能の実装、ドキュメント整合、自動リリース準備チェックを含む状態で正常に読み込まれました。'`

- [x] In `src/app/locales/ko.mjs` (line 315), replace the value with:
  `'Legendary: Marvel 랜덤라이저가 전체 기능 구현, 문서 정렬, 자동화된 릴리스 준비도 커버리지로 성공적으로 로드되었습니다.'`

- [x] **Test (Story 55.2):** After all edits, run `grep -rn "Epic[- ]\d" src/app/locales/` and confirm zero matches. Also run `grep -rn "épopées [0-9]" src/app/locales/` and confirm zero matches.

- [x] **QC (Automated) (Story 55.2):** Run `npm run lint` and confirm it exits with code 0.

---

## Story 55.3 — Verify no internal terminology renders in the UI

- [x] Start the dev server (`npm run dev`) and open the app in a browser. Switch through all six supported locales using the locale selector.

- [x] In the **New Game** tab, navigate to the setup generator preview area and confirm the notice text does not contain "Epic 3", "Epic-3", or any "Epic N" pattern in any locale.

- [x] Open the **About panel** in each locale and confirm that:
  - The test-results label does not contain "Epic 1" or "Epic-1".
  - The failed-init message (visible when test failures are present) does not contain "Epic 1" or "Epic-1".
  - The loaded-ok message does not contain "Epic 1-10", "Epic-1-10", "épopées 1 à 10", or any "Epic N" pattern.

- [x] Confirm that no other surface in the app displays any "Epic N" label in any locale by visually scanning the New Game, History, Browse, Stats, and Settings tabs.

- [x] **Test (Story 55.3):** Run `grep -rn "Epic[- ]\d" src/app/locales/` one final time and assert zero matches as the definitive automated check.

- [x] **QC (Automated) (Story 55.3):** Run `npm run lint` and confirm it exits with code 0.
