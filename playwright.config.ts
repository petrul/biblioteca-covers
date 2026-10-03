import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT) || 3335;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  // Renders go through a single headless Chrome instance with a serial queue.
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    // Use the system Google Chrome binary; no `playwright install` needed.
    channel: 'chrome',
    headless: true,
  },
  webServer: {
    command: 'npx tsx server.ts',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'ignore',
    env: { DISABLE_HMR: 'true' },
  },
});
