
export function formatValue(value, { rawStrings = false } = {}) {
  const MAX_DEPTH = 2;
  const MAX_ITEMS = 100;
  const BREAK_LENGTH = 72;
  const seen = [];

  function quote(text) {
    const q = text.includes("'") && !text.includes('"') ? '"' : "'";
    const escaped = text
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(new RegExp(q, 'g'), `\\${q}`);
    return q + escaped + q;
  }

  function formatKey(key) {
    if (typeof key === 'symbol') return `[${key.toString()}]`;
    return /^[A-Za-z_$][\w$]*$/.test(key) ? key : quote(key);
  }

  function wrap(prefix, open, items, close, indent) {
    if (items.length === 0) return `${prefix}${open}${close}`;
    const single = `${prefix}${open} ${items.join(', ')} ${close}`;
    if (single.length + indent.length <= BREAK_LENGTH && !single.includes('\n')) return single;
    const inner = `${indent}  `;
    return `${prefix}${open}\n${items.map((item) => inner + item).join(',\n')}\n${indent}${close}`;
  }

  function describeFunction(fn) {
    const source = Function.prototype.toString.call(fn);
    if (/^class\b/.test(source)) return `[class ${fn.name || '(anonymous)'}]`;
    return fn.name ? `[Function: ${fn.name}]` : '[Function (anonymous)]';
  }

  function describeNode(node) {
    if (node.nodeType === 1) {
      const id = node.id ? ` id="${node.id}"` : '';
      const className = typeof node.className === 'string' && node.className ? ` class="${node.className}"` : '';
      return `<${node.tagName.toLowerCase()}${id}${className}>`;
    }
    if (node.nodeType === 3) return `#text ${quote(node.textContent)}`;
    if (node.nodeType === 9) return '#document';
    return `[${node.nodeName}]`;
  }

  function propertyEntries(object, indent, depth) {
    const keys = [...Object.keys(object), ...Object.getOwnPropertySymbols(object).filter((s) => Object.prototype.propertyIsEnumerable.call(object, s))];
    return keys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      let text;
      if (descriptor && (descriptor.get || descriptor.set)) {
        text = descriptor.get && descriptor.set ? '[Getter/Setter]' : descriptor.get ? '[Getter]' : '[Setter]';
      } else {
        text = format(object[key], depth + 1, `${indent}  `);
      }
      return `${formatKey(key)}: ${text}`;
    });
  }

  function format(v, depth, indent) {
    if (v === null) return 'null';
    switch (typeof v) {
      case 'undefined': return 'undefined';
      case 'string': return quote(v);
      case 'number': return Object.is(v, -0) ? '-0' : String(v);
      case 'bigint': return `${v}n`;
      case 'boolean': return String(v);
      case 'symbol': return v.toString();
      case 'function': return describeFunction(v);
    }

    if (seen.includes(v)) return '[Circular *]';
    if (typeof Node !== 'undefined' && v instanceof Node) return describeNode(v);
    if (typeof Window !== 'undefined' && v instanceof Window) return '[Window]';
    if (v instanceof Date) return Number.isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
    if (v instanceof RegExp) return String(v);
    if (v instanceof Error) return v.message ? `${v.name}: ${v.message}` : v.name;
    if (v instanceof Promise) return 'Promise {}';
    if (v instanceof WeakMap || v instanceof WeakSet) return `${v.constructor.name} { <items unknown> }`;

    const isArray = Array.isArray(v);
    if (depth > MAX_DEPTH) return isArray ? '[Array]' : `[${v.constructor?.name ?? 'Object'}]`;

    seen.push(v);
    try {
      if (isArray || ArrayBuffer.isView(v)) {
        const items = [];
        const length = v.length;
        for (let i = 0; i < Math.min(length, MAX_ITEMS); i++) items.push(format(v[i], depth + 1, `${indent}  `));
        if (length > MAX_ITEMS) items.push(`... ${length - MAX_ITEMS} more items`);
        if (isArray) {
          const extra = Object.keys(v).filter((key) => !/^\d+$/.test(key));
          for (const key of extra) items.push(`${formatKey(key)}: ${format(v[key], depth + 1, `${indent}  `)}`);
        }
        const prefix = isArray ? '' : `${v.constructor.name}(${length}) `;
        return wrap(prefix, '[', items, ']', indent);
      }
      if (v instanceof Map) {
        const items = [...v].slice(0, MAX_ITEMS).map(([key, val]) => `${format(key, depth + 1, `${indent}  `)} => ${format(val, depth + 1, `${indent}  `)}`);
        return wrap(`Map(${v.size}) `, '{', items, '}', indent);
      }
      if (v instanceof Set) {
        const items = [...v].slice(0, MAX_ITEMS).map((item) => format(item, depth + 1, `${indent}  `));
        return wrap(`Set(${v.size}) `, '{', items, '}', indent);
      }
      const proto = Object.getPrototypeOf(v);
      let prefix = '';
      if (proto === null) prefix = '[Object: null prototype] ';
      else if (proto !== Object.prototype) {
        const name = proto.constructor?.name;
        prefix = name ? `${name} ` : '';
      }
      return wrap(prefix, '{', propertyEntries(v, indent, depth), '}', indent);
    } catch {
      return '[nečitelná hodnota]';
    } finally {
      seen.pop();
    }
  }

  if (rawStrings && typeof value === 'string') return value;
  return format(value, 0, '');
}
