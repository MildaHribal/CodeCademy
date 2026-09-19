
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
