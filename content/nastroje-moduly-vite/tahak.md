## ES moduly

| zápis | co dělá |
|---|---|
| `export function formatCzk() {}` | [[pojmenovaný export]] |
| `export { a, b };` | export seznamem na konci souboru |
| `export default function () {}` | [[výchozí export]], jen jeden na modul |
| `import { a, b } from './money.js'` | pojmenovaný import, stejné jméno |
| `import { format as formatDate } from './dates.js'` | přejmenování při importu |
| `import receipt from './receipt.js'` | výchozí import, jméno libovolné |
| `import * as money from './money.js'` | celý modul jako objekt |
| `export { addItem } from './items.js'` | znovu vystavit ([[barrel soubor]] `index.js`) |
| `import data from './menu.json' with { type: 'json' }` | import JSON |
| `const { openEditor } = await import('./editor.js')` | [[dynamický import]] za běhu |
| `import.meta.url`, `import.meta.main` | adresa modulu, spuštěný přímo? |

- Relativní cesta od souboru s importem, **vždy s `.js`**: `./menu.js`, `../money.js`.
- Import je [[živá vazba]] jen pro čtení. Stav mění funkce modulu.
- Modul se vyhodnotí jednou, má vlastní rozsah, v prohlížeči `type="module"`.
- CommonJS poznáš podle `require` a `module.exports`; z ES modulu ho importuj výchozím importem.

## npm a pnpm

| příkaz npm | pnpm | co dělá |
|---|---|---|
| `npm install dayjs` | `pnpm add dayjs` | přidá do `dependencies` |
| `npm install -D vite` | `pnpm add -D vite` | přidá do `devDependencies` |
| `npm ci` | `pnpm install --frozen-lockfile` | přesně podle lockfile |
| `npm run build` | `pnpm build` | pustí skript |
| `npx eslint .` | `pnpm exec eslint .` | pustí nástroj z balíčku |

| rozsah | povolí | nepovolí |
|---|---|---|
| `^1.2.3` | `1.x.x` od `1.2.3` | `2.0.0` |
| `~1.2.3` | `1.2.x` od `1.2.3` | `1.3.0` |
| `^0.2.3` | `0.2.x` od `0.2.3` | `0.3.0` |

- `node_modules` do `.gitignore`, [[lockfile]] do Gitu.
- `"type": "module"` v každém novém projektu.
- `"exports": { ".": "./src/index.js" }` — co v něm není, skončí `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## Vite

| skript | příkaz | k čemu |
|---|---|---|
| `dev` | `vite` | dev server s [[HMR]], `localhost:5173` |
| `build` | `vite build` | hotový web do `dist/` |
| `preview` | `vite preview` | vyzkoušet `dist/` na místním serveru |

- Vstup je `index.html` s `<script type="module" src="/src/main.js">`.
- `import './style.css'` a `import logoUrl from './logo.svg'` (adresa, malé soubory vložené jako `data:`).
- `public/robots.txt` → `/robots.txt`, beze změny jména.
- `.env`: kód vidí jen `import.meta.env.VITE_…`. Předpona = veřejné, ne bezpečné.
- Web v podsložce: `defineConfig({ base: './' })`.

## ESLint a Prettier

```js
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  { languageOptions: { globals: globals.browser }, rules: { eqeqeq: 'error' } },
];
```

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run lint && npm run format:check && npm run build"
  }
}
```

## Pasti

| příznak | oprava |
|---|---|
| `ERR_MODULE_NOT_FOUND` u vlastního souboru | dopiš `.js` |
| `does not provide an export named 'default'` | složené závorky u pojmenovaného exportu |
| `Assignment to constant variable.` u importu | změnu udělej funkcí modulu |
| `addToCart is not defined` z `onclick` | `addEventListener` v modulu |
| `Cannot access 'X' before initialization` | cyklus: sdílenou hodnotu do třetího modulu |
| `import.meta.env.API_URL` je `undefined` | předpona `VITE_` |
| bílá stránka z `dist/index.html` přes `file://` | `npm run preview` |
| `'document' is not defined` v ESLint | `languageOptions.globals` |
| lint padá na `dist/assets/…` | `{ ignores: ['dist/'] }` |
