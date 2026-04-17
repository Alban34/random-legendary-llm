import { defineConfig } from '@playwright/test';
import { sharedConfig } from './playwright.base.config.mjs';

const PORT = process.env.PLAYWRIGHT_PORT || '4173';

/**
 * Production-only Playwright config.
 *
 * Runs against `npm run preview` (the Vite preview server serving the
 * production build at the /random-legendary-llm/ base path).
 *
 * Usage:
 *   npm run build
 *   npx playwright test --config playwright.prod.config.mjs
 */
export default defineConfig({
  ...sharedConfig,
  testMatch: ['**/epic40-production.spec.mjs'],
  use: {
    ...sharedConfig.use,
    baseURL: `http://127.0.0.1:${PORT}/random-legendary-llm/`,
  },
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/random-legendary-llm/`,
    reuseExistingServer: true,
    timeout: 60_000
  }
});
