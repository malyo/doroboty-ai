# Przepisy ekranów i bramki przeglądu

Każdy przepis mówi, gdzie leżą **trzy punkty kontrastu**. Najpierw ustal, jaką decyzję użytkownik podejmuje na ekranie. Punkty kontrastu dostają tylko rzeczy, które tej decyzji służą.

## 1. Lista kandydatów (rekruter) — wzorzec: `assets/candidate-list.html`

- **Pulpit** (`header.console`): ścieżka i ogłoszenie mono, tytuł DM Mono (`.c-title`), 2–4 liczniki Doto. Zielony dostaje tylko licznik dostępnych.
- **Filtry** (`.filters`): komórki sklejone w pasek (selecty), aktywny filtr odwrócony z „✕”, pole filtra z wypisanym `/`, licznik „47 z 214” mono.
- **Nagłówki kolumn** (`.thead`): `.t-label`. Sortowana kolumna ma strzałkę ↓.
- **Wiersz** (`.row`) w stałej kolejności: zaznaczenie · NR · imię + meta · segment · stawka · dostępność · aktualizacja · ›.
  - NR jest mały i szary, bo ludzie nie są pozycjami w katalogu.
  - Brak stawki pokazuj jako „—”, a nie pustą komórkę.
- **Shortlista**: `.row.sl` (wiersz odwrócony). Zaznaczenie checkboxa przełącza klasę, licznik w pulpicie i pasek akcji.
- **Pasek akcji** (`.actbar`): przyklejony u dołu i ukryty, gdy nic nie jest zaznaczone. Zawiera jedyną `.cta` na ekranie, z poprawną odmianą („Zaproś 1 osobę / 2 osoby / 5 osób”).
- **Gęstość**: wiersz ma ok. 80 px (padding `--s5`), więc pod pulpitem i filtrami mieści się ok. 5–6 osób na ekranie 900 px. To świadomy wybór „więcej powietrza”. Gdy rekruter potrzebuje porównać więcej osób naraz, dodaj tryb kompaktowy (`.list.compact`: wiersz 52 px, bez linii meta, padding `--s3`) i pozwól go przełączyć.
- **Kontrast**: pulpit · wiersze `.sl` · `.cta` w pasku.

## 2. Lista ogłoszeń (kandydat) albo lista ogłoszeń firmy (pracodawca)

- Ta sama anatomia co w punkcie 1. Kolumny zmieniaj przez `--cols` i `--areas`, na przykład: tytuł + firma · segment · widełki · forma · lokalizacja · data.
- **Pulpit kandydata**: liczniki typu „nowe od ostatniej wizyty”, „pasujące do profilu”.
- **Pulpit pracodawcy**: „aktywne ogłoszenia”, „nowe zgłoszenia / 24 h”, „do przejrzenia”.
- Stan ogłoszenia mapuj na plakietki: aktywne `.badge` (stan normalny, bez zieleni, bo zielony znaczy tylko „kandydat dostępny”), szkic `.badge.off`, w weryfikacji `.badge.warn`, wygasłe `.badge.off` z datą.
- **Wiersz odwrócony** oznacza tu „zapisane” (kandydat) albo „wymaga działania” (pracodawca). Wybierz jedno znaczenie na ekran. Pod meta dodaj linię `.t-label.why` z powodem („Wygasa za 3 dni · 2 osoby czekają > 48 h”), bo kolor nie może być jedynym nośnikiem znaczenia. Nad listą wyjaśnij w jednym zdaniu, co znaczy ciemny wiersz.
- Logo firmy: małe (24–32 px), w szarym kwadracie, z inicjałem jako zastępstwem. Nigdy nie jest nośnikiem kontrastu.

## Rola · Kandydat: lista ofert — przykład: `prototypes/kandydat-oferty.html`

- **Decyzja**: „które oferty warto otworzyć?”.
- **Pulpit**: dopasowanie i skala rynku („Pasuje do profilu”, „Nowe od wczoraj”, „Z widełkami 92%”). **Bez zieleni**, bo nic tu nie znaczy „kandydat dostępny”.
- **Wiersz**: logo (`.logo`, inicjał) · stanowisko + firma · miasto · segment · widełki mono z formą (B2B / UoP) · tryb jako `.chip` · dodano · `.save` (☆/★).
- **Wiersz odwrócony** = oferta zapisana, z powodem w `.why` („Zapisana · wygasa za 4 dni”). Gwiazdka przełącza `.sl` od razu.
- **Akcja główna listy ofert jest nieustalona** (decyzja użytkownika, 2026-11-09). „Powiadamiaj o nowych z tymi filtrami” to `.cta2` w `.sec-head`, a nie akcja główna. Bez pewnej akcji głównej lista nie ma pomarańczowego przycisku; punktami kontrastu są pulpit i zapisane wiersze. **Pewne jest „Aplikuj” na stronie oferty jako `.cta`.**
- Brak widełek pokazuj jako „—”. Nie ukrywaj go, bo to ważna informacja dla kandydata.

## Rola · Kandydat: strona ogłoszenia — przykład: `prototypes/kandydat-oferta.html`

- Anatomia szczegółu (przepis 3).
- **Karta faktów**: widełki, forma, tryb, start, ważna do. Pod nią `.cta` „Aplikuj” i `.cta2` „Zapisz”. Pod przyciskami jedno zdanie o tym, co zobaczy firma i jak szybko odpowiada.
- **Treść**:
  - „Co będziesz robić” (lista);
  - „Wymagania” jako `.spec` (Konieczne / Mile widziane / Stack / Zespół);
  - „Proces rekrutacji” jako `.steps-list` z czasem każdego etapu mono;
  - „O firmie” z małym `.logo`.

## Rola · Pracodawca: własne ogłoszenie — przykład: `prototypes/pracodawca-ogloszenie.html`

- To samo ogłoszenie co 3a, ale **karta faktów pokazuje wyniki, a nie warunki**: zgłoszenia, nowe / 24 h, do przejrzenia, dostępni od zaraz (jedyna zieleń), wygasa.
- **Akcje**:
  - `.cta` „Przejrzyj zgłoszenia (N)”;
  - `.cta2` „Edytuj”;
  - `.tx` „Przedłuż”, „Zakończ rekrutację”.
- **Pilność** pokazuj jako `.t-label.why-head` pod chipami, a nie jako drugi ciemny blok.
- **Treść**:
  - lejek jako poziome słupki (`Fig. 1`; seria kluczowa w `--ink`, reszta w `--chip`);
  - „Najdłużej czekają” jako krótka lista;
  - podgląd ogłoszenia w ramce przerywanej z linkiem do widoku kandydata.

## Rola · Pracodawca: ogłoszenia firmy — przykład: `prototypes/pracodawca-ogloszenia.html`

- Jak przepis 2. Filtr stanu jako `fieldset.choice` z liczbami („Aktywne (4)”).
- **Jedyna `.cta`**: „Dodaj ogłoszenie”. Na pulpicie pracodawcy ta sama akcja jest `.cta2`, bo tam pomarańczowa jest „Przejrzyj zgłoszenia”. **O tym, co jest pomarańczowe, decyduje główna czynność danego ekranu**, a nie stała lista.
- Kolumna „Dostępni” to liczba z zielonym ● (`--signal-ink`, na `.sl` `--signal`).

## Nawigacja globalna (ekstrapolacja)

- `nav.topbar`: jasna, cicha, nie jest punktem kontrastu.
- Wordmark mono wersalikami.
- Bieżąca pozycja: `aria-current="page"` (tekst `--ink` + kreska 2 px).
- Konto po prawej z inicjałami w `.logo`.
- Kandydat i pracodawca mają osobne menu:
  - kandydat: Oferty / Zapisane / Moje aplikacje / Profil;
  - pracodawca: Pulpit / Ogłoszenia / Kandydaci / Firma.

## 3. Szczegół: profil kandydata albo ogłoszenie — wzorzec: `assets/candidate-profile.html`

- **Tło**: gradient „niebo” jest domyślnym tłem `.ins`, jak na każdej stronie. Karta faktów zostaje nieprzezroczysta.
- `.detail` z trzema dziećmi: `header.d-head`, `aside.side` (przyklejona karta faktów) i `article.d-body`. Na desktopie karta stoi obok, na mobile między nagłówkiem a treścią.
- **Nagłówek**:
  - `.t-label` z segmentem i NR;
  - H1 `.t-h1` (DM Mono 500), z pełnym imieniem i nazwiskiem albo pełnym tytułem;
  - `.lead`, czyli jedno zdanie;
  - `.chips` z faktami (miasto / tryb, forma, języki).
- **Treść**: sekcje z nagłówkiem `.t-sec` (DM Mono 500). Fakty techniczne podawaj jako `.spec` (etykieta mono → wartość), projekty jako `figure.fig` z podpisem „Fig. N — …”.
- **Karta faktów** (`.kv`): 4–6 pozycji, które decydują o kontakcie. Pod nimi jedyna `.cta` i ewentualnie `.cta2`.
- **Mobile**: kolejność to nagłówek → karta faktów → treść (jak w Nothing). Zapewniają ją obszary siatki w CSS.
- **Kontrast**: `.cta`, ewentualnie plakietka „od zaraz”. Pulpit tu zwykle nie występuje, bo strona ma tylko 1–2 punkty, i to jest w porządku.

## 4. Formularz: dodanie ogłoszenia, edycja profilu, ustawienia (ekstrapolacja)

- Tło `--paper`. Grupy pól w `.panel`, każda grupa z nagłówkiem `.t-sec` albo `.t-label`.
- **Pole** (`.field`):
  - etykieta mono wersalikami nad polem;
  - wartość w 16 px, żeby iOS nie przybliżał ekranu;
  - podpowiedź `.hint` pod polem.
- **Błąd**: `.field.err`, czyli `--alert` na obrysie i w podpowiedzi. Komunikat mówi, co poprawić. Nad formularzem `.note-err` z listą błędów i linkami do pól. To jedyne miejsce, gdzie występuje czerwień.
- **Wybór jednej z kilku opcji** (segment, tryb pracy) rób jako `fieldset.choice` (komórki sklejone w pasek). Natywne radio jest ukryte wizualnie, ale dostępne. Przy wielu opcjach użyj `select`.
- **Pola liczbowe** (widełki, stawka) pisz krojem mono (`font-family:var(--f-mono)` na `input`).
- **Akcja**: jedna `.cta` („Opublikuj ogłoszenie”) na końcu albo w przyklejonym pasku na długich formularzach. „Zapisz szkic” to `.cta2` albo `.tx`.
- **Postęp kilku kroków**: krok mono „Krok 2 / 4”, a nie kolorowy pasek.
- **Kontrast**: `.cta` · ewentualnie błędy (stan warunkowy, poza budżetem).

## 5. Pulpit pracodawcy, przegląd (ekstrapolacja)

Przykład wykonania: `prototypes/pulpit-pracodawcy.html` w repozytorium.

- **Decyzja ekranu**: „czym muszę się dziś zająć?”. Tytuł pulpitu może to powiedzieć wprost („7 osób czeka na odpowiedź dłużej niż 48 h”).
- **Punkty kontrastu**: pulpit · ogłoszenia „wymaga działania” jako wiersze `.sl` · jedna `.cta` przy najpilniejszej czynności (np. „Przejrzyj 18 nowych zgłoszeń”). „Dodaj ogłoszenie” to `.cta2` w `.sec-head`.

- Na górze duży `header.console` z 3–4 licznikami.
- Pod nim 1–3 krótkie listy wierszy (np. „Do przejrzenia dziś”, „Ogłoszenia wygasające w 7 dni”). Nie rób siatki kafelków z wykresami.
- Wykresy rysuj w konwencji Oxide: linie 1 px, etykiety osi mono, jedna seria w `--ink`, reszta w `--chip`. Zieleń tylko wtedy, gdy seria dosłownie oznacza „dostępnych”.

## 6. Stany puste, zero wyników, ładowanie

- **Zero wyników**: `.empty` z `.t-label` („0 wyników”), zdaniem, który filtr najbardziej zawęża, i `.tx` „Wyczyść filtry”. Bez ilustracji i bez pomarańczowej pigułki.
- **Pusta shortlista**: pulpit pokazuje „00”, a pasek akcji jest ukryty.
- **Ładowanie**: wiersze-szkielety w `--chip`, bez animowanych gradientów. Liczniki na pulpicie pokazują „—”.

## 7. Mobile (≤ 760 px)

- **Pulpit**: widać tylko 2 pierwsze liczniki, więc ustaw je w HTML według ważności. Podpisy liczników trzymaj do ok. 16 znaków („Nowe / 24 h”, a nie „Nowe zgłoszenia / 24 h”), bo inaczej łamią się na 390 px.
- **Liczby w kartach** tracą nagłówek kolumny. Daj im `data-label` („Nowe:”, „Wygasa:”), a CSS wyświetli podpis tylko na mobile.
- **Filtry**: przewijają się poziomo w jednej linii, licznik wyników jest ukryty.
- **Nagłówek sekcji z akcją** (`.sec-head`): na mobile `.cta` przechodzi pod nagłówek na pełną szerokość.
- **Wiersz**: zamienia się w kartę w trzech pasmach:
  - zaznaczenie · segment · NR;
  - imię + meta;
  - stawka · dostępność.
- **Pasek akcji**: zostaje, ale bez linków tekstowych.
- Nie skaluj desktopowej tabeli. Nie dopuszczaj do poziomego przewijania strony.

## 8. Poza zakresem tego kierunku

Landing, kampanie i strona marketingowa mogą używać mocniejszej ekspresji, np. kinowego retro albo szerokiego groteska w logo. Ten skill opisuje panel roboczy. Przy landingu powiedz wprost, że reguły mogą być luźniejsze, i zapytaj o kierunek.

## Bramki przeglądu (przed oddaniem)

1. **Policz punkty kontrastu**: ciemne powierzchnie, pomarańczowe przyciski i zielone elementy. Maksymalnie 3 rodzaje i jedna `.cta` widoczna naraz.
2. **Pomarańczowy = akcja główna, zielony = dostępny.** Pomarańcz tylko jako tło `.cta`; ostrzeżenia nie mają koloru, błędy są karmazynowe z „!”. Żaden link, ikona, wykres ani przycisk nie jest zielony bez tego znaczenia. Jasna zieleń `--signal` nigdy nie leży na jasnym tle.
3. **Liczby, daty, stawki, NR** są krojem mono (`.t-data`, `.nr`, `.t-label`).
4. **DM Mono 500** występuje tylko w H1, `.t-sec` i tytule pulpitu, nigdy w wierszu listy, przycisku ani plakietce.
5. **Ramki, bez zaokrągleń i cieni.** Każdy przycisk ma komórkę strzałki, a lista to tabela w ramce, a nie osobne karty.
6. **Treści po polsku i realistyczne.** Testuj na długich nazwiskach z dywizem i diakrytykami („Ewa Szczepańska-Bąk”), braku stawki, długich rolach i 1 / 2 / 5 zaznaczonych (odmiana).
7. **Render 1440 i 390 px**: brak poziomego przewijania, wiersze nie ucinają imion, karta faktów na mobile jest nad treścią.
8. **CSS wklejony w stronę** (`scripts/inline_css.py`), bo podgląd Claude otwiera plik jako `data:` i nie wczyta `instrument.css` z dysku.
9. **Fokus** widoczny klawiaturą wszędzie. Na ciemnym tle obrys jest zielony.
