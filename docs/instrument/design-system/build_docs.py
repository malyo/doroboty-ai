# Builds docs/instrument/design-system/komponenty.html — the Instrument component documentation for designers (Polish content).
# Run from the repository root: python3 docs/instrument/design-system/build_docs.py   (potem skrypt sam wkleja CSS systemu przez inline_css.py)
import base64, html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))  # repository root
EV = os.path.join(HERE, "evidence")
SKILL = os.path.join(ROOT, ".claude", "skills", "doroboty-instrument-ui")
VERSION = "v4"
DATE = "2026-11-09"
MAN = {m["id"]: m for m in json.load(open(os.path.join(EV, "manifest.json")))}
sys.path.insert(0, HERE)
from renders import R as RENDERS, JS as RENDER_JS

def render_block(cid):
    items = RENDERS.get(cid, [])
    if not items: return ""
    parts = "".join(f'<div class="rd"><div class="rd-cap">{c}</div><div class="rd-body">{h}</div></div>' for c, h in items)
    return f'<div class="renders"><div class="rd-head"><span>Render na żywo · instrument.css (S10)</span><span>{len(items)} {"przykład" if len(items)==1 else "przykłady"}</span></div>{parts}</div>'

def esc(s): return html.escape(str(s), quote=True)
def st(code):
    lab = {"P": "Potwierdzone", "S": "Szacunek", "R": "Rekomendacja", "?": "Do potwierdzenia", "T": "Do testu we wdrożeniu"}[code]
    cls = {"P": "p", "S": "s", "R": "r", "?": "q", "T": "t"}[code]
    return f'<em class="st st-{cls}" title="{lab}">{lab}</em>'

def table(head, rows, cls=""):
    th = "".join(f"<th>{h}</th>" for h in head)
    tr = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<div class="tw"><table class="dt {cls}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'

def jpeg_width(path):
    d = open(path, "rb").read(); i = 2
    while i < len(d):
        if d[i] != 0xFF: i += 1; continue
        m = d[i+1]
        if m in (0xC0, 0xC1, 0xC2): return int.from_bytes(d[i+7:i+9], "big")
        i += 2 + int.from_bytes(d[i+2:i+4], "big")
    return 0

def ev(*ids):
    rel = {"prototypes/": "../prototypes/", ".claude/": "../../../.claude/"}
    items = []
    for i in ids:
        m = MAN[i]; href = m["file"]
        for k, v in rel.items():
            if href.startswith(k): href = v + href[len(k):]
        items.append(f'<li><span class="tag">{m["source"]}</span> <a href="{esc(href)}" target="_blank" rel="noopener">{esc(m["file"].split("/")[-1])}</a> · {m["viewport"]} px · <code>{esc(m["selector"])}</code> — {esc(m["caption"])}</li>')
    return '<div class="ctx"><div class="t-label">W kontekście ekranu (zrzuty dowodowe: docs/instrument/design-system/evidence/)</div><ul>' + "".join(items) + "</ul></div>"

def spec_box(code, note):
    return f'<div class="specimen"><div class="sp-cap"><span>Przykład renderowany z instrument.css (S10)</span><span>{note}</span></div><div class="sp-body">{code}</div></div>'

A11Y_HEAD = ["Obszar", "Ustalenie lub wymaganie", "Dowód / status", "Kryterium / wzorzec", "Jak sprawdzić"]
DD_HEAD = ["Zalecane", "Niewskazane", "Powód / status / źródło"]
TOK_HEAD = ["Rola", "Token", "Tryb / wariant", "Wartość", "Źródło", "Status"]
DIM_HEAD = ["Elementy / krawędzie", "Wariant", "Wartość", "Token", "Reguła / źródło"]
TYPO_HEAD = ["Rola tekstu", "Klasa", "Font / grubość", "Rozmiar", "Interlinia", "Tracking", "Kolor / uwagi"]
ANAT_HEAD = ["Część / rola", "Wymagana?", "Klasa / źródło", "Co można zmienić / status"]
VAR_HEAD = ["Oś", "Wartość", "Kiedy użyć", "Co się zmienia", "Status / źródło"]
PROP_HEAD = ["Właściwość", "Typ", "Pokazane wartości", "Domyślna", "Efekt", "Zależności / status"]

CARDS = []
def card(cid, name, purpose, anatomy, variants, combos, props, tokens, dims, typo, behaviour, dodont, a11y, sources, evidence="", specimen=""):
    CARDS.append((cid, name, f'''<section class="page card" id="{cid}">
<div class="card-head"><span class="tag">{cid.upper()}</span><h2 class="t-sec">{name}</h2></div>
{render_block(cid)}{evidence}
<h3>Przeznaczenie i wybór</h3>{purpose}
<h3>Anatomia i komponenty składowe</h3>{table(ANAT_HEAD, anatomy)}
<h3>Warianty i ich zastosowanie</h3>{table(VAR_HEAD, variants)}{('<h4>Zaobserwowane kombinacje</h4>' + combos) if combos else ''}
<h3>Dostępne właściwości i atrybuty</h3>{table(PROP_HEAD, props)}
<h3>Tokeny i style</h3>{table(TOK_HEAD, tokens)}
<h3>Wymiary, odległości i układ</h3>{table(DIM_HEAD, dims)}
<h3>Typografia</h3>{typo if isinstance(typo, str) else table(TYPO_HEAD, typo)}
<h3>Zachowanie, treści i lokalizacja</h3>{behaviour}
<h3>Zalecane i niewskazane praktyki</h3>{table(DD_HEAD, dodont, "dd")}
<h3>Dostępność</h3>{table(A11Y_HEAD, a11y)}
<h3>Źródła i otwarte kwestie</h3>{sources}
</section>'''))

P, S_, R, Q, T = st("P"), st("S"), st("R"), st("?"), st("T")
CSS = "S10 (instrument.css)"
S11 = "S11 (visual-system.md)"
W = lambda sc, title: f'<a href="https://www.w3.org/WAI/WCAG22/quickref/#{sc}" target="_blank" rel="noopener">{title}</a>'
APG = lambda slug, title: f'<a href="https://www.w3.org/WAI/ARIA/apg/patterns/{slug}/" target="_blank" rel="noopener">APG: {title}</a>'

# ============================================================ 1. Nawigacja globalna
card("c01", "Nawigacja globalna (topbar)",
"""<p>Stały pasek na górze każdego ekranu roboczego. Mówi, w jakiej części produktu jest użytkownik, i daje dostęp do konta. Jest celowo cichy, czyli <b>nie jest punktem kontrastu</b>: jasne tło, szare linki, bieżąca pozycja podkreślona kreską 2 px {P} (S12, „Nawigacja globalna (ekstrapolacja)”). Kandydat i pracodawca mają osobne zestawy pozycji {P} (S01, S04).</p>
<p>Wybór: używaj na każdym ekranie po zalogowaniu. Nawigację wewnątrz ekranu robią filtry (C04) albo link „‹ wstecz” w szczególe (C17), nie topbar. Nawigacja jest w całości ekstrapolacją, bo badane źródła nie dawały wzoru dla panelu {Q}.</p>""".format(P=P, Q=Q),
[["Wordmark „DOROBOTY.AI”", "tak", "<code>.wordmark</code> (S01, S04)", "Tekst marki; „.AI” w <code>&lt;b&gt;</code> szarym. Do zastąpienia logo " + Q],
 ["Lista pozycji menu", "tak", "<code>ul.nav</code> &gt; <code>a</code>", "Pozycje zależne od roli " + P],
 ["Wskaźnik bieżącej pozycji", "tak", "<code>a[aria-current=page]</code>", "Kreska 2 px <code>--ink</code> pod linkiem " + P],
 ["Konto", "tak", "<code>.acct</code> + <code>.logo</code> z inicjałami", "Imię (desktop) + inicjały. Na mobile tylko inicjały " + P],
 ["Separatory pionowe", "tak", "border-right/left <code>--frame</code>", "Oddzielają wordmark i konto " + P]],
[["Rola", "Kandydat", "Ekrany kandydata", "Pozycje: Oferty / Zapisane (n) / Moje aplikacje / Profil", P + " S01, S02"],
 ["Rola", "Pracodawca", "Ekrany firmy", "Pozycje: Pulpit / Ogłoszenia / Kandydaci / Firma; konto z nazwą firmy", P + " S04, S05"],
 ["Tło", "półprzezroczyste", "Pasek przepuszcza gradient tła (rgba 252,252,252,.75)", "Tło", P + " " + CSS],
 ["Szerokość", "desktop / ≤760 px", "—", "Mobile: pasek przewija się poziomo, ukryte imię w koncie", P + " S01 390 px"]],
"",
[["Pozycje menu", "lista linków", "4 na rolę", "—", "Zmiana sekcji", R + " liczba pozycji niepotwierdzona"],
 ["Bieżąca pozycja", "jedna z listy", "Oferty, Ogłoszenia", "—", "Kreska + kolor <code>--ink</code>", P],
 ["Licznik w pozycji", "liczba w nawiasie", "„Zapisane (2)”", "—", "Informacja w treści linku", P + " S01"],
 ["Konto", "tekst + inicjały", "„Zofia Łęcka · ZŁ”, „Marta Kołodziej · Wektor Labs · W”", "—", "—", P]],
[["Tło paska", "--surface", "domyślny", "#fcfcfc", CSS, P],
 ["Linia dolna i separatory", "--frame", "—", "#8a8a8a, 1 px", CSS, P],
 ["Link nieaktywny", "--mute", "—", "#6b6b6b", CSS, P],
 ["Link aktywny + kreska", "--ink", "—", "#1c1c1c, 2 px", CSS, P]],
[["Wysokość paska", "desktop", "64 px", "—", P + " " + CSS],
 ["Margines boczny", "desktop / mobile", "48 / 16 px", "--gutter", P],
 ["Padding pozycji menu", "desktop / mobile", "0 24 px / 0 12 px", "--s5", P],
 ["Wordmark → separator", "—", "32 px + margines 8 px", "--s6, --s2", P]],
[["Wordmark", ".wordmark", "DM Mono 500", "13 px", "—", "0.12em, wersaliki", "--ink, „.AI” --mute"],
 ["Pozycja menu", ".nav a", "Nunito Sans 500", "14 px", "—", "0", "--mute / --ink"]],
"<p>Nazwy pozycji krótkie, rzeczownikowe, po polsku. Liczniki w nawiasie (np. „Zapisane (2)”) aktualizują się po akcji. Jak dokładnie, nie pokazano " + Q + ". Długie nazwy firm w koncie ucina mobile przez ukrycie tekstu " + P + ".</p>",
[["Jedna pozycja z <code>aria-current=\"page\"</code>, np. „Oferty” na liście i na szczególe oferty (S01, S02)", "Podświetlanie dwóch pozycji albo żadnej", "Użytkownik musi wiedzieć, gdzie jest. " + P],
 ["Topbar jasny i cichy", "Pomarańczowy przycisk w topbarze („Dodaj ogłoszenie”)", "Akcja główna należy do ekranu, nie do nawigacji, a w topbarze zużyłaby budżet kontrastu. " + R],
 ["Inicjały w kwadracie <code>.logo</code>", "Zdjęcie profilowe jako duży avatar", "System nie używa zdjęć jako nośnika ekspresji. " + P + " S13"]],
[["Landmark", "<code>&lt;nav aria-label=\"Główna\"&gt;</code>", "Tak w kodzie S01–S05 " + P, APG("landmarks", "Landmarks"), "Czytnik: lista punktów orientacyjnych"],
 ["Bieżąca strona", "<code>aria-current=\"page\"</code> na aktywnym linku", "W kodzie " + P + "; ogłaszanie " + T, W("name-role-value", "4.1.2 Name, Role, Value (A)"), "VoiceOver/NVDA ogłasza „bieżąca strona”"],
 ["Kontrast linków", "--mute na --surface 5,2:1; --ink 16,6:1", "Obliczone z tokenów " + P, W("contrast-minimum", "1.4.3 Contrast (Minimum) (AA)"), "—"],
 ["Rozmiar celu", "Link ma całą wysokość paska 64 px", P + " (CSS); obszar aktywny " + T, W("target-size-minimum", "2.5.8 Target Size (Minimum) (AA)"), "Sprawdzić obszar kliknięcia w DevTools"],
 ["Reflow 320 px", "Pasek przewija się poziomo", P + " 390 px; 320 px " + T, W("reflow", "1.4.10 Reflow (AA)"), "Przewijanie poziome dozwolone tylko w pasku, nie na stronie"],
 ["Fokus", "Obrys 2 px --ink, odsunięty o 2 px", "Zdefiniowane w CSS " + P + "; niepokazane na zrzutach " + T, W("focus-visible", "2.4.7 Focus Visible (AA)"), "Tab przez pozycje"]],
"<ul><li>Źródła: S01, S02, S04, S05 (1440 i 390 px), S10, S12.</li><li><b>Luka:</b> brak logo. Wordmark to tekst roboczy " + Q + ".</li><li><b>Luka:</b> menu konta (wylogowanie, ustawienia) nie zaprojektowane " + Q + ".</li><li><b>Pytanie:</b> czy na mobile zostaje przewijany pasek, czy będzie menu „hamburger”?</li></ul>",
ev("topbar-d", "topbar-e", "topbar-m"))

# ============================================================ 2. Pulpit
card("c02", "Pulpit (konsola z licznikami)",
"""<p>Ciemny pas u góry ekranu roboczego. Pokazuje skalę i pilność w liczbach, a to jest <b>punkt kontrastu nr 1</b> z 3 dozwolonych na widok {P} (S13 zasada 1). Odpowiada na pytanie ekranu, np. „czym muszę się dziś zająć?” (S03) albo „ile ofert pasuje do profilu?” (S01).</p>
<p>Wybór: na listach i pulpitach. <b>Nie</b> na szczegółach (ogłoszenie, profil), formularzach i stronach do czytania. Tam punktem kontrastu jest akcja w karcie faktów {P} (S12 przepis 3). Zielona liczba tylko wtedy, gdy znaczy „dostępni kandydaci” {P}.</p>""".format(P=P),
[["Głowa: ścieżka + status", "tak", "<code>.c-head</code> (2 × span)", "Lewa: ścieżka „DoRoboty / …”; prawa: data albo „● na żywo” (<code>.c-live</code>) " + P],
 ["Tytuł", "tak", "<code>h1.c-title</code>", "Zdanie z najważniejszą informacją albo nazwa sekcji " + P],
 ["Siatka liczników", "tak", "<code>.c-stats</code> &gt; <code>.c-stat</code>", "2–4 komórki " + P],
 ["Licznik: liczba", "tak", "<code>.c-stat b</code>, opcjonalnie <code>.sig</code>", "Doto 48 px; <code>.sig</code> = zielony " + P],
 ["Licznik: podpis", "tak", "<code>.c-stat small</code>", "Departure Mono 11 px " + P],
 ["Linia „horyzontu”", "tak (automatycznie)", "<code>.console::after</code>", "3 px gradient <code>--sky-line</code> " + P]],
[["Liczba liczników", "2", "Mobile (≤760 px) automatycznie", "Widać 2 pierwsze, reszta ukryta", P + " S01 390 px"],
 ["Liczba liczników", "4", "Desktop", "Komórki o równej szerokości (min. 140 px)", P + " S01, S03, S04"],
 ["Liczba liczników", "3", "—", "Nie pokazano w dostarczonych materiałach", Q],
 ["Licznik sygnałowy", "<code>b.sig</code>", "Tylko „Dostępni od zaraz”", "Liczba w <code>--signal</code>", P + " S03, S04; brak w S01 (kandydat)"],
 ["Status na żywo", "<code>.c-live</code>", "Dane odświeżane", "Zielona kropka + tekst", P + " S03, S07"]],
table(["Ekran", "Liczniki", "Zielony", "Tytuł"], [
 ["S01 kandydat-oferty", "Pasuje do profilu · Nowe od wczoraj · Wszystkie oferty · Z widełkami", "nie", "hasło sekcji"],
 ["S03 pulpit-pracodawcy", "Czekają &gt; 48 h · Nowe / 24 h · Dostępni od zaraz · Aktywne ogłoszenia", "tak (3.)", "zdanie z pilnością"],
 ["S04 pracodawca-ogloszenia", "Wymagają działania · Aktywne z 5 · Zgłoszenia łącznie · Dostępni od zaraz", "tak (4.)", "nazwa sekcji"],
 ["S07 candidate-list", "Zgłoszenia · Dostępni od zaraz · Nowe / 24 h · Shortlista", "tak (2.)", "tytuł ogłoszenia"]]),
[["Ścieżka", "tekst", "„DoRoboty / Wektor Labs / Pulpit rekrutacji”", "—", "Kontekst", P],
 ["Prawa strona głowy", "tekst", "data aktualizacji / pakiet / „● na żywo”", "—", "Stan danych", P],
 ["Tytuł", "tekst", "zdanie (S03) / nazwa (S04)", "—", "Główny przekaz", P],
 ["Liczniki", "lista 2–4 × (liczba, podpis, sig?)", "zob. tabela kombinacji", "—", "—", P + "; max 4 " + R],
 ["Kolejność liczników", "porządek w HTML", "najważniejsze pierwsze", "—", "Na mobile widać 2 pierwsze", P + " S12 przepis 7"]],
[["Tło", "--console", "—", "#0b0e12", "Oxide oklch(0.162 0.01 260), S11", P],
 ["Tekst / liczby", "--console-ink", "—", "#dedede", S11, P],
 ["Podpisy, ścieżka", "--console-mute", "—", "#a3a4a5", S11, P],
 ["Ramki komórek", "--console-line", "—", "#30353d, 1 px", CSS, P],
 ["Liczba sygnałowa, „na żywo”", "--signal", "—", "#00d892", S11, P],
 ["Linia horyzontu", "--sky-line", "—", "#e7d4e5 → #cad9e5, 3 px", S11, P]],
[["Padding pulpitu", "desktop", "32 px góra, 48 px dół, boki --gutter (48)", "--s6, --s7", P + " " + CSS],
 ["Padding pulpitu", "mobile", "24 / 32 px, boki 16", "--s5, --s6", P],
 ["Tytuł → liczniki", "—", "32 px (mobile 24)", "--s6 / --s5", P],
 ["Komórka licznika", "desktop / mobile", "24 / 16 px", "--s5 / --s4", P],
 ["Liczba → podpis", "—", "12 px", "--s3", P],
 ["Szerokość tytułu", "—", "maks. 44 znaki", "—", P + "; dłuższe łamie się"]],
[["Ścieżka, status", ".c-head", "Departure Mono 400", "11 px", "—", "1 px, wersaliki", "--console-mute"],
 ["Tytuł", ".c-title", "DM Mono 500", "34 px (mobile 23)", "1.15", "−0.035em", "biały"],
 ["Liczba", ".c-stat b", "Doto 700", "48 px (mobile 40)", "1", "—", "--console-ink / --signal"],
 ["Podpis licznika", ".c-stat small", "Departure Mono 400", "11 px", "—", "1 px, wersaliki", "--console-mute"]],
"<p>Liczby z zerem wiodącym dla wartości jednocyfrowych („07”, „04”), jak na wyświetlaczu " + P + " (S03). Duże liczby bez spacji tysięcy („1284”) " + P + " S01; czy to zasada, " + Q + ". Podpisy krótkie, do ~16 znaków, bo dłuższe łamią się na 390 px " + P + " S12. Ładowanie: liczniki „—” " + R + " (S12 przepis 6). Odświeżanie „na żywo” nie jest pokazane " + T + ".</p>",
[["Tytuł mówiący, co zrobić: „7 osób czeka na odpowiedź dłużej niż 48 h” (S03)", "Ogólnik „Witaj w panelu”", "Pulpit ma odpowiadać na pytanie ekranu. " + R],
 ["Zielony tylko przy „Dostępni od zaraz”", "Zielona liczba „Nowe / 24 h”", "Zielony ma jedno znaczenie (S13 zasada 4). " + P],
 ["Najważniejszy licznik pierwszy w HTML", "Najważniejszy jako czwarty", "Na mobile widać tylko 2 pierwsze. " + P + " S12"],
 ["Jeden pulpit na ekran", "Drugi ciemny pas w treści, np. baner promocyjny", "Ciemność = sygnał; drugi pas rozbija budżet kontrastu. " + P + " S13"]],
[["Kontrast", "console-ink/console 14,4:1; console-mute/console 7,8:1; signal/console 10,4:1", "Obliczone " + P, W("contrast-minimum", "1.4.3 (AA)"), "—"],
 ["Liczby jako tekst", "Liczby Doto muszą być prawdziwym tekstem, nie grafiką", "W kodzie tekst " + P, W("images-of-text", "1.4.5 Images of Text (AA)"), "Zaznaczyć tekst / czytnik"],
 ["Kolor nie jedynym nośnikiem", "Zielona liczba ma też podpis „Dostępni od zaraz”", P, W("use-of-color", "1.4.1 Use of Color (A)"), "Podgląd w skali szarości"],
 ["Nagłówek strony", "Tytuł to <code>h1</code>", "W kodzie " + P, W("info-and-relationships", "1.3.1 Info and Relationships (A)"), "Struktura nagłówków"],
 ["Aktualizacja na żywo", "Zmiana liczb nie powinna przerywać czytnika; ewentualnie <code>aria-live=\"polite\"</code> dla kluczowej liczby", T, W("status-messages", "4.1.3 Status Messages (AA)"), "Test z czytnikiem przy zmianie danych"]],
"<ul><li>Źródła: S01, S03, S04, S07 (1440, 390), S10–S13.</li><li><b>Luka:</b> wariant z 3 licznikami nie pokazany " + Q + ".</li><li><b>Pytanie:</b> format dużych liczb: „1284” czy „1 284”? Doto ma wąską spację?</li><li><b>Luka:</b> czy liczniki są klikalne (np. „07” → filtr „czekają &gt; 48 h”)? Nie zaprojektowano.</li></ul>",
ev("console-d", "console-c", "console-m"))

# ============================================================ 3. Przyciski
BTN_SPEC = """<div class="sp-row"><button class="cta" type="button">Aplikuj profilem DoRoboty</button><button class="cta2" type="button">Edytuj ogłoszenie</button><button class="cta ext" type="button">Otwórz stronę firmy</button><button class="cta" type="button" disabled>Zaproś (brak zaznaczeń)</button></div>
<div class="sp-row"><button class="cta2" type="button" aria-pressed="false">Zapisz ofertę</button><button class="cta2" type="button" aria-pressed="true">Na shortliście</button><button class="tx" type="button">Przedłuż o 30 dni</button></div>"""
card("c03", "Przyciski i linki akcji",
"""<p>Trzy poziomy akcji {P} (S13 zasada 3 i 6, S11 „Kształt: ramki”):</p>
<ul><li><b>Akcja główna</b> <code>.cta</code>: pomarańczowe wypełnienie <code>--action</code>, ciemny tekst, ramka <code>--ink</code> i komórka ze strzałką „→”. <b>Jedna widoczna na ekran.</b> To punkt kontrastu nr 3.</li>
<li><b>Akcja drugorzędna</b> <code>.cta2</code>: ta sama ramka z komórką strzałki, tło <code>--surface</code>. Jako przełącznik (<code>aria-pressed</code>) pokazuje w komórce „+” albo „✓”.</li>
<li><b>Link akcji</b> <code>.tx</code>: podkreślony tekst. Służy do akcji pobocznych i nieodwracalnych z potwierdzeniem („Zakończ rekrutację”, „Odznacz”).</li></ul>
<p>Wybór: która akcja jest pomarańczowa, zależy od głównej czynności ekranu, a nie od nazwy akcji. „Dodaj ogłoszenie” to <code>.cta</code> na liście ogłoszeń (S04), ale <code>.cta2</code> na pulpicie, gdzie główne jest „Przejrzyj zgłoszenia” (S03) {P} (S12).</p>""".format(P=P),
[["Ramka", "tak", "border 1 px --ink", "— " + P],
 ["Etykieta (czasownik)", "tak", "tekst przycisku", "Treść " + P],
 ["Komórka znaku", "tak", "<code>::after</code> z linią pionową", "„→” domyślnie; „↗” <code>.ext</code>; „+”/„✓” przy <code>aria-pressed</code> " + P],
 ["Wypełnienie", "tak", "--action / --surface", "Zależnie od poziomu " + P]],
[["Poziom", ".cta", "Jedyna akcja główna", "Pomarańcz, ciemny tekst", P + " S01–S05, S07–S09"],
 ["Poziom", ".cta2", "Akcja druga obok głównej, przełącznik", "Jasne tło", P + " S02, S03, S05, S08"],
 ["Poziom", ".tx", "Akcja poboczna, w zdaniu, w pasku akcji", "Tylko podkreślony tekst", P + " S01, S05, S07, S09"],
 ["Szerokość", ".wide", "Karta faktów, pełna szerokość", "100%; kolejne <code>.wide</code> sklejone (−1 px)", P + " S02, S05, S08"],
 ["Link zewnętrzny", ".ext", "Prowadzi poza DoRoboty", "Komórka „↗”", P + " CSS; " + Q + " brak w ekranach"],
 ["Przełącznik", "aria-pressed=false/true", "Zapisz, shortlista", "Komórka „+” / „✓”", P + " S02 (false), S08 (true)"],
 ["Stan", ":hover", "—", ".cta jaśniejszy (#ff7a45); .cta2 tło białe", P + " CSS; niepokazane " + T],
 ["Stan", ":active", "—", ".cta #e8540f", P + " CSS; " + T],
 ["Stan", ":disabled", "Akcja chwilowo niemożliwa", "Szare tło --chip, tekst --mute, ramka --frame", P + " CSS; " + Q + " brak w ekranach"],
 ["Stan", ":focus-visible", "Klawiatura", "Obrys 2 px --ink (na ciemnym --signal)", P + " CSS; " + T],
 ["Mobile w .sec-head", "—", "—", ".cta na 100% szerokości", P + " S01 390 px"]],
table(["Kombinacja", "Gdzie"], [["cta.wide + cta2.wide (przełącznik)", "S02 Aplikuj + Zapisz ofertę"], ["cta.wide + cta2.wide + 2 × tx", "S05 Przejrzyj + Edytuj + Przedłuż/Zakończ"], ["cta w .sec-head", "S04"], ["cta2 w .sec-head", "S01 (Powiadamiaj), S03"], ["2 × tx + cta w .actbar", "S07"], ["tx + cta w .actbar", "S09"]]),
[["Etykieta", "tekst", "„Aplikuj profilem DoRoboty”, „Przejrzyj zgłoszenia (41)”, „Zaproś 2 osoby do rozmowy”", "—", "—", P],
 ["Poziom", "cta / cta2 / tx", "3", "—", "Hierarchia", P],
 ["Szerokość", "auto / wide", "2", "auto", "—", P + " (domyślna z CSS)"],
 ["Znak w komórce", "→ / ↗ / + / ✓", "→, +", "→", "Typ akcji", P + "; ↗, ✓ tylko w CSS/S08"],
 ["Wyłączony", "boolean", "nie pokazano", "false", "—", P + " CSS"],
 ["Liczba w etykiecie", "tekst", "„(41)”, „2 osoby”", "—", "Skala skutku akcji", R]],
[["Tło .cta", "--action", "domyślny", "#ff5a1f", "TE (moodboard B1), S11", S_ + " (wartość szacowana ze źródła)"],
 ["Tło .cta hover / active", "--action-hover / --action-press", "stan", "#ff7a45 / #e8540f", S11, P],
 ["Tekst i ramka", "--ink", "—", "#1c1c1c, 1 px", CSS, P],
 ["Tło .cta2", "--surface", "—", "#fcfcfc", CSS, P],
 ["Wyłączony", "--chip / --mute / --frame", "disabled", "#e3e3e3 / #6b6b6b / #8a8a8a", CSS, P]],
[["Wysokość", "cta, cta2", "min. 48 px (linia 46 + ramki)", "—", P + " " + CSS],
 ["Lewy padding etykiety", "—", "24 px", "--s5", P],
 ["Komórka znaku", "—", "48 px szerokości, odstęp od etykiety 24 px", "--s5", P],
 ["Odstęp .wide → .wide", "—", "−1 px (ramki się nakładają)", "—", P],
 ["Odstęp .tx pod przyciskami", "S05", "12 px, kolumna", "--s3", P + " (styl strony S05)"]],
[["Etykieta .cta/.cta2", ".cta", "Nunito Sans 500", "14 px", "46 px", "−0.01em", "--ink"],
 ["Link", ".tx", "Nunito Sans 500", "14 px", "—", "0", "--ink, podkreślenie 3 px pod"]],
"<p>Etykieta zaczyna się czasownikiem w trybie rozkazującym albo bezokoliczniku i mówi o skutku: „Zaproś 2 osoby do rozmowy”, a nie „OK” " + P + ". Liczebniki odmieniaj poprawnie: 1 osobę / 2–4 osoby / 5+ osób " + P + " (S07, skrypt odmiany). Przełącznik zmienia etykietę i znak; czy etykieta zmienia się z „Zapisz” na „Zapisano”, " + Q + ". Akcje nieodwracalne („Zakończ rekrutację”) jako <code>.tx</code> z potwierdzeniem " + R + "; okno potwierdzenia nie zaprojektowane " + Q + ".</p>",
[["Jedna pomarańczowa akcja widoczna naraz (S03: tylko „Przejrzyj 18 nowych zgłoszeń”)", "Dwa pomarańczowe przyciski obok siebie", "Pomarańcz traci znaczenie „zrób to”. " + P + " S13"],
 ["Ciemny tekst na pomarańczu", "Biały tekst na #ff5a1f", "Biały ma 3,1:1, czyli za mało dla AA przy 14 px. " + P + " S11"],
 ["„Zakończ rekrutację” jako .tx", "„Zakończ rekrutację” jako .cta", "Akcja niszcząca nie może kusić kolorem. " + R],
 ["Pomarańcz tylko na przycisku z czasownikiem", "Pomarańczowa plakietka „Pilne” albo pomarańczowy tekst", "Pomarańcz w stanie czyta się jak ostrzeżenie. " + P + " S11"],
 ["Komórka strzałki zawsze obecna", "Przycisk bez komórki (sama ramka)", "Bez strzałki przycisk wygląda jak ramka z danymi (chip, tag). " + P + " S13 zasada 6"]],
[["Kontrast tekstu", "ink/action 5,5:1; ink/action-press 4,6:1; ink/surface 16,6:1", "Obliczone " + P, W("contrast-minimum", "1.4.3 (AA)"), "—"],
 ["Kontrast granicy", "Ramka --ink na tle strony; .cta2 rozpoznawalny po ramce", P, W("non-text-contrast", "1.4.11 Non-text Contrast (AA)"), "—"],
 ["Rozmiar celu", "Wysokość 48 px, cel ≥ 24 × 24", P + " CSS", W("target-size-minimum", "2.5.8 (AA)"), "Pomiar w przeglądarce"],
 ["Rola i stan", "<code>&lt;button&gt;</code>; przełącznik z <code>aria-pressed</code>; znak w <code>::after</code> nie może być jedynym nośnikiem stanu", "W kodzie " + P + "; ogłaszanie " + T, APG("button", "Button (toggle)") + "; " + W("name-role-value", "4.1.2 (A)"), "Czytnik ogłasza „przełącznik, wciśnięty”"],
 ["Nazwa a etykieta", "Nazwa dostępna zawiera widoczny tekst", T, W("label-in-name", "2.5.3 Label in Name (A)"), "Sterowanie głosem"],
 ["Fokus", "Obrys 2 px; nie może go zasłonić przyklejony <code>.actbar</code>", T, W("focus-visible", "2.4.7 (AA)") + "; " + W("focus-not-obscured-minimum", "2.4.11 (AA)"), "Tab do przycisku pod paskiem akcji"],
 [".tx", "Link-akcja to <code>&lt;button class=\"tx\"&gt;</code>, gdy nie zmienia adresu", P + " S05, S07", APG("button", "Button"), "—"]],
"<ul><li>Źródła: S01–S05, S07–S09, S10, S11, S13.</li><li><b>Niepokazane w ekranach:</b> <code>.ext</code>, <code>:disabled</code>, hover, active, focus. Zdefiniowane w CSS " + Q + ".</li><li><b>Decyzja (2026-11-09):</b> „Aplikuj” na stronie oferty to na pewno <code>.cta</code>. „Powiadamiaj o nowych” na liście ofert to <code>.cta2</code>. Akcja główna listy ofert jest nieustalona.</li><li><b>Pytanie:</b> czy przycisk ma stan ładowania (np. po „Aplikuj”)? Nie zaprojektowano.</li><li><b>Pytanie:</b> zmiana etykiety przełącznika po kliknięciu?</li></ul>",
ev("side-cand", "side-emp", "cta-sechead", "cta2-sechead"),
spec_box(BTN_SPEC, "w tym stany niepokazane w ekranach: .ext, disabled, przełącznik true " + R))

# ============================================================ 4. Filtry
FIL_SPEC = """<div class="filters" style="padding:0"><button class="fpill" type="button">Segment ▾</button><button class="fpill" type="button" aria-pressed="true">Zdalnie ✕</button><button class="fpill" type="button">Stawka ▾</button><label class="fsearch"><input type="search" placeholder="Szukaj: stanowisko, firma" aria-label="Szukaj"><kbd>/</kbd></label><span class="count">47 z 214</span></div>
<div class="filters" style="padding:0;margin-top:16px"><fieldset class="choice" aria-label="Stan"><label><input type="radio" name="sx" checked>Wszystkie (7)</label><label><input type="radio" name="sx">Aktywne (4)</label><label><input type="radio" name="sx">Szkice (1)</label></fieldset></div>"""
card("c04", "Filtry i wybór (pasek filtrów)",
"""<p>Zawęża listę. Komórki z ramką 1 px są sklejone w jeden pasek, jak przyciski w tabeli. Aktywna komórka jest wypełniona <code>--ink</code> {P} (S01, S04, S07). Dwa typy komórek:</p>
<ul><li><code>.fpill</code>: filtr wielokrotny albo rozwijany (▾). Aktywny filtr ma „✕” do usunięcia.</li>
<li><code>.choice</code> (radio): wybór dokładnie jednej opcji, np. stan ogłoszenia z licznikami. Ten sam wygląd służy jako pole formularza (C16).</li></ul>
<p>Obok stoi pole wyszukiwania <code>.fsearch</code> ze skrótem „/” i opcjonalny licznik wyników <code>.count</code>. Wybór: <code>.choice</code>, gdy opcje się wykluczają i jest ich do ~5; <code>.fpill ▾</code>, gdy opcji jest więcej lub można wybrać kilka {R}.</p>""".format(P=P, R=R),
[["Komórka filtra", "tak (min. 1)", "<code>button.fpill</code> albo <code>.choice label</code>", "Etykieta, „▾” lub „✕” " + P],
 ["Pole wyszukiwania", "opcjonalne", "<code>label.fsearch</code> &gt; <code>input</code> + <code>kbd</code>", "Placeholder, skrót „/” " + P],
 ["Licznik wyników", "opcjonalne", "<code>.count</code>", "„47 z 214” " + P + " S07; ukryty na mobile"],
 ["Kontener", "tak", "<code>.filters</code>", "Zawija się na desktopie, przewija poziomo na mobile " + P]],
[["Typ", ".fpill ▾", "Filtr z listą opcji", "—", P + " S01, S07"],
 ["Typ", ".fpill[aria-pressed=true] ✕", "Aktywny filtr", "Wypełnienie --ink, biały tekst", P + " S01 „Zdalnie ✕”, S07"],
 ["Typ", ".choice", "Opcje wykluczające się", "Zaznaczona = wypełniona --ink", P + " S04, S09"],
 ["Stan", ":hover", "—", "Tło białe", P + " CSS; " + T],
 ["Stan", "fokus w .fsearch", "—", "Ramka i obwódka --ink", P + " CSS; " + T],
 ["Szerokość", "≤760 px", "—", "Jedna linia, przewijanie poziome, .fsearch min. 220 px, .count ukryty", P + " S01 390 px"]],
"",
[["Etykieta", "tekst", "Segment, Lokalizacja, Widełki od, Forma, Stawka, „Zdalnie”, „Dostępni od zaraz”", "—", "—", P],
 ["Aktywny", "boolean (aria-pressed)", "true/false", "false", "Wypełnienie + „✕”", P],
 ["Liczba w opcji", "tekst", "„Aktywne (4)”", "—", "Podgląd skutku", P + " S04"],
 ["Wyszukiwanie: placeholder", "tekst", "„Szukaj: stanowisko, firma, technologia”", "—", "—", P],
 ["Rozwinięcie ▾", "—", "nie pokazano", "—", "—", Q + " (lista opcji nie zaprojektowana)"]],
[["Ramka komórek i pola", "--frame", "—", "#8a8a8a, 1 px", CSS, P],
 ["Tło", "--surface", "—", "#fcfcfc", CSS, P],
 ["Aktywna komórka", "--ink", "—", "#1c1c1c, tekst biały", CSS, P],
 ["Placeholder, kbd, licznik", "--mute", "—", "#6b6b6b", CSS, P]],
[["Padding komórki", "—", "14 × 20 px", "—", P + " " + CSS],
 ["Komórka → komórka", "—", "−1 px (wspólna ramka)", "—", P],
 ["Ostatnia komórka → pole", "—", "16 px", "--s4", P],
 ["Padding paska", "desktop / mobile", "32 px / 16 px + --gutter", "--s6 / --s4", P],
 ["Rzędy przy zawijaniu", "desktop", "12 px", "--s3", P]],
[["Komórka", ".fpill / .choice label", "Nunito Sans 400", "14 px", "1", "0", "--ink / biały"],
 ["Wyszukiwanie", ".fsearch input", "Nunito Sans 400", "14 px", "—", "0", "--ink"],
 ["Skrót", "kbd", "Departure Mono 400", "11 px", "—", "—", "--mute, ramka"],
 ["Licznik", ".count", "DM Mono 400", "14 px", "—", "—", "--mute"]],
"<p>Klawisz „/” przenosi fokus do wyszukiwania " + P + " (S01, S07, skrypt). Licznik wyników aktualizuje się po zmianie filtra " + R + " (zachowanie " + T + "). Etykiety filtrów to rzeczowniki; filtr aktywny pokazuje wartość, a nie nazwę („Zdalnie ✕”, nie „Tryb ✕”) " + P + ". Polskie etykiety bywają długie, więc pasek ma się przewijać, a nie ściskać tekst " + P + ".</p>",
[["Aktywny filtr pokazuje wartość z „✕”: „Zdalnie ✕”", "Aktywny filtr tylko zmienia kolor", "Kolor nie może być jedynym sygnałem; „✕” mówi, jak usunąć. " + P],
 ["<code>.choice</code> z licznikami „Aktywne (4)”", "<code>.choice</code> z 8 opcjami", "Przy wielu opcjach pasek się nie mieści; użyj .fpill ▾. " + R],
 ["Na mobile przewijanie poziome", "Zawijanie filtrów w 3 rzędy nad listą", "Lista ma być widoczna bez przewijania. " + P + " S01 390 px"]],
[["Stan wciśnięcia", "<code>aria-pressed</code> na .fpill; radio w .choice", "W kodzie " + P, APG("button", "Button (toggle)") + "; " + APG("radio", "Radio Group"), "Czytnik ogłasza stan"],
 ["Rozwijane ▾", "<code>aria-haspopup=\"listbox\"</code> obecne; brak listy", P + " / " + Q, APG("listbox", "Listbox") + " / " + APG("combobox", "Combobox"), "Zaprojektować i przetestować klawiaturą"],
 ["Etykieta wyszukiwania", "<code>aria-label</code> na input; sam placeholder nie wystarcza", P + " w kodzie", W("labels-or-instructions", "3.3.2 (A)"), "Czytnik"],
 ["Skrót „/”", "Skrót jednoznakowy działa tylko poza polem tekstowym", "W kodzie warunek INPUT " + P, W("character-key-shortcuts", "2.1.4 Character Key Shortcuts (A)"), "Pisać „/” w polu; rozważyć możliwość wyłączenia"],
 ["Kontrast granic", "frame/surface 3,4:1; aktywna: ink", "Obliczone " + P, W("non-text-contrast", "1.4.11 (AA)"), "—"],
 ["Rozmiar celu", "Komórka ok. 42 px wysokości", S_ + " z CSS", W("target-size-minimum", "2.5.8 (AA)"), "Pomiar"],
 ["Wynik filtrowania", "Zmiana liczby wyników ogłaszana", T, W("status-messages", "4.1.3 (AA)"), "<code>aria-live</code> na .count"]],
"<ul><li>Źródła: S01, S04, S07, S09, S10, S12.</li><li><b>Luka:</b> lista rozwijana pod ▾ nie istnieje " + Q + ".</li><li><b>Luka:</b> „Wyczyść wszystkie filtry” nie zaprojektowane.</li></ul>",
ev("filters-d", "filters-choice", "filters-count", "filters-m"),
spec_box(FIL_SPEC, "hover, fokus i rozwinięcie niepokazane " + R))

# ============================================================ 5. Lista-tabela
LIST_SPEC = """<div class="list compact" style="padding:0;--cols:minmax(0,1fr) 90px 140px 16px;--areas:'who seg stat go'"><div class="thead"><span>Kandydat</span><span>Segment</span><span>Dostępność</span><span></span></div>
<div class="row"><div class="who"><span class="t-name">Natalia Kępińska</span><span class="t-meta">LLM Engineer</span></div><span class="seg">▲ Build</span><span class="stat"><span class="badge ok">● Od zaraz</span></span><span class="go">›</span></div>
<div class="row"><div class="who"><span class="t-name">Grzegorz Wiśniewski-Ołdak</span><span class="t-meta">Head of Data &amp; AI</span></div><span class="seg">■ Lead</span><span class="stat"><span class="badge">Od 01.01</span></span><span class="go">›</span></div></div>"""
card("c05", "Lista-tabela (wiersze w ramce)",
"""<p>Główny komponent ekranów roboczych: porównywanie wielu pozycji (kandydaci, oferty, ogłoszenia, zgłoszenia). To tabela w ramce, a nie osobne karty. Ramka zewnętrzna <code>--frame</code>, wiersze dzielone cieńszą linią <code>--rule</code>, nagłówek kolumn w ramce {P} (S11, S13 zasada 6).</p>
<p><b>Wiersz wybrany</b> <code>.sl</code> (zapisane, shortlista, „wymaga działania”) jest odwrócony na ciemno. To punkt kontrastu nr 2 i zawsze ma linię <code>.why</code> z powodem {P}. Jedno znaczenie ciemnego wiersza na ekran, wyjaśnione zdaniem nad listą {P} (S12).</p>
<p>Wybór: lista do porównania ≥3 pozycji tego samego typu. Do faktów jednej pozycji użyj C12 (klucz–wartość). Kolumny konfiguruje się przez <code>--cols</code> i <code>--areas</code>.</p>""".format(P=P),
[["Ramka listy + nagłówek kolumn", "nagłówek opcjonalny (ukryty na mobile)", "<code>.list</code> &gt; <code>.thead</code>", "Etykiety kolumn " + P],
 ["Wiersz", "tak", "<code>.row</code> (div albo a)", "Cały wiersz linkiem (S03–S05) albo link w nazwie (S01, S07) " + P],
 ["Kto/co", "tak", "<code>.who</code>: <code>.t-name</code> + <code>.t-meta</code> + opc. <code>.why</code>", P],
 ["Zaznaczenie", "opcjonalne", "<code>input.chk</code>", P + " S07"],
 ["Numer", "opcjonalne", "<code>.nr</code>", P + " S07"],
 ["Logo firmy", "opcjonalne", "<code>.logo</code> (C09)", P + " S01"],
 ["Segment", "opcjonalne", "<code>.seg</code> (C08)", P],
 ["Wartość / stawka", "opcjonalne", "<code>.rate</code> <code>.t-data</code>", P],
 ["Stan", "opcjonalne", "<code>.stat</code> &gt; <code>.badge</code> lub <code>.chip</code>", P],
 ["Data / czas", "opcjonalne", "<code>.upd</code>", P],
 ["Zapisz", "opcjonalne", "<code>.save</code> (C10)", P + " S01"],
 ["Przejście", "opcjonalne", "<code>.go</code> „›”", P],
 ["Kolumny własne", "opcjonalne", "np. <code>.nw</code>, <code>.rev</code>, <code>.av</code>, <code>.exp</code> przez <code>--areas</code>", P + " S03–S05 (style stron)"]],
[["Wiersz", "domyślny", "Pozycja zwykła", "Tło --surface", P],
 ["Wiersz", ".sl", "Wybrana / pilna", "Tło --console, jasny tekst, badge i chip obrysowane", P + " S01, S03, S04, S07"],
 ["Wiersz", ":hover", "—", "Tło białe", P + " CSS; " + T],
 ["Gęstość", "domyślna", "—", "Wiersz min. 80 px, padding 24 px", P],
 ["Gęstość", ".compact", "Porównanie wielu osób", "52 px, bez linii meta", P + " CSS; " + Q + " brak w ekranach"],
 ["Szerokość", "≤760 px", "—", "Wiersz → karta w 3 pasmach, nagłówek ukryty, <code>.upd</code>/<code>.go</code> ukryte, liczby z <code>data-label</code>", P + " S01, S04 390 px"]],
table(["Lista", "Kolumny", "Wiersz .sl znaczy"], [
 ["S07 kandydaci (wzorzec)", "chk · nr · who · seg · rate · stat · upd · go", "na shortliście"],
 ["S01 oferty (kandydat)", "logo · who · seg · rate · mode · upd · save", "zapisana oferta"],
 ["S03/S04 ogłoszenia (pracodawca)", "who · seg · nowe · do przejrzenia · (dostępni) · stan · wygasa · go", "wymaga działania"],
 ["S03/S05 zgłoszenia", "who · seg · stat · upd · go", "— (brak .sl)"],
 ["S06 indeks", "who · seg · go", "—"]]),
[["Kolumny", "--cols (grid-template-columns)", "zob. kombinacje", "18px 44px minmax(240px,1fr) 90px 130px 140px 110px 16px", "Układ", P + " domyślna z CSS"],
 ["Obszary", "--areas / --areas-m", "„chk nr who seg rate stat upd go”", "jw.", "Kolejność", P],
 ["Wybrany", "klasa .sl", "true/false", "false", "Odwrócenie", P],
 ["Powód", "tekst .why", "„Zapisana · wygasa za 4 dni”, „5 osób czeka &gt; 48 h · 41 nieprzejrzanych”", "—", "Wymagany przy .sl", P + " S12"],
 ["Gęstość", ".compact", "—", "normalna", "—", P + " CSS"],
 ["Podpis liczby (mobile)", "data-label", "„Nowe:”, „Wygasa:”", "—", "Tylko ≤760 px", P + " S04"]],
[["Ramka zewnętrzna", "--frame", "—", "#8a8a8a, 1 px", CSS, P],
 ["Linia między wierszami", "--rule", "—", "#d9d9d9, 1 px", CSS, P],
 ["Tło wiersza / nagłówka", "--surface / --paper", "—", "#fcfcfc / #f2f2f2", CSS, P],
 ["Wiersz .sl tło / linia", "--console / --console-line", ".sl", "#0b0e12 / #30353d", CSS, P],
 ["Tekst .sl", "--console-ink, nazwa biała, meta --console-mute", ".sl", "#dedede / #fff / #a3a4a5", CSS, P]],
[["Padding wiersza", "desktop / mobile", "24 px / 24 × 16 px", "--s5 / --s4", P + " " + CSS],
 ["Min. wysokość wiersza", "normalna / compact", "80 / 52 px", "—", P],
 ["Odstęp kolumn", "—", "24 px (mobile 8 × 12)", "--s5", P],
 ["Nazwa → meta", "—", "2 px", "—", P],
 ["Meta → .why", "—", "8 px", "--s2", P],
 ["Margines listy", "—", "--gutter (48 / 16 px)", "--gutter", P],
 ["Ile wierszy na ekranie", "1440 × 900, pod pulpitem", "ok. 5–6", "—", S_ + " S12"]],
[["Nagłówek kolumny", ".thead", "Departure Mono 400", "11 px", "—", "1 px, wersaliki", "--mute"],
 ["Nazwa", ".t-name", "Nunito Sans 650", "18 px", "1.25", "−0.005em", "--ink / biały w .sl"],
 ["Meta", ".t-meta", "Nunito Sans 400", "14 px", "1.4", "0", "--mute, ucinana „…” na desktopie"],
 ["Liczby, daty", ".t-data", "DM Mono 400", "14 px", "1.4", "—", "cyfry tabelaryczne, bez zawijania"],
 ["Powód", ".why", "Departure Mono 400", "11 px", "1.3", "1 px, wersaliki", "--ink / --console-ink"]],
"<p>Zaznaczenie checkboxa przełącza <code>.sl</code>, licznik w pulpicie i pasek akcji " + P + " (S07, skrypt). Gwiazdka (C10) robi to samo dla ofert " + P + " (S01). Brak wartości to „—”, a nie pusta komórka " + P + ". Meta ucinana na desktopie, zawijana na mobile " + P + ". Linia <code>.why</code> przy 1 px trackingu łamie się w wąskich kolumnach " + P + " (S04). Sortowanie: „↓” w nagłówku kolumny " + P + " S07; sposób zmiany sortowania " + Q + ".</p>",
[["Wiersz .sl z .why: „Wygasa za 3 dni · 2 osoby czekają &gt; 48 h” (S04)", "Ciemny wiersz bez wyjaśnienia", "Kolor nie może być jedynym nośnikiem znaczenia. " + P + " S12"],
 ["Jedno znaczenie .sl na ekranie i zdanie nad listą", "Ciemne = zapisane i jednocześnie pilne", "Użytkownik nie odróżni powodów. " + P],
 ["„—” przy braku widełek", "Ukrycie kolumny w jednym wierszu", "Brak widełek to informacja dla kandydata. " + P],
 ["Lista jako tabela w jednej ramce", "Osobne karty z odstępami 8 px", "Ramki to język systemu; karty rozbijają porównanie. " + P + " S13"],
 ["Do 30 zaznaczeń: filtr „pokaż shortlistę”", "30 ciemnych pasów na liście", "Przy wielu .sl lista zamienia się w pasy. " + R + " S12"]],
[["Struktura", "Wizualnie tabela, w kodzie siatka divów. Zastosować <code>role=\"table\"</code>/<code>row</code>/<code>cell</code> albo prawdziwy <code>&lt;table&gt;</code>; nagłówek jest <code>aria-hidden</code>", P + " brak ról / " + R, W("info-and-relationships", "1.3.1 (A)") + "; " + APG("table", "Table"), "Czytnik: nawigacja po komórkach"],
 ["Elementy zagnieżdżone", "Cały wiersz jako <code>&lt;a&gt;</code> nie może zawierać przycisków (S01 ma .save; S01 używa div + link w nazwie, poprawnie)", P, W("name-role-value", "4.1.2 (A)"), "Walidator HTML"],
 ["Kolor .sl", "Powód w .why; checkbox/gwiazdka niosą stan", P, W("use-of-color", "1.4.1 (A)"), "Skala szarości"],
 ["Kontrast", "mute/surface 5,2:1; mute/paper 4,8:1 (nagłówek); console-mute/console 7,8:1", "Obliczone " + P, W("contrast-minimum", "1.4.3 (AA)"), "—"],
 ["Checkbox", "16 × 16 px; akcent --ink (poprawione 2026-11-18, wcześniej zielony 1,8:1)", P, W("target-size-minimum", "2.5.8 (AA)") + " (wyjątek odstępu?); " + W("non-text-contrast", "1.4.11 (AA)"), "Pomiar celu; " + R + " akcent --ink"],
 ["Reflow", "Karta na 390 px bez przewijania poziomego", P + " 390; 320 px " + T, W("reflow", "1.4.10 (AA)"), "320 px"],
 ["Ucinanie meta", "Ucięta meta „…” musi być dostępna w pełni (title / szczegół)", T, W("reflow", "1.4.10") + " / " + W("resize-text", "1.4.4 (AA)"), "Powiększenie 200%"]],
"<ul><li>Źródła: S01, S03–S07 (1440, 390), S10–S13.</li><li><b>Rozwiązane 2026-11-18:</b> checkbox zaznaczenia ma akcent <code>--ink</code> zamiast zielonego.</li><li><b>Niepokazane:</b> .compact, hover, sortowanie, stronicowanie („Pokaż kolejne 20” jako .tx w S01).</li><li><b>Pytanie:</b> wiersz klikalny w całości czy tylko nazwa? Dziś są oba wzorce.</li></ul>",
ev("list-cands", "list-posts", "list-offers", "list-m", "list-posts-m"),
spec_box(LIST_SPEC, ".compact — niepokazany w ekranach " + R))

# ============================================================ 6. Plakietka statusu
BADGE_SPEC = """<div class="sp-row"><span class="badge ok">● Od zaraz</span><span class="badge">Od 01.12</span><span class="badge warn">W rozmowach</span><span class="badge off">Niedostępna</span><span class="badge">Aktywne</span><span class="badge warn">W weryfikacji</span><span class="badge off">Szkic</span></div>
<div class="sp-row" style="background:#0b0e12;padding:16px"><span class="row sl" style="display:flex;gap:8px;min-height:0;padding:0;border:0;background:none"><span class="badge ok">● Od zaraz</span><span class="badge">Aktywne</span><span class="badge off">Niedostępna</span></span></div>"""
card("c06", "Plakietka statusu (badge)",
"""<p>Krótki stan pozycji: dostępność kandydata albo stan ogłoszenia. Prostokąt z obrysem, krój Departure Mono {P} (S10, S11). <b>Zielona tylko „od zaraz”</b>. Pozostałe stany są neutralne, a „w toku” ma obrys <code>--ink</code> zamiast koloru, bo ostrzeżenia w systemie nie mają koloru {P} (S11 „Pomarańcz akcji a ostrzeżenia”).</p>
<p>Wybór: plakietka = stan, który się zmienia. Stały fakt (miasto, forma umowy) to chip (C07).</p>""".format(P=P),
[["Ramka", "tak", "border 1 px", "Kolor zależny od wariantu " + P],
 ["Kropka „●”", "tylko .ok", "znak w tekście", P],
 ["Tekst stanu", "tak", "tekst", P]],
[["Stan", ".ok", "Dostępny od zaraz", "Tło --signal-tint, tekst i ramka --signal-ink", P + " S03, S05, S07, S08"],
 ["Stan", "domyślny", "Dostępny od daty, Aktywne", "Ramka --frame, przezroczyste", P + " S04, S07"],
 ["Stan", ".warn", "W toku (rozmowy, weryfikacja)", "Ramka --ink", P + " S04, S07"],
 ["Stan", ".off", "Niedostępny, szkic, zakończone", "Ramka --rule, tekst --mute", P + " S04, S07"],
 ["Tło", "w .row.sl", "Wiersz wybrany", "Ramka --console-mute; .ok: tło --signal-deep, tekst --signal", P + " S01, S04, S07"],
 ["Tło", "w .kv", "Karta faktów", "Bez zmian", P + " S05, S08"]],
table(["Wartość", "Wariant", "Źródło"], [["● Od zaraz", ".ok", "S07, S08, S03"], ["Od 01.12 / Od 15.12 / Od 01.01", "domyślny", "S07, S03, S05"], ["W rozmowach", ".warn", "S07, S03"], ["Niedostępna", ".off", "S07"], ["Aktywne", "domyślny", "S03, S04, S05"], ["W weryfikacji", ".warn", "S04"], ["Szkic, Zakończone", ".off", "S04"], ["● 31 (liczba dostępnych)", ".ok", "S05"]]),
[["Wariant", "klasa", "ok / — / warn / off", "domyślny (bez klasy)", "Kolor i ramka", P],
 ["Tekst", "tekst", "zob. kombinacje", "—", "—", P],
 ["Data w tekście", "DD.MM", "„Od 01.12”", "—", "—", P]],
[["Dostępny: tło / tekst", "--signal-tint / --signal-ink", ".ok", "#dcf3ea / #00503a", S11, P],
 ["Dostępny w .sl", "--signal-deep / --signal", ".ok w .sl", "#0e3b2c / #00d892", S11, P],
 ["Ramka domyślna / w toku / wyłączona", "--frame / --ink / --rule", "—", "#8a8a8a / #1c1c1c / #d9d9d9", CSS, P]],
[["Padding", "—", "5 × 7 px", "—", P + " " + CSS],
 ["Wysokość", "—", "ok. 23 px", "—", S_ + " (11 px + padding + ramka)"],
 ["Położenie w wierszu (mobile)", "≤760 px", "do prawej krawędzi", "—", P]],
[["Stan", ".badge", "Departure Mono 400", "11 px", "1", "1 px, wersaliki", "zależnie od wariantu"]],
"<p>Teksty stanów krótkie, 1–2 słowa, z datą w formacie DD.MM " + P + ". Rodzaj gramatyczny zgodny z osobą („Niedostępna” w S07); jak system rozpozna rodzaj, " + Q + ". Plakietka nie jest klikalna " + P + ".</p>",
[["Zielona tylko „Od zaraz”", "Zielona plakietka „Aktywne” przy ogłoszeniu", "Zielony = dostępny kandydat. " + P + " S12 (poprawione)"],
 ["„W toku” jako obrys --ink", "Żółta/pomarańczowa plakietka „W rozmowach”", "Kolor ostrzeżenia myli się z akcją. " + P + " S11"],
 ["Stan w plakietce, stały fakt w chipie", "„Kraków” jako plakietka", "Plakietka sugeruje zmienność. " + R]],
[["Kontrast tekstu", "signal-ink/tint 8,2:1; signal/deep 6,7:1; ink/surface 16,6:1; mute/surface 5,2:1", "Obliczone " + P, W("contrast-minimum", "1.4.3 (AA)"), "—"],
 ["Kolor nie jedynym sygnałem", "Każdy stan ma inny tekst; „●” przy .ok", P, W("use-of-color", "1.4.1 (A)"), "Skala szarości"],
 ["Zmiana stanu", "Ogłoszenie zmiany (np. po zaproszeniu)", T, W("status-messages", "4.1.3 (AA)"), "Czytnik"],
 ["Wersaliki z CSS", "Tekst w HTML zapisany zwykłą wielkością liter (czytnik nie literuje)", P + " w kodzie", "—", "VoiceOver"]],
"<ul><li>Źródła: S03–S05, S07, S08, S10, S11.</li><li><b>Pytanie:</b> pełna lista stanów kandydata i ogłoszenia (np. „Zatrudniony”, „Odrzucony”) nie jest zdefiniowana " + Q + ".</li></ul>",
ev("list-cands"), spec_box(BADGE_SPEC, "wszystkie stany na jasnym i w wierszu .sl"))

# ============================================================ 7. Chip i tag
CHIP_SPEC = """<div class="sp-row"><span class="chip">Kraków / hybryda</span><span class="chip">B2B lub UoP</span><span class="chip">EN B2+</span><span class="tag">Fig. 1 — Wdrożenie, 2025</span><span class="tag">Nr 0042</span></div>"""
card("c07", "Chip faktu i tag",
"""<p><b>Chip</b> <code>.chip</code> to stały fakt pozycji: miasto i tryb, forma umowy, poziom, język. Stoi w nagłówku szczegółu (<code>.chips</code>) albo w kolumnie „Tryb” listy {P} (S01, S02, S05, S08).</p>
<p><b>Tag</b> <code>.tag</code> to etykieta w obrysie, np. podpis „Fig.” albo identyfikator. W ekranach występuje tylko jako styl podpisu w <code>.fig figcaption</code> {P}. Sama klasa <code>.tag</code> jest w CSS, ale żaden ekran jej nie używa {Q}.</p>
<p>Wybór: chip = fakt, plakietka (C06) = stan, segment (C08) = kategoria Build/Apply/Lead.</p>""".format(P=P, Q=Q),
[["Ramka 1 px --frame", "tak", ".chip / .tag", P],
 ["Tekst", "tak", "—", "Wersaliki z CSS " + P],
 ["Kontener grupy", "opcjonalny", "<code>.chips</code> (flex, zawijanie)", P]],
[["Typ", ".chip", "Fakt", "Tekst --ink", P],
 ["Typ", ".tag", "Podpis, identyfikator", "Tekst --mute", P + " CSS; " + Q],
 ["Tło", "w .row.sl", "—", "Ramka --console-mute, tekst --console-ink", P + " S01"],
 ["Mieszanie z plakietką", ".chips z .badge na początku", "Stan + fakty w nagłówku", "—", P + " S05 „Aktywne”"]],
"",
[["Tekst", "tekst", "„Kraków / hybryda”, „B2B lub UoP”, „Senior”, „EN B2+”, „26–30 tys. zł”", "—", "—", P],
 ["Liczba chipów", "—", "3–4", "—", "Zawijają się", P]],
[["Ramka", "--frame", "—", "#8a8a8a", CSS, P], ["Tekst chipu / tagu", "--ink / --mute", "—", "#1c1c1c / #6b6b6b", CSS, P]],
[["Padding", "chip, tag", "5 × 8 px", "—", P + " " + CSS], ["Odstęp chipów", "—", "8 px", "--s2", P]],
[["Fakt / podpis", ".chip / .tag", "Departure Mono 400", "11 px", "1", "1 px, wersaliki", "--ink / --mute"]],
"<p>Chip krótki (do ~20 znaków); „/” łączy dwa aspekty jednego faktu („Kraków / hybryda”) " + P + ". Chipy nie są klikalne " + P + "; czy mają filtrować listę, " + Q + ".</p>",
[["„Kraków / hybryda” jako jeden chip", "Osobne chipy „Kraków” i „Hybryda” i „Polska”", "Mniej elementów, ta sama informacja. " + R],
 ["Chip nieklikalny bez strzałki", "Chip wyglądający jak przycisk filtra", "Komórka strzałki wyróżnia klikalne. " + P + " S13"]],
[["Kontrast", "ink/surface 16,6:1; ramka 3,4:1", P, W("contrast-minimum", "1.4.3 (AA)"), "—"],
 ["Grupa", "Lista chipów jako <code>ul</code> albo opisany kontener", R, W("info-and-relationships", "1.3.1 (A)"), "Czytnik"],
 ["Odstępy tekstu", "Przy zwiększonym tracking/line-height chip się zawija", T, W("text-spacing", "1.4.12 Text Spacing (AA)"), "Bookmarklet text-spacing"]],
"<ul><li>Źródła: S01, S02, S05, S08, S10.</li><li><b>Niepokazane:</b> .tag jako samodzielny element.</li></ul>",
ev("chips", "chips-emp"), spec_box(CHIP_SPEC, ".tag " + R))

# ============================================================ 8. Segment
card("c08", "Segment (Build / Apply / Lead)",
"""<p>Kategoria osoby albo oferty. Oznacza ją <b>kształt, a nie kolor</b>: ▲ Build, ● Apply, ■ Lead {P} (S11 „Oznaczenia segmentów”, S13). Tekst w Departure Mono, bez ramki. Występuje w wierszach list, w nagłówkach szczegółu (<code>.t-label</code>) i jako wybór w formularzu {P}.</p>""".format(P=P),
[["Znak kształtu", "tak", "▲ ● ■ w tekście", P], ["Nazwa segmentu", "tak", "„Build”, „Apply”, „Lead”", P + " (angielskie nazwy z briefu)"]],
[["Segment", "▲ Build", "Budujący modele i systemy", "—", P + " S09 opis"], ["Segment", "● Apply", "Wdrażający AI w swojej dziedzinie", "—", P], ["Segment", "■ Lead", "Prowadzący zespoły i transformację", "—", P],
 ["Kontekst", "w wierszu .seg / w nagłówku .t-label / w wyborze .choice", "—", "W .choice krój Nunito Sans", P + " S09"]],
"",
[["Segment", "enum", "Build / Apply / Lead", "—", "Znak + nazwa", P]],
[["Tekst", "--ink (w .sl --console-ink)", "—", "#1c1c1c", CSS, P]],
[["—", "—", "Bez paddingu, nie zawija się", "—", P]],
[["Segment", ".seg", "Departure Mono 400", "11 px", "1", "1 px, wersaliki", "--ink"]],
"<p>Przy pierwszym użyciu na ekranie (filtr segmentu) pokaż legendę znaczeń " + P + " S11; legendy w filtrze nie zaprojektowano " + Q + ". Opis segmentów w formularzu: S09.</p>",
[["Kształt + nazwa: „▲ Build”", "Kolorowe plakietki segmentów (żółta/niebieska/różowa)", "Kolor zarezerwowany dla „dostępny” i akcji. " + P + " S11"], ["Zawsze z nazwą", "Sam znak ▲", "Znak bez nazwy jest nieczytelny. " + R]],
[["Znak", "Znak ▲●■ czytany przez czytnik jako „trójkąt” itd.; rozważyć <code>aria-hidden</code> na znaku", T, W("info-and-relationships", "1.3.1 (A)"), "VoiceOver"],
 ["Kolor", "Nie zależy od koloru", P, W("use-of-color", "1.4.1 (A)"), "—"]],
"<ul><li>Źródła: S01–S09 (występuje na 7 ekranach), S11.</li><li><b>Pytanie:</b> polskie nazwy segmentów czy angielskie?</li></ul>")

# ============================================================ 9. Logo
card("c09", "Logo firmy i inicjały",
"""<p>Mały kwadrat 32 × 32 px z obrysem i inicjałem. Identyfikuje firmę w liście ofert i w sekcji „O firmie”. Ten sam element służy jako inicjały konta w nawigacji {P} (S01, S02, S04). <b>Nigdy nie niesie kontrastu</b> i nie zastępuje nazwy firmy {P} (S12).</p>""".format(P=P),
[["Kwadrat z ramką", "tak", ".logo", P], ["Inicjał(y)", "tak", "tekst 1–2 znaki", P], ["Prawdziwe logo (obraz)", "—", "nie pokazano", Q]],
[["Rozmiar", "32 px", "Lista, konto", "—", P], ["Rozmiar", "40 px", "„O firmie”", "Styl strony S02", P + " (lokalny)"], ["Tło", "w .row.sl", "—", "Ramka --console-mute", P]],
"",
[["Inicjał", "tekst", "W, K, B, S, G, U, ZŁ", "—", "—", P], ["Obraz logo", "img", "nie pokazano", "—", "—", Q]],
[["Ramka / tekst", "--frame / --ink", "—", "#8a8a8a / #1c1c1c", CSS, P]],
[["Wymiar", "domyślny", "32 × 32 px", "—", P + " " + CSS]],
[["Inicjał", ".logo", "DM Mono 500", "13 px", "—", "—", "--ink"]],
"<p>Inicjał z pierwszej litery nazwy firmy; dla osoby dwie litery („ZŁ”) " + P + ".</p>",
[["Małe logo obok nazwy firmy w tekście", "Duże kolorowe logotypy w każdym wierszu", "Kolorowe logo rozbija budżet kontrastu. " + R]],
[["Tekst alternatywny", "Inicjał dekoracyjny: <code>aria-hidden=\"true\"</code>, nazwa firmy obok w tekście", P + " w kodzie", W("non-text-content", "1.1.1 Non-text Content (A)"), "Czytnik nie czyta „W”"]],
"<ul><li>Źródła: S01, S02, S04, S05, S10.</li><li><b>Luka:</b> obsługa prawdziwych logo (obraz, monochromatyzacja?) " + Q + ".</li></ul>")

# ============================================================ 10. Zapisz
SAVE_SPEC = """<div class="sp-row"><button class="save" type="button" aria-pressed="false" aria-label="Zapisz">☆</button><button class="save" type="button" aria-pressed="true" aria-label="Usuń z zapisanych">★</button></div>"""
card("c10", "Zapisz (gwiazdka w wierszu)",
"""<p>Kwadratowy przełącznik 36 × 36 px z gwiazdką. Zapisuje ofertę i od razu przełącza wiersz w <code>.sl</code> z linią „Zapisana” {P} (S01, skrypt). W szczególe tę samą rolę pełni <code>.cta2</code> z <code>aria-pressed</code> (C03) {P} (S02).</p>""".format(P=P),
[["Przycisk z ramką", "tak", "button.save", P], ["Znak ☆ / ★", "tak", "tekst", P]],
[["Stan", "aria-pressed=false ☆", "Niezapisana", "Ramka --frame, znak --mute", P], ["Stan", "aria-pressed=true ★", "Zapisana", "Ramka i znak --ink; w .sl biały", P]],
"",
[["Zapisana", "boolean", "true / false", "false", "Przełącza .sl wiersza", P + " S01"], ["Etykieta dostępna", "aria-label", "„Zapisz: …”, „Usuń z zapisanych: …”", "—", "—", P]],
[["Ramka / znak", "--frame / --mute / --ink", "stan", "—", CSS, P]],
[["Wymiar", "—", "36 × 36 px", "—", P + " " + CSS]],
[["Znak", ".save", "systemowy", "16 px", "—", "—", "—"]],
"<p>Po zapisaniu wiersz ciemnieje i dostaje „Zapisana”; po odznaczeniu wraca " + P + ". Potwierdzenie (toast) nie zaprojektowane " + Q + ".</p>",
[["Etykieta dostępna z nazwą oferty", "Sam znak ☆ bez etykiety", "Czytnik musi wiedzieć, co zapisuje. " + P]],
[["Rola i stan", "<code>button</code> + <code>aria-pressed</code> + <code>aria-label</code>", P + " w kodzie; ogłaszanie " + T, APG("button", "Button (toggle)"), "Czytnik"],
 ["Rozmiar celu", "36 × 36 px ≥ 24 × 24", P, W("target-size-minimum", "2.5.8 (AA)"), "—"],
 ["Kontrast granicy", "Ramka 3,4:1 (niezapisana)", P, W("non-text-contrast", "1.4.11 (AA)"), "—"]],
"<ul><li>Źródła: S01, S10.</li><li><b>Pytanie:</b> czy zapisanie pokazuje komunikat statusu?</li></ul>",
ev("list-offers"), spec_box(SAVE_SPEC, "oba stany"))

# ============================================================ 11. Ramka / panel
FRAME_SPEC = """<div class="frame" style="max-width:420px"><div class="cap"><span>Fakty</span><span>Nr 0042</span></div><div style="padding:24px">Treść ramki z nagłówkiem <code>.cap</code>.</div></div>"""
card("c11", "Ramka, panel i figura",
"""<p>Podstawowy pojemnik systemu: obrys 1 px <code>--frame</code>, kąty proste, wnętrze <code>--surface</code>, bez cieni {P} (S11 „Kształt: ramki”). Odmiany:</p>
<ul><li><code>.side</code>: karta faktów w szczególe, przyklejona na desktopie (C17);</li><li><code>.panel</code>: grupa treści, np. pola formularza albo <code>.kv</code> na pulpicie;</li><li><code>.fig</code>: wykres lub ilustracja z podpisem „Fig. N — …”;</li><li><code>.frame</code>: ogólna ramka;</li><li><code>.cap</code>: nagłówek ramki, etykieta z linią pod spodem;</li><li><code>.empty</code>: przerywana ramka stanu pustego (C15).</li></ul>
<p><code>.frame</code> i <code>.cap</code> są zdefiniowane w CSS, ale nie występują w ekranach {Q}.</p>""".format(P=P, Q=Q),
[["Ramka", "tak", "border 1 px --frame", P], ["Nagłówek .cap", "opcjonalny", ".cap", Q + " niepokazany"], ["Treść", "tak", "dowolna", P], ["Podpis figury", "w .fig", "figcaption: .t-label (w ramce) + opis", P + " S03, S05, S08"]],
[["Typ", ".side", "Karta faktów", "Padding 32 / 24 px, sticky", P + " S02, S05, S08, S09"], ["Typ", ".panel", "Grupa treści", "Padding 32 px", P + " S03, S09"], ["Typ", ".fig", "Wykres", "Padding 32 px, podpis 24 px niżej", P + " S03, S05, S08"], ["Typ", ".frame + .cap", "Ogólna ramka z nagłówkiem", "—", Q], ["Typ", "podgląd przerywany", "„Tak widzą je kandydaci”", "Ramka przerywana", P + " S05 (styl strony)"]],
"",
[["Typ", "klasa", "side / panel / fig / frame / empty", "—", "Padding, położenie", P], ["Nagłówek", ".cap", "—", "brak", "—", Q]],
[["Ramka / tło", "--frame / --surface", "—", "#8a8a8a / #fcfcfc", CSS, P], ["Podpis figury: ramka etykiety", "--frame", "—", "1 px", CSS, P]],
[["Padding .side/.panel/.fig", "desktop / mobile", "32 / 24 px", "--s6 / --s5", P + " " + CSS], ["Odstęp .fig pod spodem", "—", "24 px", "--s5", P], [".cap", "—", "12 × 24 px, wyciąga się do krawędzi (ujemny margines)", "--s3, --s5", P]],
[["Nagłówek ramki", ".cap", "Departure Mono 400", "11 px", "1.3", "1 px, wersaliki", "--mute"], ["Etykieta figury", ".fig figcaption .t-label", "Departure Mono 400", "11 px", "—", "1 px", "w ramce"], ["Opis figury", "figcaption", "Nunito Sans 400", "14 px", "—", "—", "--ink"]],
"<p>Podpis figury zaczyna się od „Fig. N — temat, data”, a potem jedno zdanie wniosku („5,5% oglądających aplikuje”) " + P + ". Wykresy w środku to style lokalne stron (lejek S05, słupki S03, S08), a nie komponenty systemu " + P + ".</p>",
[["Wykres w .fig z podpisem-wnioskiem", "Wykres bez podpisu", "Podpis mówi, co z wykresu wynika. " + P], ["Bez cieni i zaokrągleń", "Karta z cieniem i promieniem 12 px", "Język ramek. " + P + " S13"]],
[["Wykres", "Opis tekstowy w <code>role=\"img\"</code> + <code>aria-label</code> (S03) albo tabela danych", P + " S03; S05 lista " + P, W("non-text-content", "1.1.1 (A)"), "Czytnik"],
 ["Granica", "Ramka 3,4:1 na surface, 3,1:1 na paper", P, W("non-text-contrast", "1.4.11 (AA)") + " (ramka nie jest wymagana do zrozumienia)", "—"],
 ["Sticky .side", "Nie może zasłaniać fokusu przy przewijaniu", T, W("focus-not-obscured-minimum", "2.4.11 (AA)"), "Tab przez treść"]],
"<ul><li>Źródła: S02, S03, S05, S08, S09, S10, S11.</li><li><b>Pytanie:</b> czy wykresy (lejek, słupki) mają stać się komponentami systemu?</li></ul>",
ev("fig-funnel", "fig-chart", "kv-panel"), spec_box(FRAME_SPEC, ".frame + .cap " + R))

# ============================================================ 12. KV i spec
card("c12", "Klucz–wartość i specyfikacja",
"""<p>Dwa układy faktów jednej pozycji (język karty katalogowej Oxide) {P} (S11):</p>
<ul><li><code>.kv</code>: klucz po lewej, wartość do prawej. Krótkie fakty decyzyjne w karcie faktów (widełki, forma, dostępność, wyniki).</li>
<li><code>.spec</code>: klucz w kolumnie 200 px, wartość obok. Dłuższe wartości w treści (wymagania, stack, zespół). Ramki górna i dolna w <code>--frame</code>, linie wewnętrzne w <code>--rule</code>.</li></ul>
<p>Wybór: 4–6 faktów do decyzji → <code>.kv</code> w <code>.side</code>; opisowe fakty → <code>.spec</code> w treści. Porównanie wielu pozycji → lista (C05).</p>""".format(P=P),
[["Klucz", "tak", "<code>dt</code>", "Departure Mono " + P], ["Wartość", "tak", "<code>dd</code>", "Tekst, liczba (<code>.t-data</code>) albo plakietka " + P], ["Linie", "tak", "border --rule", P]],
[["Typ", ".kv", "Karta faktów", "Wartość do prawej, pogrubiona", P + " S02, S03, S05, S08, S09"], ["Typ", ".spec", "Treść szczegółu", "Kolumny 200 px / reszta", P + " S02, S05, S08"], ["Szerokość", "≤860 px (.spec)", "—", "Klucz nad wartością", P + " S02 390 px"], ["Tło", "na „niebie”", "—", "Linie --rule-on-sky (16% czerni)", P + " CSS"]],
"",
[["Liczba wierszy .kv", "—", "4–5", "—", "—", P + "; 4–6 " + R + " S12"], ["Wartość", "tekst / .t-data / .badge", "„26–30 tys. zł”, „B2B (netto) / UoP”, „● 31”", "—", "—", P]],
[["Linie", "--rule", "—", "#d9d9d9", CSS, P], ["Ramki .spec", "--frame", "—", "#8a8a8a", CSS, P], ["Klucz", "--mute", "—", "#6b6b6b (#555 na niebie)", CSS, P]],
[["Pion wiersza", ".kv / .spec", "16 px", "--s4", P + " " + CSS], ["Kolumna klucza .spec", "desktop", "200 px", "—", P], [".kv → przyciski", "—", "24 px", "--s5", P]],
[["Klucz", ".kv dt / .spec dt", "Departure Mono 400", "11 px", "1.3", "1 px, wersaliki", "--mute"], ["Wartość .kv", ".kv dd", "Nunito Sans 500 / DM Mono", "14 px", "—", "—", "--ink, do prawej"], ["Wartość .spec", ".spec dd", "Nunito Sans 400", "14 px", "—", "—", "--ink"]],
"<p>Klucze krótkie (1–2 słowa). Liczby i daty w wartości jako <code>.t-data</code> " + P + ". Brak wartości: „—” " + R + ".</p>",
[["Liczby w DM Mono: „26–30 tys. zł”", "Liczby w Nunito Sans w karcie faktów", "Kolumna liczb czyta się jak dane. " + P + " S13 zasada 5"], [".kv w karcie, .spec w treści", "Długie wymagania w .kv", "Wartość do prawej przy długim tekście jest nieczytelna. " + R]],
[["Struktura", "<code>&lt;dl&gt;</code>/<code>dt</code>/<code>dd</code>", P + " w kodzie", W("info-and-relationships", "1.3.1 (A)"), "Czytnik"], ["Kontrast", "mute/surface 5,2:1; #555/niebo 6,1:1", P, W("contrast-minimum", "1.4.3 (AA)"), "—"]],
"<ul><li>Źródła: S02, S03, S05, S08, S09, S10.</li></ul>",
ev("side-cand", "spec"))

# ============================================================ 13. Kroki
card("c13", "Lista kroków procesu",
"""<p>Numerowana lista etapów z czasem: proces rekrutacji w ogłoszeniu {P} (S02). Numer „01” w Departure Mono, opis w Nunito Sans, czas w DM Mono po prawej. Ramki górna i dolna, linie między krokami.</p>
<p>Wybór: sekwencja 3–6 etapów z czasem lub terminem. Postęp formularza („Krok 1 / 3” w S09) to inny wzorzec, lokalny dla strony {P}.</p>""".format(P=P),
[["Numer", "tak", ".n", P], ["Opis", "tak", "tekst", P], ["Czas", "opcjonalny", ".t-data", P]],
[["—", "jeden wariant", "—", "—", P + " S02"]],
"",
[["Kroki", "lista", "4 (S02)", "—", "—", P]],
[["Ramki / linie", "--frame / --rule", "—", "—", CSS, P]],
[["Pion kroku", "—", "16 px", "--s4", P + " " + CSS], ["Kolumna numeru", "—", "48 px", "—", P]],
[["Numer", ".n", "Departure Mono 400", "11 px", "—", "1 px", "--mute"], ["Opis", "li", "Nunito Sans 400", "14 px", "—", "—", "--ink"], ["Czas", ".t-data", "DM Mono 400", "14 px", "—", "—", "--mute"]],
"<p>Czas: „30 min”, „3 h”, „do 5 dni” " + P + ". Na mobile opis zawija się, czas zostaje po prawej " + P + " S02 390 px.</p>",
[["Każdy krok z czasem", "Kroki bez informacji o czasie", "Kandydat planuje czas. " + R]],
[["Struktura", "<code>&lt;ol&gt;</code> zachowuje kolejność dla czytnika", P + " w kodzie", W("info-and-relationships", "1.3.1 (A)"), "Czytnik"]],
"<ul><li>Źródła: S02, S10.</li></ul>",
ev("steps"))

# ============================================================ 14. Sec-head
card("c14", "Nagłówek sekcji z akcją",
"""<p>Nagłówek sekcji (<code>.t-sec</code>, DM Mono 500) z opcjonalnym opisem pod spodem i akcją po prawej (<code>.cta</code>, <code>.cta2</code> albo <code>.tx</code>) {P} (S01, S03–S05). Odstęp 64 px nad sekcją tworzy „powietrze” między ramkami {P} (S11 „Odstępy”).</p>""".format(P=P),
[["Tytuł", "tak", "h2.t-sec", P], ["Opis / legenda", "opcjonalny", "p.t-meta", P + " S01, S03, S04"], ["Akcja", "opcjonalna", ".cta / .cta2 / .tx", P]],
[["Akcja", ".cta", "Główna czynność ekranu", "—", P + " S04"], ["Akcja", ".cta2", "Gdy główna jest gdzie indziej albo nieustalona", "—", P + " S01, S03"], ["Akcja", ".tx", "Link „Wszystkie (214)”", "—", P + " S05"], ["Szerokość", "≤760 px", "—", ".cta na 100%, pod tytułem", P]],
"",
[["Tytuł", "tekst", "„312 ofert”, „Ogłoszenia”, „Najdłużej czekają”", "—", "—", P], ["Opis", "tekst", "wyjaśnienie ciemnego wiersza, sortowanie", "—", "—", P]],
[["—", "dziedziczy z .t-sec i przycisków", "—", "—", CSS, P]],
[["Nad sekcją", "desktop / mobile", "64 / 48 px", "--s8 / --s7", P + " " + CSS], ["Pod nagłówkiem", "—", "24 px", "--s5", P], ["Tytuł ↔ akcja", "—", "16 × 24 px (zawijanie)", "--s4, --s5", P]],
[["Tytuł", ".t-sec", "DM Mono 500", "28 px (mobile 22)", "1.15", "−0.03em", "--ink"], ["Opis", ".t-meta", "Nunito Sans 400", "14 px", "1.4", "—", "--mute"]],
"<p>Tytuł może być liczbą wyników („312 ofert”) z odmianą: 1 oferta / 2–4 oferty / 5+ ofert " + R + ".</p>",
[["Opis pod tytułem wyjaśnia ciemne wiersze listy", "Legenda w osobnym miejscu daleko od listy", "Wyjaśnienie tam, gdzie patrzy użytkownik. " + P + " S12"]],
[["Hierarchia", "h2 pod h1 pulpitu/szczegółu", P + " w kodzie", W("info-and-relationships", "1.3.1 (A)"), "Struktura nagłówków"]],
"<ul><li>Źródła: S01, S03–S05, S10, S11.</li></ul>",
ev("cta-sechead", "cta2-sechead"))

# ============================================================ 15. Stan pusty
EMPTY_SPEC = """<div class="empty" style="max-width:520px"><span class="t-label">0 wyników</span><p style="margin:0 0 12px">Najbardziej zawęża filtr „Widełki od 30 tys. zł”.</p><button class="tx" type="button">Wyczyść filtry</button></div>"""
card("c15", "Stan pusty",
"""<p>Komunikat zamiast pustej listy: przerywana ramka, etykieta „0 wyników”, zdanie o przyczynie i <code>.tx</code> do wyjścia ze stanu {R} (S12 przepis 6). <b>Żaden ekran go nie pokazuje</b>, a styl istnieje tylko w CSS {Q}.</p>""".format(R=R, Q=Q),
[["Ramka przerywana", "tak", ".empty", P + " CSS"], ["Etykieta", "tak", ".t-label", R], ["Zdanie przyczyny", "tak", "p", R], ["Akcja wyjścia", "opcjonalna", ".tx", R]],
[["Kontekst", "Zero wyników filtra", "—", "—", R + " S12"], ["Kontekst", "Pusta shortlista", "—", "Pulpit „00”, pasek akcji ukryty (bez .empty)", R + " S12"], ["Kontekst", "Ładowanie", "—", "Wiersze-szkielety --chip, liczniki „—”", R + " S12"]],
"", [["Tekst", "tekst", "nie pokazano", "—", "—", Q]],
[["Ramka", "--frame (przerywana)", "—", "#8a8a8a", CSS, P]],
[["Padding", "—", "48 px", "--s7", P + " " + CSS]],
[["Etykieta", ".t-label", "Departure Mono", "11 px", "—", "1 px", "--mute"]],
"<p>Zdanie mówi, który filtr najbardziej zawęża wynik; bez ilustracji i bez pomarańczowej pigułki " + R + " S12.</p>",
[["„Najbardziej zawęża filtr …” + „Wyczyść filtry”", "„Brak wyników” bez wskazówki", "Użytkownik wie, co zmienić. " + R]],
[["Komunikat", "Pojawienie się ogłoszone", T, W("status-messages", "4.1.3 (AA)"), "Czytnik po filtrowaniu"]],
"<ul><li>Źródła: S10, S12. Brak w ekranach.</li></ul>", "", spec_box(EMPTY_SPEC, "cały komponent " + R))

# ============================================================ 16. Pasek akcji
card("c16", "Pasek akcji zbiorczych",
"""<p>Pasek przyklejony u dołu listy albo formularza. Pokazuje liczbę zaznaczonych pozycji (albo stan szkicu) i akcje na nich. Na liście pojawia się dopiero po zaznaczeniu, a jego <code>.cta</code> jest punktem kontrastu nr 3 {P} (S07, S12). W formularzu stoi stale („Szkic zapisany 14:32” + „Dalej”) {P} (S09).</p>""".format(P=P),
[["Etykieta stanu", "tak", ".t-label", "„2 zaznaczone”, „Szkic zapisany 14:32” " + P], ["Akcje poboczne", "opcjonalne", ".tx", "„Porównaj”, „Odznacz”, „Zapisz szkic” " + P], ["Akcja główna", "tak", ".cta", P]],
[["Kontekst", "lista (S07)", "Po zaznaczeniu ≥1", "Ukryty przy 0 (hidden)", P], ["Kontekst", "formularz (S09)", "Zawsze", "—", P], ["Szerokość", "≤760 px", "—", ".tx ukryte; zostaje etykieta + .cta", P + " CSS"]],
"",
[["Liczba zaznaczonych", "liczba", "1, 2", "0 → ukryty", "Etykieta i odmiana w .cta", P + " S07"]],
[["Tło / linia górna", "--surface / --frame", "—", "#fcfcfc / #8a8a8a", CSS, P]],
[["Padding", "desktop / mobile", "16 px + --gutter / 12 px", "--s4 / --s3", P + " " + CSS], ["Odstęp nad paskiem", "—", "48 px", "--s7", P], ["Odstęp elementów", "—", "24 px (mobile 12)", "—", P]],
[["Etykieta", ".t-label", "Departure Mono", "11 px", "—", "1 px", "--ink"]],
"<p>Etykieta przycisku odmienia liczbę: „Zaproś 1 osobę / 2 osoby / 5 osób do rozmowy” " + P + " (S07). Zaznaczenie aktualizuje licznik „Shortlista” w pulpicie " + P + ".</p>",
[["Pasek ukryty przy 0 zaznaczonych", "Pasek z wyłączonym przyciskiem stale widoczny na liście", "Pomarańcz pojawia się, gdy jest co zrobić. " + P + " S12"]],
[["Zasłanianie fokusu", "Przyklejony pasek nie może zasłonić fokusu w ostatnich wierszach (dodać scroll-padding-bottom)", T, W("focus-not-obscured-minimum", "2.4.11 (AA)"), "Tab do ostatniego wiersza"],
 ["Zmiana liczby", "„2 zaznaczone” ogłaszane po zmianie", T, W("status-messages", "4.1.3 (AA)"), "<code>aria-live=\"polite\"</code>"],
 ["Reflow", "Na 320 px etykieta + .cta mieszczą się", T, W("reflow", "1.4.10 (AA)"), "320 px"]],
"<ul><li>Źródła: S07, S09, S10, S12.</li></ul>",
ev("actbar", "form-actbar"))

# ============================================================ 17. Pole formularza
card("c17", "Pole formularza i komunikaty błędów",
"""<p>Etykieta w Departure Mono nad polem, pole z ramką <code>--frame</code>, podpowiedź pod polem. Błąd: karmazynowa ramka <code>--alert</code>, podpowiedź w tym kolorze z ikoną „!” oraz podsumowanie błędów <code>.note-err</code> nad formularzem z linkami do pól {P} (S09). Czerwień tylko w stanie błędu {P} (S13). Formularze to ekstrapolacja: nie było ich w badanych źródłach {P} (S11).</p>""".format(P=P),
[["Etykieta", "tak", ".field &gt; label", P], ["Pole", "tak", "input / select / textarea", P], ["Podpowiedź", "opcjonalna", ".hint", P], ["Ikona błędu", "w błędzie", "::before „!”", P], ["Podsumowanie błędów", "przy błędach", ".note-err z linkami", P], ["Wybór jednej opcji", "opcjonalny", "fieldset.choice (C04)", P]],
[["Stan", "domyślny", "—", "Ramka --frame", P + " S09"], ["Stan", ":focus", "—", "Ramka + obwódka --ink", P + " CSS; " + T], ["Stan", ".err", "Błąd walidacji", "Ramka i podpowiedź --alert, „!”", P + " S09"], ["Typ", "liczba (widełki)", "—", "Krój DM Mono w polu", P + " S09 (styl strony)"], ["Układ", "2 kolumny", "Pary pól (Od / Do)", "Na ≤860 px jedna kolumna", P + " S09 (styl strony)"]],
"",
[["Etykieta", "tekst", "„Tytuł stanowiska”, „Lokalizacja”, „Od (zł / mies., B2B)”", "—", "—", P], ["Błąd", "boolean + tekst", "„Wpisz tytuł…”, „Górna granica musi być większa niż dolna (26 000).”", "—", "—", P], ["Podpowiedź", "tekst", "opis segmentów, informacja o widełkach", "—", "—", P]],
[["Ramka pola", "--frame", "domyślny", "#8a8a8a", CSS, P], ["Błąd", "--alert", ".err", "#9f1239", S11, P], ["Fokus", "--ink", ":focus", "#1c1c1c", CSS, P]],
[["Etykieta → pole → podpowiedź", "—", "8 px", "--s2", P + " " + CSS], ["Pole → kolejne pole", "—", "24 px", "--s5", P], ["Padding pola", "—", "12 × 14 px", "—", P]],
[["Etykieta", ".field&gt;label", "Departure Mono 400", "11 px", "—", "1 px, wersaliki", "--mute"], ["Wartość", "input", "Nunito Sans 400", "16 px", "—", "—", "16 px, by iOS nie przybliżał"], ["Podpowiedź", ".hint", "Nunito Sans 400", "13 px", "—", "—", "--mute / --alert"]],
"<p>Komunikat błędu mówi, co poprawić, i podaje wartość odniesienia („większa niż dolna (26 000)”) " + P + ". Moment walidacji (na wyjściu z pola / przy wysłaniu) nie jest pokazany " + Q + ". Stan „sukces” nie jest zaprojektowany " + Q + ".</p>",
[["Błąd: ramka + „!” + tekst + podsumowanie u góry", "Sama czerwona ramka", "Kolor nie może być jedynym sygnałem. " + P + " S09"], ["Karmazyn #9f1239 dla błędów", "Czerwono-pomarańczowy błąd", "Pomarańcz to akcja; błąd musi się od niej odróżniać. " + P + " S11"]],
[["Etykiety", "Widoczna etykieta powiązana z polem (<code>for</code>)", P + " w kodzie", W("labels-or-instructions", "3.3.2 (A)"), "Klik w etykietę ustawia fokus"],
 ["Identyfikacja błędu", "Tekst błędu + <code>aria-invalid</code> + <code>aria-describedby</code>", P + " w kodzie", W("error-identification", "3.3.1 (A)") + "; " + W("error-suggestion", "3.3.3 (AA)"), "Czytnik ogłasza błąd przy fokusie"],
 ["Podsumowanie", "<code>role=\"alert\"</code> na .note-err; linki przenoszą fokus do pól", P + " w kodzie; działanie " + T, W("status-messages", "4.1.3 (AA)"), "Wysłać pusty formularz"],
 ["Kontrast", "alert/surface 7,8:1; ramka pola 3,4:1", P, W("non-text-contrast", "1.4.11 (AA)"), "—"]],
"<ul><li>Źródła: S09, S10, S11, S13.</li><li><b>Luka:</b> pola: textarea, checkbox, upload CV, datepicker nie pokazane.</li></ul>",
ev("form-err", "form-panel"))

# ============================================================ Fundamenty i układ szczegółu
FOUND = f"""<section class="page card" id="fundamenty"><div class="card-head"><span class="tag">F</span><h2 class="t-sec">Fundamenty: wspólne tokeny i zasady</h2></div>
<p>Tokeny poniżej dotyczą wszystkich kart. Nazwy i wartości pochodzą ze specyfikacji systemu (S10 <code>instrument.css</code>, S11 <code>visual-system.md</code>), więc mają status {P}. Pochodzenie ze źródeł badawczych (Nothing, Oxide, Teenage Engineering, Stripe Press) opisuje S11.</p>
<h3>Zasady systemu (S13)</h3><ol>
<li><b>Budżet kontrastu:</b> najwyżej 3 mocne punkty na widok: pulpit, wiersze <code>.sl</code>, jedna <code>.cta</code>.</li>
<li><b>Ciemne znaczy „ważne”.</b></li>
<li><b>Pomarańczowy znaczy tylko „zrób to”</b> i występuje tylko jako tło <code>.cta</code>.</li>
<li><b>Zielony znaczy tylko „dostępny”.</b></li>
<li><b>Cztery głosy tekstu:</b> Nunito Sans (ludzie), DM Mono (tytuły, dane), Departure Mono (etykiety 11 px), Doto (liczniki).</li>
<li><b>Wszystko w ramkach:</b> kąty proste, obrys 1 px, dużo powietrza między ramkami, zwarte dane w środku.</li></ol>
<h3>Kolor</h3>{table(["Token", "Wartość", "Rola", "Status"], [
["--paper", "#f2f2f2", "tło strony", P], ["--surface", "#fcfcfc", "wnętrze ramek", P], ["--ink", "#1c1c1c", "tekst, ramka przycisków, fokus", P], ["--mute", "#555555", "meta, etykiety (ciemniejsza, bo tłem jest gradient)", P],
["--chip", "#e3e3e3", "wypełnienie neutralne (disabled)", P], ["--frame", "#8a8a8a", "ramka zewnętrzna", P], ["--rule", "#d9d9d9", "linie wewnętrzne", P],
["--console / -ink / -mute / -line", "#0b0e12 / #dedede / #a3a4a5 / #30353d", "pulpit, wiersz .sl", P], ["--signal / -ink / -tint / -deep", "#00d892 / #00503a / #dcf3ea / #0e3b2c", "„dostępny”", P],
["--action / -hover / -press", "#ff5a1f / #ff7a45 / #e8540f", "tylko .cta", P + " (wartość bazowa szacowana ze źródła TE)"], ["--alert", "#9f1239", "tylko błędy", P],
["--sky", "#efe7ec → #e3e9ec (180°)", "tło każdej strony (na .ins)", P], ["--sky-line", "#e7d4e5 → #cad9e5", "linia horyzontu pod pulpitem", P]])}
<h3>Kontrast par tokenów (WCAG 2.x, obliczony z wartości)</h3>{table(["Para", "Kontrast", "Ocena"], [
["ink / surface", "16,6:1", "AA"], ["mute #555 / surface", "7,3:1", "AA"], ["mute #555 / paper", "6,7:1", "AA"], ["mute #555 / niebo", "≈ 6,1:1", "AA"], ["console-ink / console", "14,4:1", "AA"], ["console-mute / console", "7,8:1", "AA"], ["signal / console", "10,4:1", "AA"],
["signal-ink / signal-tint", "8,2:1", "AA"], ["ink / action (tekst .cta)", "5,5:1", "AA"], ["alert / surface", "7,8:1", "AA"], ["frame / surface (granica)", "3,4:1", "≥ 3:1 (1.4.11)"],
["<b>signal / surface</b>", "1,8:1", "<b>zakazane</b>: jasna zieleń na jasnym"], ["<b>biały / action</b>", "3,1:1", "<b>zakazane</b>"], ["<b>action / paper (tekst)</b>", "2,8:1", "<b>zakazane</b>"]])}
<p class="t-meta">Kontrast liczony ze wzoru WCAG na wartościach tokenów, nie z pikseli. Nie dowodzi zgodności wdrożenia {T}.</p>
<h3>Typografia</h3>{table(TYPO_HEAD, [
["Tytuł strony", ".t-h1", "DM Mono 500", "52 px (mobile 32)", "1.05", "−0.04em", "--ink"], ["Nagłówek sekcji", ".t-sec", "DM Mono 500", "28 px (mobile 22)", "1.15", "−0.03em", "--ink"],
["Tytuł pulpitu", ".c-title", "DM Mono 500", "34 px (mobile 23)", "1.15", "−0.035em", "biały"], ["Nazwa w wierszu", ".t-name", "Nunito Sans 650", "18 px", "1.25", "−0.005em", "--ink"],
["Treść", ".t-body", "Nunito Sans 400", "16 px", "1.6", "0", "maks. 68 znaków"], ["Lead", ".lead", "Nunito Sans 400", "19 px", "1.5", "0", "maks. 56 znaków"], ["Meta", ".t-meta", "Nunito Sans 400", "14 px", "1.4", "0", "--mute"],
["Dane", ".t-data", "DM Mono 400", "14 px", "1.4", "—", "cyfry tabelaryczne"], ["Etykieta", ".t-label i 11 px", "Departure Mono 400", "11 px (tylko)", "1.3", "1 px", "wersaliki"], ["Licznik", ".c-stat b", "Doto 700", "48 px", "1", "—", "tylko pulpit"]])}
<p>Fonty: DM Mono, Nunito Sans, Doto z Google Fonts (SIL OFL). Departure Mono v1.500 (Helena Zhang, SIL OFL) lokalnie w <code>assets/fonts/</code> {P}. Polskie znaki sprawdzone w renderze {P}.</p>
<h3>Odstępy</h3>{table(["Token", "Wartość"], [["--s1 … --s9", "4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px"], ["--gutter", "48 px desktop, 16 px ≤760 px"]])}
<h3>Kształt, cienie, fokus, favicon</h3><ul><li>Promień 0 wszędzie, bez cieni {P}.</li><li>Fokus: obrys 2 px <code>--ink</code> z odsunięciem 2 px; na ciemnym <code>--signal</code> {P}. Na zrzutach niepokazany {T}.</li><li>Favicon: czarny kwadrat z pomarańczową kropką (<code>assets/favicon.svg</code>) {P}.</li><li>Punkty przełamania widoczne w CSS: 760 px (lista, filtry, pulpit) i 860 px (układ szczegółu) {P}. Zachowanie między 390 a 1440 px poza tymi progami {T}.</li></ul>
</section>
<section class="page card" id="uklad"><div class="card-head"><span class="tag">U</span><h2 class="t-sec">Wzorzec układu: strona szczegółu</h2></div>
{render_block("uklad")}{ev("detail-d", "detail-m", "profile-head")}
<p><code>.detail</code>: nagłówek (<code>.d-head</code>), karta faktów (<code>.side</code>) i treść (<code>.d-body</code>). Desktop: treść | karta 340 px, odstęp 64 px, karta przyklejona. ≤860 px: kolejność nagłówek → karta → treść {P} (S02, S05, S08). Nagłówek zawiera:</p>
<ul><li>link „‹ wstecz” z kontekstem („Oferty: zdalnie (312)”);</li><li><code>.t-label</code> z segmentem i numerem;</li><li>H1;</li><li><code>.lead</code>;</li><li><code>.chips</code>.</li></ul>
<p>Tło: gradient „niebo”, jak na każdej stronie (domyślne tło <code>.ins</code>) {P}. Punkt kontrastu: jedna <code>.cta</code> w karcie, bez pulpitu {P} (S12 przepis 3).</p></section>"""

# ============================================================ assemble
SOURCES = table(["ID", "Materiał", "Rodzaj", "Widoki"], [
["S01", "docs/instrument/prototypes/kandydat-oferty.html", "ekran: lista ofert (kandydat)", "1440×900, 390×844"], ["S02", "docs/instrument/prototypes/kandydat-oferta.html", "ekran: ogłoszenie (kandydat)", "1440, 390"],
["S03", "docs/instrument/prototypes/pulpit-pracodawcy.html", "ekran: pulpit pracodawcy", "1440, 390"], ["S04", "docs/instrument/prototypes/pracodawca-ogloszenia.html", "ekran: ogłoszenia firmy", "1440, 390"],
["S05", "docs/instrument/prototypes/pracodawca-ogloszenie.html", "ekran: własne ogłoszenie", "1440, 390"], ["S06", "docs/instrument/prototypes/index.html", "ekran: indeks prototypów", "1440"],
["S07", ".claude/skills/doroboty-instrument-ui/assets/candidate-list.html", "wzorzec: lista kandydatów", "1440, 390"], ["S08", "…/assets/candidate-profile.html", "wzorzec: profil kandydata", "1440"],
["S09", "…/assets/job-form.html", "wzorzec: formularz w stanie błędu", "1440"], ["S10", "…/assets/instrument.css", "specyfikacja stylów", "—"],
["S11", "…/references/visual-system.md", "opis systemu: tokeny, typografia, kontrast", "—"], ["S12", "…/references/screen-recipes.md", "przepisy ekranów, bramki przeglądu", "—"], ["S13", "…/SKILL.md", "zasady kierunku", "—"]])

INDEX = table(["Karta", "Rodzina", "Przeznaczenie", "Źródła"], [
["<a href='#fundamenty'>F</a>", "Fundamenty", "tokeny, kontrast, typografia, odstępy", "S10, S11, S13"], ["<a href='#uklad'>U</a>", "Układ szczegółu", "nagłówek, karta faktów, treść", "S02, S05, S08"]] + [
[f"<a href='#{cid}'>{cid.upper()}</a>", name, "", ""] for cid, name, _ in CARDS])
PURPOSES = {"c01": ("orientacja i konto", "S01, S02, S04, S05"), "c02": ("skala i pilność w liczbach (kontrast nr 1)", "S01, S03, S04, S07"), "c03": ("akcje: główna, druga, link", "S01–S05, S07–S09"),
"c04": ("zawężanie listy, wybór jednej opcji, wyszukiwanie", "S01, S04, S07, S09"), "c05": ("porównanie wielu pozycji (kontrast nr 2)", "S01, S03–S07"), "c06": ("stan dostępności i ogłoszenia", "S03–S05, S07, S08"),
"c07": ("stały fakt pozycji, podpis", "S01, S02, S05, S08"), "c08": ("kategoria Build/Apply/Lead", "7 ekranów"), "c09": ("identyfikacja firmy, inicjały konta", "S01, S02, S04, S05"),
"c10": ("zapisanie oferty", "S01"), "c11": ("pojemniki, wykres z podpisem", "S02, S03, S05, S08, S09"), "c12": ("fakty jednej pozycji", "S02, S03, S05, S08, S09"),
"c13": ("etapy procesu z czasem", "S02"), "c14": ("tytuł sekcji z akcją", "S01, S03–S05"), "c15": ("brak wyników", "tylko S10, S12"), "c16": ("akcje na zaznaczonych, szkic", "S07, S09"), "c17": ("dane wejściowe i błędy", "S09")}
INDEX = table(["Karta", "Rodzina", "Przeznaczenie", "Źródła"], [
["<a href='#fundamenty'>F</a>", "Fundamenty", "tokeny, kontrast, typografia, odstępy", "S10, S11, S13"], ["<a href='#uklad'>U</a>", "Układ szczegółu", "nagłówek, karta faktów, treść", "S02, S05, S08"]] + [
[f"<a href='#{cid}'>{cid.upper()}</a>", name, PURPOSES[cid][0], PURPOSES[cid][1]] for cid, name, _ in CARDS])

OPEN = """<ol>
<li><s>Zielony checkbox zaznaczenia</s> <b>Rozwiązane 2026-11-18:</b> <code>.chk</code> ma teraz <code>accent-color: --ink</code>. (C05)</li>
<li><b>Klasy w CSS bez wystąpień w ekranach:</b> <code>.tag</code>, <code>.frame</code>, <code>.cap</code>, <code>.empty</code>, <code>.list.compact</code>, <code>.cta.ext</code>. Zostawić, pokazać na ekranach czy usunąć? (C03, C05, C07, C11, C15)</li>
<li><b>Stany interakcji</b> (hover, fokus, active, disabled) są zdefiniowane w CSS, ale żaden zrzut ich nie pokazuje. Wymagają przeglądu wizualnego i testu.</li>
<li><b>Dwa wzorce klikalnego wiersza:</b> cały wiersz <code>&lt;a&gt;</code> (S03–S05) albo link w nazwie (S01, S07). Wybrać jeden. (C05)</li>
<li><b>Linia <code>.why</code></b> przy trackingu 1 px łamie się w wąskich kolumnach (S04). Skrócić teksty czy poszerzyć kolumnę? (C05)</li>
<li><b>Lista rozwijana filtrów (▾)</b> nie jest zaprojektowana. (C04)</li>
<li><b>Lista jako siatka divów</b> bez ról tabeli: semantyka do decyzji (<code>&lt;table&gt;</code> czy role ARIA). (C05)</li>
<li><b>Wykresy</b> (lejek, słupki) i postęp formularza („Krok 1 / 3”) to style lokalne stron. Czy mają zostać komponentami? (C11, C17)</li>
<li><b>Nazewnictwo:</b> segmenty Build / Apply / Lead po angielsku czy po polsku? Rodzaj gramatyczny w plakietkach („Niedostępna”)? (C06, C08)</li>
<li><b>Logo:</b> brak logo marki (wordmark tekstowy) i obsługi prawdziwych logo firm. (C01, C09)</li>
</ol>"""

DOC_CSS = """
body{margin:0}
.shell{display:grid;grid-template-columns:272px minmax(0,1fr);align-items:start}
.doc{max-width:1180px;margin:0 auto;padding:var(--s7) var(--gutter) var(--s9);min-width:0;width:100%}
.doc h1{margin-bottom:var(--s3)}
.doc h3{font:500 18px/1.2 var(--f-display);letter-spacing:-.02em;margin:var(--s7) 0 var(--s4);padding-top:var(--s4);border-top:1px solid var(--frame)}
.doc h4{font:400 11px var(--f-code);letter-spacing:1px;text-transform:uppercase;color:var(--mute);margin:var(--s5) 0 var(--s3)}
.doc p,.doc li{font-size:15px;line-height:1.6;max-width:80ch}
.doc code{font:400 13px var(--f-mono);background:var(--chip);padding:0 4px}
.toc{position:sticky;top:0;height:100vh;overflow-y:auto;background:var(--surface);border-right:1px solid var(--frame);display:flex;flex-direction:column}
.toc-brand{padding:var(--s5);border-bottom:1px solid var(--frame)}
.toc-brand b{display:block;font:500 15px var(--f-display);letter-spacing:-.02em;margin-top:6px}
.toc-group{font:400 11px var(--f-code);letter-spacing:1px;text-transform:uppercase;color:var(--mute);padding:var(--s5) var(--s5) var(--s2)}
.toc a{display:grid;grid-template-columns:40px 1fr;gap:var(--s2);align-items:baseline;font-size:14px;color:var(--ink);text-decoration:none;padding:9px var(--s5);border-left:2px solid transparent}
.toc a .k{font:400 11px var(--f-code);letter-spacing:1px;color:var(--mute)}
.toc a:hover{background:#fff}
.toc a[aria-current="page"]{background:var(--paper);border-left-color:var(--ink);font-weight:650}
.toc a[aria-current="page"] .k{color:var(--ink)}
.toc-foot{margin-top:auto;padding:var(--s5);border-top:1px solid var(--frame);font-size:12px;color:var(--mute)}
.card{background:var(--surface);border:1px solid var(--frame);padding:var(--s6);margin:0 0 var(--s7);scroll-margin-top:var(--s5)}
.pager{display:flex;justify-content:space-between;gap:var(--s4);flex-wrap:wrap;margin-top:var(--s7);padding-top:var(--s5);border-top:1px solid var(--frame)}
.pager .pg-prev::after{content:none}.pager .pg-prev{padding-right:var(--s5)}
.doc h1:focus,.doc h2:focus{outline:none}
.card-head{display:flex;align-items:center;gap:var(--s4);margin-bottom:var(--s5)}.card-head .t-sec{margin:0}
.tw{overflow-x:auto;margin:var(--s3) 0}
.dt{border-collapse:collapse;width:100%;font-size:13.5px}
.dt th{font:400 11px var(--f-code);letter-spacing:1px;text-transform:uppercase;color:var(--mute);text-align:left;padding:10px 12px;border:1px solid var(--frame);background:var(--paper)}
.dt td{padding:10px 12px;border:1px solid var(--rule);vertical-align:top;line-height:1.45}
.dt td code{font-size:12px}
.st{font-style:normal;font:400 10px var(--f-code);letter-spacing:.5px;text-transform:uppercase;border:1px solid currentColor;padding:2px 5px;white-space:nowrap;display:inline-block}
.st-p{color:#00503a}.st-s{color:#7a4a00}.st-r{color:#4b3aa8}.st-q{color:#9f1239}.st-t{color:#1c1c1c;border-style:dashed}
.legend{display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;font-size:13px}
.evs{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:var(--s5);margin:var(--s4) 0}
.evid{margin:0;border:1px solid var(--frame);background:#fff;min-width:0}
.evid.wide{grid-column:1/-1}
.evid img{display:block;width:100%;height:auto;border-bottom:1px solid var(--rule)}
.evid.narrow img{max-width:390px;margin:0 auto}
.evid figcaption{padding:var(--s3) var(--s4);font-size:13px}
.renders{border:1px solid var(--frame);margin:var(--s4) 0 var(--s5)}
.rd-head{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font:400 11px var(--f-code);letter-spacing:1px;text-transform:uppercase;color:var(--mute);padding:10px 16px;border-bottom:1px solid var(--frame);background:var(--surface)}
.rd+.rd{border-top:1px solid var(--rule)}
.rd-cap{font-size:13px;color:var(--mute);padding:12px 24px 0;background-image:var(--sky)}
.rd-body{padding:16px 24px 24px;background-image:var(--sky);overflow-x:auto}
@media (min-width:761px){.rd-body .list{min-width:760px}}
.ctx{margin:0 0 var(--s4)}.ctx ul{margin:8px 0 0;padding-left:18px;font-size:13px}.ctx li{margin:4px 0}
.specimen{border:1px dashed var(--frame);margin:var(--s4) 0}
.sp-cap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font:400 11px var(--f-code);letter-spacing:1px;text-transform:uppercase;color:var(--mute);padding:10px 16px;border-bottom:1px dashed var(--frame)}
.sp-body{padding:var(--s5);background:var(--paper)}
.sp-row{display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;margin-bottom:var(--s3)}
.meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));border:1px solid var(--frame);margin:var(--s5) 0}
.meta-grid div{padding:var(--s4);border-right:1px solid var(--rule);font-size:14px}.meta-grid div:last-child{border-right:0}
.meta-grid b{display:block;font:400 11px var(--f-code);letter-spacing:1px;text-transform:uppercase;color:var(--mute);margin-bottom:6px}
@media (max-width:960px){.shell{display:block}
 .toc{position:sticky;top:0;z-index:5;height:auto;flex-direction:row;overflow-x:auto;overflow-y:hidden;border-right:0;border-bottom:1px solid var(--frame)}
 .toc-brand,.toc-group,.toc-foot{display:none}
 .toc a{display:block;white-space:nowrap;border-left:0;border-bottom:2px solid transparent;padding:12px 14px}
 .toc a .k{margin-right:6px}
 .toc a[aria-current="page"]{border-bottom-color:var(--ink)}
 .card{scroll-margin-top:56px}}
@media (max-width:760px){.card{padding:var(--s4)}.evs{grid-template-columns:1fr}.dt{font-size:12.5px}}
"""

NAV_JS = """<script>
(function(){
  const pages=[...document.querySelectorAll('section.page')];
  const ids=pages.map(p=>p.id);
  const links=[...document.querySelectorAll('.toc a')];
  const title=id=>{const a=links.find(l=>l.getAttribute('href')==='#'+id);return a?a.querySelector('span:last-child').textContent.trim():id};
  pages.forEach((p,i)=>{
    const nav=document.createElement('nav');nav.className='pager';nav.setAttribute('aria-label','Poprzednia i następna sekcja');
    const prev=ids[i-1],next=ids[i+1];
    nav.innerHTML=(prev?`<a class="cta2 pg-prev" href="#${prev}">← ${title(prev)}</a>`:'<span></span>')+(next?`<a class="cta2" href="#${next}">${title(next)}</a>`:'');
    p.appendChild(nav);
  });
  function show(){
    const id=(location.hash||'#przeglad').slice(1);
    if(!ids.includes(id)) return;             // kotwice wewnątrz sekcji (np. linki w błędach formularza) nie zmieniają strony
    pages.forEach(p=>{const on=p.id===id;p.hidden=!on;});
    links.forEach(a=>{const on=a.getAttribute('href')==='#'+id;on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');if(on)a.scrollIntoView({block:'nearest',inline:'nearest'})});
    const t=links.find(a=>a.getAttribute('href')==='#'+id);
    document.title='DoRoboty.ai — Instrument · '+(t?t.querySelector('span:last-child').textContent.trim():'');
    window.scrollTo(0,0);
    const h=document.getElementById(id).querySelector('h1,h2'); if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}
  }
  window.addEventListener('hashchange',show); show();
})();
</script>"""

page = f"""<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DoRoboty.ai — Instrument: komponenty {VERSION}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Doto:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="instrument.css">
<style>{DOC_CSS}</style></head><body class="ins">
<div class="shell">
<nav class="toc" aria-label="Nawigacja po systemie">
<div class="toc-brand"><span class="t-label">DoRoboty.ai · Instrument</span><b>Komponenty {VERSION}</b></div>
<div class="toc-group">Start</div>
<a href="#przeglad"><span class="k">00</span><span>Przegląd i źródła</span></a>
<div class="toc-group">Podstawy</div>
<a href="#fundamenty"><span class="k">F</span><span>Fundamenty</span></a>
<a href="#uklad"><span class="k">U</span><span>Układ szczegółu</span></a>
<div class="toc-group">Komponenty</div>
{''.join(f'<a href="#{c}"><span class="k">{c.upper()}</span><span>{esc(n.split(" (")[0])}</span></a>' for c, n, _ in CARDS)}
<div class="toc-group">Do decyzji</div>
<a href="#otwarte"><span class="k">?</span><span>Otwarte kwestie</span></a>
<div class="toc-foot">Wersja {VERSION} · {DATE}<br>Źródło: build_docs.py</div>
</nav>
<main class="doc" id="top">
<section class="page card" id="przeglad">
<div class="t-label">DoRoboty.ai · design system „Instrument” · dokumentacja komponentów dla designerów</div>
<h1 class="t-h1">Komponenty · {VERSION}</h1>
<p class="lead">Dokumentacja rodzin komponentów rozpoznanych w prototypach HTML kierunku „Instrument”: przeznaczenie, anatomia, warianty, tokeny, wymiary, typografia, zachowanie, praktyki i dostępność.</p>
<div class="meta-grid"><div><b>Wersja</b>{VERSION} · do oceny</div><div><b>Data analizy</b>{DATE}</div><div><b>Pokrycie</b>9/9 ekranów (6 prototypów + 3 wzorce), 4 dokumenty specyfikacji · 17 rodzin + fundamenty + 1 układ</div><div><b>Poza zakresem</b>ekrany niezaprojektowane: profil kandydata od strony kandydata, aplikowanie, wiadomości, ustawienia</div></div>
<h3>Legenda oznaczeń</h3><div class="legend">{P} widoczne w ekranie lub zapisane w specyfikacji (S10–S13) {S_} przybliżenie {R} propozycja, nie istniejąca zasada {Q} brak danych / konflikt {T} wymaga działającego produktu</div>
<p class="t-meta">Dokumentacja jest podzielona na sekcje: wybierz sekcję w nawigacji po lewej albo przejdź dalej przyciskiem na dole strony. Każda sekcja ma własny adres (np. <code>komponenty.html#c05</code>). Źródłem wartości liczbowych jest specyfikacja stylów S10, a nie pomiar pikseli, więc większość wymiarów ma status „Potwierdzone”. Każda karta zaczyna się od <b>żywego renderu</b> z CSS systemu: to te same klasy, co w prototypach, więc rendery zmieniają się razem z CSS. Hover, fokus i przełączniki można sprawdzić na miejscu. Pod renderem są linki do ekranów, na których komponent występuje, a zrzuty dowodowe leżą w <code>evidence/</code>. Render nie dowodzi zgodności z WCAG we wdrożeniu.</p>
<h3>Materiały źródłowe</h3>{SOURCES}
<h3>Indeks</h3>{INDEX}
</section>
{FOUND}
{''.join(c for _, _, c in CARDS)}
<section class="page card" id="otwarte"><div class="card-head"><span class="tag">?</span><h2 class="t-sec">Otwarte kwestie i pytania do właściciela systemu</h2></div>{OPEN}
<p class="t-meta">Standardy: <a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank" rel="noopener">WCAG 2.2 Quick Reference</a>, <a href="https://www.w3.org/WAI/ARIA/apg/patterns/" target="_blank" rel="noopener">WAI-ARIA APG Patterns</a>. APG to wzorce praktyk, a nie kryteria normatywne WCAG. Cel dostępności WCAG 2.2 AA przyjęty jako {R}, bo materiały go nie określają.</p></section>
</main></div>
{NAV_JS}<script>{RENDER_JS}</script></body></html>"""

out = os.path.join(HERE, "komponenty.html")
open(out, "w", encoding="utf-8").write(page)
subprocess.run(["python3", os.path.join(SKILL, "scripts", "inline_css.py"), out], check=True)
print("ok", round(os.path.getsize(out) / 1e6, 2), "MB")
