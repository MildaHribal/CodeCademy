import fs from 'node:fs';
import path from 'node:path';

export const GENERAL_NOTES = 'obecne';
export const GENERAL_TITLE = 'Obecné poznámky';
export const NOTE_KINDS = ['note', 'quote', 'explain', 'plan'];
export const APPEND_LIMIT_BYTES = 100 * 1024;

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const REF_PATTERN = new RegExp(`^${SLUG}/${SLUG}(?:/\\d{3})?(?:#${SLUG})?$`);

export function formatNoteEntry({ kind, source, title, text, quote = '' }, time) {
  const lines = ['', `## ${title}`, '', `<!-- zdroj: ${source} · ${time} · ${kind} -->`, ''];
  if (quote) {
    lines.push(...quote.split('\n').map((line) => `> ${line}`), '');
  }
  if (text) lines.push(text);
  else lines.pop();
  return `${lines.join('\n')}\n`;
}

export function appendEntry(content, entry) {
  if (content && !content.endsWith('\n')) return `${content}\n${entry}`;
  return content + entry;
}

const normalizeNewlines = (value) => value.replace(/\r\n?/g, '\n');

export function validateAppendBody(body, InputError) {
  const { kind, source, title, text = '', quote } = body;
  if (!NOTE_KINDS.includes(kind)) {
    throw new InputError(`"kind" musí být jedno z: ${NOTE_KINDS.join(', ')}`);
  }
  if (typeof source !== 'string' || !REF_PATTERN.test(source)) {
    throw new InputError('"source" musí být odkaz na výklad, třeba "js-pole/co-je-pole#kopie-pole"');
  }
  if (typeof title !== 'string' || !title.trim()) throw new InputError('"title" musí být neprázdný text');
  if (typeof text !== 'string') throw new InputError('"text" musí být text');
  if (quote !== undefined && quote !== null && typeof quote !== 'string') throw new InputError('"quote" musí být text');

  const cleanQuote = normalizeNewlines(quote ?? '').trim();
  const cleanText = normalizeNewlines(text).trim();
  if (kind === 'quote' && !cleanQuote) throw new InputError('Záznam „Nerozumím" potřebuje citovaný text v "quote"');
  if (!cleanText && !cleanQuote) throw new InputError('Poznámka je prázdná');

  return {
    kind,
    source,
    title: title.replace(/\s+/g, ' ').trim(),
    text: cleanText,
    quote: cleanQuote,
  };
}

export function register(router, ctx) {
  const notesDir = () => path.dirname(ctx.dataPath(`poznamky/${GENERAL_NOTES}.md`));
  const fileOf = (section) => ctx.dataPath(`poznamky/${section}.md`);

  function availableSections() {
    return ctx
      .loadCurriculum()
      .parts.flatMap((part) => part.sections)
      .filter((section) => section.available)
      .map(({ id, title }) => ({ id, title }));
  }

  function checkSection(section) {
    if (section === GENERAL_NOTES) return GENERAL_TITLE;
    ctx.checkSlugs(section);
    const found = availableSections().find((s) => s.id === section);
    if (!found) throw new ctx.InputError(`Sekce "${section}" v osnově není (poznámky mimo sekci patří do "${GENERAL_NOTES}")`);
    return found.title;
  }

  function readNotes(section) {
    const file = fileOf(section);
    try {
      const content = fs.readFileSync(file, 'utf8');
      return { content, updated: fs.statSync(file).mtime.toISOString() };
    } catch (error) {
      if (error.code === 'ENOENT') return { content: '', updated: null };
      throw error;
    }
  }

  function writeNotes(section, content) {
    const file = fileOf(section);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, content);
    fs.renameSync(tmp, file);
    return fs.statSync(file).mtime.toISOString();
  }

  function bodySize(req, body) {
    const declared = Number(req.headers['content-length']);
    return Number.isFinite(declared) && declared > 0 ? declared : Buffer.byteLength(JSON.stringify(body));
  }

  router.get('/api/notes', () => {
    let names = [];
    try {
      names = fs.readdirSync(notesDir()).filter((name) => name.endsWith('.md'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const existing = new Set(names.map((name) => name.slice(0, -'.md'.length)));
    const ordered = [
      { id: GENERAL_NOTES, title: GENERAL_TITLE },
      ...availableSections(),
      ...[...existing].sort().map((id) => ({ id, title: id })),
    ];
    const seen = new Set();
    const notes = [];
    for (const { id, title } of ordered) {
      if (!existing.has(id) || seen.has(id)) continue;
      seen.add(id);
      const stat = fs.statSync(fileOf(id));
      notes.push({ section: id, title, updated: stat.mtime.toISOString(), size: stat.size });
    }
    return { notes };
  });

  router.get('/api/notes/:section', ({ params }) => {
    checkSection(params.section);
    return { section: params.section, ...readNotes(params.section) };
  });

  router.put('/api/notes/:section', async ({ params, readBody }) => {
    checkSection(params.section);
    const { content, baseUpdated } = await readBody();
    if (typeof content !== 'string') throw new ctx.InputError('"content" musí být text');
    if (baseUpdated !== undefined && baseUpdated !== null && typeof baseUpdated !== 'string') {
      throw new ctx.InputError('"baseUpdated" musí být čas ve formátu ISO nebo null');
    }
    if (baseUpdated !== undefined) {
      const { updated } = readNotes(params.section);
      if (updated !== baseUpdated) {
        throw new ctx.HttpError(409, 'Poznámky se mezitím změnily (jiné okno nebo ruční úprava). Načti je znovu a úpravu zopakuj.');
      }
    }
    const normalized = normalizeNewlines(content);
    const updated = writeNotes(params.section, normalized && !normalized.endsWith('\n') ? `${normalized}\n` : normalized);
    return { ok: true, updated };
  });

  router.post('/api/notes/:section/append', async ({ req, params, readBody }) => {
    checkSection(params.section);
    const body = await readBody();
    if (bodySize(req, body) > APPEND_LIMIT_BYTES) {
      throw new ctx.HttpError(413, 'Záznam je příliš dlouhý (limit 100 kB)');
    }
    const entry = formatNoteEntry(validateAppendBody(body, ctx.InputError), new Date().toISOString());
    const { content } = readNotes(params.section);
    const updated = writeNotes(params.section, appendEntry(content, entry));
    return { ok: true, updated };
  });
}
