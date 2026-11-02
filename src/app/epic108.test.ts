import { test } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('release notes use the standard scaffold and have a release-entry section', async () => {
  const releaseNotes = await fs.readFile(
    path.join(rootDir, 'documentation', 'release-notes', 'v2.3.0-release-notes.md'),
    'utf8'
  );

  assert.match(releaseNotes, /^# Legendary: Marvel Randomizer — v\d+\.\d+\.\d+ Release Notes$/m);
  assert.match(releaseNotes, /^\*\*Released: TBD\*\*$/m);
  assert.match(releaseNotes, /^> Fan-made tool\. Not affiliated with Marvel or Upper Deck Entertainment\.$/m);
  assert.match(releaseNotes, /^## What is this\?$/m);
  assert.match(releaseNotes, /^\*\*\[Try it now →\]\(https:\/\/alban34\.github\.io\/random-legendary-llm\)\*\*$/m);
  assert.match(releaseNotes, /^## What's in v\d+\.\d+\.\d+$/m);
});
