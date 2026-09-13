// Popisky odkazů „Kde se to učíš" u výstupů sekce — bez DOM, testuje se v Node.

/**
 * Popisek reference podle osnovy sekce: titulek modulu, u kroku „Krok N", u kotvy
 * v lekci „Titulek › nadpis" (když je text nadpisu známý).
 * Reference mimo sekci nebo neznámý modul → id modulu.
 * @param {string} ref  např. 'js-pole/co-je-pole#kopie-pole' nebo 'js-pole/workshop/016'
 * @param {{ modules: { id: string, title: string }[] }} section
 * @param {{ anchor: string, text: string }[]} [headings]  nadpisy lekce, na kterou reference míří
 */
export function outcomeLinkLabel(ref, section, headings = []) {
  const [path, anchor] = ref.split('#');
  const [sectionId, moduleSlug, step] = path.split('/');
  const moduleId = `${sectionId}/${moduleSlug}`;
  const title = section.modules?.find((module) => module.id === moduleId)?.title ?? moduleId;
  if (step) return `${title}, krok ${Number(step)}`;
  const heading = anchor ? headings.find((item) => item.anchor === anchor) : null;
  return heading ? `${title} › ${plainHeading(heading.text)}` : title;
}

/** Text nadpisu bez markdownu (inline kód, zdůraznění, pojmy a odkazy). */
export function plainHeading(text) {
  return String(text)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '');
}
