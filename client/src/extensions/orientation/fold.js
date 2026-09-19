import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { plural } from '../../text.js';
import { foldRanges } from './fold-ranges.js';

const unfold = StateEffect.define();

class FoldWidget extends WidgetType {
  constructor(lines, index) {
    super();
    this.lines = lines;
    this.index = index;
  }

  eq(other) {
    return other.lines === this.lines && other.index === this.index;
  }

  toDOM(view) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cm-fold-previous';
    button.textContent = `⋯ ${plural(this.lines, ['řádek', 'řádky', 'řádků'])} z předchozích kroků — rozbalit`;
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => view.dispatch({ effects: unfold.of(this.index) }));
    return button;
  }

  ignoreEvent() {
    return false;
  }
}

export function foldOutsideRegion(region) {
  const field = StateField.define({
    create(state) {
      const lineCount = state.doc.lines;
      return foldRanges(region, lineCount)
        .filter((range) => range.toLine <= lineCount)
        .map((range) => ({
          from: state.doc.line(range.fromLine).from,
          to: state.doc.line(range.toLine).to,
          lines: range.toLine - range.fromLine + 1,
          open: false,
        }));
    },
    update(ranges, tr) {
      let next = ranges;
      if (tr.docChanged) {
        next = next.map((range) => ({ ...range, from: tr.changes.mapPos(range.from, 1), to: tr.changes.mapPos(range.to, -1) }));
      }
      for (const effect of tr.effects) {
        if (effect.is(unfold)) next = next.map((range, index) => (index === effect.value ? { ...range, open: true } : range));
      }
      return next;
    },
    provide: (self) => [
      EditorView.decorations.from(self, (ranges) => decorations(ranges)),
      EditorView.atomicRanges.of((view) => decorations(view.state.field(self))),
    ],
  });
  return field;
}

function decorations(ranges) {
  const marks = [];
  ranges.forEach((range, index) => {
    if (range.open || range.to <= range.from) return;
    marks.push(Decoration.replace({ widget: new FoldWidget(range.lines, index) }).range(range.from, range.to));
  });
  return Decoration.set(marks, true);
}
