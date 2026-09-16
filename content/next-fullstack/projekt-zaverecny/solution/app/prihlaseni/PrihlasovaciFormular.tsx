'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { authClient } from '@/lib/auth-client.ts';

export function PrihlasovaciFormular() {
  const router = useRouter();
  const pokracovat = useSearchParams().get('pokracovat') ?? '/moje';
  const [chyba, setChyba] = useState('');
  const [odesilam, setOdesilam] = useState(false);

  async function odesli(formData: FormData) {
    setOdesilam(true);
    setChyba('');

    const { error } = await authClient.signIn.email({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('heslo') ?? ''),
    });

    setOdesilam(false);
    if (error) {
      setChyba('Přihlášení se nepovedlo. Zkontroluj e-mail a heslo.');
      return;
    }

    router.push(pokracovat);
    router.refresh();
  }

  return (
    <form action={odesli} className="zaznam" noValidate>
      {chyba && <p className="chyba">{chyba}</p>}

      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" />
      </label>

      <label>
        Heslo
        <input name="heslo" type="password" autoComplete="current-password" />
      </label>

      <button type="submit" disabled={odesilam}>
        {odesilam ? 'Přihlašuju…' : 'Přihlásit se'}
      </button>
    </form>
  );
}
