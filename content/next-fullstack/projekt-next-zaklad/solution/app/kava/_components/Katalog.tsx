'use client';

import { useState } from 'react';
import Link from 'next/link';

import { DRUHY, filtrujKavy, formatujCenu, type Druh, type Kava } from '@/lib/kava';

export function Katalog({ kavy }: { kavy: Kava[] }) {
  const [dotaz, setDotaz] = useState('');
  const [druh, setDruh] = useState<Druh | 'vse'>('vse');

  const nalezene = filtrujKavy(kavy, { dotaz, druh });

  return (
    <>
      <div className="filtr">
        <label>
          Hledat
          <input
            name="dotaz"
            value={dotaz}
            onChange={(udalost) => setDotaz(udalost.target.value)}
            placeholder="Etiopie, Brazílie…"
          />
        </label>

        <label>
          Druh
          <select name="druh" value={druh} onChange={(udalost) => setDruh(udalost.target.value as Druh | 'vse')}>
            {DRUHY.map((polozka) => (
              <option key={polozka.hodnota} value={polozka.hodnota}>
                {polozka.popisek}
              </option>
            ))}
          </select>
        </label>
      </div>

      {nalezene.length === 0 ? (
        <p className="zprava">Nic jsme nenašli. Zkus jiný výraz nebo jiný druh.</p>
      ) : (
        <ul className="mrizka">
          {nalezene.map((kava) => (
            <li className="karta" key={kava.slug}>
              <p className="karta__puvod">{kava.puvod}</p>
              <Link href={`/kava/${kava.slug}`}>{kava.nazev}</Link>
              <p className="karta__cena">{formatujCenu(kava.cena)} / 250 g</p>
              <p className="karta__popis">{kava.chute.join(' · ')}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
