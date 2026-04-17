import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';

/**
 * Resolve the Chromium executable to use for local runs.
 *
 * Priority:
 *   1. PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH env var (explicit override, used by some CI configs)
 *   2. On CI (CI env var set) – return undefined so Playwright uses its own installed browser
 *   3. Locally – scan the ms-playwright cache for the newest full "Chrome for Testing" build,
 *      which avoids needing the separate chromium_headless_shell download.
 */
function resolveChromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  if (process.env.CI) return undefined;

  let cacheDir;
  if (process.platform === 'darwin') {
    cacheDir = `${os.homedir()}/Library/Caches/ms-playwright`;
  } else if (process.platform === 'linux') {
    cacheDir = `${os.homedir()}/.cache/ms-playwright`;
  } else {
    return undefined;
  }

  if (!existsSync(cacheDir)) return undefined;

  // Find the newest chromium-NNNN directory (not headless-shell)
  const chromiumDirs = readdirSync(cacheDir)
    .filter(d => /^chromium-\d+$/.test(d))
    .sort()
    .reverse();

  for (const dir of chromiumDirs) {
    const base = `${cacheDir}/${dir}`;
    const candidates = [
      // macOS arm64
      `${base}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
      // macOS x64
      `${base}/chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
      // Linux
      `${base}/chrome-linux/chrome`,
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

const CHROMIUM_EXECUTABLE_PATH = resolveChromiumExecutable();

/**
 * Shared Playwright settings inherited by both playwright.config.mjs (dev)
 * and playwright.prod.config.mjs (production preview).
 *
 * Each consumer must supply its own `use.baseURL` and `webServer` block.
 */
export const sharedConfig = {
  testDir: './test/playwright',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    headless: true,
    viewport: { width: 1440, height: 1080 },
    ...(CHROMIUM_EXECUTABLE_PATH ? { launchOptions: { executablePath: CHROMIUM_EXECUTABLE_PATH } } : {}),
  },
};
