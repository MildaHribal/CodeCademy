// Hledání CSS pravidel uživatele podle selektoru (helpers.cssRules / helpers.cssRule).
//
// POZOR: funkce se do iframu vkládá jako text, nesmí používat nic mimo své tělo.

/**
 * Vrátí pole CSSStyleRule, jejichž selektor odpovídá `selector`. Prochází i @media,
 * @supports, @layer, @container, @import a vnořená pravidla (CSS nesting).
 * Každé pravidlo dostane `.conditions` — texty podmínek, pod kterými platí.
 */
export function findCssRules(doc, selector) {
  const view = doc.defaultView;

  /** Rozdělí seznam selektorů podle čárek, které nejsou uvnitř závorek nebo řetězců. */
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

  /** Nechá prohlížeč selektor přečíst a zapsat po svém (`nav>a` → `nav > a`, `[x=y]` → `[x="y"]`). */
  function canonical(text) {
    try {
      const sheet = new view.CSSStyleSheet();
      sheet.insertRule(`${text}{}`);
      return sheet.cssRules[0].selectorText;
    } catch {
      return text;
    }
  }

  /** Bílé znaky pryč (i kolem kombinátorů a čárek); pořadí selektorů se nemění. */
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

  /** Selektor vnořeného pravidla rozepsaný na plný tvar (`& > a` uvnitř `nav` → `nav > a`). */
  function resolveNested(selectorText, parentSelector) {
    if (!parentSelector) return selectorText;
    const parent = splitList(parentSelector).length > 1 ? `:is(${parentSelector})` : parentSelector;
    return splitList(selectorText)
      .map((part) => (part.includes('&') ? part.split('&').join(parent) : `${parent} ${part}`))
      .join(', ');
  }

  function conditionOf(rule) {
    if (view.CSSLayerBlockRule && rule instanceof view.CSSLayerBlockRule) return null; // vrstva nic nepodmiňuje
    if (typeof rule.conditionText === 'string') return rule.conditionText; // @media, @supports, @container
    const header = String(rule.cssText ?? '').split('{')[0].trim();
    return header || null; // např. @scope, @starting-style
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
      continue; // cizí styl bez CORS nejde číst
    }
    visit(rules, [], null);
  }
  return found;
}
