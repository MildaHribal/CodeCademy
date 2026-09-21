// Párování telefonu: tlačítko „Phone" v liště ukáže QR kód s adresou a tokenem.
// Položka je vidět jen na počítači, kde server běží — telefon už spárovaný je.
import qrcode from 'qrcode-generator';
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { registerHeaderItem } from '../../core/header.js';
import { growIn } from '../../motion.js';
import './phone.css';

let dialog = null;

async function loadPairing() {
  try {
    const response = await fetch('/api/remote/pairing');
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

function qrSvg(text) {
  const code = qrcode(0, 'M');
  code.addData(text);
  code.make();
  const holder = h('div', { class: 'phone-pair__qr', role: 'img', 'aria-label': 'QR kód s adresou pro telefon' });
  holder.innerHTML = code.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  return holder;
}

function body(pairing) {
  if (!pairing.enabled) {
    return [
      h('p', { class: 'phone-pair__lead' }, 'Vzdálený přístup je vypnutý. Server teď poslouchá jen na tomhle počítači.'),
      h('p', { class: 'phone-pair__hint' }, 'Zapneš ho spuštěním serveru s proměnnou prostředí:'),
      h('pre', { class: 'phone-pair__code' }, 'AKADEMIE_REMOTE=tailscale node server/index.js'),
      h('p', { class: 'phone-pair__hint' }, 'Telefon i počítač musí být ve stejné síti Tailscale. Přístup chrání párovací token.'),
    ];
  }
  return [
    h('p', { class: 'phone-pair__lead' }, 'Naskenuj kód telefonem. Postup, poznámky i opakování jsou společné — pokračuješ tam, kde jsi na počítači skončil.'),
    qrSvg(pairing.url),
    h('p', { class: 'phone-pair__hint' }, 'Telefon musí být připojený k Tailscale. Kód obsahuje párovací token — nikomu ho neposílej.'),
    h('input', { class: 'phone-pair__url', readOnly: true, value: pairing.url, 'aria-label': 'Adresa pro telefon', onfocus: (event) => event.target.select() }),
  ];
}

async function open() {
  const pairing = await loadPairing();
  if (!pairing) return;
  dialog?.remove();
  dialog = h(
    'dialog',
    { class: 'phone-pair', 'aria-labelledby': 'phone-pair-title' },
    h(
      'div',
      { class: 'phone-pair__head' },
      h('h2', { id: 'phone-pair-title', class: 'phone-pair__title' }, 'Pokračuj na telefonu'),
      h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Close / Zavřít', onclick: () => dialog.close() }, svg(icons.close)),
    ),
    body(pairing),
  );
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.body.append(dialog);
  dialog.showModal();
  growIn(dialog, { origin: 'top right' });
}

loadPairing().then((pairing) => {
  if (!pairing?.local) return;
  registerHeaderItem({ id: 'phone', order: 80, label: 'Phone', icon: icons.phone, onClick: open });
});
