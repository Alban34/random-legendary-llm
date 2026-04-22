export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

export function isPlainObject(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
