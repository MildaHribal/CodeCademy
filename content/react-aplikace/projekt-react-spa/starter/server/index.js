// API plánovače jídel. Součást starteru — tenhle soubor needituj, jen ho spouštěj
// příkazem `npm run api`. Data drží v paměti, takže restartem se vrátí na začátek.
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { recipes, users } from './data.js';

const PORT = Number(process.env.PORT ?? 3001);
const sessions = new Map(); // token -> id uživatele

function send(res, status, body, headers = {}) {
  if (body === null) {
    res.writeHead(status, headers);
    res.end();
    return;
  }
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    ...headers,
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) reject(new Error('Tělo požadavku je příliš velké.'));
    });
    req.on('end', () => {
      if (!data) return resolve(null);
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Tělo požadavku není platný JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function userOf(req) {
  const cookie = req.headers.cookie ?? '';
  const match = /(?:^|;\s*)session=([^;]+)/.exec(cookie);
  if (!match) return null;
  const id = sessions.get(decodeURIComponent(match[1]));
  return users.find((user) => user.id === id) ?? null;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

const handlers = [
  ['GET', /^\/api\/recipes$/, (req, res) => send(res, 200, recipes)],

  ['GET', /^\/api\/recipes\/(\d+)$/, (req, res, [id]) => {
    const recipe = recipes.find((item) => item.id === Number(id));
    if (!recipe) return send(res, 404, { error: 'Takový recept tu není.' });
    send(res, 200, recipe);
  }],

  ['POST', /^\/api\/login$/, async (req, res) => {
    const body = await readBody(req);
    const user = users.find((item) => item.email === body?.email && item.password === body?.password);
    if (!user) return send(res, 401, { error: 'E-mail nebo heslo nesedí.' });
    const token = randomUUID();
    sessions.set(token, user.id);
    send(res, 200, publicUser(user), {
      'set-cookie': `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600`,
    });
  }],

  ['POST', /^\/api\/logout$/, (req, res) => {
    const cookie = req.headers.cookie ?? '';
    const match = /(?:^|;\s*)session=([^;]+)/.exec(cookie);
    if (match) sessions.delete(decodeURIComponent(match[1]));
    send(res, 204, null, { 'set-cookie': 'session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
  }],

  ['GET', /^\/api\/me$/, (req, res) => {
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Nikdo není přihlášený.' });
    send(res, 200, publicUser(user));
  }],

  ['GET', /^\/api\/favourites$/, (req, res) => {
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Nikdo není přihlášený.' });
    send(res, 200, user.favourites);
  }],

  ['PUT', /^\/api\/favourites\/(\d+)$/, (req, res, [id]) => {
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Nikdo není přihlášený.' });
    if (!recipes.some((recipe) => recipe.id === Number(id))) return send(res, 404, { error: 'Takový recept tu není.' });
    if (!user.favourites.includes(Number(id))) user.favourites.push(Number(id));
    send(res, 200, user.favourites);
  }],

  ['DELETE', /^\/api\/favourites\/(\d+)$/, (req, res, [id]) => {
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Nikdo není přihlášený.' });
    user.favourites = user.favourites.filter((item) => item !== Number(id));
    send(res, 200, user.favourites);
  }],

  ['GET', /^\/api\/plan$/, (req, res) => {
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Nikdo není přihlášený.' });
    send(res, 200, user.plan);
  }],

  ['PUT', /^\/api\/plan$/, async (req, res) => {
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Nikdo není přihlášený.' });
    const body = await readBody(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return send(res, 400, { error: 'Plán má být objekt: den → pole id receptů.' });
    }
    user.plan = body;
    send(res, 200, user.plan);
  }],
];

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  try {
    for (const [method, pattern, handle] of handlers) {
      const match = pattern.exec(path);
      if (!match) continue;
      if (req.method !== method) return send(res, 405, { error: `Adresa ${path} tuhle metodu neumí.` }, { allow: method });
      return await handle(req, res, match.slice(1));
    }
    send(res, 404, { error: `Adresu ${path} tohle API nezná.` });
  } catch (error) {
    console.error(error);
    send(res, 400, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`API plánovače běží na http://localhost:${PORT}`);
});
