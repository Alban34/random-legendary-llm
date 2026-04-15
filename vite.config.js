import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default defineConfig(({ command }) => ({
  plugins: [svelte()],
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
