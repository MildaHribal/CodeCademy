// SVG cesty ikon (viewBox 0 0 16 16). Kreslené tahem, barva přebírá currentColor.

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
  eye: stroke('M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z') + '<circle cx="8" cy="8" r="1.8" fill="currentColor"/>',
};
