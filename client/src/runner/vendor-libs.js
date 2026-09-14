// Knihovny dostupné v prohlížečových runtime (kontrakt kap. 6.10 a 6.11).
//
// Jediný popis pro tři místa: skládání stránky (import map, compose.js), sestavení
// balíčků (tools/build-vendor.js) a server, který soubory vydává (server/routes/vendor.js).
// Soubor je čistá data bez importů, aby šel načíst v prohlížeči i v Node.

/** Adresa, pod kterou server knihovny vydává (s CORS `*`, iframe má neprůhledný origin). */
export const VENDOR_PATH = '/api/vendor';

/** Jména pro `libs` (frontmatter, module.json, `:::live … libs=`). */
export const LIB_NAMES = ['tailwind', 'gsap', 'motion', 'lenis', 'three'];

/** Knihovny, které stránku mění samy od sebe — bez `libs` se nenačtou. Ostatní jsou jen ES moduly. */
export const PAGE_LIBS = ['tailwind', 'lenis'];

/**
 * Předsestavené ES moduly (jeden build rolldownem, sdílené části v chunk-*.js, takže
 * `react` je v celé stránce jediná instance). Klíč = specifikátor v import map.
 * `cjs: true` = balíček je CommonJS, pojmenované exporty se vypíšou do obalového modulu.
 */
export const BUNDLED_MODULES = {
  react: { cjs: true },
  'react/jsx-runtime': { cjs: true },
  'react/jsx-dev-runtime': { cjs: true },
  'react-dom': { cjs: true },
  'react-dom/client': { cjs: true },
  'react-router': {},
  'react-router/dom': {},
  '@tanstack/react-query': {},
  'radix-ui': {},
  clsx: {},
  'class-variance-authority': {},
  'tailwind-merge': {},
  motion: {},
  'motion/react': {},
};

/** `react-dom/client` → `react-dom__client.js`, `@tanstack/react-query` → `tanstack__react-query.js` */
export function bundleFileName(specifier) {
  return `${specifier.replace(/^@/, '').replace(/\//g, '__')}.js`;
}

/**
 * Balíčky, které už jsou čisté ES moduly bez holých importů mimo import map — vydávají se
 * přímo z node_modules. Klíč = první segment adresy `/api/vendor/raw/<klíč>/…`.
 */
export const RAW_ROOTS = {
  gsap: 'gsap',
  three: 'three',
  lenis: 'lenis/dist',
  'tailwindcss-browser': '@tailwindcss/browser/dist',
};

/** Specifikátory mířící na soubory z RAW_ROOTS (klíče končící `/` jsou předpony). */
const GSAP_FILES = [
  'all', 'CSSPlugin', 'CSSRulePlugin', 'CustomBounce', 'CustomEase', 'CustomWiggle', 'Draggable', 'DrawSVGPlugin',
  'EaselPlugin', 'EasePack', 'Flip', 'GSDevTools', 'InertiaPlugin', 'MorphSVGPlugin', 'MotionPathHelper',
  'MotionPathPlugin', 'Observer', 'PhysicsPropsPlugin', 'Physics2DPlugin', 'PixiPlugin', 'ScrambleTextPlugin',
  'ScrollSmoother', 'ScrollToPlugin', 'ScrollTrigger', 'SplitText', 'TextPlugin',
];

const RAW_IMPORTS = {
  gsap: 'gsap/index.js',
  // `import { ScrollTrigger } from 'gsap/ScrollTrigger'` (bez .js, jak to píše dokumentace GSAP)
  ...Object.fromEntries(GSAP_FILES.map((name) => [`gsap/${name}`, `gsap/${name}.js`])),
  'gsap/': 'gsap/',
  three: 'three/build/three.module.js',
  'three/webgpu': 'three/build/three.webgpu.js',
  'three/tsl': 'three/build/three.tsl.js',
  'three/addons': 'three/examples/jsm/Addons.js',
  'three/addons/': 'three/examples/jsm/',
  'three/examples/jsm/': 'three/examples/jsm/',
  lenis: 'lenis/lenis.mjs',
  'lenis/react': 'lenis/lenis-react.mjs',
  'lenis/snap': 'lenis/lenis-snap.mjs',
};

export const TAILWIND_SCRIPT = 'raw/tailwindcss-browser/index.global.js';

/**
 * Import map pro knihovny (runtime dom, vue, react). Moduly jsou v ní vždy — načtou se,
 * až když je kód opravdu naimportuje.
 * @param {string} origin  adresa serveru (iframe má neprůhledný origin, relativní URL nejdou)
 */
export function vendorImports(origin = '') {
  const base = `${origin}${VENDOR_PATH}/`;
  const imports = {};
  for (const specifier of Object.keys(BUNDLED_MODULES)) imports[specifier] = `${base}bundle/${bundleFileName(specifier)}`;
  for (const [specifier, target] of Object.entries(RAW_IMPORTS)) imports[specifier] = `${base}raw/${target}`;
  return imports;
}

/** Styly, které Lenis potřebuje (lenis/dist/lenis.css). Vkládají se přímo, ať jdou číst z testu. */
export const LENIS_CSS = `html.lenis, html.lenis body { height: auto; }
.lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }
.lenis [data-lenis-prevent], .lenis [data-lenis-prevent-wheel], .lenis [data-lenis-prevent-touch],
.lenis [data-lenis-prevent-vertical], .lenis [data-lenis-prevent-horizontal] { overscroll-behavior: contain; }
.lenis.lenis-smooth iframe { pointer-events: none; }
.lenis.lenis-autoToggle { transition-property: overflow; transition-duration: 1ms; transition-behavior: allow-discrete; }`;

/** CSS s direktivami Tailwindu — v režimu `libs: tailwind` se vloží jako `<style type="text/tailwindcss">`. */
export function isTailwindCss(css) {
  return /@(theme|apply|utility|variant|custom-variant|source|plugin|config|reference)\b|@import\s+["']tailwindcss/.test(String(css ?? ''));
}

/**
 * Normalizace `libs` z požadavku: jen známá jména, bez duplicit.
 * @returns {string[]}
 */
export function normalizeLibs(libs) {
  if (!Array.isArray(libs)) return [];
  return [...new Set(libs.map((lib) => String(lib).trim().toLowerCase()))].filter((lib) => LIB_NAMES.includes(lib));
}

/**
 * Tailwind se zapne sám, když CSS importuje `tailwindcss` (jako ve skutečném projektu), stránka má
 * `<style type="text/tailwindcss">` nebo načítá `@tailwindcss/browser` z CDN (jak radí dokumentace
 * Tailwindu) — adresa CDN se nahradí místním souborem, stránka funguje offline.
 */
const TAILWIND_MARKER = /@import\s+(url\(\s*)?["']tailwindcss["']|type\s*=\s*["']?text\/tailwindcss|<script\b[^>]*\bsrc\s*=\s*["']?[^"'\s>]*@tailwindcss\/browser/i;

/** `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4` (i unpkg, bez verze, s cestou k souboru) */
export function isTailwindCdnUrl(src) {
  return /^(https?:)?\/\/[^\s"'<>]*\/@tailwindcss\/browser(@[\w.^~-]+)?(\/[\w./-]*)?(\?[^\s"'<>]*)?$/i.test(String(src ?? '').trim());
}
/** Lenis potřebuje své styly — vloží se, i když kód lenis jen naimportuje. */
const LENIS_IMPORT = /\bfrom\s*["']lenis(\/[\w-]+)?["']|\bimport\s*\(\s*["']lenis["']/;

/**
 * Knihovny, které stránka opravdu zapne: `libs` z požadavku + odvozené z kódu.
 * @param {string[]|undefined} libs
 * @param {Iterable<[string, string]>} files  dvojice [jméno, obsah]
 * @returns {string[]}
 */
export function resolvePageLibs(libs, files) {
  const enabled = new Set(normalizeLibs(libs));
  for (const [name, content] of files) {
    if (/\.(css|html?)$/i.test(name) && TAILWIND_MARKER.test(content)) enabled.add('tailwind');
    if (/\.(m?[jt]sx?|html?)$/i.test(name) && LENIS_IMPORT.test(content)) enabled.add('lenis');
  }
  return LIB_NAMES.filter((lib) => enabled.has(lib));
}
