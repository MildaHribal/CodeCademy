// Vytvoření sandboxovaného iframu (kontrakt kap. 6.8).

// Bez allow-same-origin: kód v iframu nemá přístup k aplikaci a Chrome ho spouští
// v odděleném procesu, takže zaseknutý iframe nezamrazí stránku.
export const SANDBOX = 'allow-scripts allow-modals allow-forms';
export const TEST_VIEWPORT = { width: 1024, height: 768 };

/**
 * Neviditelný iframe pro testy. Záměrně leží v okně (průhledný, pod obsahem), ne mimo
 * obrazovku: iframe mimo viditelnou oblast Chrome přestane vykreslovat, a pak nefungují
 * requestAnimationFrame, ResizeObserver ani CSS přechody.
 */
export function createHiddenFrame({ width = TEST_VIEWPORT.width, height = TEST_VIEWPORT.height } = {}) {
  const frame = createFrame('Běh testu');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  Object.assign(frame.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
  });
  return frame;
}

/** Viditelný iframe náhledu, vyplní svůj kontejner. */
export function createPreviewFrame() {
  const frame = createFrame('Náhled stránky');
  Object.assign(frame.style, { display: 'block', width: '100%', height: '100%', border: '0', background: '#fff' });
  return frame;
}

function createFrame(title) {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', SANDBOX);
  frame.setAttribute('title', title);
  return frame;
}

export function resizeFrame(frame, width, height) {
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
}
