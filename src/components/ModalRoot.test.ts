import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let source: string;

beforeAll(async () => {
  source = await fs.readFile(path.join(rootDir, 'src', 'components', 'ModalRoot.svelte'), 'utf8');
});

test('ModalRoot renders dialog with required ARIA attributes', () => {
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby="modal-title"/);
  assert.match(source, /aria-describedby="modal-description"/);
});

test('ModalRoot dialog is conditionally rendered based on modalConfig', () => {
  assert.match(source, /\{#if modalConfig\}/);
});

test('ModalRoot has cancel and confirm focus targets for keyboard trap', () => {
  assert.match(source, /data-modal-focus="cancel"/);
  assert.match(source, /data-modal-focus="confirm"/);
});

test('ModalRoot keyboard handler traps Escape and Tab keys', () => {
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /event\.key === 'Tab'/);
});

test('ModalRoot container has id="modal-root"', () => {
  assert.match(source, /id="modal-root"/);
});
