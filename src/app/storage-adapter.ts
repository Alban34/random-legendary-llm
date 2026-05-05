import type { StorageAdapter, StorageOperationResult } from './types.ts';

export function createUnavailableResult(message: string): StorageOperationResult {
  return {
    ok: false,
    storageAvailable: false,
    message
  };
}

export function createStorageAdapter(storageCandidate: unknown): StorageAdapter {
  const unavailableMessage = 'Browser storage is unavailable; changes will only live in memory for this session.';

  const s = storageCandidate as Record<string, unknown> | null | undefined;
  if (
    !s
    || typeof s.getItem !== 'function'
    || typeof s.setItem !== 'function'
    || typeof s.removeItem !== 'function'
  ) {
    return {
      available: false,
      message: unavailableMessage,
      getItem: () => null,
      setItem: () => createUnavailableResult(unavailableMessage),
      removeItem: () => createUnavailableResult(unavailableMessage)
    };
  }

  const storage = storageCandidate as { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };

  try {
    const probeKey = '__legendary_storage_probe__';
    storage.setItem(probeKey, 'ok');
    storage.removeItem(probeKey);
  } catch (error) {
    const msg = `Browser storage is unavailable: ${(error as Error).message}`;
    return {
      available: false,
      message: msg,
      getItem: () => null,
      setItem: () => createUnavailableResult(msg),
      removeItem: () => createUnavailableResult(msg)
    };
  }

  return {
    available: true,
    message: null,
    getItem(key: string): string | null {
      return storage.getItem(key);
    },
    setItem(key: string, value: string): StorageOperationResult {
      try {
        storage.setItem(key, value);
        return {
          ok: true,
          storageAvailable: true,
          message: 'Saved browser state successfully.'
        };
      } catch (error) {
        return {
          ok: false,
          storageAvailable: true,
          message: `Failed to save browser state: ${(error as Error).message}`
        };
      }
    },
    removeItem(key: string): StorageOperationResult {
      try {
        storage.removeItem(key);
        return {
          ok: true,
          storageAvailable: true,
          message: 'Reset browser state successfully.'
        };
      } catch (error) {
        return {
          ok: false,
          storageAvailable: true,
          message: `Failed to reset browser state: ${(error as Error).message}`
        };
      }
    }
  };
}
