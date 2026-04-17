import { defineConfig } from '@playwright/test';
import { sharedConfig } from './playwright.base.config.mjs';

const PORT = process.env.PLAYWRIGHT_PORT || '8131';

export default defineConfig({
  ...sharedConfig,
  testIgnore: ['**/epic40-production.spec.mjs'],
  use: {
    ...sharedConfig.use,
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 30_000
  }
});
