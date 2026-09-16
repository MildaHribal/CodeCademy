'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { vytvorInzerat, type StavAkce } from '@/lib/akce.ts';

function Odeslat() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Ukládám…' : 'Zveřejnit inzerát'}
    </button>
  );
}

export function FormularInzeratu() {
  const [stav, akce] = useActionState<StavAkce, FormData>(vytvorInzerat, {});

  return (
    <form action={akce} className="zaznam" noValidate>
      {stav.chyba && <p className="chyba">{stav.chyba}</p>}

      <label>
        Název
        <input name="nazev" defaultValue={stav.hodnoty?.nazev ?? ''} aria-invalid={Boolean(stav.chybyPoli?.nazev)} />
      </label>
      {stav.chybyPoli?.nazev && <p className="chyba">{stav.chybyPoli.nazev[0]}</p>}

      <label>
        Popis
        <textarea name="popis" rows={5} defaultValue={stav.hodnoty?.popis ?? ''} />
      </label>
      {stav.chybyPoli?.popis && <p className="chyba">{stav.chybyPoli.popis[0]}</p>}

      <label>
        Cena v Kč
        <input name="cena" type="number" min="1" defaultValue={stav.hodnoty?.cena ?? ''} />
      </label>
      {stav.chybyPoli?.cena && <p className="chyba">{stav.chybyPoli.cena[0]}</p>}

      <label>
        Kategorie
        <select name="kategorie" defaultValue={stav.hodnoty?.kategorie ?? 'sport'}>
          <option value="sport">Sport</option>
          <option value="domacnost">Domácnost</option>
          <option value="elektronika">Elektronika</option>
          <option value="ostatni">Ostatní</option>
        </select>
      </label>
      {stav.chybyPoli?.kategorie && <p className="chyba">{stav.chybyPoli.kategorie[0]}</p>}

      <Odeslat />
    </form>
  );
}
