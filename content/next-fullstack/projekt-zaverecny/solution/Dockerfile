# Dvoufázový build: výsledný obraz nenese zdrojáky ani devDependencies.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# Režim standalone nekopíruje .next/static — musíme ho přidat sami.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/drizzle ./drizzle
EXPOSE 3000
CMD ["node", "server.js"]
