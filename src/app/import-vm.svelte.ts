// src/app/import-vm.svelte.ts
// Svelte 5 reactive view-model for the Import tab (BGG and MyLudo imports).

import { toast } from 'svelte-sonner';
import { parseMyludoFile, matchMyludoNamesToSets } from './myludo-import-utils.ts';
import { fetchBggCollection, matchBggNamesToSets } from './bgg-import-utils.ts';
import { mergeOwnedSets } from './collection-utils.ts';
import type { AppState, LocaleTools, BggMatchResult, MyludoMatchResult } from './types.ts';
import type { Epic1Bundle } from './game-data-pipeline.ts';

export type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export const importVm = $state<{
  myludoStatus: ImportStatus;
  myludoError: string;
  myludoSummary: MyludoMatchResult | null;
  bggStatus: ImportStatus;
  bggError: string;
  bggSummary: BggMatchResult | null;
}>({
  myludoStatus: 'idle',
  myludoError: '',
  myludoSummary: null,
  bggStatus: 'idle',
  bggError: '',
  bggSummary: null
});

// ---------------------------------------------------------------------------
// Action factory
// ---------------------------------------------------------------------------

interface ImportActionDeps {
  getLocale: () => LocaleTools;
  getBundle: () => Epic1Bundle;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => void;
}

export function createImportActions(deps: ImportActionDeps) {
  return {
    async importMyludoFile(file: File) {
      if (!file) return;
      importVm.myludoStatus = 'loading';
      importVm.myludoError = '';
      importVm.myludoSummary = null;
      const result = await parseMyludoFile(file);
      if (!result.ok) {
        importVm.myludoStatus = 'error';
        importVm.myludoError = result.error;
        toast.error(result.error, { duration: Infinity });
        return;
      }
      const { matched, unmatched } = matchMyludoNamesToSets(result.gameNames, deps.getBundle().runtime.sets);
      const matchedSetIds = matched.map((m) => m.setId);
      deps.applyStateUpdate(
        (currentState: AppState) => mergeOwnedSets(currentState, matchedSetIds),
        deps.getLocale().t('actions.importedMyludoCollection')
      );
      importVm.myludoSummary = { matched, unmatched };
      importVm.myludoStatus = 'idle';
    },

    dismissMyludoSummary() {
      importVm.myludoSummary = null;
      importVm.myludoError = '';
      importVm.myludoStatus = 'idle';
    },

    async importBggCollection(username: string) {
      if (!username) return;
      importVm.bggStatus = 'loading';
      importVm.bggError = '';
      importVm.bggSummary = null;
      const result = await fetchBggCollection(username);
      if (!result.ok) {
        importVm.bggStatus = 'error';
        importVm.bggError = result.error;
        toast.error(result.error, { duration: Infinity });
        return;
      }
      const { matched, unmatched } = matchBggNamesToSets(result.gameNames, deps.getBundle().runtime.sets);
      const matchedSetIds = matched.map((m) => m.setId);
      deps.applyStateUpdate(
        (currentState: AppState) => mergeOwnedSets(currentState, matchedSetIds),
        deps.getLocale().t('actions.importedBggCollection')
      );
      importVm.bggSummary = { matched, unmatched };
      importVm.bggStatus = 'idle';
    },

    dismissBggSummary() {
      importVm.bggSummary = null;
      importVm.bggError = '';
      importVm.bggStatus = 'idle';
    }
  };
}
