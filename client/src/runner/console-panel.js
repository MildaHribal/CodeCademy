// Jednoduchý panel konzole pro náhled runtime js.
// Třídy `akademie-console*` si může aplikace nastylovat po svém.

const COLORS = { log: 'inherit', info: '#2563eb', warn: '#b45309', error: '#dc2626' };

export function createConsolePanel() {
  const element = document.createElement('div');
  element.className = 'akademie-console';
  element.setAttribute('role', 'log');
  Object.assign(element.style, {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    height: '100%',
    boxSizing: 'border-box',
    padding: '8px',
  });

  function append(entry) {
    if (entry.level === 'clear') {
      element.replaceChildren();
      return;
    }
    const line = document.createElement('div');
    line.className = `akademie-console__entry akademie-console__entry--${entry.level}`;
    line.style.color = COLORS[entry.level] ?? 'inherit';
    line.textContent = entry.text;
    element.append(line);
    element.scrollTop = element.scrollHeight;
  }

  return { element, append };
}
