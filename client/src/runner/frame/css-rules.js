
export function findCssRules(doc, selector) {
  const view = doc.defaultView;

  function splitList(text) {
    const parts = [];
    let depth = 0;
    let quote = null;
    let current = '';
    for (const ch of text) {
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === '(' || ch === '[') {
        depth += 1;
      } else if (ch === ')' || ch === ']') {
        depth -= 1;
      } else if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    parts.push(current.trim());
    return parts;
  }

  function canonical(text) {
    try {
      const sheet = new view.CSSStyleSheet();
      sheet.insertRule(`${text}{}`);
      return sheet.cssRules[0].selectorText;
    } catch {
      return text;
    }
  }

  function normalize(text) {
    return String(text)
      .replace(/\s+/g, ' ')
      .replace(/\s*([>+~,])\s*/g, '$1')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim();
  }

  const key = (text) => normalize(canonical(text));
  const wanted = key(selector);

  function resolveNested(selectorText, parentSelector) {
    if (!parentSelector) return selectorText;
    const parent = splitList(parentSelector).length > 1 ? `:is(${parentSelector})` : parentSelector;
    return splitList(selectorText)
      .map((part) => (part.includes('&') ? part.split('&').join(parent) : `${parent} ${part}`))
      .join(', ');
  }

  function conditionOf(rule) {
    if (view.CSSLayerBlockRule && rule instanceof view.CSSLayerBlockRule) return null;
    if (typeof rule.conditionText === 'string') return rule.conditionText;
    const header = String(rule.cssText ?? '').split('{')[0].trim();
    return header || null;
  }

  const found = [];

  function visit(rules, conditions, parentSelector) {
    for (const rule of Array.from(rules ?? [])) {
      if (typeof rule.selectorText === 'string' && rule.style) {
        const resolved = resolveNested(rule.selectorText, parentSelector);
        if (key(rule.selectorText) === wanted || key(resolved) === wanted) {
          rule.conditions = [...conditions];
          found.push(rule);
        }
        if (rule.cssRules && rule.cssRules.length) visit(rule.cssRules, conditions, resolved);
      } else if (view.CSSImportRule && rule instanceof view.CSSImportRule) {
        const media = rule.media?.mediaText;
        let imported = null;
        try {
          imported = rule.styleSheet?.cssRules;
        } catch {
          imported = null;
        }
        visit(imported, media ? [...conditions, media] : conditions, parentSelector);
      } else if (rule.cssRules) {
        const condition = conditionOf(rule);
        visit(rule.cssRules, condition ? [...conditions, condition] : conditions, parentSelector);
      }
    }
  }

  const sheets = [...Array.from(doc.styleSheets), ...Array.from(doc.adoptedStyleSheets ?? [])];
  for (const sheet of sheets) {
    let rules = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    visit(rules, [], null);
  }
  return found;
}
