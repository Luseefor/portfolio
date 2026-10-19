import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    poolOptions: {
      forks: {
        // Node's native Web Storage can shadow JSDOM's browser storage.
        // Disable it only where the runtime supports this flag.
        execArgv: process.allowedNodeEnvironmentFlags.has('--no-experimental-webstorage')
          ? ['--no-experimental-webstorage']
          : [],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    clearMocks: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
