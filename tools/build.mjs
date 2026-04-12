/**
 * Build script: bundles and minifies JS with esbuild,
 * copies static assets (HTML, CSS, JSON) to dist/ preserving relative paths.
 */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

// --- Helpers ---

function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

// --- Bundle JS (entry point → dist, preserving relative path so index.html needs no change) ---

await build({
  entryPoints: [join(root, 'src/app/browser-entry.mjs')],
  bundle: true,
  minify: true,
  format: 'esm',
  outfile: join(dist, 'src/app/browser-entry.mjs'),
  // Treat the JSON data file as external — it is fetched at runtime via URL
  external: ['../data/canonical-game-data.json'],
  platform: 'browser',
  target: 'es2022',
});

console.log('✓ JS bundled and minified');

// --- Copy static assets ---

// index.html (references ./src/app/browser-entry.mjs and ./src/app/app-shell.css — paths remain valid)
copyFile(join(root, 'index.html'), join(dist, 'index.html'));
console.log('✓ index.html copied');

// CSS
copyFile(join(root, 'src/app/app-shell.css'), join(dist, 'src/app/app-shell.css'));
console.log('✓ app-shell.css copied');

// JSON data (fetched at runtime relative to the JS bundle)
copyFile(join(root, 'src/data/canonical-game-data.json'), join(dist, 'src/data/canonical-game-data.json'));
console.log('✓ canonical-game-data.json copied');

console.log('\nBuild complete → dist/');
