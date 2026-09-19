// Nastavení bez DOM: motivy, šířky náhledu a jejich převody (kontrakt kap. 6.7, 12.6).

export const THEMES = ['system', 'light', 'dark'];

export const THEME_LABELS = {
  system: 'Motiv podle systému',
  light: 'Světlý motiv',
  dark: 'Tmavý motiv',
};

export function nextTheme(theme) {
  const index = THEMES.indexOf(theme);
  return THEMES[(index + 1) % THEMES.length];
}

export function resolveTheme(theme, prefersDark) {
  if (theme === 'light' || theme === 'dark') return theme;
  return prefersDark ? 'dark' : 'light';
}

export const PREVIEW_WIDTHS = ['tests', '768', '375', 'panel'];

export const PREVIEW_WIDTH_LABELS = {
  tests: { label: 'Jako testy', title: 'Stránka široká 1024 px jako při kontrole, zmenšená do panelu' },
  768: { label: '768', title: 'Šířka tabletu na výšku (768 px)' },
  375: { label: '375', title: 'Šířka telefonu (375 px)' },
  panel: { label: 'Panel', title: 'Náhled vyplní celý panel' },
};

export function previewViewport(width) {
  switch (width) {
    case 'tests':
      return { width: 1024, height: 768 };
    case '768':
      return { width: 768, height: 1024 };
    case '375':
      return { width: 375, height: 667 };
    case 'panel':
      return null;
    default:
      return { width: 1024, height: 768 };
  }
}
