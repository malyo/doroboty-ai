# System „Instrument”: tokeny, typografia, pochodzenie

Status każdej wartości: **Zmierzone** (getComputedStyle na stronie źródłowej), **Obserwowane** (widoczne na zrzucie), **Propozycja** (decyzja ze studium). To kierunek zaproponowany w studium, a nie zatwierdzona marka. Pełne uzasadnienia są w `research/visual-direction/direction-study.html`.

## Skąd to jest

Wybrany zestaw to kierunek B + C z moodboardu:
- **B, kontrast punktowy:** Nothing (strona kariery) i Teenage Engineering (listy downloads i guides).
- **C, retro-przyszłość:** Oxide (strona, indeks RFD, wydarzenia) i Stripe Press (gradient „niebo”, wzór przycisku z komórką strzałki).

B jest jasny, a C ciemny. Studium rozwiązało ten konflikt tak: **ciemność to sygnał, a nie tło**.

## Kolor

| Token | Wartość | Rola | Status | Źródło |
| --- | --- | --- | --- | --- |
| `--paper` | #f2f2f2 | tło strony | Zmierzone | Nothing, tło listy ról |
| `--surface` | #fcfcfc | wiersz, karta, panel | Zmierzone | Nothing, tło wiersza |
| `--ink` | #1c1c1c | tekst, jedyna akcja główna | Zmierzone | Nothing, pigułka „Apply for this role” |
| `--mute` | #555555 | meta, etykiety | Propozycja | Nothing ma #777 (4,37:1); #6b6b6b nie spełniał AA na gradiencie „niebo” (4,4:1), który jest tłem każdej strony |
| `--chip` | #e3e3e3 | filtry, chipy, linie | Zmierzone | Nothing, chipy i select |
| `--line-strong` | #c9c9c9 | obrys pól, hover wiersza | Propozycja | — |
| `--console` | #0b0e12 | pulpit, wiersz wybrany | Zmierzone | Oxide `oklch(0.162 0.01 260)`, TE wiersz OP-XY `rgb(15,14,18)` |
| `--console-ink` | #dedede | tekst na pulpicie | Zmierzone | Oxide `oklch(0.9 0.0001 260)` |
| `--console-mute` | #a3a4a5 | meta na pulpicie | Zmierzone | Oxide `oklch(0.717 0.0021 260)` |
| `--signal` | #00d892 | „dostępny”, tylko na ciemnym | Zmierzone | Oxide `oklch(0.77 0.1919 163.7)` |
| `--signal-ink` | #00503a | „dostępny” na jasnym | Zmierzone | TE, wiersz EP-40 `rgb(0,80,58)` |
| `--signal-tint` | #dcf3ea | tło plakietki „dostępny” | Propozycja | — |
| `--sky` | gradient 180°: #efe7ec → #e3e9ec | tło każdej strony (ustawione na `.ins`) | Propozycja na bazie zmierzonego | Stripe Press (The Dream Machine, 2026-11-09) ma 5 przystanków #e7d4e5 → #cad9e5 → #eeebcc → #e9d8e3 → #dbd4ed. Wzięte są dwa pierwsze i rozjaśnione w 60% ku #f4f3f1, żeby gradient był liniowy i cichy. |
| `--sky-line` | #e7d4e5 → #cad9e5 (poziomo) | linia horyzontu pod pulpitem | Zmierzone | j.w., pełna intensywność, bo to tylko 3 px |
| `--frame` | #8a8a8a | ramka zewnętrzna wszystkich pojemników, przycisków, pól, plakietek | Propozycja | 3,4:1 do `--surface` (WCAG 1.4.11 ≥ 3:1). Inspiracja: szkic C z moodboardu i karty specyfikacji Oxide |
| `--rule` | #d9d9d9 | linie wewnątrz ramek | Propozycja | — |
| `--action` | #ff5a1f | tło jedynej akcji głównej `.cta` | Szacowane | Teenage Engineering, akcent pomarańczowy (moodboard B1, odczyt wizualny). Dodane na prośbę o kolor primary. |
| `--action-hover` | #ff7a45 | hover `.cta` | Propozycja | — |
| `--action-press` | #e8540f | wciśnięcie `.cta` | Propozycja | — |
| `--alert` | #9f1239 | wyłącznie błędy, zawsze z „!” | Propozycja | Brak w źródłach. Karmazyn zamiast czerwieni #b42318, żeby nie mylił się z pomarańczem akcji. |

### Kontrast (WCAG 2.x, policzony)

| Para | Kontrast | Wynik |
| --- | --- | --- |
| ink / surface | 16,6:1 | AA |
| mute (#555) / surface | 7,3:1 | AA |
| mute (#555) / paper | 6,7:1 | AA |
| console-ink / console | 14,4:1 | AA |
| signal / console | 10,4:1 | AA |
| signal-ink / signal-tint | 8,2:1 | AA |
| biały / ink | 17,0:1 | AA |
| console-mute / console | 7,8:1 | AA |
| signal / signal-deep (plakietka na ciemnym) | 6,7:1 | AA |
| ink / action (tekst przycisku) | 5,5:1 | AA |
| ink / action-press | 4,6:1 | AA |
| action / console (przycisk na ciemnym) | 6,2:1 | widoczny |
| alert / surface | 7,8:1 | AA |
| --mute (#6b6b6b) / sky | 4,35–4,4:1 | **nie**: na gradiencie `--mute` = #555 |
| #555 / sky | ≈ 6,1:1 | AA |
| ink / sky | 11,8–14,1:1 | AA |
| **biały / action** | **3,1:1** | **zakazane**: biały tekst na pomarańczu nie przechodzi AA dla 14 px |
| **action / paper (pomarańczowy tekst)** | **2,8:1** | **zakazane**: pomarańcz nigdy nie jest kolorem tekstu |
| **signal / surface** | **1,8:1** | **zakazane**: jasna zieleń na jasnym tle jest nieczytelna |

Nie zmieniaj wartości tokenów dla pojedynczego ekranu. Jeśli para nie przechodzi AA, zmień tło, a nie kolor tekstu.

## Typografia

Kroje wybrał użytkownik (2026-11-09): **DM Mono** do tytułów („muszą mieć większy kontrast”; wcześniej był Science Gothic, ale lekki i poszerzony był za słaby) oraz **Nunito Sans** do tekstu. Potem, również decyzją użytkownika, DM Mono zastąpił Geist Mono w danych i etykietach, więc system ma jeden krój mono. Oba kroje są z Google Fonts (SIL OFL) i mają latin-ext, więc polskie znaki są poprawne. DM Mono ma tylko 300 / 400 / 500. Doto zostaje do liczników. Na końcu, też decyzją użytkownika („typowo kodowy font do labeli”), etykiety 11 px dostały **Departure Mono** (Helena Zhang, SIL OFL 1.1, v1.500), pikselowy krój terminalowy. Plik jest w `assets/fonts/` razem z licencją, a `scripts/inline_css.py` wkleja go do strony jako data: URI. Wybrany z porównania z Space Mono, VT323 i Share Tech Mono, bo jest najbardziej „kodowy” przy 11 px i ostry w siatce pikseli.

Link: `https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Doto:wght@700&display=swap`

| Klasa | Krój | Parametry | Użycie |
| --- | --- | --- | --- |
| `.t-h1` | DM Mono | 500, 52 px / 1.05, −0.04em, `--ink` (mobile 32 px) | imię w profilu, tytuł ogłoszenia, H1 strony |
| `.t-sec` | DM Mono | 500, 28 px, −0.03em, `--ink` (mobile 22 px) | nagłówki sekcji |
| `.c-title` | DM Mono | 500, 34 px, −0.035em, biały, maks. 44 znaki (mobile 23 px) | zdanie w pulpicie |
| `.t-name` | Nunito Sans | 650, 18 px | imię lub tytuł w wierszu listy |
| `.t-body` | Nunito Sans | 400, 16 px / 1.6, maks. 68 znaków | treść opisów |
| `.t-meta` | Nunito Sans | 400, 14 px, `--mute` | rola · miasto · forma |
| `.t-label` (i `.thead`, `.badge`, `.chip`, `.seg`, `.nr`, `.tag`, `.cap`, `.kv dt`, `.spec dt`, `.field>label`) | Departure Mono | 11/400, wersaliki, `letter-spacing:1px` (całe piksele) | nagłówki kolumn, etykiety, NR, FIG. (parametr z Nothing: 11 px +0.825 px) |
| `.t-data` | DM Mono | 14/400, cyfry tabelaryczne | stawki, daty, liczby |
| `.c-stat b` | Doto | 48/700 | wyłącznie liczniki pulpitu (zastępstwo Ndot z Nothing) |

Zasady:
- **Departure Mono tylko 11 px**, jedna grubość, wersaliki, odstęp 1 px. Inne rozmiary rozmywają piksele.
- **Jeden krój mono, dwie role.** Tytuły to DM Mono duże (22–52 px), 500, w pełnej czerni i zwykłą wielkością liter. Dane to DM Mono 14 px. Kontrast z etykietami (też mono, ale 11 px, wersaliki, szare) robi rozmiar, grubość i kolor.
- **DM Mono nigdy w wierszach listy, przyciskach, plakietkach ani polach.** Krój o stałej szerokości zjada miejsce.
- **Długie tytuły:** mono jest szerokie, więc przy H1 dłuższym niż ~28 znaków dopuszczalne są 2 linie. Nie zmniejszaj rozmiaru poniżej 40 px na desktopie.
- **Doto nigdy nie służy do tekstu.**

## Odstępy

Strona ma oddychać, ale dane w ramkach zostają zwarte. Skala `--s1`–`--s9` to 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px, a `--gutter` (margines strony) wynosi 48 px na desktopie i 16 px na mobile.

| Gdzie | Odstęp |
| --- | --- |
| Margines strony | `--gutter` |
| Nad nagłówkiem sekcji (`.t-sec`, `.sec-head`) | `--s8` (64 px), mobile `--s7` |
| Wnętrze pulpitu | `--s6` / `--s7` (32 / 48 px), komórka licznika `--s5` |
| Wnętrze ramek (`.side`, `.panel`, `.fig`) | `--s6` (32 px), mobile `--s5` |
| Wiersz listy | padding `--s5` (24 px), min. 80 px, odstęp kolumn `--s5` |
| Pary klucz–wartość, spec, kroki | `--s4` (16 px) w pionie |
| Szczegół: kolumna treści ↔ karta faktów | `--s8` (64 px) |

Nie dopisuj odstępów spoza skali. Jeśli coś jest za ciasno albo za luźno, zmień krok skali, a nie wartość w jednym miejscu.

## Kształt: ramki

Wszystko jest prostokątne (promień 0) i obrysowane linią 1 px. Charakter jest tabelaryczny i bauhausowy, a „designerskość” robi typografia (DM Mono w tytułach, mono w danych) i proporcje.

| Element | Kształt | Znaczenie |
| --- | --- | --- |
| Pojemniki: `.frame`, `.side`, `.panel`, `.fig`, `.empty` (przerywana) | ramka `--frame`, wnętrze `--surface` | grupa treści |
| `.cap` | pasek u góry ramki, etykieta mono, linia pod spodem | nazwa ramki („Fakty”, „Fig. 1”, „Nr 0042”) |
| Lista | tabela w ramce: `.thead` w ramce, wiersze dzielone `--rule` | porównywanie pozycji |
| `.cta`, `.cta2` | ramka `--ink` + komórka strzałki „→” | **da się kliknąć**. Wzór: lista zakupu Stripe Press (ramka, tekst, komórka ze strzałką) |
| `.fpill`, `.choice` | komórki sklejone w pasek, aktywna wypełniona `--ink` | filtr / wybór |
| `.badge`, `.chip`, `.tag`, `.logo`, `.save` | mały prostokąt z obrysem | dane, stan, identyfikator |

Komórka strzałki odróżnia przycisk od ramki z danymi. Przełączniki (zapisz, shortlista) pokazują w niej „+” albo „✓”, a linki zewnętrzne „↗”.

## Oznaczenia segmentów

Build ▲ · Apply ● · Lead ■, mono 11 px wersalikami. Segmenty oznacza kształt, a nie kolor, bo kolor jest zarezerwowany dla dostępności. Kształt jest też czytelny w skali szarości i przy daltonizmie. Przy pierwszym użyciu na ekranie (filtr segmentu) pokaż legendę.

## Stany dostępności kandydata

| Stan | Klasa | Wygląd |
| --- | --- | --- |
| Dostępny od zaraz | `.badge.ok` | jedyny zielony |
| Dostępny od daty | `.badge` | neutralna szara, data mono („Od 01.12”) |
| W toku (rozmowy, weryfikacja) | `.badge.warn` | obrys 1 px `--ink` |
| Niedostępny, zamknięty | `.badge.off` | obrys `--chip`, tekst `--mute` |

## Nie badano

Hover, focus, animacje, nawigacja klawiaturą, formularze, puste stany i błędy nie występowały w badanych ekranach albo nie były sprawdzane. Ich wygląd w `assets/instrument.css` to propozycja wywiedziona z zasad. Gdy je projektujesz, mów o tym wprost.

## Favicon

`assets/favicon.svg`: czarny kwadrat `--ink` (#1c1c1c), kąty proste jak cały system, w środku pomarańczowa kropka `--action` (#ff5a1f, promień 7,5 z 32, czytelna też przy 16 px). To znak marki, a nie element interfejsu, więc pomarańcz nie łamie tu zasady „pomarańcz = akcja”. Wkleja go `scripts/inline_css.py` jako data: URI. Do czasu prawdziwego logo jest roboczym znakiem DoRoboty.

## Pomarańcz akcji a ostrzeżenia

Pomarańczowy łatwo czytać jako „uwaga”. System chroni się przed tym na cztery sposoby:
1. **Pomarańcz pojawia się tylko jako wypełnienie przycisku z czasownikiem i komórką strzałki.** Nie ma go w tekście, ikonach, plakietkach, obrysach ani wykresach. Ramka ze strzałką plus czasownik czyta się jako przycisk, a nie jako komunikat.
2. **Ostrzeżenia w systemie nie mają koloru.** Stan „w toku” to obrys (`.badge.warn`), a pilność to ciemny wiersz z powodem (`.why`). Nie dodawaj żółtych ani bursztynowych plakietek ostrzegawczych.
3. **Błąd jest karmazynowy (#9f1239), nie czerwono-pomarańczowy, i zawsze ma ikonę „!” oraz tekst.** Kolor nigdy nie jest jedynym nośnikiem błędu.
4. **Tekst na przycisku jest ciemny (`--ink`), jak na przyciskach Teenage Engineering.** Biały tekst na tym pomarańczu nie przechodzi AA.
