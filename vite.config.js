import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const api = `http://127.0.0.1:${process.env.API_PORT ?? 4300}`;

export default defineConfig({
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'client/index.html'),
        runner: resolve(import.meta.dirname, 'client/runner.html'),
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: Number(process.env.VITE_PORT ?? 5300),
    strictPort: true,
    proxy: { '/api': api, '/vendor': api },
  },
});
