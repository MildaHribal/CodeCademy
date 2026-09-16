import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Cache mimo node_modules, ať ji jde smazat bez přeinstalace závislostí.
  cacheDir: '.cache',
  test: {
    // Jednotkové testy jsou jen nad logikou v lib/; e2e testy patří Playwrightu.
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
