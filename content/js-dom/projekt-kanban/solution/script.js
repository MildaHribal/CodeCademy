// Tabule projektu „Web pro Pekárnu U Mlýna".
// Celé zadání s uživatelskými příběhy najdeš v Akademii u projektu.

// Sloupce v pořadí zleva doprava. `id` odpovídá atributu data-column v index.html.
const columns = [
  { id: 'todo', title: 'K udělání' },
  { id: 'doing', title: 'Rozpracované' },
  { id: 'done', title: 'Hotovo' },
];

// Popisky štítků pro kartu.
const labelNames = {
  design: 'Design',
  frontend: 'Frontend',
  obsah: 'Obsah',
};

// Klíč, pod kterým se karty ukládají do localStorage.
const STORAGE_KEY = 'kanban-cards';

// Karty, se kterými tabule začne, když v prohlížeči nic uloženého není.
const sampleCards = [
  { id: 'logo', title: 'Navrhnout logo', label: 'design', column: 'done' },
  { id: 'texty', title: 'Napsat texty o pekárně', label: 'obsah', column: 'doing' },
  { id: 'hlavicka', title: 'Nakódovat hlavičku s menu', label: 'frontend', column: 'doing' },
  { id: 'fotky', title: 'Nafotit chleba a dorty do galerie', label: 'obsah', column: 'todo' },
  { id: 'objednavka', title: 'Formulář objednávky dortů', label: 'frontend', column: 'todo' },
  { id: 'hosting', title: 'Nasadit web na hosting', label: 'frontend', column: 'todo' },
];

const board = document.querySelector('.board');
const addForm = document.querySelector('#add-form');
const titleInput = document.querySelector('#card-title');
const filterInput = document.querySelector('#filter');
const statusMessage = document.querySelector('#status');
const template = document.querySelector('#card-template');

// --- Stav -------------------------------------------------------------------

// Jediný zdroj pravdy: pole karet a text filtru. Stránka se z nich vykresluje.
let cards = loadCards();
let filterText = new URLSearchParams(location.search).get('q') ?? '';

/** Je to karta, se kterou tabule umí pracovat? */
function isValidCard(card) {
  return typeof card?.id === 'string'
    && typeof card.title === 'string'
    && Object.hasOwn(labelNames, card.label)
    && columns.some((column) => column.id === card.column);
}

/** Karty z localStorage; rozbitá nebo chybějící data = ukázkové karty. */
function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.every(isValidCard) ? saved : sampleCards;
  } catch {
    return sampleCards;
  }
}

function saveCards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // plné nebo zakázané úložiště: tabule funguje dál, jen se neuloží
  }
}

function createId() {
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function columnTitle(columnId) {
  return columns.find((column) => column.id === columnId).title;
}

function matchesFilter(card) {
  return card.title.toLocaleLowerCase('cs').includes(filterText.trim().toLocaleLowerCase('cs'));
}

// --- Změny stavu ----------------------------------------------------------------

function addCard(title, label) {
  cards = [...cards, { id: createId(), title, label, column: 'todo' }];
  saveCards();
  render();
  announce(`Karta „${title}" přidána do sloupce ${columnTitle('todo')}.`);
}

/** Přesune kartu na konec sloupce. Vrátí true, když se opravdu přesunula. */
function moveCard(id, columnId) {
  const card = cards.find((item) => item.id === id);
  if (!card || card.column === columnId) return false;
  // na konec cílového sloupce: kartu vyjmi a přidej za ostatní
  cards = [...cards.filter((item) => item.id !== id), { ...card, column: columnId }];
  saveCards();
  render();
  announce(`Karta „${card.title}" přesunuta do sloupce ${columnTitle(columnId)}.`);
  return true;
}

function deleteCard(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) return;
  cards = cards.filter((item) => item.id !== id);
  saveCards();
  render();
  announce(`Karta „${card.title}" smazána.`);
}

function setFilter(text) {
  filterText = text;
  const url = new URL(location.href);
  if (text.trim() === '') url.searchParams.delete('q');
  else url.searchParams.set('q', text);
  history.replaceState(null, '', url);
  render();
}

function announce(text) {
  statusMessage.textContent = text;
}

// --- Vykreslení -----------------------------------------------------------------

function createCardElement(card) {
  const element = template.content.firstElementChild.cloneNode(true);
  element.dataset.id = card.id;
  element.querySelector('.card__title').textContent = card.title;
  const label = element.querySelector('.card__label');
  label.dataset.label = card.label;
  label.textContent = labelNames[card.label];

  const index = columns.findIndex((column) => column.id === card.column);
  const left = element.querySelector('[data-action="left"]');
  const right = element.querySelector('[data-action="right"]');
  left.disabled = index === 0;
  right.disabled = index === columns.length - 1;
  left.setAttribute('aria-label', `Přesunout ${card.title} doleva`);
  right.setAttribute('aria-label', `Přesunout ${card.title} doprava`);
  element.querySelector('[data-action="delete"]').setAttribute('aria-label', `Smazat ${card.title}`);
  return element;
}

function render() {
  for (const column of board.querySelectorAll('.column')) {
    const visible = cards.filter((card) => card.column === column.dataset.column && matchesFilter(card));
    column.querySelector('.column__list').replaceChildren(...visible.map(createCardElement));
    column.querySelector('.column__count').textContent = visible.length;
    column.querySelector('.column__empty').hidden = visible.length > 0;
  }
}

// --- Posluchače -----------------------------------------------------------------

addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(addForm);
  const title = data.get('title').trim();
  if (title === '') return;
  addCard(title, data.get('label'));
  titleInput.value = '';
  titleInput.focus();
});

board.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || !board.contains(button)) return;
  const id = button.closest('.card').dataset.id;
  const action = button.dataset.action;

  if (action === 'delete') {
    deleteCard(id);
    filterInput.focus();
    return;
  }

  const card = cards.find((item) => item.id === id);
  const index = columns.findIndex((column) => column.id === card.column);
  const target = columns[index + (action === 'left' ? -1 : 1)];
  if (!target || !moveCard(id, target.id)) return;

  // překreslení tlačítko zničilo: fokus vrať na tlačítko přesunuté karty
  const moved = board.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
  if (!moved) return;
  const same = moved.querySelector(`[data-action="${action}"]`);
  const other = moved.querySelector(`[data-action="${action === 'left' ? 'right' : 'left'}"]`);
  (same.disabled ? other : same).focus();
});

// Přetahování myší (HTML Drag and Drop API)
let draggedId = null;

board.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.card');
  if (!card) return;
  draggedId = card.dataset.id;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', draggedId);
  card.classList.add('is-dragging');
});

board.addEventListener('dragover', (event) => {
  const column = event.target.closest('.column');
  if (!column || draggedId === null) return;
  // bez preventDefault prohlížeč puštění karty nepovolí
  event.preventDefault();
  column.classList.add('is-drop-target');
});

board.addEventListener('dragleave', (event) => {
  const column = event.target.closest('.column');
  if (column && !column.contains(event.relatedTarget)) column.classList.remove('is-drop-target');
});

board.addEventListener('drop', (event) => {
  const column = event.target.closest('.column');
  if (!column || draggedId === null) return;
  event.preventDefault();
  column.classList.remove('is-drop-target');
  moveCard(draggedId, column.dataset.column);
  draggedId = null;
});

board.addEventListener('dragend', () => {
  draggedId = null;
  for (const element of board.querySelectorAll('.is-drop-target, .is-dragging')) {
    element.classList.remove('is-drop-target', 'is-dragging');
  }
});

filterInput.addEventListener('input', () => setFilter(filterInput.value));

filterInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    filterInput.value = '';
    setFilter('');
  }
});

document.addEventListener('keydown', (event) => {
  const typing = event.target.closest?.('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    filterInput.focus();
  }
});

// Start aplikace
filterInput.value = filterText;
render();
