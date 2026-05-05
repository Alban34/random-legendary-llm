import type { ThemeId, AppState } from './types-app-state.ts';
import type { BackupPayload, BackupSummary } from './types-storage.ts';

// =============================================================================
// Section 8: Theme
// =============================================================================

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  description: string;
  colorScheme: 'dark' | 'light';
}

// =============================================================================
// Section 9: App integration types (Epic 67)
// =============================================================================

export interface AppTab {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export interface ModalConfig {
  title: string;
  description: string;
  cancelAction: string;
  confirmAction: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface OnboardingActions {
  openOnboardingTab: (tabId: string) => void;
  previousOnboardingStep: () => void;
  nextOnboardingStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

export interface AppPersistenceState {
  storageAvailable: boolean;
  hydratedFromStorage: boolean;
  recoveredOnLoad: boolean;
  hydrateNotices: string[];
  updateNotices: string[];
  lastSaveMessage: string | null;
  lastSaveOk: boolean | null;
}

export interface StagedBackup {
  fileName: string;
  payload: BackupPayload;
  importedState: AppState;
  summary: BackupSummary;
}
