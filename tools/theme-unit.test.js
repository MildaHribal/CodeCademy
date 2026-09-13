// Barevné tokeny (client/src/styles/tokens.css): světlá a tmavá varianta mají stejná jména,
// text je vůči své ploše čitelný (kontrast aspoň 4.5:1, kontrakt kap. 5.11) a ostatní CSS
// barvy nepíše natvrdo (docs/platforma.md, kap. 4.7).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const CLIENT_SRC = path.join(import.meta.dirname, '..', 'client', 'src');
const TOKENS_FILE = path.join(CLIENT_SRC, 'styles', 'tokens.css');

/** Custom properties z bloku CSS, jehož selektor začíná `selectorStart`. */
function tokenBlock(css, selectorStart) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const start = clean.indexOf(selectorStart);
  assert.notEqual(start, -1, `blok ${selectorStart} v tokens.css chybí`);
  const open = clean.indexOf('{', start);
  const close = clean.indexOf('}', open);
  const tokens = {};
  for (const match of clean.slice(open + 1, close).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[match[1]] = match[2].trim();
  return tokens;
}

function luminance(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// [text, plocha] — dvojice, které se v UI opravdu potkají.
const PAIRS = [
  ['--ink', '--paper'],
  ['--ink', '--surface'],
  ['--ink-soft', '--surface'],
  ['--ink-soft', '--paper'],
  ['--ink-faint', '--surface'],
  ['--ink-faint', '--paper'],
  ['--accent', '--surface'],
  ['--accent', '--paper'],
  ['--accent', '--accent-soft'],
  ['--on-accent', '--accent'],
  ['--done', '--done-soft'],
  ['--done-ink', '--done-soft'],
  ['--fail-ink', '--fail-soft'],
  ['--warn', '--warn-soft'],
  ['--text-strong-accent', '--paper'],
  ['--text-strong-accent', '--surface'],
  ['--code-inline-fg', '--code-inline-bg'],
  ['--term-fg', '--paper'],
  ['--term-fg', '--surface'],
  ['--mark-fg', '--mark-bg'],
  ...['remember', 'pitfall', 'tip', 'note'].flatMap((type) => [
    [`--callout-${type}-fg`, `--callout-${type}-bg`],
    [`--callout-${type}-icon`, `--callout-${type}-bg`],
  ]),
];

describe('barevné tokeny', () => {
  const css = fs.readFileSync(TOKENS_FILE, 'utf8');
  const light = tokenBlock(css, ":root,\n:root[data-theme='light']");
  const dark = tokenBlock(css, ":root[data-theme='dark']");

  test('tmavá varianta má přesně stejná jména tokenů jako světlá', () => {
    assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
  });

  test('tokeny výkladu z kontraktu kap. 5.11 existují', () => {
    const required = [
      '--text-strong-accent', '--code-inline-bg', '--code-inline-fg', '--term-fg', '--mark-bg',
      ...['remember', 'pitfall', 'tip', 'note'].flatMap((type) => ['bg', 'border', 'fg', 'icon'].map((part) => `--callout-${type}-${part}`)),
    ];
    for (const name of required) assert.ok(light[name], `chybí ${name}`);
  });

  for (const [variant, tokens] of [['světlá', light], ['tmavá', dark]]) {
    test(`${variant} varianta: text vůči ploše aspoň 4.5:1`, () => {
      const failures = PAIRS.map(([fg, bg]) => [fg, bg, contrast(tokens[fg], tokens[bg])])
        .filter(([, , ratio]) => !(ratio >= 4.5))
        .map(([fg, bg, ratio]) => `${fg} na ${bg}: ${ratio.toFixed(2)}`);
      assert.deepEqual(failures, []);
    });
  }
});

describe('CSS mimo tokens.css nepíše barvy natvrdo', () => {
  function cssFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return cssFiles(full);
      return entry.name.endsWith('.css') && full !== TOKENS_FILE ? [full] : [];
    });
  }

  test('žádné #hex, rgb(), hsl() ani oklch() ve stylech (jen var(--…))', () => {
    const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g;
    const found = [];
    for (const file of cssFiles(CLIENT_SRC)) {
      const lines = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' ')).split('\n');
      lines.forEach((line, index) => {
        // Jen hodnoty vlastností — selektor jako #main nebo řádek s výčtem selektorů se nekontroluje.
        const value = /[{,]\s*$/.test(line) ? '' : line.slice(line.indexOf(':') + 1);
        if (COLOR.test(value)) found.push(`${path.relative(CLIENT_SRC, file)}:${index + 1}: ${line.trim()}`);
        COLOR.lastIndex = 0;
      });
    }
    assert.deepEqual(found, [], 'barvu přidej jako token do tokens.css (obě varianty) a použij var(--…)');
  });
});
