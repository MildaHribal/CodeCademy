import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Jednotkové testy jsou jen nad logikou v lib/; e2e testy patří Playwrightu.
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
