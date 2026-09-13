// Postranní panel lekce (slot 'aside'): na širokém okně stojí vpravo vedle výkladu a jede s ním.
//
// Slot je v DOM na konci článku. Když je vedle textu dost místa, dostane třídu is-docked
// a CSS proměnnou --lesson-right (pravý okraj textu nebo nejširšího bloku v px) — panel se
// pak připne vedle textu a nikdy nepřekryje širší živou ukázku.
// Používají ho obsah lekce i poznámky; první, kdo ho zavolá, ho zapne, další volání jen počítají.

const MIN_SPACE_PX = 180; // nejužší rozumný sloupec vedle textu (bez mezery 40 px a okraje 24 px)
const MIN_WINDOW_PX = 1200;

const docked = new WeakMap(); // article → { users, cleanup }

/** Zapne připínání panelu lekce; vrací úklid. */
export function dockAside(lesson) {
  const article = lesson.article;
  const existing = docked.get(article);
  if (existing) {
    existing.users++;
    return () => release(article);
  }

  const slot = article.querySelector(':scope > [data-slot="aside"]');
  if (!slot) return () => {};

  function update() {
    // Pravý okraj textu; bloky, které přesahují šířku textu (živé ukázky), posunou okraj dál.
    let right = article.getBoundingClientRect().right - parseFloat(getComputedStyle(article).paddingRight || '0');
    for (const child of article.children) {
      if (child === slot || child.hidden) continue;
      right = Math.max(right, child.getBoundingClientRect().right);
    }
    const space = window.innerWidth - right - 64;
    const dock = window.innerWidth >= MIN_WINDOW_PX && space >= MIN_SPACE_PX;
    slot.classList.toggle('is-docked', dock);
    slot.style.setProperty('--lesson-right', `${Math.round(right)}px`);
    document.body.classList.toggle('has-lesson-aside', dock);
  }

  const observer = new ResizeObserver(update);
  observer.observe(article);
  window.addEventListener('resize', update);
  update();

  const record = {
    users: 1,
    cleanup() {
      observer.disconnect();
      window.removeEventListener('resize', update);
      document.body.classList.remove('has-lesson-aside');
      slot.classList.remove('is-docked');
    },
  };
  docked.set(article, record);
  return () => release(article);
}

function release(article) {
  const record = docked.get(article);
  if (!record) return;
  record.users--;
  if (record.users <= 0) {
    record.cleanup();
    docked.delete(article);
  }
}
