// Vařečka — JSON API pro sdílení receptů nad SQLite.
// Zadání je v Akademii u projektu, přehled endpointů v README.md.
import { createServer } from 'node:http';
import { openDb } from './db.js';
import {
  ApiError,
  addRating,
  categoryRankings,
  categoryStats,
  createRecipe,
  ingredientUsage,
  listRecipes,
  ratingById,
  ratingSummary,
  recipeDetail,
  recipeIdBySlug,
} from './queries.js';

const port = Number(process.env.PORT ?? 3000);
const db = openDb();

const OBTIZNOSTI = ['snadne', 'stredni', 'narocne'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// --- odpovědi ---------------------------------------------------------------

function posliJson(res, status, data, hlavicky = {}) {
  const telo = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(telo),
    ...hlavicky,
  });
  res.end(telo);
}

function posliChybu(res, status, code, message, hlavicky = {}) {
  const telo = JSON.stringify({ error: { code, message } });
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(telo),
    ...hlavicky,
  });
  res.end(telo);
}

function prectiTelo(req) {
  return new Promise((splnit, odmitnout) => {
    let text = '';
    req.on('data', (kus) => {
      text += kus;
      if (text.length > 100_000) {
        odmitnout(new ApiError(413, 'BODY_TOO_LARGE', 'Tělo požadavku je moc velké.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        splnit(text.trim() === '' ? null : JSON.parse(text));
      } catch {
        odmitnout(new ApiError(400, 'INVALID_JSON', 'Tělo požadavku není platný JSON.'));
      }
    });
    req.on('error', odmitnout);
  });
}

// --- kontrola vstupů --------------------------------------------------------

const jeCeleKladne = (hodnota) => Number.isInteger(hodnota) && hodnota > 0;

function cislo(params, jmeno, { vychozi, max = Number.MAX_SAFE_INTEGER }) {
  const syrove = params.get(jmeno);
  if (syrove === null) return vychozi;
  const hodnota = Number(syrove);
  if (!jeCeleKladne(hodnota) || hodnota > max) {
    throw new ApiError(400, 'INVALID_QUERY', `Parametr „${jmeno}" má být celé číslo od 1 do ${max}, přišlo „${syrove}".`);
  }
  return hodnota;
}

function textovyParametr(params, jmeno) {
  const hodnota = params.get(jmeno);
  return hodnota === null || hodnota.trim() === '' ? null : hodnota.trim();
}

function zkontrolujRecept(telo) {
  if (telo === null || typeof telo !== 'object' || Array.isArray(telo)) {
    throw new ApiError(400, 'INVALID_BODY', 'Tělo požadavku má být objekt s receptem.');
  }
  const text = (jmeno, min, max) => {
    const hodnota = typeof telo[jmeno] === 'string' ? telo[jmeno].trim() : '';
    if (hodnota.length < min || hodnota.length > max) {
      throw new ApiError(400, 'INVALID_BODY', `Pole „${jmeno}" má být text o ${min} až ${max} znacích.`);
    }
    return hodnota;
  };

  const slug = text('slug', 3, 60);
  if (!SLUG.test(slug)) {
    throw new ApiError(400, 'INVALID_BODY', 'Pole „slug" smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky.');
  }
  const title = text('title', 3, 100);
  const category = text('category', 1, 60);
  const instructions = text('instructions', 10, 4000);
  const difficulty = typeof telo.difficulty === 'string' ? telo.difficulty : '';
  if (!OBTIZNOSTI.includes(difficulty)) {
    throw new ApiError(400, 'INVALID_BODY', `Pole „difficulty" má být jedno z ${OBTIZNOSTI.join(', ')}.`);
  }
  for (const jmeno of ['minutes', 'servings']) {
    if (!jeCeleKladne(telo[jmeno])) {
      throw new ApiError(400, 'INVALID_BODY', `Pole „${jmeno}" má být celé číslo větší než nula.`);
    }
  }
  if (!Array.isArray(telo.ingredients) || telo.ingredients.length < 1 || telo.ingredients.length > 30) {
    throw new ApiError(400, 'INVALID_BODY', 'Pole „ingredients" má být seznam s 1 až 30 položkami.');
  }

  const ingredients = telo.ingredients.map((polozka, poradi) => {
    if (polozka === null || typeof polozka !== 'object' || Array.isArray(polozka)) {
      throw new ApiError(400, 'INVALID_BODY', `Ingredience č. ${poradi + 1} má být objekt { name, amount, unit }.`);
    }
    const name = typeof polozka.name === 'string' ? polozka.name.trim() : '';
    const unit = typeof polozka.unit === 'string' ? polozka.unit.trim() : '';
    if (name === '' || name.length > 60 || unit === '' || unit.length > 20) {
      throw new ApiError(400, 'INVALID_BODY', `Ingredience č. ${poradi + 1} potřebuje název a jednotku.`);
    }
    if (typeof polozka.amount !== 'number' || !Number.isFinite(polozka.amount) || polozka.amount <= 0) {
      throw new ApiError(400, 'INVALID_BODY', `Množství ingredience „${name}" má být číslo větší než nula.`);
    }
    return { name, amount: polozka.amount, unit };
  });

  const jmena = new Set();
  for (const polozka of ingredients) {
    if (jmena.has(polozka.name)) {
      throw new ApiError(400, 'DUPLICATE_INGREDIENT', `Ingredience „${polozka.name}" je v receptu dvakrát.`);
    }
    jmena.add(polozka.name);
  }

  return { slug, title, category, minutes: telo.minutes, servings: telo.servings, difficulty, instructions, ingredients };
}

function zkontrolujHodnoceni(telo) {
  if (telo === null || typeof telo !== 'object' || Array.isArray(telo)) {
    throw new ApiError(400, 'INVALID_BODY', 'Tělo požadavku má být objekt s hodnocením.');
  }
  const author = typeof telo.author === 'string' ? telo.author.trim() : '';
  if (author === '' || author.length > 40) {
    throw new ApiError(400, 'INVALID_BODY', 'Pole „author" má být text o 1 až 40 znacích.');
  }
  if (!Number.isInteger(telo.stars) || telo.stars < 1 || telo.stars > 5) {
    throw new ApiError(400, 'INVALID_BODY', 'Pole „stars" má být celé číslo od 1 do 5.');
  }
  const comment = typeof telo.comment === 'string' ? telo.comment.trim() : '';
  if (comment.length > 500) {
    throw new ApiError(400, 'INVALID_BODY', 'Pole „comment" má nejvýš 500 znaků.');
  }
  return { author, stars: telo.stars, comment };
}

// --- obsluha cest -----------------------------------------------------------

function vypisReceptu(res, params) {
  const strana = cislo(params, 'page', { vychozi: 1, max: 1000 });
  const naStranku = cislo(params, 'per_page', { vychozi: 5, max: 50 });
  const { total, items } = listRecipes(db, {
    category: textovyParametr(params, 'category'),
    maxMinutes: params.get('max_minutes') === null ? null : cislo(params, 'max_minutes', { vychozi: null, max: 100_000 }),
    q: textovyParametr(params, 'q'),
    page: strana,
    perPage: naStranku,
  });
  posliJson(res, 200, {
    page: strana,
    per_page: naStranku,
    total,
    total_pages: Math.ceil(total / naStranku),
    items,
  });
}

function detailReceptu(res, slug) {
  const recept = recipeDetail(db, slug);
  if (!recept) throw new ApiError(404, 'RECIPE_NOT_FOUND', `Recept „${slug}" v databázi není.`);
  posliJson(res, 200, recept);
}

async function zalozReceptHandler(req, res) {
  const data = zkontrolujRecept(await prectiTelo(req));
  createRecipe(db, data);
  posliJson(res, 201, recipeDetail(db, data.slug), { Location: `/api/recipes/${data.slug}` });
}

async function pridejHodnoceniHandler(req, res, slug) {
  const recipeId = recipeIdBySlug(db, slug);
  if (recipeId === null) throw new ApiError(404, 'RECIPE_NOT_FOUND', `Recept „${slug}" v databázi není.`);
  const data = zkontrolujHodnoceni(await prectiTelo(req));
  const id = addRating(db, recipeId, data);
  posliJson(res, 201, { rating: ratingById(db, id), ...ratingSummary(db, recipeId) });
}

// --- server -----------------------------------------------------------------

const server = createServer(async (req, res) => {
  try {
    const adresa = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const cesta = adresa.pathname.replace(/\/+$/, '') || '/';
    const metoda = req.method;

    if (cesta === '/api/recipes') {
      if (metoda === 'GET') return vypisReceptu(res, adresa.searchParams);
      if (metoda === 'POST') return await zalozReceptHandler(req, res);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET, POST' });
    }

    if (cesta === '/api/ingredients' || cesta === '/api/rankings' || cesta === '/api/stats') {
      if (metoda !== 'GET') {
        throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET' });
      }
      if (cesta === '/api/ingredients') return posliJson(res, 200, { items: ingredientUsage(db) });
      if (cesta === '/api/rankings') return posliJson(res, 200, { items: categoryRankings(db, 2) });
      return posliJson(res, 200, { items: categoryStats(db) });
    }

    const hodnoceni = cesta.match(/^\/api\/recipes\/([^/]+)\/ratings$/);
    if (hodnoceni) {
      const slug = decodeURIComponent(hodnoceni[1]);
      if (metoda === 'POST') return await pridejHodnoceniHandler(req, res, slug);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'POST' });
    }

    const detail = cesta.match(/^\/api\/recipes\/([^/]+)$/);
    if (detail) {
      const slug = decodeURIComponent(detail[1]);
      if (metoda === 'GET') return detailReceptu(res, slug);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET' });
    }

    throw new ApiError(404, 'NOT_FOUND', `Adresa ${adresa.pathname} na tomhle API neexistuje.`);
  } catch (chyba) {
    if (chyba instanceof ApiError) {
      posliChybu(res, chyba.status, chyba.code, chyba.message, chyba.headers);
      return;
    }
    console.error(chyba);
    posliChybu(res, 500, 'SERVER_ERROR', 'Na serveru se něco pokazilo.');
  }
});

server.listen(port, () => {
  console.log(`API Vařečky běží na http://localhost:${port}`);
});
