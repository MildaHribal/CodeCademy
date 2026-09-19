
export function outcomeLinkLabel(ref, section, headings = []) {
  const [path, anchor] = ref.split('#');
  const [sectionId, moduleSlug, step] = path.split('/');
  const moduleId = `${sectionId}/${moduleSlug}`;
  const title = section.modules?.find((module) => module.id === moduleId)?.title ?? moduleId;
  if (step) return `${title}, krok ${Number(step)}`;
  const heading = anchor ? headings.find((item) => item.anchor === anchor) : null;
  return heading ? `${title} › ${plainHeading(heading.text)}` : title;
}

export function plainHeading(text) {
  return String(text)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '');
}
