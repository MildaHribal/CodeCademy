// Doporučená trasa (kontrakt kap. 2.1) jen radí, v jakém pořadí sekce procházet — prokládá

export function sectionsInOrder(curriculum) {
  return curriculum.parts.flatMap((part) => part.sections.map((section) => ({ part, section })));
}

export function routeView(curriculum) {
  const entries = sectionsInOrder(curriculum);
  const byId = new Map(entries.map((entry) => [entry.section.id, entry]));
  const route = routeIds(curriculum);
  const hasRoute = Boolean(curriculum.doporucenaTrasa?.length);
  const onRoute = route.map((id) => byId.get(id));
  const onRouteIds = new Set(route);
  return { onRoute, offRoute: entries.filter((entry) => !onRouteIds.has(entry.section.id)), hasRoute };
}

export function routeIds(curriculum) {
  const known = sectionsInOrder(curriculum).map((entry) => entry.section.id);
  const route = curriculum.doporucenaTrasa ?? [];
  if (!route.length) return known;
  const knownSet = new Set(known);
  return [...new Set(route)].filter((id) => knownSet.has(id));
}

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

export const partHref = (partId) => `#/?cast=${encodeURIComponent(partId)}`;
