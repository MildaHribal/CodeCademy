// Knihovny dostupné v prohlížečových runtime (kontrakt kap. 6.10 a 6.11).

export const VENDOR_PATH = '/api/vendor';

export const LIB_NAMES = ['tailwind', 'gsap', 'motion', 'lenis', 'three'];

export const PAGE_LIBS = ['tailwind', 'lenis'];

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

export function bundleFileName(specifier) {
  return `${specifier.replace(/^@/, '').replace(/\//g, '__')}.js`;
}

export const RAW_ROOTS = {
  gsap: 'gsap',
  three: 'three',
  lenis: 'lenis/dist',
  'tailwindcss-browser': '@tailwindcss/browser/dist',
};

const GSAP_FILES = [
  'all', 'CSSPlugin', 'CSSRulePlugin', 'CustomBounce', 'CustomEase', 'CustomWiggle', 'Draggable', 'DrawSVGPlugin',
  'EaselPlugin', 'EasePack', 'Flip', 'GSDevTools', 'InertiaPlugin', 'MorphSVGPlugin', 'MotionPathHelper',
  'MotionPathPlugin', 'Observer', 'PhysicsPropsPlugin', 'Physics2DPlugin', 'PixiPlugin', 'ScrambleTextPlugin',
  'ScrollSmoother', 'ScrollToPlugin', 'ScrollTrigger', 'SplitText', 'TextPlugin',
];

const RAW_IMPORTS = {
  gsap: 'gsap/index.js',
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

export function vendorImports(origin = '') {
  const base = `${origin}${VENDOR_PATH}/`;
  const imports = {};
  for (const specifier of Object.keys(BUNDLED_MODULES)) imports[specifier] = `${base}bundle/${bundleFileName(specifier)}`;
  for (const [specifier, target] of Object.entries(RAW_IMPORTS)) imports[specifier] = `${base}raw/${target}`;
  return imports;
}

export const LENIS_CSS = `html.lenis, html.lenis body { height: auto; }
.lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }
.lenis [data-lenis-prevent], .lenis [data-lenis-prevent-wheel], .lenis [data-lenis-prevent-touch],
.lenis [data-lenis-prevent-vertical], .lenis [data-lenis-prevent-horizontal] { overscroll-behavior: contain; }
.lenis.lenis-smooth iframe { pointer-events: none; }
.lenis.lenis-autoToggle { transition-property: overflow; transition-duration: 1ms; transition-behavior: allow-discrete; }`;

export function isTailwindCss(css) {
  return /@(theme|apply|utility|variant|custom-variant|source|plugin|config|reference)\b|@import\s+["']tailwindcss/.test(String(css ?? ''));
}

export function normalizeLibs(libs) {
  if (!Array.isArray(libs)) return [];
  return [...new Set(libs.map((lib) => String(lib).trim().toLowerCase()))].filter((lib) => LIB_NAMES.includes(lib));
}

const TAILWIND_MARKER = /@import\s+(url\(\s*)?["']tailwindcss["']|type\s*=\s*["']?text\/tailwindcss|<script\b[^>]*\bsrc\s*=\s*["']?[^"'\s>]*@tailwindcss\/browser/i;

export function isTailwindCdnUrl(src) {
  return /^(https?:)?\/\/[^\s"'<>]*\/@tailwindcss\/browser(@[\w.^~-]+)?(\/[\w./-]*)?(\?[^\s"'<>]*)?$/i.test(String(src ?? '').trim());
}
const LENIS_IMPORT = /\bfrom\s*["']lenis(\/[\w-]+)?["']|\bimport\s*\(\s*["']lenis["']/;

export function resolvePageLibs(libs, files) {
  const enabled = new Set(normalizeLibs(libs));
  for (const [name, content] of files) {
    if (/\.(css|html?)$/i.test(name) && TAILWIND_MARKER.test(content)) enabled.add('tailwind');
    if (/\.(m?[jt]sx?|html?)$/i.test(name) && LENIS_IMPORT.test(content)) enabled.add('lenis');
  }
  return LIB_NAMES.filter((lib) => enabled.has(lib));
}
