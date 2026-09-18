## Konfigurace prostředí

Aplikace čte hesla a nastavení z prostředí (z `.env` jen lokálně; nikdy do Gitu):
```js
const config = {
  port: process.env.PORT ?? 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

if (!config.dbUrl || !config.jwtSecret) {
  console.error("Chybí konfigurace!");
  process.exit(1);
}
```

## Health check a proces

Jednoduchý [[health check]] endpoint:
```js
app.get('/health', (req, res) => {
  // Aplikace běží, pokud tu odpoví a připojí se k databázi
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});
```
Řízené ukončení ([[graceful shutdown]]):
```js
const server = app.listen(port, () => console.log('Běžím.'));
process.on('SIGTERM', () => {
  server.close(() => {
    // zavírat připojení k databázi, cleanup
    process.exit(0); // OK
  });
});
```

## Dockerfile a Compose

Příklad vícefázového (multi-stage) Dockerfile:
```dockerfile
# Builder fáze (instaluje vše včetně devDependencies pro build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Produkční fáze (jen to nutné)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Nekoukat pod právy roota!
USER node
CMD ["node", "dist/server.js"]
```
Soubor `compose.yaml` (spuštění přes `docker compose up -d`):
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
```

## Základní workflow v GitHub Actions (CI)

```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```
