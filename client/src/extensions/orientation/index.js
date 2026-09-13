// Orientace na pracovní ploše: kód z předchozích kroků mimo oblast `--edit--` se sbalí (B12).
//
// Ve workshopu seed každého kroku obsahuje hotový kód všech předchozích kroků. U delšího
// souboru by oblast, kam se píše, zapadla mezi desítkami řádků, které už uživatel zná.
// Sbalený úsek je jeden řádek „⋯ 24 řádků z předchozích kroků"; kliknutí ho rozbalí.
// Soubor zůstává celý — sbalení je jen zobrazení, kontrola i ukládání vidí všechno.
import './fold.css';
import { registerEditorExtension } from '../../components/code-editor.js';
import { foldOutsideRegion } from './fold.js';

registerEditorExtension({
  id: 'fold-outside-edit-region',
  order: 50,
  extension: ({ region, context, item }) => {
    // Jen krok workshopu (id sekce/modul/NNN), jen běžný editor s oblastí --edit--.
    const isWorkshopStep = /^[^/]+\/[^/]+\/\d{3}$/.test(item?.id ?? '');
    if (context !== 'workspace' || !isWorkshopStep || !region || item?.kind === 'parsons') return null;
    return foldOutsideRegion(region);
  },
});
