import { defineConfig } from 'vitest/config';

// Separado do vite.config.ts: o plugin do React Router monta o app inteiro
// e não roda dentro dos testes.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
  },
});
