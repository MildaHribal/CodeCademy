// API poznámek — REST API v čistém Node, data v JSON souboru.
// Zadání s uživatelskými příběhy je v Akademii u projektu, přehled API v README.md.
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

// Port z prostředí, bez něj 3000.
const port = Number(process.env.PORT ?? 3000);

// Soubor s poznámkami. Cestu jde přepsat proměnnou NOTES_FILE — kontrola v Akademii
// si tak podstrčí vlastní dočasný soubor a tvoje data v data/notes.json nechá být.
// Tuhle konstantu používej všude, kde čteš nebo zapisuješ poznámky.
const notesFile = process.env.NOTES_FILE ?? path.join(import.meta.dirname, 'data', 'notes.json');

const TITLE_MAX_LENGTH = 100;

// --- Data ---------------------------------------------------------------

async function readNotes() {
  const text = await readFile(notesFile, 'utf8');
  return JSON.parse(text);
}

async function writeNotes(notes) {
  await writeFile(notesFile, JSON.stringify(notes, null, 2));
}

// --- HTTP pomocníci -----------------------------------------------------

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

// Tělo požadavku přichází po kouscích; spojíme je a převedeme na text až nakonec.
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// --- Validace -----------------------------------------------------------

// Vrátí popis první chyby ve vstupu, nebo null, když je poznámka v pořádku.
function validateNote(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return 'Tělo požadavku musí být JSON objekt.';
  }
  if (typeof input.title !== 'string' || input.title.trim() === '') {
    return 'Poznámka musí mít název (title).';
  }
  if (input.title.trim().length > TITLE_MAX_LENGTH) {
    return `Název může mít nejvýš ${TITLE_MAX_LENGTH} znaků.`;
  }
  if (input.text !== undefined && typeof input.text !== 'string') {
    return 'Text poznámky (text) musí být řetězec.';
  }
  return null;
}

// --- Routy --------------------------------------------------------------

async function listNotes(res) {
  sendJson(res, 200, await readNotes());
}

async function showNote(res, id) {
  const notes = await readNotes();
  const note = notes.find((item) => item.id === id);
  if (!note) {
    return sendError(res, 404, 'Poznámka nenalezena.');
  }
  sendJson(res, 200, note);
}

async function createNote(req, res) {
  let input;
  try {
    input = JSON.parse(await readBody(req));
  } catch {
    return sendError(res, 400, 'Tělo požadavku musí být platný JSON.');
  }

  const problem = validateNote(input);
  if (problem) {
    return sendError(res, 400, problem);
  }

  const note = {
    // Náhodné UUID se neopakuje ani po smazání poznámky (na rozdíl od „nejvyšší id + 1“).
    id: randomUUID(),
    title: input.title.trim(),
    text: input.text ?? '',
    createdAt: new Date().toISOString(),
  };

  const notes = await readNotes();
  notes.push(note);
  await writeNotes(notes);
  sendJson(res, 201, note);
}

async function deleteNote(res, id) {
  const notes = await readNotes();
  const remaining = notes.filter((item) => item.id !== id);
  if (remaining.length === notes.length) {
    return sendError(res, 404, 'Poznámka nenalezena.');
  }
  await writeNotes(remaining);
  // 204 No Content: hotovo, tělo odpovědi je prázdné.
  res.writeHead(204);
  res.end();
}

async function handleRequest(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/notes') {
    if (req.method === 'GET') return listNotes(res);
    if (req.method === 'POST') return createNote(req, res);
    res.setHeader('Allow', 'GET, POST');
    return sendError(res, 405, 'Tahle metoda tu není povolená.');
  }

  if (pathname.startsWith('/api/notes/')) {
    const id = pathname.slice('/api/notes/'.length);
    if (req.method === 'GET') return showNote(res, id);
    if (req.method === 'DELETE') return deleteNote(res, id);
    res.setHeader('Allow', 'GET, DELETE');
    return sendError(res, 405, 'Tahle metoda tu není povolená.');
  }

  sendError(res, 404, 'Tahle adresa neexistuje.');
}

const server = createServer(async (req, res) => {
  // Nečekaná chyba (třeba rozbitý soubor s daty) nesmí shodit celý server.
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error(error);
    if (res.headersSent) {
      res.end();
    } else {
      sendError(res, 500, 'Na serveru se něco pokazilo.');
    }
  }
});

server.listen(port, () => {
  console.log(`API poznámek běží na http://localhost:${port}`);
  console.log(`Poznámky se ukládají do ${notesFile}`);
});
