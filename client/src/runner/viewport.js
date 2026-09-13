// Výpočet, jak velký a jak zmenšený má být iframe náhledu (Preview.setViewport).
// Čistý výpočet bez DOM, aby šel testovat v Node.

/**
 * @param {{ width: number, height: number } | null} viewport  požadovaná velikost stránky, null = celý panel
 * @param {{ width: number, height: number }} panel  rozměry panelu náhledu v px
 * @returns {{ scale: number, frameWidth: string, frameHeight: string, stageWidth: string, stageHeight: string, centered: boolean }}
 *
 * Stránka dostane přesně požadovanou šířku (media queries počítají s ní) a zmenší se tak,
 * aby se do panelu vešla na šířku. Nikdy se nezvětšuje. Na výšku se v panelu posouvá.
 */
export function fitViewport(viewport, panel) {
  if (!viewport) {
    return { scale: 1, frameWidth: '100%', frameHeight: '100%', stageWidth: '100%', stageHeight: '100%', centered: false };
  }
  const available = Number(panel?.width) > 0 ? Number(panel.width) : viewport.width;
  const scale = Math.min(1, available / viewport.width);
  const round = (value) => `${Math.floor(value * 100) / 100}px`;
  return {
    scale,
    frameWidth: `${viewport.width}px`,
    frameHeight: `${viewport.height}px`,
    stageWidth: round(viewport.width * scale),
    stageHeight: round(viewport.height * scale),
    centered: scale === 1,
  };
}
