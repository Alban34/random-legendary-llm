import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    include: ['test/**/*.test.mjs'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts', 'src/**/*.js'],
    },
  },
});
