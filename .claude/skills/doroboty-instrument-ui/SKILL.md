---
name: doroboty-instrument-ui
description: "Buduje i rozszerza ekrany DoRoboty.ai w kierunku wizualnym „Instrument”. Jasna, cicha powierzchnia robocza w ramkach i tabelach (kąty proste, obrys 1 px); kontrast tylko w trzech miejscach (ciemny pulpit z liczbami, odwrócone wiersze wybranych pozycji, jedna pomarańczowa akcja); zielony wyłącznie jako „dostępny”; mono dla faktów; DM Mono 500 tylko w tytułach. Używaj zawsze, gdy powstaje albo zmienia się jakikolwiek ekran, komponent lub prototyp DoRoboty.ai: lista kandydatów, profil, ogłoszenie, formularz ogłoszenia, pulpit pracodawcy, filtry, puste stany, mobile. Także gdy użytkownik pisze tylko „zrób ekran X”, „w naszym stylu”, „jak w studium” albo prosi o prototyp HTML dla tego projektu, nawet bez nazwy „Instrument”."
---

# DoRoboty.ai: kierunek „Instrument”

Budujesz ekrany dla polskiego portalu pracy dla osób pracujących z AI (segmenty Build / Apply / Lead). Główni użytkownicy to rekruterzy: mają dużo zgłoszeń i mało czasu. Kandydaci są drugą stroną rynku i też muszą czuć się traktowani po ludzku.

Kierunek łączy dwa źródła:
- **kontrast punktowy** z Nothing i Teenage Engineering;
- **język dokumentacji technicznej** z Oxide.

Jedno zdanie: *jasna, cicha powierzchnia robocza, w której ciemne są tylko liczby pulpitu i wybrane pozycje, a pomarańczowa jest tylko jedna akcja.*

Interfejs i treści piszesz po polsku. Pochodzenie każdej decyzji opisuje `research/visual-direction/direction-study.html` w repozytorium. To propozycja ze studium, a nie zatwierdzona marka. Gdy świadomie od niej odchodzisz, powiedz o tym w jednym zdaniu.

## Zanim zaczniesz

0. **Przeczytaj [design.md](design.md).** To skrót całego systemu w jednym pliku: zasady, tokeny, role typografii, kompozycja stron, API klas komponentów, sprawdzenie przed oddaniem i otwarte kwestie. Pozostałe pliki rozwijają szczegóły.

1. **Sprawdź, co już jest w projekcie.** Zobacz framework, komponenty i istniejące tokeny. Jeśli projekt ma własny system, przetłumacz na niego role z `assets/instrument.css`, zamiast dokładać drugi zestaw zmiennych. Jeśli projektu jeszcze nie ma albo prośba dotyczy prototypu HTML, **wklej CSS do strony, zamiast linkować plik**. Podgląd w aplikacji Claude, załączniki i artefakty otwierają HTML jako `data:` URL, więc `<link href="instrument.css">` nie ma do czego się odwołać i strona traci wszystkie style. Pisz stronę z `<link rel="stylesheet" href="instrument.css">` przed własnym `<style>` strony, a na koniec uruchom `python3 <katalog skilla>/scripts/inline_css.py strona.html`. Skrypt podmienia link na blok `<style id="instrument-css">` i przy kolejnym uruchomieniu odświeża ten blok, gdy zmieni się `instrument.css`. Linki między stronami w takim podglądzie mogą nie działać, ale w zwykłej przeglądarce działają. Ten sam skrypt dodaje do `<head>` **favicon** (`assets/favicon.svg`: czarny kwadrat `--ink` z pomarańczową kropką `--action`), żeby kartę DoRoboty łatwo było znaleźć w przeglądarce. Jeśli strona ma już własną ikonę, skrypt jej nie rusza.
2. **Przeczytaj przepis dla swojego typu ekranu** w [references/screen-recipes.md](references/screen-recipes.md). Przy liście albo szczególe otwórz też odpowiedni wzorzec:
   - `assets/candidate-list.html`
   - `assets/candidate-profile.html`
   - `assets/job-form.html` (formularz w stanie błędu, ekstrapolacja)

   To działające strony z całą anatomią i zachowaniem (zaznaczanie, odmiana „osoba / osoby / osób”, skrót `/`).
3. **Gdy chodzi o kolor, krój, kontrast albo kształt,** zajrzyj do [references/visual-system.md](references/visual-system.md). Są tam tokeny ze źródłem, policzone pary kontrastu i role typograficzne.
4. **Gdy potrzebujesz zobaczyć wzorzec,** obejrzyj zrzuty z [references/screenshots.md](references/screenshots.md). Przy liście otwórz co najmniej `m01-mock-list.jpg` i `r01-nothing-roles-list.jpg`, a przy szczególe `m02-mock-profile.jpg` i `r02-nothing-job.jpg`. Zrzuty źródeł są dowodem, a nie grafiką: nie wklejaj ich do produktu i nie kopiuj logotypów Nothing, TE ani Oxide.

## Sześć zasad i dlaczego

1. **Budżet kontrastu: najwyżej trzy mocne punkty na widok.** Są to pulpit z liczbami, wiersze wybrane i jedna pomarańczowa akcja (`.cta`). Kontrast działa tylko wtedy, gdy jest rzadki. Na liście 200 kandydatów rekruter ma od razu widzieć skalę, swoich wybranych i następny krok. Drugi pomarańczowy przycisk albo dekoracyjny ciemny baner zabiera tę informację.
2. **Ciemne znaczy „ważne”, a nie „ładne”.** Ciemne tło Oxide (`--console`) pojawia się tylko w pulpicie i w wierszach wybranych (shortlista, zapisane, „wymaga działania”). Pełny tryb ciemny nie jest domyślny, bo rekruter godzinami czyta długie opisy.
3. **Pomarańczowy znaczy tylko „zrób to”.** `--action` (#ff5a1f, pomarańcz Teenage Engineering) jest wyłącznie tłem `.cta`: prostokątnego przycisku z czasownikiem i komórką strzałki („Aplikuj”, „Zaproś”, „Dodaj ogłoszenie”). Tekst na nim jest ciemny (`--ink`, 5,5:1), jak na przyciskach TE. Nigdy nie używaj go do plakietek, ikon, tekstu, obramowań stanów ani wykresów. Dzięki temu nie czyta się jako ostrzeżenie: ostrzeżenia w tym systemie nie mają koloru (obrys `.badge.warn`, ciemny wiersz z powodem `.why`), a błędy są karmazynowe (`--alert`) z ikoną „!”.
4. **Zielony znaczy tylko „dostępny”.** Kolor sygnałowy ma jedno znaczenie, więc rekruter uczy się go raz. Jasna zieleń `--signal` leży tylko na ciemnym tle. Na jasnym używaj `--signal-ink` na `--signal-tint`, bo jasna zieleń na bieli ma kontrast 1,8:1.
5. **Cztery głosy tekstu.**
   - **Nunito Sans** mówi o ludziach: imiona, opisy, meta.
   - **DM Mono** mówi o faktach i tytułach. W grubości 400 przy 14 px to stawki, daty i liczby. W grubości 500 przy 22–52 px, w pełnej czerni, zwykłą wielkością liter i ciasno, to H1, `.t-sec` i zdanie w pulpicie.
   - **Departure Mono** (pikselowy, „kodowy”) to wszystkie etykiety 11 px: nagłówki kolumn, NR, statusy, chipy, segmenty, „Fig.”, klucze w `.kv` i `.spec`, etykiety pól. Zawsze 11 px (autorka zaleca kroki co 11 px), wersaliki, `letter-spacing:1px`, jedna grubość. Nie skaluj go do innych rozmiarów i nie używaj do zdań.
   - **Doto** służy tylko do liczników pulpitu.

   Dużych tytułów ani tekstu w wierszach listy, przyciskach czy polach nie pisz krojem o stałej szerokości, bo zjada miejsce.
6. **Wszystko siedzi w ramkach.** Kąty proste, obrys 1 px, podział jak w tabeli: surowo, bauhausowo, ale z typografią „wydania”.
   - Ramka zewnętrzna `--frame` (#8a8a8a) ma 3,4:1 do tła, więc spełnia WCAG dla obrysów komponentów. Linie wewnętrzne `--rule` (#d9d9d9) są cichsze.
   - Listy to tabele w ramce (nagłówek kolumn w ramce, wiersze dzielone linią), a nie osobne karty. Panele, wykresy i karty faktów to `.frame` / `.side` / `.panel` / `.fig`. Nagłówek ramki to `.cap` (etykieta mono z linią pod spodem).
   - Plakietki, chipy, logo, gwiazdka i podpisy „Fig.” to prostokąty z obrysem. Nigdy nie mają zaokrągleń ani wypełnień „pigułkowych”.
   - **Przycisk to ramka z komórką strzałki** (wzór: lista zakupu Stripe Press): tekst, pionowa linia, „→” (albo „↗” dla linku zewnętrznego, „+” / „✓” dla przełącznika). Strzałka mówi, że coś da się kliknąć. Filtry to komórki sklejone w jeden pasek, a aktywna komórka jest wypełniona `--ink`.
   - Nie dodawaj cieni ani zaokrągleń. Hierarchię robi grubość i kolor linii, wypełnienie oraz typografia.
   - **Dużo powietrza między ramkami, zwarte dane w środku.** Używaj tylko skali odstępów `--s1`–`--s9` i `--gutter` (tabela w `visual-system.md`): 64 px nad sekcjami, 32 px wewnątrz paneli, 24 px w wierszu.

**Gradient „niebo” jest tłem każdej strony.** Spokojny, liniowy gradient z dwóch pierwszych kolorów Stripe Press, rozjaśniony w 60% ku papierowi (`--sky`: #efe7ec → #e3e9ec, z góry na dół). Ustawia go sam `.ins`, więc nie trzeba dodawać klasy. Klasa `sky` zostaje jako alias zgodności.
- **Dane leżą w nieprzezroczystych ramkach** (lista, filtry, `.side`, `.panel`, `.fig`) na `--surface`. Gradient widać w odstępach między ramkami, a nie pod tekstem w tabelach.
- **Szarość `--mute` to #555** (6,1:1 na gradiencie, 7,3:1 na `--surface`), bo jaśniejsza szarość nie spełniała AA na gradiencie.
- **Pod każdym pulpitem** jest linia „horyzontu” w kolorach gradientu.
- **Nie rób gradientu z pomarańczu** (pomarańcz to akcja) i nie kładź gradientu pod przyciskami ani plakietkami.

Do tego dwie zasady treści:
- **Człowiek przed numerem.** NR kandydata (`.nr`) jest mały i szary, a imię i nazwisko to najważniejszy tekst wiersza. Język specyfikacji z Oxide (NR, FIG., „klucz: wartość”) porządkuje fakty, ale nie może sprawiać, że ludzie wyglądają jak pozycje w magazynie.
- **Bez zdjęć jako nośnika ekspresji.** Lista nie pokazuje dużych zdjęć kandydatów, bo to ryzyko oceniania wyglądu. Ekspresję robią liczby, typografia i pulpit. Logo firmy jest małe i ma zastępczy inicjał.

## Segmenty i stany

- **Segmenty:** ▲ Build, ● Apply, ■ Lead jako `.seg` (mono 11 px wersalikami). Oznacza je kształt, a nie kolor.
- **Dostępność:**
  - `.badge.ok` – od zaraz, jedyny zielony;
  - `.badge` – od daty;
  - `.badge.warn` – w toku, obrys;
  - `.badge.off` – niedostępny.
- **Błędy formularzy:** tylko `--alert` (karmazyn), wyłącznie w stanie błędu, zawsze z ikoną „!” i tekstem. Nigdy pomarańczowy.

## Budowanie

- **Jeden ekran to jeden ekran.** Prośba o jeden widok nie upoważnia do przerabiania całej aplikacji.
- **Kompozycję wybierasz z zadania, a nie ze wzorca.** Lista porównuje, szczegół pozwala ocenić, formularz zbiera dane. Każdy przepis w `screen-recipes.md` mówi, gdzie są trzy punkty kontrastu.
- **Używaj klas roli** (`.t-label`, `.t-data`, `.t-name`…). Nie dopisuj rozmiarów fontu na sztywno. Jeśli rola nie pasuje, dodaj ją do systemu z nazwą, a nie jako jednorazowy styl.
- **Kontrolki muszą działać.** Checkbox przełącza `.sl`, pasek akcji znika przy zerze zaznaczonych, filtr pod `/` dostaje fokus, a przyciski są `<button>`, a nie `<span>`. Jeśli powstaje tylko wizualizacja, nieinteraktywne elementy podpisz jako propozycję.
- **Dane realistyczne i polskie.** Używaj fikcyjnych osób z diakrytykami i długimi nazwiskami („Ewa Szczepańska-Bąk”), braków danych („—”), stawek w złotych („26–30 tys. zł”, „180 zł/h”) i poprawnej odmiany liczebników.
- **Elementy, których nie było w źródłach** (formularze, puste stany, błędy, ładowanie, wykresy), mają w `instrument.css` i przepisach propozycję wywiedzioną z zasad. Trzymaj się jej i zaznacz w podsumowaniu, że to ekstrapolacja.

## Sprawdzenie przed oddaniem

Wyrenderuj ekran przy 1440 i 390 px, np. Playwrightem albo w przeglądarce w aplikacji, i obejrzyj zapisany obraz, a nie tylko kod. Przejdź przez bramki z końca `references/screen-recipes.md`:
- policz punkty kontrastu (jedna pomarańczowa `.cta` widoczna naraz);
- znajdź każdy pomarańczowy element i sprawdź, czy jest przyciskiem akcji głównej;
- znajdź każdy zielony element i sprawdź, czy znaczy „dostępny”;
- sprawdź mono na liczbach i DM Mono 500 tylko w H1, `.t-sec` i tytule pulpitu;
- sprawdź, że nic nie ma zaokrągleń ani cieni, a każdy przycisk ma komórkę strzałki;
- sprawdź długie nazwiska;
- sprawdź, że nie ma poziomego przewijania;
- sprawdź, że CSS jest wklejony (`id="instrument-css"`), a nie podlinkowany, i że jest favicon (`id="ins-favicon"`);
- sprawdź widoczny fokus.

W podsumowaniu dla użytkownika napisz:
- jakie są punkty kontrastu na ekranie i dlaczego właśnie te;
- co jest ekstrapolacją poza zbadane źródła;
- czego nie sprawdziłeś.
