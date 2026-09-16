import { defineConfig } from 'vite';

export default defineConfig({
  // Cache buildu ve složce projektu (výchozí je node_modules/.vite).
  cacheDir: '.cache/vite',
  server: {
    // API běží vedle na 3001. Proxy z něj udělá stejný původ, takže cookie
    // s přihlášením funguje bez CORS a bez credentials napříč doménami.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
