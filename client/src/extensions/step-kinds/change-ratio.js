// Míra změny u `kind: debug` (kontrakt kap. 3.4) — výpočet bez DOM, testuje se v Node.
import { changeRatio } from '../../../../shared/diff.js';

export function debugChangeRatio({ seed, userFiles, solution = null }) {
  const withRegion = seed.filter((file) => file.region);
  const parts = withRegion.length
    ? withRegion.map((file) => ({ name: file.name, lines: regionLines(file) }))
    : seed
        .filter((file) => {
          const solved = solution?.find((s) => s.name === file.name);
          if (!solution) return userFiles.find((u) => u.name === file.name)?.content !== file.content;
          return solved && solved.content !== file.content;
        })
        .map((file) => ({ name: file.name, lines: file.content.split('\n') }));

  let assessed = 0;
  let missing = 0;
  for (const part of parts) {
    const lines = part.lines.filter((line) => line.trim() !== '');
    if (!lines.length) continue;
    const userText = userFiles.find((file) => file.name === part.name)?.content ?? '';
    assessed += lines.length;
    missing += changeRatio(lines, userText) * lines.length;
  }
  return assessed ? { ratio: missing / assessed, assessed } : null;
}

function regionLines(file) {
  return file.content.split('\n').slice(file.region.start - 1, file.region.end);
}

export function changeWarning(ratio, maxChange = 0.5) {
  if (!(ratio > maxChange)) return null;
  if (maxChange === 0.5) return 'Přepsal jsi víc než polovinu kódu — u opravy chyby jde o nejmenší změnu.';
  return `Přepsal jsi víc než ${Math.round(maxChange * 100)} % kódu — u opravy chyby jde o nejmenší změnu.`;
}
