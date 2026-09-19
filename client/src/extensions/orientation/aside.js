
const MIN_SPACE_PX = 180;
const MIN_WINDOW_PX = 1200;

const docked = new WeakMap();

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
