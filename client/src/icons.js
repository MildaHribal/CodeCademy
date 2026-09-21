
const stroke = (d, width = 1.8) =>
  `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const icons = {
  check: stroke('M3.5 8.5l3 3 6-7'),
  cross: stroke('M4.5 4.5l7 7M11.5 4.5l-7 7'),
  pending: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.2 2.2"/>',
  circle: '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  half: '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 2.8a5.2 5.2 0 0 1 0 10.4z" fill="currentColor"/>',
  play: '<path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/>',
  reset: stroke('M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8'),
  arrowLeft: stroke('M9.5 3.5L5 8l4.5 4.5'),
  arrowRight: stroke('M6.5 3.5L11 8l-4.5 4.5'),
  copy: stroke('M5.5 5.5h7v7h-7zM3.5 10.5v-7h7'),
  lock: stroke('M4.5 7.5h7v5.5h-7zM6 7.5V5.5a2 2 0 0 1 4 0v2'),
  folder: stroke('M2.5 4.5h4l1.5 1.5h5.5v6.5h-11z'),
  chevronDown: stroke('M4 6l4 4 4-4'),
  note: stroke('M4 2.5h5.5l2.5 2.5v8.5H4zM9.5 2.5V5H12M6 8h4M6 10.5h3'),
  question: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/>' + stroke('M6.3 6.3a1.8 1.8 0 1 1 2.5 1.6c-.5.2-.8.6-.8 1.1v.4') + '<circle cx="8" cy="11.4" r=".9" fill="currentColor"/>',
  close: stroke('M4 4l8 8M12 4l-8 8'),
  phone: stroke('M5 2.5h6v11H5zM7.2 11.6h1.6', 1.5),
  search: '<circle cx="7" cy="7" r="4.3" fill="none" stroke="currentColor" stroke-width="1.7"/>' + stroke('M10.2 10.2L13.5 13.5'),
  eye: stroke('M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z') + '<circle cx="8" cy="8" r="1.8" fill="currentColor"/>',
};

/* Značky typů modulů. Každá říká, co u modulu děláš:
   lekce = otevřená kniha (čteš), workshop = schody (vedený postup krok za krokem),
   lab = prázdné hranaté závorky (vyplníš je sám), kvíz = otazník (vybavuješ si),
   projekt = list přes list (větší práce ve VS Code). */
export const moduleTypeIcons = {
  lesson: stroke('M8 4.6C6.9 3.7 5.1 3.3 2.8 3.5v8c2.3-.2 4.1.2 5.2 1 1.1-.8 2.9-1.2 5.2-1v-8c-2.3-.2-4.1.2-5.2 1zM8 4.6v8.9', 1.5),
  workshop: stroke('M2.4 13.2V10.4h3.8V7.2h3.8V4h3.6', 1.9),
  lab: stroke('M6 3.4H3.4v9.2H6M10 3.4h2.6v9.2H10', 1.6),
  quiz:
    '<circle cx="8" cy="8" r="5.8" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    stroke('M6.4 6.5a1.7 1.7 0 1 1 2.3 1.6c-.5.2-.7.6-.7 1v.3', 1.5) +
    '<circle cx="8" cy="11.2" r=".85" fill="currentColor"/>',
  project: stroke('M6 5.2h3.6L12 7.5v6.1H6zM9.6 5.2v2.3H12M3.9 11.4V2.6h4.8', 1.5),
};
