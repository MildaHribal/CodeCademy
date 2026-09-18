---
title: Kvíz testování
---

# --questions--

## --question--

Co je hlavním rizikem mockování databáze v unit testech?

### --answer--
Test bude trvat mnohem déle.
#### --why--
Mocky jsou obecně rychlejší než reálná databáze, proto se z výkonnostního hlediska používají.

### --correct--
Test může procházet, i když skutečná integrace v produkci nefunguje.
#### --why--
Mock neověřuje reálné chování. Pokud změníš databázové schéma a zapomeneš aktualizovat mock, testy budou falešně procházet.

## --question--

Proč bychom neměli testovat soukromé (neexportované) metody třídy či modulu?

### --answer--
Protože Node.js nedovolí testům přístup k soukromým metodám.
#### --why--
Technicky lze přístup často obejít. Problém je koncepční.

### --correct--
Protože to vytváří křehké testy, které brání refaktoringu.
#### --why--
Pokud se změní vnitřní implementace, test by neměl selhat, dokud je vnější chování zachováno. Testování soukromých metod fixuje implementační detaily.

## --question--

Jaký je hlavní účel E2E (End-to-End) testů v testovací pyramidě?

### --answer--
Testovat jednotlivé funkce izolovaně od zbytku systému.
#### --why--
To je účel unit testů, ne E2E testů.

### --correct--
Ověřit fungování celé aplikace od začátku do konce z pohledu uživatele.
#### --why--
E2E testy simulují uživatele, který kliká v prohlížeči, takže testují integraci všech vrstev včetně databáze a sítě.

## --question--

Co se testuje při testování izolované jednotky sítě (tzv. unit testy) z hlediska organizace kódu?

### --answer--
Kód, který provádí síťové požadavky proti reálnému produkčnímu API.
#### --why--
Unit testy by neměly sahat na síť; použil bys pro ně mocky.

### --correct--
Logika, struktura, výstupy a chování jedné oddělené části, například čisté funkce, bez ohledu na databázi či vnější služby.
#### --why--
Přesně tak. Unit testy by měly být čisté, spolehlivé a nevyžadovat připojení k síti či databázi.

## --question--

Co z následujícího je nejlepší kandidát pro napsání unit testu?

### --answer--
Kliknutí na tlačítko, které naviguje na jinou stránku aplikace.
#### --why--
To je lepší otestovat přes E2E nebo integrační testy, protože se řeší router a komponenty.

### --correct--
Funkce, která vezme hrubou částku s daní a spočítá, kolik činí DPH.
#### --why--
Tohle je čistá, deterministická funkce, kterou snadno pokryješ unit testy a zajistíš se tak před matematickými chybami.

