// Blok `compare`: dvě varianty stejné stránky vedle sebe (kontrakt kap. 5.7).
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { mountPreview } from '../../run.js';
import { renderMarkdown } from '../../markdown.js';
import { createCodeEditor } from '../../components/code-editor.js';
import { composeVariant, splitCompareVariants } from './live-logic.js';

export const compareBlock = {
  kind: 'compare',
  render(block, env) {
    const variants = block.variants ?? [];
    const { common, extras } = splitCompareVariants(variants);
    const editorHost = common.length ? h('div', { class: 'compare__editor' }) : null;
    const previews = [];
    let editor = null;

    const resetButton = common.length
      ? h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Reset / Obnovit', onclick: reset }, svg(icons.reset), 'Reset')
      : null;

    const variantElements = variants.map((variant, index) => {
      const previewHost = h('div', { class: 'compare__preview' });
      const own = extras[index] ?? [];
      return {
        previewHost,
        element: h(
          'figure',
          { class: 'compare__variant' },
          h('figcaption', { class: 'compare__label' }, h('span', { class: 'compare__letter', 'aria-hidden': 'true' }, index === 0 ? 'A' : 'B'), variant.label),
          own.length
            ? h(
                'div',
                { class: 'compare__own' },
                h('p', { class: 'compare__own-title' }, 'Jen v této variantě'),
                own.map((file) => renderMarkdown(`\`\`\`\`${file.lang}\n${file.content}\n\`\`\`\``, { className: 'prose compare__code' })),
              )
            : h('p', { class: 'compare__own compare__own--empty' }, 'Jen společný kód.'),
          previewHost,
        ),
      };
    });

    const element = h(
      'section',
      { class: 'lesson-block compare', 'aria-label': 'Porovnání dvou variant', dataset: { block: 'compare' } },
      h(
        'header',
        { class: 'block-bar' },
        h('span', { class: 'block-bar__title' }, `Porovnání ${env.number}`),
        h('span', { class: 'block-bar__hint' }, common.length ? 'Uprav společný kód — změna se projeví v obou variantách.' : 'Dvě varianty vedle sebe.'),
        resetButton,
      ),
      editorHost ? h('div', { class: 'compare__common' }, h('p', { class: 'compare__common-title' }, 'Společný kód'), editorHost) : null,
      h('div', { class: 'compare__variants' }, variantElements.map((v) => v.element)),
    );

    function filesFor(index, sharedFiles) {
      return composeVariant(sharedFiles, extras[index] ?? []);
    }

    function update(sharedFiles) {
      previews.forEach((preview, index) => preview.update({ runtime: 'dom', files: filesFor(index, sharedFiles) }));
    }

    function reset() {
      editor?.setFiles(common);
      update(common);
    }

    return {
      element,
      mount() {
        if (editorHost) {
          editor = createCodeEditor(editorHost, {
            files: common.map((file) => ({ ...file, region: null })),
            compact: true,
            label: 'Společný kód porovnání',
            context: 'live',
            runtime: 'dom',
            onChange: (files) => update(files),
          });
        }
        variantElements.forEach((variant, index) => {
          const preview = mountPreview(variant.previewHost, { runtime: 'dom', files: filesFor(index, common) });
          preview.setViewport?.(null);
          previews.push(preview);
        });
      },
      destroy() {
        previews.forEach((preview) => preview.destroy());
        editor?.destroy();
      },
    };
  },
};
