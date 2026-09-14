#!/usr/bin/env bash
# Spustí Akademii: sestaví klienta (když je potřeba) a nastartuje server.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then npm install; fi
if [ ! -f dist/index.html ] || [ -n "$(find client shared -newer dist/index.html -type f -print -quit)" ]; then
  echo "Sestavuju klienta…"
  npx vite build --logLevel warn
fi

# Knihovny pro runtime react a libs (React, Motion…) — jen když chybí nebo jsou po npm install zastaralé.
node tools/build-vendor.js

PORT="${PORT:-4300}"
echo "Akademie běží na http://localhost:$PORT"
exec env PORT="$PORT" node server/index.js
