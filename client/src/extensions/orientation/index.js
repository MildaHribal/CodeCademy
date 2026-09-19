import './fold.css';
import { registerEditorExtension } from '../../components/code-editor.js';
import { foldOutsideRegion } from './fold.js';

registerEditorExtension({
  id: 'fold-outside-edit-region',
  order: 50,
  extension: ({ region, context, item }) => {
    const isWorkshopStep = /^[^/]+\/[^/]+\/\d{3}$/.test(item?.id ?? '');
    if (context !== 'workspace' || !isWorkshopStep || !region || item?.kind === 'parsons') return null;
    return foldOutsideRegion(region);
  },
});
