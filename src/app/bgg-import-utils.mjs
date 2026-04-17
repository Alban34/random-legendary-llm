/**
 * BoardGameGeek collection import utilities.
 *
 * API reference: https://boardgamegeek.com/wiki/page/BGG_XML_API2
 */

const QUEUED_ERROR = {
  ok: false,
  error: 'BGG collection request timed out after queuing — please try again.'
};

/**
 * Perform a single BGG collection fetch attempt.
 * Returns `{ retry: true }` when the server indicates the collection is still
 * being queued (HTTP 202 or a 200 with a <message> body), a terminal error
 * object, or `{ ok: true, gameNames }` on success.
 *
 * @param {string} url
 * @param {Function} fetchFn
 * @returns {Promise<{ retry?: boolean, ok?: boolean, gameNames?: string[], error?: string }>}
 */
async function attemptBggFetch(url, fetchFn) {
  let response;
  try {
    response = await fetchFn(url);
  } catch {
    return { ok: false, error: 'Network error — check your connection and try again.' };
  }

  if (response.status === 202) {
    return { retry: true };
  }

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      error:
        `BGG denied access (HTTP ${response.status}). Make sure your BGG collection is set to public: log in at boardgamegeek.com → your profile → Collection → Privacy → set to "Public".`
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: `BGG returned an error (HTTP ${response.status}). Check the username and try again.`
    };
  }

  // 200 OK — parse XML and extract game names
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  // BGG sometimes returns 200 with a <message> body instead of 202 when
  // the collection is still being queued for processing. Treat it as a retry.
  if (doc.querySelector('message')) {
    return { retry: true };
  }

  const items = [...doc.querySelectorAll('item')];
  const gameNames = items
    .map((item) => {
      const nameEls = [...item.querySelectorAll('name')];
      const el = nameEls.find((n) => n.getAttribute('sortindex') === '1');
      return el ? el.textContent.trim() : null;
    })
    .filter(Boolean);

  return { ok: true, gameNames };
}

/**
 * Fetch a BGG user's public owned collection via the BGG XML API v2.
 *
 * Handles 202 "queued" responses by retrying up to maxRetries times with
 * a configurable delay between attempts. All parameters other than `username`
 * are injectable to allow deterministic unit testing without real network I/O.
 *
 * @param {string} username
 * @param {{ maxRetries?: number, retryDelayMs?: number, fetchFn?: Function }} [options]
 * @returns {Promise<{ ok: boolean, gameNames?: string[], error?: string }>}
 */
export async function fetchBggCollection(
  username,
  { maxRetries = 5, retryDelayMs = 2000, fetchFn = globalThis.fetch } = {}
) {
  const url = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&own=1`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await attemptBggFetch(url, fetchFn);
    if (!result.retry) return result;
    if (attempt === maxRetries) return QUEUED_ERROR;
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }
  return QUEUED_ERROR;
}

/**
 * Match an array of BGG game names against the app's expansion catalog using
 * case-insensitive comparison and alias lookup.
 *
 * @param {string[]} bggGameNames
 * @param {Array<{ id: string, name: string, aliases?: string[] }>} sets
 * @returns {{
 *   matched: Array<{ setId: string, setName: string, bggName: string }>,
 *   unmatched: string[]
 * }}
 */
export function matchBggNamesToSets(bggGameNames, sets) {
  // Build lookup map once: lowercase name/alias → { setId, setName }
  const lookup = new Map();
  for (const set of sets) {
    const entry = { setId: set.id, setName: set.name };
    lookup.set(set.name.trim().toLowerCase(), entry);
    for (const alias of (set.aliases || [])) {
      lookup.set(alias.trim().toLowerCase(), entry);
    }
  }

  const matched = [];
  const unmatched = [];
  const seenSetIds = new Set();

  for (const bggName of bggGameNames) {
    const normalized = bggName.trim().toLowerCase();
    const found = lookup.get(normalized);
    if (found) {
      if (!seenSetIds.has(found.setId)) {
        seenSetIds.add(found.setId);
        matched.push({ setId: found.setId, setName: found.setName, bggName });
      }
    } else {
      unmatched.push(bggName);
    }
  }

  return { matched, unmatched };
}
