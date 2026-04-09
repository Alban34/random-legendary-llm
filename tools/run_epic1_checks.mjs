import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');
const coreModuleUrl = pathToFileURL(path.join(rootDir, 'src', 'app', 'game-data-pipeline.mjs')).href;

const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const { createEpic1Bundle } = await import(coreModuleUrl);
const bundle = createEpic1Bundle(seed);
const failed = bundle.tests.filter((test) => test.status === 'fail');

console.log(`Sets: ${bundle.counts.sets}`);
console.log(`Heroes: ${bundle.counts.heroes}`);
console.log(`Masterminds: ${bundle.counts.masterminds}`);
console.log(`Villain Groups: ${bundle.counts.villainGroups}`);
console.log(`Henchman Groups: ${bundle.counts.henchmanGroups}`);
console.log(`Schemes: ${bundle.counts.schemes}`);
console.log(`Tests: ${bundle.tests.length}, Failed: ${failed.length}`);

for (const test of bundle.tests) {
  console.log(`${test.status.toUpperCase()}: ${test.name}${test.error ? ` :: ${test.error}` : ''}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}

