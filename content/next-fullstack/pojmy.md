## --term-- hydratace

en: hydration
aliases: hydrataci, hydratace, hydratací, hydratovat
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Hydration
lekce: next-fullstack/ssr-csr-ssg#hydratace-html-samo-nic-neumi

Chvíle, kdy JavaScript v prohlížeči projde hotové HTML ze serveru, přiřadí
k prvkům komponenty a navěsí obsluhy událostí. Stránka je do té doby vidět, ale
nereaguje.

## --term-- nesoulad při hydrataci

en: hydration mismatch
aliases: nesoulad hydratace, nesouladu při hydrataci, nesoulad při hydrataci
lekce: next-fullstack/ssr-csr-ssg#co-nesoulad-zpusobuje

Stav, kdy z komponenty vyjde v prohlížeči jiný výsledek než na serveru. React
ho ohlásí hláškou `Hydration failed` a podstrom vykreslí znovu na klientovi.

## --term-- streamování

en: streaming
aliases: streamování, streamovat, streamovaná odpověď
lekce: next-fullstack/ssr-csr-ssg#streamovani-necekat-na-to-nejpomalejsi

Posílání HTML po částech v jedné odpovědi: rychlá část jde k uživateli hned,
pomalá dorazí, až je hotová. Místo pro dopsání označí `<Suspense>`.

## --term-- statická skořápka

en: static shell
aliases: statické skořápky, statickou skořápku, statická skořápka
lekce: next-fullstack/ssr-csr-ssg#streamovani-necekat-na-to-nejpomalejsi

Část stránky, která se dá vyrobit předem, protože nezávisí na požadavku —
hlavička, navigace, nadpisy a `fallback` místa, která se dostreamují.

## --term-- App Router

en: App Router
aliases: App Routeru, App Routerem
lekce: next-fullstack/app-router#app-jako-mapa-webu

Způsob routování v Next.js, kde adresu určuje struktura složek v `app/`
a role souboru jeho jméno (`page.tsx`, `layout.tsx`, `route.ts`).

## --term-- serverová komponenta

en: Server Component
aliases: serverové komponenty, serverovou komponentu, serverových komponent, serverovými komponentami
lekce: next-fullstack/server-a-client-komponenty#vychozi-stav-vsechno-je-serverove

Komponenta, která se vykreslí jen na serveru. Smí být `async`, sahat do
databáze a na tajemství, ale nemá stav ani obsluhy událostí a její kód se
neposílá do prohlížeče.

## --term-- klientská komponenta

en: Client Component
aliases: klientské komponenty, klientskou komponentu, klientských komponent, klientskými komponentami
lekce: next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

Komponenta ze souboru s `"use client"` na prvním řádku. Vykreslí se na serveru
do HTML a pak ožije v prohlížeči, takže smí mít stav, efekty a obsluhy událostí.

## --term-- RSC payload

en: RSC payload
aliases: RSC payloadu, RSC payloadem
lekce: next-fullstack/server-a-client-komponenty#co-jde-po-dratu

Serializovaný výsledek serverových komponent, který server posílá vedle HTML.
Obsahuje vykreslený strom, props pro klientské komponenty a odkazy na jejich
soubory.

## --term-- route handler

en: Route Handler
aliases: route handleru, route handlery, route handlerem
lekce: next-fullstack/app-router#route-handler-kdyz-potrebujes-endpoint

Soubor `route.ts` v `app/`, který místo stránky vrací odpověď HTTP. Exportuje
funkci pojmenovanou podle metody (`GET`, `POST`) a hodí se pro cizí klienty
a webhooky.

## --term-- serverová akce

en: Server Action
aliases: serverové akce, serverovou akci, serverových akcí, serverovými akcemi, server action
lekce: next-fullstack/data-a-server-actions#serverova-akce-formular-ktery-mluvi-s-databazi

Asynchronní funkce se `"use server"`, kterou smí zavolat formulář nebo obsluha
události z prohlížeče. Běží na serveru a Next.js z ní udělá veřejný endpoint
přístupný metodou POST.

## --term-- revalidace

en: revalidation
aliases: revalidaci, revalidace, revalidovat
lekce: next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

Označení uloženého výsledku za neplatný, aby se při dalším požadavku vyrobil
znovu. V Next.js ji vyvolá `revalidatePath`, `revalidateTag` nebo `updateTag`.

## --term-- značka cache

en: cache tag
aliases: značky cache, značkou cache, značku cache
lekce: next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

Jméno, kterým označíš uložený výsledek (`cacheTag('inzeraty')`), abys ho pak
mohl jedním voláním zneplatnit napříč celou aplikací.

## --term-- metadata stránky

en: metadata
aliases: metadata stránky, metadat stránky
lekce: next-fullstack/seo-a-metadata#metadata-jako-export

Údaje v `<head>`, které stránka o sobě říká vyhledávačům a náhledům odkazů:
titulek, popis, kanonická adresa, náhledový obrázek. V App Routeru se píšou
jako export `metadata` nebo funkce `generateMetadata`.
