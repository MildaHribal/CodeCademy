# Rozšíření: vlastní Linux server

:::check pretest
Koupíš si VPS za 150 Kč měsíčně a poskytovatel ti pošle IP adresu a heslo k účtu `root`. Server je rovnou na internetu. Co myslíš, jak dlouho bude trvat, než se na něj začnou zkoušet přihlásit roboti?

### --answer--
Týdny, IP adresu nikdo nezná.

#### --why--
Roboti procházejí celý adresní prostor internetu pořád dokola. Nová adresa pro ně není neznámá, jen další v řadě.

### --correct--
Minuty; v logu SSH budou pokusy o přihlášení ještě ten den.

#### --why--
Automatické skenery zkouší běžná jména a hesla na každé adrese s otevřeným portem 22. Proto jako první přijde na řadu přihlašování klíčem a vypnutá hesla.

### --answer--
Nikdy, poskytovatel server chrání firewallem.

#### --why--
Většina VPS je po vytvoření otevřená. Firewall si nastavuješ sám.
:::

Tohle je nepovinná lekce. Platforma za tebe řeší přihlašování, firewall,
spouštění procesu, HTTPS i aktualizace. Na vlastním serveru je to všechno tvoje
práce — zato za pevnou cenu a s tím, že přesně víš, co pod aplikací běží. Lekce
projde minimum, se kterým se dá malá aplikace na VPS provozovat bez ostudy. Předpokládá
Debian nebo Ubuntu a základní práci v terminálu.

> [!REMEMBER]
> **Server na internetu je od první minuty pod útokem. Zavři všechno, co nepotřebuješ, a všechno, co běží, ať spravuje systém: spustí to po startu, restartuje po pádu a zapisuje do logu.**

## SSH klíče a uživatel

Hesla se dají uhodnout, klíče ne. Klíč vyrobíš na svém počítači a jeho **veřejnou**
část nahraješ na server:

```sh
ssh-keygen -t ed25519 -C "karel@notebook"   # vyrobí ~/.ssh/id_ed25519 a id_ed25519.pub
ssh-copy-id root@203.0.113.10               # nahraje veřejný klíč na server
ssh root@203.0.113.10                       # přihlášení už bez hesla
```

Soukromý klíč `id_ed25519` nikdy neopouští tvůj počítač. Server zná jen veřejný
a ověří, že protějšek máš.

Na serveru pak:

1. **Vlastní uživatel se `sudo`**, ať nepracuješ jako `root`:
   `adduser karel` a `usermod -aG sudo karel`. Klíč zkopíruj i pro něj.
2. **Vypnout hesla a přihlášení roota** v `/etc/ssh/sshd_config`:
   `PasswordAuthentication no` a `PermitRootLogin no`, pak `sudo systemctl reload ssh`.
3. **Ověřit v druhém terminálu**, že se přihlásíš jako nový uživatel, **než** zavřeš
   ten první. Kdyby něco nesedělo, pořád máš otevřené spojení a můžeš to opravit.

:::check
Ke kterému souboru se na serveru dostane obsah `~/.ssh/id_ed25519.pub` z tvého notebooku?

### --answer--
Nikam, přihlášení klíčem posílá soukromý klíč při každém přihlášení.

#### --why--
Soukromý klíč počítač neopouští nikdy. Server ověří, že ho máš, aniž by ho viděl.

### --correct--
Do `~/.ssh/authorized_keys` uživatele, za kterého se přihlašuješ.

#### --why--
`ssh-copy-id` připíše veřejný klíč do `authorized_keys`. Server pak přijme přihlášení od toho, kdo má odpovídající soukromý klíč.

### --answer--
Do `/etc/ssh/sshd_config`.

#### --why--
`sshd_config` je nastavení SSH serveru (třeba zákaz hesel), klíče jednotlivých uživatelů v něm nejsou.
:::

## Firewall

Firewall propustí jen spojení na porty, které povolíš. Webový server potřebuje tři:
SSH (22), HTTP (80) a HTTPS (443). Na Ubuntu je nejjednodušší `ufw`:

```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

**Pořadí je důležité:** `allow OpenSSH` musí být před `enable`. Jinak firewall
po zapnutí zablokuje každé další přihlášení přes SSH a po odhlášení se na server
dostaneš jen přes nouzovou konzoli poskytovatele.

Aplikace sama na portu 3000 zvenku dostupná být nemá — provoz k ní chodí přes Caddy.

> [!PITFALL]
> **Docker obchází `ufw`.** Port publikovaný přes `ports: "3000:3000"` v `compose.yaml`
> Docker otevře vlastními pravidly a `ufw status` o něm nic neví. Aplikace je pak
> dostupná zvenku bez HTTPS, i když firewall „port 3000 blokuje". Oprava: v Compose
> nepublikovat porty aplikace vůbec, nebo jen na `127.0.0.1:3000:3000`.

:::check
Máš otevřené SSH spojení k serveru a spustíš `sudo ufw default deny incoming` a hned `sudo ufw enable`. Co se stane s tvým spojením?

### --answer--
Nic, `ufw` se týká jen nových spojení.

#### --why--
Zavedené spojení to chvíli přežít může, ale každé nové přihlášení už firewall zablokuje. Po odpojení se zpátky nedostaneš.

### --correct--
Firewall zakáže příchozí SSH; po odpojení se na server nepřihlásíš a zbyde nouzová konzole poskytovatele.

#### --why--
Povolení `OpenSSH` chybí. Proto se SSH povoluje vždycky před `ufw enable`.

### --answer--
`ufw` zapnutí odmítne, dokud nepovolíš SSH.

#### --why--
`ufw` jen upozorní, že zapnutí může přerušit spojení, a po potvrzení firewall zapne.
:::

## Služba v systemd

Na platformě i v Dockeru proces spouští a hlídá někdo jiný. Na vlastním serveru je
to [[systemd]]: správce, který na Linuxu spouští všechny služby. Aplikaci popíšeš
souborem `/etc/systemd/system/pujcovna.service`:

```ini
[Unit]
Description=API půjčovny kol
After=network.target

[Service]
User=pujcovna
WorkingDirectory=/srv/pujcovna
EnvironmentFile=/etc/pujcovna/env
ExecStart=/usr/bin/node server.js
Restart=on-failure
TimeoutStopSec=15

[Install]
WantedBy=multi-user.target
```

- **`User`** — samostatný uživatel bez práva `sudo` (`adduser --system pujcovna`).
- **`EnvironmentFile`** — proměnné prostředí ze souboru, který čte jen `root`
  (`chmod 600`). Tady jsou tajemství, v repozitáři ne.
- **`ExecStart`** — celá cesta k `node` a přímo `node`, ne `npm start`.
- **`Restart=on-failure`** — po pádu proces znovu spustí.
- **`TimeoutStopSec`** — při zastavení pošle `SIGTERM` a po limitu `SIGKILL`, jako
  Docker. Výchozí limit je 90 sekund.

Ovládání:

```sh
sudo systemctl daemon-reload            # načti změněné soubory služeb
sudo systemctl enable --now pujcovna    # spusť teď i po každém restartu serveru
sudo systemctl restart pujcovna         # po nasazení nové verze
journalctl -u pujcovna -f               # logy služby, živě
```

Standardní výstup aplikace sbírá `journalctl`. Strukturované logy z workshopu tam
najdeš bez jakéhokoli nastavení.

:::live node predict
```js
// ExecStart=/usr/bin/node server.js, Restart=on-failure
import { createServer } from 'node:http';

process.on('uncaughtException', (error) => {
  console.error(JSON.stringify({ level: 'error', msg: 'Fatální chyba', error: error.stack }));
  process.exit(0);
});

createServer((req, res) => res.end('ok')).listen(3000);
setTimeout(() => { throw new Error('Spojení s databází ztraceno'); }, 1000);
```
--question-- Aplikace po sekundě vyhodí nechycenou výjimku. Co udělá systemd?
--option-- Službu restartuje, protože aplikace spadla.
--option*-- Nic, služba zůstane vypnutá.
--option-- Pošle `SIGTERM` a počká `TimeoutStopSec`.
--output--
```text
$ systemctl status pujcovna
○ pujcovna.service - API půjčovny kol
     Loaded: loaded (/etc/systemd/system/pujcovna.service; enabled)
     Active: inactive (dead) since Tue 2026-09-15 03:12:44 CEST; 2h ago
   Main PID: 81234 (code=exited, status=0/SUCCESS)
```
--why-- `Restart=on-failure` restartuje jen po nenulovém kódu nebo zabití signálem. Obsluha chyby ukončila proces kódem `0`, což pro systemd znamená „skončil jsem v pořádku". Po pádu se končí nenulovým kódem: `process.exit(1)`.
:::

:::check
Po úpravě `/etc/systemd/system/pujcovna.service` spustíš `sudo systemctl restart pujcovna`, ale služba se chová postaru, jako by změna nebyla. Který příkaz jsi měl spustit před restartem?

### --expected--
sudo systemctl daemon-reload

### --accept--
systemctl daemon-reload
daemon-reload

### --why--
systemd drží načtené soubory služeb v paměti. Po jejich změně je potřeba `daemon-reload`, teprve pak `restart` použije nové nastavení.
:::

## Caddy před aplikací

Na serveru bez Dockeru nainstaluješ Caddy jako balíček (návod pro Debian a Ubuntu je
v jeho dokumentaci) a běží jako další služba v systemd. `/etc/caddy/Caddyfile`:

```text
pujcovna-kol.cz {
    reverse_proxy 127.0.0.1:3000
}
```

Pak `sudo systemctl reload caddy`. Když DNS domény ukazuje na server a porty 80 a 443
jsou ve firewallu povolené, Caddy získá certifikát sám.

Aplikace tady **má** poslouchat jen na `127.0.0.1`: Caddy běží na tomtéž počítači
a nikdo jiný se k ní dostat nemá. Je to přesný opak Dockeru, kde `127.0.0.1`
v kontejneru aplikaci od proxy odřízne.

| kde běží aplikace | kde běží Caddy | na čem aplikace poslouchá |
|---|---|---|
| přímo na serveru (systemd) | přímo na serveru | `127.0.0.1` |
| v kontejneru | v jiném kontejneru | všechna rozhraní, port nepublikovat |

:::check
Aplikace běží přes systemd přímo na serveru, Caddy taky. Proč je tady `server.listen(3000, '127.0.0.1')` správně, když v Dockeru stejný řádek aplikaci odřízne?

### --answer--
Protože systemd port 3000 přesměruje sám.

#### --why--
systemd porty nepřesměrovává, jen spouští proces. Rozhoduje, kde je Caddy vůči aplikaci.

### --correct--
Caddy běží na stejném počítači, takže se k aplikaci přes `127.0.0.1` dostane, a zvenku ne nikdo.

#### --why--
`127.0.0.1` je dostupné jen z téhož počítače, respektive téhož kontejneru. V Dockeru jsou Caddy a aplikace v různých kontejnerech, na serveru bez Dockeru na jednom počítači.

### --answer--
Protože bez Dockeru `127.0.0.1` znamená všechna rozhraní.

#### --why--
`127.0.0.1` je vždycky jen smyčka uvnitř stroje. Všechna rozhraní jsou `0.0.0.0` nebo vynechaná adresa.
:::

## Automatické aktualizace

Bezpečnostní opravy systému vycházejí každý týden. Na Debianu a Ubuntu je stáhne
a nainstaluje balíček `unattended-upgrades`:

```sh
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Ve výchozím nastavení instaluje jen **bezpečnostní** aktualizace, ne nové verze
programů, takže provoz nerozbije. Oprava jádra systému ale začne platit až po
restartu serveru. Že je restart potřeba, poznáš podle souboru
`/var/run/reboot-required`. Restart můžeš povolit automaticky v noci
(`Unattended-Upgrade::Automatic-Reboot "true";` s časem), nebo ho dělat ručně.

Díky `enable` v systemd a korektnímu ukončení aplikace restart serveru přežije:
služby se po startu spustí samy.

Node z oficiálního repozitáře NodeSource nebo z `apt` se aktualizuje taky, ale
přechod na novou hlavní verzi (24 → 26) dělej ručně a po vyzkoušení.

:::check
`unattended-upgrades` v noci nainstaloval opravu jádra. Server běží dál a `uname -r` ukazuje starou verzi. Je oprava účinná?

### --answer--
Ano, balíček je nainstalovaný.

#### --why--
Nainstalovaný soubor jádra ještě neběží. Běžící jádro je to, se kterým server nastartoval.

### --correct--
Ne, nové jádro začne platit až po restartu serveru.

#### --why--
Jádro se za běhu nevymění. Proto soubor `/var/run/reboot-required` a naplánovaný restart.

### --answer--
Ne, `unattended-upgrades` jádro nikdy neaktualizuje.

#### --why--
Bezpečnostní opravy jádra instaluje. Jen se projeví až po restartu.
:::

## Zálohy na serveru

Na VPS nikdo zálohy nedělá za tebe. Minimum pro SQLite databázi:

1. **Každou noc výpis** — `sqlite3 data.db ".backup záloha.db"` vytvoří konzistentní
   kopii i za běhu aplikace (obyčejné `cp` otevřené databáze může zkopírovat
   rozepsaný stav).
2. **Kopie mimo server** — nástroje `restic` nebo `rclone` pošlou zálohu do úložiště
   u jiného poskytovatele a staré zálohy po čase promažou.
3. **Plánovač** — `cron` nebo časovač systemd spustí skript každou noc.
4. **Zkouška obnovy** — jednou za měsíc zálohu stáhni a otevři.

Snapshot celého disku, který nabízí poskytovatel VPS, je dobrý doplněk, ale ne jediná
záloha: bývá u téhož poskytovatele a při zrušení účtu zmizí se serverem.

> [!PITFALL]
> **Procento v `crontab`.** Řádek `0 3 * * * sqlite3 /srv/pujcovna/data.db ".backup /var/backups/pujcovna-$(date +%F).db"`
> nic nezálohuje: `%` má v `crontab` zvláštní význam (konec příkazu) a zbytek řádku se
> zahodí. V logu cronu uvidíš jen useknutý příkaz. Oprava: `\%F`, nebo celý příkaz
> dát do skriptu a v `crontab` volat jen skript.

:::check
Proč se SQLite databáze za běhu aplikace zálohuje přes `.backup`, a ne obyčejným `cp`?

### --answer--
Protože `cp` neumí kopírovat soubory větší než 2 GB.

#### --why--
`cp` zkopíruje soubor jakékoli velikosti. Problém je, co v souboru zrovna je.

### --correct--
`cp` může zkopírovat soubor uprostřed zápisu a záloha pak bude poškozená; `.backup` vytvoří konzistentní kopii.

#### --why--
Aplikace do databáze průběžně zapisuje. `.backup` použije mechanismus SQLite, který zkopíruje ucelený stav.

### --answer--
Protože `cp` zálohu nezkomprimuje.

#### --why--
Komprese se dá přidat kdykoli. Kopie rozepsaného souboru ale zůstane rozbitá, ať ji zkomprimuješ, nebo ne.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`ufw enable` před `ufw allow OpenSSH`.** Otevřené spojení ještě chvíli žije, ale
> po odhlášení přijde `ssh: connect to host 203.0.113.10 port 22: Connection timed out`.
> Oprava: nouzová konzole poskytovatele, `ufw allow OpenSSH`; příště povolit SSH jako první.

> [!PITFALL]
> **Vypnutá hesla bez ověřeného klíče.** Po `reload ssh` přijde
> `Permission denied (publickey)` a jiná cesta dovnitř není. Oprava: přihlášení
> klíčem vždycky ověřit v druhém terminálu, než zavřeš první.

> [!PITFALL]
> **Aplikace běží jako `root`.** Díra v aplikaci nebo v balíčku z npm pak dá útočníkovi
> celý server. Oprava: `User=` s vlastním systémovým uživatelem v souboru služby.

> [!PITFALL]
> **Node z `nvm` a `ExecStart=node server.js`.** Hláška `status=203/EXEC`: systemd
> nevidí `PATH` z tvého shellu, hledá jen v systémových adresářích, a `node` z `nvm`
> leží v domovské složce. Oprava: celá cesta z `which node`, nebo Node nainstalovaný
> systémově. A ne `npm start`: `SIGTERM` by dostal npm, ne Node.

:::check
Node máš na serveru nainstalovaný přes `nvm` a v terminálu `node server.js` funguje. Služba se ale nespustí a `systemctl status` ukazuje `status=203/EXEC`. V souboru služby je `ExecStart=node server.js`. Co je nejpravděpodobnější příčina?

### --answer--
Soubor `server.js` obsahuje syntaktickou chybu.

#### --why--
Syntaktickou chybu by nahlásil Node a skončil by s kódem 1. `203/EXEC` znamená, že systemd program vůbec nespustil.

### --correct--
systemd nenašel program `node`: nevidí `PATH` z tvého shellu, kam `nvm` Node přidává.

#### --why--
`203/EXEC` = spuštění programu selhalo. systemd hledá jen v systémových adresářích; celou cestu k Node z `nvm` zjistíš příkazem `which node`.

### --answer--
Uživatel služby nemá právo `sudo`.

#### --why--
Služba `sudo` nepotřebuje a nemá ho mít. Chybějící práva ke čtení souborů by skončila jinou hláškou z Node.
:::

## Kde to najdeš v MDN

- [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) — až web běží přes HTTPS, touhle hlavičkou prohlížeči řekneš, ať HTTP nezkouší vůbec.
- [HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS) — co šifrované spojení chrání a co ne.
- Mimo MDN: `man systemd.service` (volby `Restart` a `TimeoutStopSec`), dokumentace Ubuntu „UFW" a „Automatic updates", v dokumentaci Dockeru „Packet filtering and firewalls" (proč Docker obchází `ufw`).

# --questions--

## --question--

V souboru služby je `Restart=on-failure`. Aplikace při nedostupné databázi zaloguje chybu a zavolá `process.exit(1)`. Kolikrát se ji systemd pokusí spustit znovu, když databáze nejde deset minut? Vyber nejpřesnější odpověď.

### --answer--
Ani jednou, `process.exit` je řízené ukončení.

#### --why--
Pro systemd rozhoduje kód, ne způsob ukončení. Kód `1` je selhání.

### --correct--
Opakovaně, dokud nenarazí na limit počtu restartů za krátkou dobu; pak službu nechá vypnutou.

#### --why--
`on-failure` restartuje po každém nenulovém kódu. Při pádech rychle za sebou systemd po výchozím limitu (5 pokusů za 10 s) přestane a službu označí jako selhanou; `RestartSec` pokusy rozloží v čase.

### --answer--
Nekonečněkrát, každých 100 ms.

#### --why--
systemd má limit pokusů za časový úsek, aby padající služba nezahltila server.

### --see--
nasazeni-provoz/linux-server#sluzba-v-systemd

## --question--

Kterým příkazem si na serveru živě prohlédneš logy služby `pujcovna`?

### --expected--
journalctl -u pujcovna -f

### --accept--
sudo journalctl -u pujcovna -f
journalctl -fu pujcovna
journalctl -f -u pujcovna
journalctl -u pujcovna

### --why--
Standardní výstup služby sbírá journal. `-u` vybere službu, `-f` sleduje nové řádky.

### --see--
nasazeni-provoz/linux-server#sluzba-v-systemd

## --question--

V `compose.yaml` na VPS je u aplikace `ports: "3000:3000"` a `ufw` port 3000 nepovoluje. Je aplikace z internetu dostupná na `http://203.0.113.10:3000`? Odpověz ano, nebo ne.

### --expected-- ignore-case
ano

### --why--
Docker pro publikované porty přidává vlastní pravidla, která `ufw` obejdou. Pomůže port nepublikovat, nebo ho publikovat jen na `127.0.0.1:3000:3000`.

### --see--
nasazeni-provoz/linux-server#firewall
