import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { build as buildSw } from 'esbuild';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

function collectFiles(dir: string, base: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, base));
    } else {
      results.push(relative(base, full));
    }
  }
  return results;
}

function swCompilePlugin(command: 'build' | 'serve'): Plugin {
  return {
    name: 'sw-compile',
    async writeBundle() {
      if (command !== 'build') return;
      await buildSw({
        entryPoints: ['src/sw.ts'],
        outfile: 'dist/sw.js',
        bundle: false,
        format: 'iife',
        target: 'es2020',
      });
    },
  };
}

function swInjectPlugin(command: 'build' | 'serve'): Plugin {
  return {
    name: 'sw-inject',
    closeBundle() {
      if (command !== 'build') return;
      const distDir = join(process.cwd(), 'dist');
      const base = '/random-legendary-llm/';
      const paths = collectFiles(distDir, distDir)
        .map((p) => base + p.replace(/\\/g, '/'))
        .sort();
      // Also cache the app base URL so offline navigation requests are served from cache
      if (!paths.includes(base)) {
        paths.unshift(base);
      }
      const hash = createHash('sha256')
        .update(paths.join('\n'))
        .digest('hex')
        .slice(0, 8);
      const cacheName = 'legendary-v' + hash;
      const swPath = join(distDir, 'sw.js');
      let sw = readFileSync(swPath, 'utf8');
      sw = sw.replace(/"%%SW_CACHE_VERSION%%"/, JSON.stringify(cacheName));
      sw = sw.replace(/\(\s*\/\*%%SW_PRECACHE_URLS%%\*\/\s*\[\]\s*\)/, JSON.stringify(paths, null, 2));
      writeFileSync(swPath, sw, 'utf8');
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [svelte(), swCompilePlugin(command), swInjectPlugin(command)],
  base: command === 'build' ? '/random-legendary-llm/' : '/',
  server: {
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
}));
