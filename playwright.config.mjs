import { defineConfig } from '@playwright/test';

const PORT = process.env.PLAYWRIGHT_PORT || '8131';
const CHROMIUM_EXECUTABLE_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;

export default defineConfig({
  testDir: './test/playwright',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
    viewport: { width: 1440, height: 1080 },
    ...(CHROMIUM_EXECUTABLE_PATH ? { launchOptions: { executablePath: CHROMIUM_EXECUTABLE_PATH } } : {}),
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 30_000
  }
});

