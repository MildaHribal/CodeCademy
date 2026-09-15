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

// Tady začni.
