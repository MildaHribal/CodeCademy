// Popisky odkazů „Kde se to učíš" u výstupů sekce — bez DOM, testuje se v Node.

/**
 * Popisek reference podle osnovy sekce: titulek modulu, u kroku „Krok N".
 * Reference mimo sekci nebo neznámý modul → id modulu.
 * @param {string} ref  např. 'js-pole/co-je-pole#kopie-pole' nebo 'js-pole/workshop/016'
 * @param {{ modules: { id: string, title: string }[] }} section
 */
export function outcomeLinkLabel(ref, section) {
  const [path] = ref.split('#');
  const [sectionId, moduleSlug, step] = path.split('/');
  const moduleId = `${sectionId}/${moduleSlug}`;
  const title = section.modules?.find((module) => module.id === moduleId)?.title ?? moduleId;
  return step ? `${title}, krok ${Number(step)}` : title;
}
