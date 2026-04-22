/**
 * MyLudo collection import utilities.
 *
 * Format reference: documentation/data/myludo-export-format.md
 */

import type { MyludoMatchResult, GameSet } from './types';

type MyludoFileResult =
  | { ok: true; gameNames: string[] }
  | { ok: false; error: string };

// Known header field names that contain the board game title.
const KNOWN_NAME_FIELDS = new Set(['nom', 'name', 'titre', 'jeu']);

/**
 * Split a single CSV/DSV line into fields, respecting RFC 4180 double-quote
 * quoting. Escaped double-quotes ("") inside quoted fields are collapsed.
 *
 * @param {string} line
 * @param {string} delimiter - single character delimiter
 * @returns {string[]}
 */
function splitLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote inside a quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Read a browser File object and parse it as a MyLudo collection export.
 *
 * Returns a Promise that resolves to:
 *   { ok: true,  gameNames: string[] }       – on success
 *   { ok: false, error: string }              – on any failure
 *
 * No data is transmitted to any server; the file is read entirely client-side
 * using the File API.
 *
 * @param {File} file
 * @returns {Promise<MyludoFileResult>}
 */
export async function parseMyludoFile(file: File): Promise<MyludoFileResult> {
  const raw = await file.text();

  // Strip UTF-8 BOM if present
  const content = raw.replace(/^\uFEFF/, '');

  if (!content.trim()) {
    return {
      ok: false,
      error: 'The selected file is empty. Please export your collection from MyLudo and try again.'
    };
  }

  // Normalize line endings and split into non-blank lines
  const lines = content
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      ok: false,
      error: 'The selected file is empty. Please export your collection from MyLudo and try again.'
    };
  }

  // Detect delimiter: prefer semicolon, fall back to comma
  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = semicolonCount >= commaCount ? ';' : ',';

  // Parse header row and locate the game-name column
  const headerFields = splitLine(firstLine, delimiter).map((f) => f.trim().toLowerCase());
  const nameFieldIndex = headerFields.findIndex((f) => KNOWN_NAME_FIELDS.has(f));

  if (nameFieldIndex === -1) {
    return {
      ok: false,
      error:
        'This file does not appear to be a MyLudo collection export. Please check the file and try again.'
    };
  }

  const dataLines = lines.slice(1);

  if (dataLines.length === 0) {
    return { ok: true, gameNames: [] };
  }

  const gameNames = dataLines
    .map((line) => {
      const fields = splitLine(line, delimiter);
      return (fields[nameFieldIndex] || '').trim();
    })
    .filter((name) => name.length > 0);

  return { ok: true, gameNames };
}

/**
 * Match an array of game names extracted from a MyLudo export against the
 * app's expansion catalog, using case-insensitive comparison and alias lookup.
 *
 * @param {string[]} myludoGameNames - trimmed game names from the import file
 * @param {GameSet[]} sets
 * @returns {MyludoMatchResult}
 */
export function matchMyludoNamesToSets(myludoGameNames: string[], sets: GameSet[]): MyludoMatchResult {
  // Build a lookup map once: lowercase name/alias → { setId, setName }
  const lookup = new Map<string, { setId: string; setName: string }>();
  for (const set of sets) {
    const entry = { setId: set.id, setName: set.name };
    lookup.set(set.name.trim().toLowerCase(), entry);
    for (const alias of (set.aliases || [])) {
      lookup.set(alias.trim().toLowerCase(), entry);
    }
  }

  const matched: MyludoMatchResult['matched'] = [];
  const unmatched: string[] = [];
  const seenSetIds = new Set<string>();

  for (const myludoName of myludoGameNames) {
    const normalized = myludoName.trim().toLowerCase();
    const found = lookup.get(normalized);
    if (found) {
      if (!seenSetIds.has(found.setId)) {
        seenSetIds.add(found.setId);
        matched.push({ setId: found.setId, setName: found.setName, myludoName });
      }
    } else {
      unmatched.push(myludoName);
    }
  }

  return { matched, unmatched };
}
