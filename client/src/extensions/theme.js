// Barevný motiv: světlý, tmavý, nebo podle systému (kontrakt kap. 12.6).
import { registerHeaderItem } from '../core/header.js';
import { settings } from './settings/client.js';
import { nextTheme, resolveTheme, THEMES } from './settings/logic.js';

const HINT_KEY = 'akademie.theme';

const ICONS = {
  light:
    '<circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  dark: '<path d="M13 9.6A5.5 5.5 0 0 1 6.4 3 5.5 5.5 0 1 0 13 9.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  system:
    '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor"/>',
};

const SHORT_LABELS = { system: 'Theme: System', light: 'Theme: Light', dark: 'Theme: Dark' };

const media = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
let choice = readHint() ?? 'system';

function readHint() {
  try {
    const value = localStorage.getItem(HINT_KEY);
    return THEMES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function writeHint(value) {
  try {
    localStorage.setItem(HINT_KEY, value);
  } catch {
  }
}

export function applyTheme(value) {
  choice = THEMES.includes(value) ? value : 'system';
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(choice, Boolean(media?.matches));
  root.dataset.themeChoice = choice;
  writeHint(choice);
  renderToggle();
}

let removeToggle = null;

function renderToggle() {
  removeToggle?.();
  removeToggle = registerHeaderItem({
    id: 'theme',
    order: 90,
    label: SHORT_LABELS[choice],
    icon: ICONS[choice],
    onClick: () => {
      const value = nextTheme(choice);
      const root = document.documentElement;
      root.dataset.themeSwitching = '';
      setTimeout(() => delete root.dataset.themeSwitching, 300);
      applyTheme(value);
      settings.update({ theme: value });
    },
  });
}

applyTheme(choice);
media?.addEventListener('change', () => {
  if (choice === 'system') applyTheme('system');
});
settings.load().then((value) => applyTheme(value.theme));
settings.onChange((value) => {
  if (value.theme !== choice) applyTheme(value.theme);
});
