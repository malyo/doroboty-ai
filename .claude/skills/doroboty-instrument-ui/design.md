# DoRoboty.ai — design system „Instrument”

`design.md` · wersja 1 · 2026-11-11 · na podstawie zaakceptowanej dokumentacji komponentów v4

Ten plik jest punktem wejścia dla osoby albo agenta, który buduje ekrany w kierunku „Instrument”, także w innym projekcie. Zawiera zasady, tokeny, role typografii, kompozycję stron, API klas komponentów i sposób sprawdzenia wyniku. Do pracy wystarczy ten plik i `assets/instrument.css`. Szczegóły i uzasadnienia są w plikach wymienionych w sekcji „Pliki i odsyłacze”.

Oznaczenia przy regułach:
- **[Potwierdzone]**: zapisane w specyfikacji (`instrument.css`) i widoczne w prototypach.
- **[Decyzja]**: wybór użytkownika podjęty w trakcie projektowania.
- **[Rekomendacja]**: propozycja pakietu, jeszcze nie zasada zespołu.
- **[Otwarte]**: do rozstrzygnięcia (lista na końcu).

---

## 1. Zakres

- **Produkt:** polski portal pracy dla osób pracujących z AI, z segmentami Build / Apply / Lead. Ma dwie strony rynku: pracodawców (rekruterów) i kandydatów.
- **Platforma:** web, desktop i mobile. Jeden jasny motyw. Trybu ciemnego nie ma i nie należy go dopisywać.
- **Zakres systemu:** ekrany robocze, czyli listy, szczegóły (ogłoszenie, profil), pulpity, formularze oraz stany puste i błędy.
- **Poza zakresem:** strona marketingowa, landing i logo marki. Mogą być bardziej ekspresyjne, ale ten plik ich nie opisuje.
- **Język interfejsu:** polski. Długie nazwiska z diakrytykami i poprawna odmiana liczebników są wymagane.

## 2. Charakter w jednym akapicie

Jasna, cicha powierzchnia robocza na delikatnym gradiencie „niebo”. Wszystko siedzi w ramkach i tabelach z kątami prostymi i obrysem 1 px: surowo jak w Bauhausie, ale „designersko” dzięki typografii. Kontrast pojawia się tylko tam, gdzie jest decyzja: ciemny pulpit z liczbami, odwrócone wiersze wybranych pozycji i jedna pomarańczowa akcja. Fakty mówią krojem mono, ludzie krojem humanistycznym, a etykiety pikselowym krojem terminala. Retro-futuryzm wynika z języka dokumentacji technicznej (NR, „Fig. 1”, „klucz: wartość”, liczniki jak na wyświetlaczu), a nie z kostiumu z filmów SF.

## 3. Sześć zasad (kolejność = priorytet)

1. **Budżet kontrastu: najwyżej 3 mocne punkty na widok.** Są to: pulpit (`.console`), wiersze wybrane (`.row.sl`) i jedna akcja główna (`.cta`). Ekran może mieć mniej punktów; szczegół zwykle ma tylko `.cta`. Nie dodawaj ciemnych banerów, drugiego pomarańczowego przycisku ani kolorowych sekcji. [Potwierdzone]
2. **Ciemne znaczy „ważne”.** `--console` pojawia się tylko w pulpicie i w wierszach wybranych (zapisane, shortlista, „wymaga działania”). Każdy ciemny wiersz ma linię `.why` z powodem w tekście. [Potwierdzone]
3. **Pomarańczowy znaczy tylko „zrób to”.** `--action` jest wyłącznie tłem `.cta`, a tekst na nim jest ciemny (`--ink`). Nigdy nie używaj go w tekście, ikonach, plakietkach, obrysach ani wykresach. Ostrzeżenia nie mają koloru (obrys albo ciemny wiersz z powodem), a błędy są karmazynowe (`--alert`) z ikoną „!”. [Potwierdzone]
4. **Zielony znaczy tylko „dostępny”**, czyli kandydat dostępny albo liczba dostępnych. Jasna zieleń `--signal` leży tylko na ciemnym tle. Na jasnym używaj `--signal-ink` na `--signal-tint`. [Potwierdzone]
5. **Dwa kroje treści, trzy głosy plus liczniki:**
   - Nunito Sans: ludzie i opisy;
   - DM Mono 400: liczby i dane;
   - DM Mono 500: tytuły (H1, sekcje, pulpit);
   - Departure Mono 11 px: etykiety;
   - Doto: tylko liczniki pulpitu. [Potwierdzone, kroje: Decyzja]
6. **Wszystko w ramkach.** Kąty proste (promień 0), obrys 1 px, bez cieni. Listy to tabele w jednej ramce, a nie osobne karty. Przycisk to ramka z komórką strzałki „→”. Między ramkami dużo powietrza, w środku zwarte dane. [Potwierdzone, Decyzja]

Do tego dwie zasady treści:
- **Człowiek przed numerem.** NR jest mały i szary, a imię i nazwisko to najważniejszy tekst w wierszu.
- **Bez zdjęć jako nośnika ekspresji.** Nie ma zdjęć kandydatów w listach. Logo firmy to mały kwadrat z inicjałem.

## 4. Szybki start

```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Doto:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="instrument.css">   <!-- skopiuj assets/instrument.css + assets/fonts/ obok -->
  <style>/* tylko układ tej strony: --cols / --areas list, siatki stron */</style>
</head>
<body class="ins">  <!-- .ins włącza tokeny, gradient tła i wszystkie komponenty -->
  …
</body>
</html>
```

- **Wszystkie reguły są pod `.ins`**, więc system nie koliduje z istniejącym CSS projektu. Możesz go też włączyć tylko na fragmencie strony (`<section class="ins">`).
- **Departure Mono to plik lokalny** (`assets/fonts/DepartureMono-Regular.woff2`, SIL OFL). `instrument.css` ładuje go ścieżką `fonts/…`, więc folder `fonts/` musi leżeć obok CSS.
- **Samodzielny plik HTML** (podgląd w aplikacji Claude, załącznik, artefakt) nie widzi plików obok siebie. Uruchom wtedy:
  `python3 scripts/inline_css.py strona.html`
  Skrypt wkleja CSS, font i favicon do strony. Uruchomiony ponownie odświeża je po zmianie CSS. [Decyzja]
- **W projekcie z frameworkiem** (React itd.) zaimportuj `instrument.css` globalnie i dodaj `className="ins"` na korzeniu. Nazwy klas są publicznym API, więc nie zmieniaj ich. [Rekomendacja]

## 5. Tokeny

Wszystkie wartości w `assets/instrument.css` (blok `.ins{…}`). Nie dodawaj kolorów ani odstępów spoza tej listy. Gdy coś nie pasuje, dodaj token z nazwą, a nie wartość w jednym miejscu.

### Kolor

| Token | Wartość | Rola |
| --- | --- | --- |
| `--paper` | `#f2f2f2` | tło pod gradientem, tło nagłówka kolumn |
| `--surface` | `#fcfcfc` | wnętrze ramek (wiersze, panele, karty, pola) |
| `--ink` | `#1c1c1c` | tekst główny, ramka przycisków, fokus |
| `--mute` | `#555555` | meta, etykiety, klucze |
| `--chip` | `#e3e3e3` | neutralne wypełnienie (np. disabled) |
| `--frame` | `#8a8a8a` | ramka zewnętrzna każdego pojemnika, pola, plakietki |
| `--rule` | `#d9d9d9` | linie wewnątrz ramek |
| `--console` / `--console-ink` / `--console-mute` / `--console-line` | `#0b0e12` / `#dedede` / `#a3a4a5` / `#30353d` | pulpit, wiersz `.sl` |
| `--signal` / `--signal-ink` / `--signal-tint` / `--signal-deep` | `#00d892` / `#00503a` / `#dcf3ea` / `#0e3b2c` | „dostępny” (na ciemnym / na jasnym / tło plakietki / tło plakietki na ciemnym) |
| `--action` / `--action-hover` / `--action-press` | `#ff5a1f` / `#ff7a45` / `#e8540f` | tylko `.cta` |
| `--alert` | `#9f1239` | tylko błędy |
| `--sky` | `linear-gradient(180deg,#efe7ec,#e3e9ec)` | tło każdej strony (ustawione na `.ins`) |
| `--sky-line` | `linear-gradient(90deg,#e7d4e5,#cad9e5)` | linia „horyzontu” 3 px pod pulpitem |

Kontrast (WCAG 2.x, liczony z wartości tokenów):

| Para | Kontrast | Ocena |
| --- | --- | --- |
| ink / surface | 16,6:1 | AA |
| mute / surface | 7,3:1 | AA |
| mute / niebo | ≈ 6,1:1 | AA |
| console-ink / console | 14,4:1 | AA |
| signal / console | 10,4:1 | AA |
| signal-ink / signal-tint | 8,2:1 | AA |
| ink / action (tekst `.cta`) | 5,5:1 | AA |
| alert / surface | 7,8:1 | AA |
| frame / surface | 3,4:1 | ≥ 3:1 dla obrysów |

**Zakazane pary:**
- jasna zieleń na jasnym tle (1,8:1);
- biały tekst na pomarańczu (3,1:1);
- pomarańczowy tekst na jasnym tle (2,8:1).

### Typografia (role, nie dowolne rozmiary)

| Klasa | Krój | Parametry | Użycie |
| --- | --- | --- | --- |
| `.t-h1` | DM Mono 500 | 52 px / 1.05, −0.04em (mobile 32 px) | imię w profilu, tytuł ogłoszenia, H1 strony |
| `.t-sec` | DM Mono 500 | 28 px / 1.15, −0.03em (mobile 22 px) | nagłówki sekcji |
| `.c-title` | DM Mono 500 | 34 px, −0.035em, biały (mobile 23 px) | zdanie w pulpicie, maks. 44 znaki szerokości |
| `.t-name` | Nunito Sans 650 | 18 px / 1.25 | imię lub tytuł w wierszu listy |
| `.lead` | Nunito Sans 400 | 19 px / 1.5, maks. 56 znaków | jedno zdanie pod H1 |
| `.t-body` | Nunito Sans 400 | 16 px / 1.6, maks. 68 znaków | treść opisów |
| `.t-meta` | Nunito Sans 400 | 14 px, `--mute` | rola · miasto · forma |
| `.t-data` | DM Mono 400 | 14 px, cyfry tabelaryczne, bez zawijania | stawki, daty, liczby |
| `.t-label` (i wszystkie etykiety 11 px) | Departure Mono 400 | **tylko 11 px**, wersaliki, `letter-spacing:1px` | nagłówki kolumn, NR, statusy, chipy, „Fig.”, klucze |
| `.c-stat b` | Doto 700 | 48 px (mobile 40 px) | tylko liczniki pulpitu |

Reguły typografii:
- **Krojów mono nie stawiaj w zdaniach**, w wierszach listy, przyciskach ani polach. Wyjątek: dane i liczby w `.t-data`.
- **Tytuły piszesz zwykłą wielkością liter.** Wersaliki zostają dla etykiet 11 px.
- **Departure Mono nie skalujesz.** Ma ostrą siatkę pikseli tylko w krokach co 11 px.

### Odstępy i kształt

| Token | Wartość |
| --- | --- |
| `--s1 … --s9` | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px |
| `--gutter` | 48 px desktop, 16 px ≤ 760 px |

Zastosowanie:
- 64 px (`--s8`) nad każdą sekcją;
- 32 px (`--s6`) wewnątrz paneli i pulpitu;
- 24 px (`--s5`) w wierszu listy;
- 16 px (`--s4`) w pionie par klucz–wartość, spec i kroków.

Promień 0, bez cieni. Progi szerokości ekranu to 760 px (lista, filtry, pulpit) i 860 px (układ szczegółu). [Potwierdzone]

## 6. Kompozycja stron

Zanim zaczniesz, ustal, jaką decyzję użytkownik podejmuje na ekranie, i przypisz do niej punkty kontrastu.

| Typ ekranu | Struktura od góry | Punkty kontrastu | Przykład |
| --- | --- | --- | --- |
| **Lista (rekruter: kandydaci)** | `nav.topbar` → `header.console` (2–4 liczniki) → `.filters` → `.sec-head` → `.list` → `.actbar` po zaznaczeniu | pulpit · `.row.sl` (shortlista) · `.cta` w pasku akcji | `assets/candidate-list.html` |
| **Lista (kandydat: oferty)** | jak wyżej, bez paska akcji; `.save` w wierszu | pulpit (bez zieleni) · `.row.sl` (zapisane) · **bez `.cta`** [Decyzja] | `prototypes/kandydat-oferty.html` |
| **Lista (pracodawca: ogłoszenia)** | pulpit → `.filters` z `.choice` stanu → `.sec-head` z `.cta` „Dodaj ogłoszenie” → `.list` | pulpit · `.row.sl` („wymaga działania” + `.why`) · `.cta` | `prototypes/pracodawca-ogloszenia.html` |
| **Pulpit pracodawcy** | pulpit ze zdaniem o pilności → lista ogłoszeń → lista nowych zgłoszeń + `.fig` z wykresem | pulpit · `.row.sl` · `.cta` przy najpilniejszej czynności | `prototypes/pulpit-pracodawcy.html` |
| **Szczegół (ogłoszenie, profil)** | `nav.topbar` → `.detail`: `.d-head` · `.side` (karta faktów) · `.d-body` | tylko `.cta` w karcie, bez pulpitu | `prototypes/kandydat-oferta.html`, `assets/candidate-profile.html` |
| **Szczegół (pracodawca: własne ogłoszenie)** | jak szczegół; karta faktów pokazuje **wyniki** zamiast warunków | `.cta` „Przejrzyj zgłoszenia” | `prototypes/pracodawca-ogloszenie.html` |
| **Formularz** | `.note-err` (gdy błędy) → grupy w `.panel` z `.t-sec` → `.actbar` z `.cta` | `.cta` + błędy (stan warunkowy) | `assets/job-form.html` |

Które akcje są pomarańczowe [Decyzja]:
- **„Aplikuj” na stronie oferty to zawsze `.cta`.**
- **„Powiadamiaj o nowych” na liście ofert to `.cta2`.**
- **O kolorze decyduje główna czynność ekranu, a nie nazwa akcji.** Ta sama akcja („Dodaj ogłoszenie”) jest `.cta` na liście ogłoszeń i `.cta2` na pulpicie, gdzie główne jest „Przejrzyj zgłoszenia”.

Mobile (≤ 760 px):
- **Pulpit:** widać 2 pierwsze liczniki, więc ustaw je w HTML według ważności i trzymaj podpisy do ~16 znaków.
- **Filtry:** przewijają się poziomo.
- **Wiersz listy:** zamienia się w kartę w trzech pasmach, a liczby dostają podpis przez `data-label`.
- **Szczegół (≤ 860 px):** kolejność to nagłówek → karta faktów → treść.
- **Bez przewijania poziomego strony.**

## 7. Komponenty — API klas

Struktura HTML jest wymagana tam, gdzie podano. Pełne karty (anatomia, warianty, tokeny, dostępność) są w `docs/design-system/komponenty.html` w projekcie źródłowym.

### C01 Nawigacja globalna
```html
<nav class="topbar" aria-label="Główna">
  <a class="wordmark" href="/">DoRoboty<b>.ai</b></a>
  <ul class="nav"><li><a href="…" aria-current="page">Oferty</a></li><li><a href="…">Zapisane (2)</a></li></ul>
  <div class="acct"><span>Zofia Łęcka</span><span class="logo" aria-hidden="true">ZŁ</span></div>
</nav>
```
- Jasna i półprzezroczysta, nie jest punktem kontrastu.
- Menu jest osobne dla roli:
  - kandydat: Oferty / Zapisane / Moje aplikacje / Profil;
  - pracodawca: Pulpit / Ogłoszenia / Kandydaci / Firma.

### C02 Pulpit
```html
<header class="console">
  <div class="c-head"><span>DoRoboty / Wektor Labs / Pulpit</span><span class="c-live">● na żywo</span></div>
  <h1 class="c-title">7 osób czeka na odpowiedź dłużej niż 48 h.</h1>
  <div class="c-stats">
    <div class="c-stat"><b>07</b><small>Czekają &gt; 48 h</small></div>
    <div class="c-stat"><b class="sig">47</b><small>Dostępni od zaraz</small></div>
  </div>
</header>
```
- 2–4 liczniki. `.sig` (zielony) tylko dla „dostępni”.
- Tytuł odpowiada na pytanie ekranu.
- Linia horyzontu dodaje się sama.

### C03 Przyciski
| Klasa | Kiedy | Uwagi |
| --- | --- | --- |
| `.cta` | jedyna akcja główna widoczna na ekranie | pomarańcz, ciemny tekst, komórka „→” |
| `.cta2` | akcja druga, przełącznik | jasne tło; `aria-pressed="false/true"` zmienia znak w komórce na „+”/„✓” |
| `.tx` | akcja poboczna lub niszcząca (z potwierdzeniem) | podkreślony tekst |
| `.wide` | karta faktów | 100% szerokości; kolejne `.wide` sklejają się jak wiersze |
| `.ext` | link poza DoRoboty | komórka „↗” |

- Przycisk zawsze jako `<button>` (albo `<a>` przy nawigacji).
- Etykieta to czasownik ze skutkiem: „Zaproś 2 osoby do rozmowy”.
- Liczebniki odmieniaj: 1 osobę / 2–4 osoby / 5+ osób.

### C04 Filtry i wybór
```html
<div class="filters">
  <button class="fpill" type="button" aria-haspopup="listbox">Segment ▾</button>
  <button class="fpill" type="button" aria-pressed="true">Zdalnie ✕</button>
  <label class="fsearch"><input type="search" placeholder="Szukaj: stanowisko, firma" aria-label="Szukaj"><kbd>/</kbd></label>
  <span class="count">47 z 214</span>
</div>
<fieldset class="choice" aria-label="Stan"><label><input type="radio" name="st" checked>Aktywne (4)</label>…</fieldset>
```
- Komórki są sklejone w jeden pasek, a aktywna jest wypełniona `--ink`.
- Aktywny filtr pokazuje wartość i „✕”.
- Klawisz „/” przenosi fokus do wyszukiwania.
- Lista rozwijana pod „▾” nie jest zaprojektowana. [Otwarte]

### C05 Lista-tabela
```html
<div class="list" style="--cols:18px 44px minmax(240px,1fr) 90px 130px 140px 110px 16px; --areas:'chk nr who seg rate stat upd go'">
  <div class="thead" aria-hidden="true"><span></span><span>Nr</span><span>Kandydat</span>…</div>
  <div class="row sl">
    <input class="chk" type="checkbox" checked aria-label="Shortlista: Agnieszka Wróblewska">
    <span class="nr">0142</span>
    <div class="who"><a class="t-name" href="…">Agnieszka Wróblewska</a><span class="t-meta">ML Engineer · Kraków</span><span class="t-label why">Na shortliście</span></div>
    <span class="seg">▲ Build</span><span class="t-data rate">180 zł/h</span>
    <span class="stat"><span class="badge ok">● Od zaraz</span></span><span class="t-data upd">2 h</span><span class="go" aria-hidden="true">›</span>
  </div>
</div>
```
- Dzieci wiersza to `.chk .nr .who .seg .rate .stat .upd .go`. Każde można pominąć, a własne kolumny dodajesz przez `--cols` / `--areas` / `--areas-m` i `grid-area`.
- **`.sl` zawsze z `.why`.** Jedno znaczenie ciemnego wiersza na ekran, opisane zdaniem nad listą.
- Brak wartości zapisujesz jako „—”.
- Liczby na mobile mają `data-label="Nowe:"`.
- `.list.compact` daje wiersz 52 px bez linii meta, gdy trzeba porównać wiele osób.

### C06 Plakietka statusu
`<span class="badge ok">● Od zaraz</span>` · `.badge` (od daty, „Aktywne”) · `.badge.warn` (w toku: obrys `--ink`) · `.badge.off` (niedostępny, szkic, zakończone).
- Zielona jest tylko plakietka `.ok`.
- Plakietka oznacza stan, który się zmienia.

### C07 Chip i tag
- `<div class="chips"><span class="chip">Kraków / hybryda</span>…</div>` to stały fakt.
- `<span class="tag">Fig. 1 — …</span>` to podpis albo identyfikator.

Oba są nieklikalne i nie mają komórki strzałki.

### C08 Segment
`<span class="seg">▲ Build</span>` · `● Apply` · `■ Lead`.
- Segment oznacza kształt, nigdy kolor.
- Znak zawsze z nazwą.

### C09 Logo / inicjały
`<span class="logo" aria-hidden="true">W</span>`: kwadrat 32 px z obrysem. Nazwa firmy zawsze stoi obok, w tekście.

### C10 Zapisz
`<button class="save" type="button" aria-pressed="false" aria-label="Zapisz: {tytuł}">☆</button>`. Zapisanie przełącza wiersz w `.sl` z `.why` „Zapisana”.

### C11 Ramki
| Klasa | Rola |
| --- | --- |
| `.frame` | ogólna ramka |
| `.side` | karta faktów, przyklejona na desktopie |
| `.panel` | grupa treści (np. pola formularza) |
| `.fig` | wykres z `figcaption`: „Fig. N — temat” + jedno zdanie wniosku |
| `.cap` | nagłówek ramki |
| `.empty` | ramka przerywana stanu pustego |

### C12 Fakty
- `<dl class="kv">`: krótkie fakty decyzyjne w karcie, 4–6 pozycji, wartość do prawej.
- `<dl class="spec">`: dłuższe fakty w treści, klucz w kolumnie 200 px.

Liczby w wartościach zapisuj jako `.t-data`.

### C13 Kroki
`<ol class="steps-list"><li><span class="n">01</span><span>Rozmowa</span><span class="t-data">30 min</span></li>…</ol>`

### C14 Nagłówek sekcji
`<div class="sec-head"><div><h2 class="t-sec">…</h2><p class="t-meta">…</p></div><button class="cta2">…</button></div>`. Na mobile `.cta` zajmuje 100% szerokości.

### C15 Stan pusty
`<div class="empty"><span class="t-label">0 wyników</span><p>Najbardziej zawęża filtr „…”.</p><button class="tx">Wyczyść filtry</button></div>`
- Bez ilustracji i bez pomarańczu.
- Komponent nie występuje na żadnym ekranie. [Rekomendacja]

### C16 Pasek akcji
`<div class="actbar" hidden>` z `.t-label` („2 zaznaczone”), `.tx` i jedną `.cta`.
- Na liście jest ukryty przy 0 zaznaczonych.
- W formularzu stoi stale („Szkic zapisany 14:32”).

### C17 Pole formularza
```html
<div class="field err">
  <label for="t">Tytuł stanowiska</label>
  <input id="t" aria-invalid="true" aria-describedby="t-h">
  <span class="hint" id="t-h">Wpisz tytuł, np. „Senior ML Engineer, LLM”.</span>
</div>
<div class="note-err" role="alert"><b>2 pola wymagają poprawy:</b> <a href="#t">tytuł stanowiska</a>, …</div>
```
- Wartość pola ma 16 px.
- Liczby w polach piszesz krojem mono.
- Błąd zawsze ma ramkę, „!” i tekst z sugestią poprawy.

### Układ szczegółu
```html
<main class="detail">
  <header class="d-head"><a class="back" href="…">‹ Oferty: zdalnie (312)</a><div class="t-label">▲ Build · Oferta nr 0042</div>
    <h1 class="t-h1">…</h1><p class="lead">…</p><div class="chips">…</div></header>
  <aside class="side"><dl class="kv">…</dl><button class="cta wide">Aplikuj profilem DoRoboty</button><button class="cta2 wide" aria-pressed="false">Zapisz ofertę</button></aside>
  <article class="d-body"><h2 class="t-sec">Co będziesz robić</h2>…</article>
</main>
```

## 8. Dostępność (cel: WCAG 2.2 AA [Rekomendacja])

Wymagania stosowane w komponentach:
- **Fokus:** widoczny obrys 2 px `--ink`, na ciemnym `--signal`. Przyklejony `.actbar` ani `.side` nie mogą go zasłaniać (2.4.7, 2.4.11).
- **Kolor nigdy nie jest jedynym sygnałem:** `.sl` ma `.why`, aktywny filtr ma „✕”, błąd ma „!” i tekst (1.4.1).
- **Przełączniki** mają `aria-pressed`, wybór jednej opcji to radio w `fieldset`, a pola mają `<label for>` i `aria-describedby` do podpowiedzi lub błędu (4.1.2, 3.3.1, 3.3.2).
- **Cele dotykowe:** przycisk ma 48 px wysokości, gwiazdka 36 px (2.5.8).
- **Reflow do 320 px bez przewijania strony w bok** (1.4.10).
- **Zmiany liczby wyników i zaznaczeń** ogłaszaj przez `aria-live="polite"` (4.1.3).

Sam wygląd nie dowodzi zgodności. Czytnik ekranu, klawiaturę i powiększenie trzeba sprawdzić na wdrożeniu.

## 9. Jak rozszerzać system

- **Najpierw szukaj istniejącej klasy** i jej wariantu. Nowy komponent buduj z istniejących części: ramka, `.cap`, etykieta 11 px, `.t-data`, przycisk z komórką.
- **Nowe wartości tylko ze skali tokenów.** Nowy kolor wymaga decyzji, bo budżet kontrastu jest zamknięty.
- **Wykresy w konwencji Oxide:**
  - linie 1 px;
  - etykiety osi krojem mono;
  - jedna seria kluczowa w `--ink`, reszta w `--chip`;
  - zawsze w `.fig` z podpisem-wnioskiem;
  - zieleń tylko dla serii „dostępni”.
- **Nowy typ ekranu:** ustal decyzję ekranu, wybierz 1–3 punkty kontrastu i dopisz przepis do `references/screen-recipes.md`.
- **Nowe klasy dopisuj do `instrument.css` pod `.ins`**, z komentarzem o roli i statusie: „ekstrapolacja” albo „decyzja”.

## 10. Sprawdzenie przed oddaniem

Wyrenderuj ekran przy 1440 i 390 px i obejrzyj zapisany obraz:
1. Najwyżej 3 punkty kontrastu i jedna pomarańczowa `.cta` widoczna naraz.
2. Każdy zielony element znaczy „dostępny”, a każdy pomarańczowy jest przyciskiem akcji głównej.
3. Każdy ciemny wiersz ma `.why`.
4. Liczby, daty i stawki są w DM Mono. Etykiety są w Departure Mono 11 px. DM Mono 500 występuje tylko w tytułach.
5. Nie ma zaokrągleń ani cieni, a każdy przycisk ma komórkę strzałki.
6. Odstępy pochodzą tylko ze skali `--s*` i `--gutter`.
7. Długie nazwiska („Ewa Szczepańska-Bąk”), braki danych („—”) i odmiana liczebników 1 / 2 / 5 są poprawne.
8. Nie ma przewijania poziomego strony, a karta faktów na mobile stoi nad treścią.
9. Fokus jest widoczny klawiaturą.
10. Samodzielny plik HTML ma wklejony CSS (`id="instrument-css"`) i favicon (`id="ins-favicon"`).

## 11. Otwarte kwestie

1. **Checkbox zaznaczenia** ma zielony akcent (`accent-color: --signal`). To łamie zasadę 4 i ma 1,8:1 na białym. Propozycja: `--ink`.
2. **Akcja główna listy ofert kandydata** jest nieustalona [Decyzja: na razie brak `.cta`].
3. **Klikalny wiersz:** cały `<a class="row">` czy tylko link w nazwie? Dziś są oba wzorce.
4. **Semantyka listy:** `<table>` czy role ARIA na siatce divów.
5. **Lista rozwijana filtrów** nie jest zaprojektowana.
6. **Nazwy segmentów:** po polsku czy po angielsku? Rodzaj gramatyczny w plakietkach (np. „Niedostępna”).
7. **Logo:** brak logo marki (wordmark jest tekstowy) i obsługi prawdziwych logo firm.
8. **Stany bez wzoru:** ładowanie przycisku, potwierdzenie akcji niszczącej, toast po zapisaniu.
9. **Wykresy i postęp formularza („Krok 1 / 3”)** są dziś stylami lokalnymi stron. Czy mają zostać komponentami?

## 12. Pliki i odsyłacze

W skillu (`.claude/skills/doroboty-instrument-ui/`):

| Plik | Co zawiera |
| --- | --- |
| `assets/instrument.css` | fundament: tokeny i wszystkie komponenty |
| `assets/fonts/` | Departure Mono + licencja OFL |
| `assets/favicon.svg` | favicon |
| `assets/candidate-list.html`, `candidate-profile.html`, `job-form.html` | działające wzorce stron |
| `scripts/inline_css.py` | wklejanie CSS, fontu i faviconu do samodzielnych stron |
| `references/visual-system.md` | pochodzenie tokenów, pełne tabele kontrastu |
| `references/screen-recipes.md` | przepisy ekranów, bramki przeglądu |
| `references/screenshots/` | zrzuty źródeł referencyjnych (Nothing, Oxide, Teenage Engineering) |

W projekcie źródłowym DoRoboty (nie przenoszą się razem ze skillem):
- `docs/design-system/komponenty.html`: dokumentacja dla designerów v4 z żywymi renderami (zaakceptowana).
- `prototypes/*.html`: ekrany obu ról.
- `research/visual-direction/`: moodboard i studium kierunku.
