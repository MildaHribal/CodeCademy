import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Testuje se produkční build, ne dev server — jen ten odpovídá tomu, co běží v provozu.
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 180_000,
  },
  use: { baseURL: 'http://localhost:3000' },
});
