// Orientace v kurzu bez DOM: doporučená trasa, „Další na trase" a kam vede „Pokračovat".
// Soubor nesahá na document ani window, testuje se v Node (tools/orientation-unit.test.js).
//
// Doporučená trasa (kontrakt kap. 2.1) jen radí, v jakém pořadí sekce procházet — prokládá
// CSS a JS. Nic se podle ní nezamyká. Když ji osnova nemá, platí pořadí sekcí v osnově.

/** Všechny sekce osnovy v pořadí částí: [{ part, section }]. */
export function sectionsInOrder(curriculum) {
  return curriculum.parts.flatMap((part) => part.sections.map((section) => ({ part, section })));
}

/**
 * Sekce podle doporučené trasy.
 * @returns {{ onRoute: {part, section}[], offRoute: {part, section}[], hasRoute: boolean }}
 *   onRoute v pořadí trasy (bez neznámých slugů a duplicit), offRoute = zbylé sekce v pořadí osnovy
 */
export function routeView(curriculum) {
  const entries = sectionsInOrder(curriculum);
  const byId = new Map(entries.map((entry) => [entry.section.id, entry]));
  const route = routeIds(curriculum);
  const hasRoute = Boolean(curriculum.doporucenaTrasa?.length);
  const onRoute = route.map((id) => byId.get(id));
  const onRouteIds = new Set(route);
  return { onRoute, offRoute: entries.filter((entry) => !onRouteIds.has(entry.section.id)), hasRoute };
}

/** Id sekcí trasy: doporučená trasa (jen známé sekce, bez opakování), jinak pořadí osnovy. */
export function routeIds(curriculum) {
  const known = sectionsInOrder(curriculum).map((entry) => entry.section.id);
  const route = curriculum.doporucenaTrasa ?? [];
  if (!route.length) return known;
  const knownSet = new Set(known);
  return [...new Set(route)].filter((id) => knownSet.has(id));
}

/**
 * Kam jít po sekci.
 * @returns {{ next: section | null, core: section | null }}
 *   next = další dostupná sekce na trase; když sekce na trase není (typicky rozšíření),
 *          první dostupná sekce trasy, která v osnově následuje po ní
 *   core = u sekce s úrovní „rozsireni" navíc další dostupná sekce jádra v pořadí osnovy
 *          (null, když je stejná jako next nebo žádná není)
 */
export function nextOnRoute(curriculum, sectionId) {
  const entries = sectionsInOrder(curriculum);
  const byId = new Map(entries.map((entry) => [entry.section.id, entry.section]));
  const current = byId.get(sectionId);
  if (!current) return { next: null, core: null };

  const route = routeIds(curriculum);
  const usable = (id) => id !== sectionId && byId.get(id)?.available;
  let candidates;
  const position = route.indexOf(sectionId);
  if (position !== -1) {
    candidates = route.slice(position + 1);
  } else {
    const onRoute = new Set(route);
    const osnovaIndex = entries.findIndex((entry) => entry.section.id === sectionId);
    candidates = entries.slice(osnovaIndex + 1).map((entry) => entry.section.id).filter((id) => onRoute.has(id));
  }
  const nextId = candidates.find(usable) ?? null;
  const next = nextId ? byId.get(nextId) : null;

  let core = null;
  if (current.uroven === 'rozsireni') {
    const osnovaIndex = entries.findIndex((entry) => entry.section.id === sectionId);
    const found = entries.slice(osnovaIndex + 1).find((entry) => entry.section.uroven !== 'rozsireni' && usable(entry.section.id));
    core = found && found.section.id !== nextId ? found.section : null;
  }
  return { next, core };
}

/**
 * Krok, na který vede „Pokračovat" ve workshopu (kontrakt kap. 8): první nesplněný krok od
 * naposledy otevřeného dál; když jsou za ním všechny splněné, první nesplněný od začátku;
 * když je splněné všechno, naposledy otevřený krok (nebo první).
 * @param {string[]} stepIds  id kroků v pořadí
 * @param {string | null} lastVisited  id z postupu (může patřit jinému modulu)
 * @param {(id: string) => boolean} isCompleted
 */
export function resumeStepId(stepIds, lastVisited, isCompleted) {
  if (!stepIds.length) return null;
  const start = Math.max(stepIds.indexOf(lastVisited), 0);
  const ordered = [...stepIds.slice(start), ...stepIds.slice(0, start)];
  return ordered.find((id) => !isCompleted(id)) ?? stepIds[start];
}

/** Adresa přehledu, která odscrolluje na část osnovy (drobečky). */
export const partHref = (partId) => `#/?cast=${encodeURIComponent(partId)}`;
