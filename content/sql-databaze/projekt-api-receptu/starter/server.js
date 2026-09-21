// Vařečka — JSON API pro sdílení receptů nad SQLite.
// Zadání je v Akademii u projektu, přehled endpointů v README.md.
//
// Hotové máš odpovědi, čtení těla a rozcestník. Tvoje práce jsou funkce dole
// v oddílu „obsluha cest", kontrola vstupů a dotazy v queries.js.
import { createServer } from 'node:http';
import { openDb } from './db.js';
import { ApiError } from './queries.js';

const port = Number(process.env.PORT ?? 3000);
const db = openDb();

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

// --- obsluha cest -----------------------------------------------------------
// Každá funkce buď pošle odpověď, nebo hodí ApiError — ten se dole přeloží na
// stavový kód a tělo { error: { code, message } }.

function vypisReceptu(res, params) {
  // Tady začni: přečti page, per_page, category, max_minutes a q, ověř je
  // a zavolej listRecipes z queries.js.
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Výpis receptů zatím není hotový.');
}

function detailReceptu(res, slug) {
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Detail receptu zatím není hotový.');
}

async function zalozRecept(req, res) {
  await prectiTelo(req);
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Zakládání receptů zatím není hotové.');
}

async function pridejHodnoceni(req, res, slug) {
  await prectiTelo(req);
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Hodnocení zatím není hotové.');
}

function vypisIngredienci(res) {
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Přehled ingrediencí zatím není hotový.');
}

function vypisZebricku(res) {
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Žebříček zatím není hotový.');
}

function vypisStatistik(res) {
  posliChybu(res, 501, 'NOT_IMPLEMENTED', 'Statistiky zatím nejsou hotové.');
}

// --- server -----------------------------------------------------------------

const server = createServer(async (req, res) => {
  try {
    const adresa = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const cesta = adresa.pathname.replace(/\/+$/, '') || '/';
    const metoda = req.method;

    if (cesta === '/api/recipes') {
      if (metoda === 'GET') return vypisReceptu(res, adresa.searchParams);
      if (metoda === 'POST') return await zalozRecept(req, res);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET, POST' });
    }

    if (cesta === '/api/ingredients') {
      if (metoda === 'GET') return vypisIngredienci(res);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET' });
    }

    if (cesta === '/api/rankings') {
      if (metoda === 'GET') return vypisZebricku(res);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET' });
    }

    if (cesta === '/api/stats') {
      if (metoda === 'GET') return vypisStatistik(res);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Metoda ${metoda} tady nedává smysl.`, { Allow: 'GET' });
    }

    const hodnoceni = cesta.match(/^\/api\/recipes\/([^/]+)\/ratings$/);
    if (hodnoceni) {
      const slug = decodeURIComponent(hodnoceni[1]);
      if (metoda === 'POST') return await pridejHodnoceni(req, res, slug);
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
