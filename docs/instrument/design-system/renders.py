# Żywe rendery komponentów do dokumentacji (używają wyłącznie klas z instrument.css).
# Importowane przez build_docs.py. Każdy wpis: lista (podpis, html).

LIST_COLS = "--cols:18px 44px minmax(220px,1fr) 80px 120px 140px 90px 16px"

R = {}

R["c01"] = [
("Kandydat · bieżąca pozycja „Oferty”", """<nav class="topbar" aria-label="Przykład: kandydat"><a class="wordmark" href="#c01">DoRoboty<b>.ai</b></a><ul class="nav"><li><a href="#c01" aria-current="page">Oferty</a></li><li><a href="#c01">Zapisane (2)</a></li><li><a href="#c01">Moje aplikacje</a></li><li><a href="#c01">Profil</a></li></ul><div class="acct"><span>Zofia Łęcka</span><span class="logo" aria-hidden="true">ZŁ</span></div></nav>"""),
("Pracodawca · bieżąca pozycja „Ogłoszenia”", """<nav class="topbar" aria-label="Przykład: pracodawca"><a class="wordmark" href="#c01">DoRoboty<b>.ai</b></a><ul class="nav"><li><a href="#c01">Pulpit</a></li><li><a href="#c01" aria-current="page">Ogłoszenia</a></li><li><a href="#c01">Kandydaci</a></li><li><a href="#c01">Firma</a></li></ul><div class="acct"><span>Marta Kołodziej · Wektor Labs</span><span class="logo" aria-hidden="true">W</span></div></nav>"""),
]

R["c02"] = [
("4 liczniki, w tym sygnałowy · status „na żywo”", """<header class="console"><div class="c-head"><span>DoRoboty / Wektor Labs / Pulpit rekrutacji</span><span>Pon, 09.11.2026 · <span class="c-live">● na żywo</span></span></div><h1 class="c-title">Dzień dobry, Marta. 7 osób czeka na odpowiedź dłużej niż 48 h.</h1><div class="c-stats"><div class="c-stat"><b>07</b><small>Czekają &gt; 48 h</small></div><div class="c-stat"><b>18</b><small>Nowe / 24 h</small></div><div class="c-stat"><b class="sig">47</b><small>Dostępni od zaraz</small></div><div class="c-stat"><b>04</b><small>Aktywne ogłoszenia</small></div></div></header>"""),
("Kandydat · bez zieleni (nic nie znaczy „dostępny”)", """<header class="console"><div class="c-head"><span>DoRoboty / Oferty pracy z AI</span><span>Aktualizacja 09.11.2026, 14:10</span></div><h1 class="c-title">Praca dla ludzi, którzy budują, wdrażają i prowadzą AI</h1><div class="c-stats"><div class="c-stat"><b>128</b><small>Pasuje do profilu</small></div><div class="c-stat"><b>46</b><small>Nowe od wczoraj</small></div><div class="c-stat"><b>1284</b><small>Wszystkie oferty</small></div><div class="c-stat"><b>92%</b><small>Z widełkami</small></div></div></header>"""),
]

R["c03"] = [
("Trzy poziomy · najedź kursorem i przejdź klawiszem Tab, żeby zobaczyć hover i fokus", """<div class="sp-row"><button class="cta" type="button">Aplikuj profilem DoRoboty</button><button class="cta2" type="button">Edytuj ogłoszenie</button><button class="tx" type="button">Przedłuż o 30 dni</button></div>"""),
("Link zewnętrzny · wyłączony", """<div class="sp-row"><button class="cta ext" type="button">Otwórz stronę firmy</button><button class="cta2 ext" type="button">Regulamin pakietu</button><button class="cta" type="button" disabled>Zaproś do rozmowy</button></div>"""),
("Przełącznik (kliknij) · szerokie przyciski sklejone jak wiersze tabeli", """<div style="max-width:340px"><button class="cta wide" type="button">Przejrzyj zgłoszenia (41)</button><button class="cta2 wide js-toggle" type="button" aria-pressed="false">Zapisz ofertę</button><button class="cta2 wide js-toggle" type="button" aria-pressed="true">Na shortliście</button></div>"""),
]

R["c04"] = [
("Komórki filtrów (kliknij, by przełączyć) · wyszukiwanie ze skrótem · licznik wyników", """<div class="filters" style="padding:0"><button class="fpill js-pill" type="button" aria-haspopup="listbox">Segment ▾</button><button class="fpill js-pill" type="button" aria-pressed="true">Zdalnie ✕</button><button class="fpill js-pill" type="button" aria-haspopup="listbox">Lokalizacja ▾</button><button class="fpill js-pill" type="button" aria-haspopup="listbox">Widełki od ▾</button><label class="fsearch"><input type="search" placeholder="Szukaj: stanowisko, firma, technologia" aria-label="Szukaj ofert (przykład)"><kbd>/</kbd></label><span class="count">47 z 214</span></div>"""),
("Wybór jednej opcji (.choice) z licznikami", """<div class="filters" style="padding:0"><fieldset class="choice" aria-label="Stan ogłoszenia (przykład)"><label><input type="radio" name="doc-st" checked>Wszystkie (7)</label><label><input type="radio" name="doc-st">Aktywne (4)</label><label><input type="radio" name="doc-st">Szkice (1)</label><label><input type="radio" name="doc-st">Zakończone (2)</label></fieldset></div>"""),
]

ROWS_CANDS = """<div class="thead" aria-hidden="true"><span></span><span>Nr</span><span>Kandydat</span><span>Segment</span><span>Stawka</span><span>Dostępność</span><span>Akt. ↓</span><span></span></div>
<div class="row sl"><input class="chk js-chk" type="checkbox" checked aria-label="Shortlista: Agnieszka Wróblewska"><span class="nr">0142</span><div class="who"><a class="t-name" href="#c05">Agnieszka Wróblewska</a><span class="t-meta">ML Engineer · LLM fine-tuning, RAG · Kraków</span><span class="t-label why">Na shortliście · zaproszenie nie wysłane</span></div><span class="seg">▲ Build</span><span class="t-data rate">180 zł/h</span><span class="stat"><span class="badge ok">● Od zaraz</span></span><span class="t-data upd">2 h</span><span class="go" aria-hidden="true">›</span></div>
<div class="row"><input class="chk js-chk" type="checkbox" aria-label="Shortlista: Michał Zawadzki-Nowicki"><span class="nr">0139</span><div class="who"><a class="t-name" href="#c05">Michał Zawadzki-Nowicki</a><span class="t-meta">Head of AI Product · GenAI w bankowości · Warszawa</span></div><span class="seg">■ Lead</span><span class="t-data rate">26–30 tys. zł</span><span class="stat"><span class="badge">Od 01.12</span></span><span class="t-data upd">wczoraj</span><span class="go" aria-hidden="true">›</span></div>
<div class="row"><input class="chk js-chk" type="checkbox" aria-label="Shortlista: Zofia Łęcka"><span class="nr">0137</span><div class="who"><a class="t-name" href="#c05">Zofia Łęcka</a><span class="t-meta">Prompt Engineer / AI Content Lead · Łódź</span></div><span class="seg">● Apply</span><span class="t-data rate">14–17 tys. zł</span><span class="stat"><span class="badge warn">W rozmowach</span></span><span class="t-data upd">3 dni</span><span class="go" aria-hidden="true">›</span></div>
<div class="row"><input class="chk js-chk" type="checkbox" aria-label="Shortlista: Ewa Szczepańska-Bąk"><span class="nr">0128</span><div class="who"><a class="t-name" href="#c05">Ewa Szczepańska-Bąk</a><span class="t-meta">AI Transformation Lead · sektor publiczny · Wrocław</span></div><span class="seg">■ Lead</span><span class="t-data rate">—</span><span class="stat"><span class="badge off">Niedostępna</span></span><span class="t-data upd">6 dni</span><span class="go" aria-hidden="true">›</span></div>"""

R["c05"] = [
("Lista kandydatów (domyślne kolumny) · zaznacz checkbox, żeby przełączyć wiersz .sl", f"""<div class="list" style="padding:0;{LIST_COLS}">{ROWS_CANDS}</div>"""),
("Lista ofert · logo, chip trybu, gwiazdka (kliknij ☆)", """<div class="list" style="padding:0;--cols:32px minmax(220px,1fr) 80px 150px 110px 36px;--areas:'logo who seg rate mode save'"><div class="thead" aria-hidden="true"><span></span><span>Stanowisko</span><span>Segment</span><span>Widełki</span><span>Tryb</span><span></span></div>
<div class="row"><span class="logo" aria-hidden="true" style="grid-area:logo">W</span><div class="who"><a class="t-name" href="#c05">Senior ML Engineer, LLM</a><span class="t-meta">Wektor Labs · Kraków</span></div><span class="seg">▲ Build</span><span class="t-data rate">26–30 tys. zł</span><span style="grid-area:mode"><span class="chip">Hybryda</span></span><button class="save js-save" type="button" aria-pressed="false" aria-label="Zapisz: Senior ML Engineer, LLM" style="grid-area:save">☆</button></div>
<div class="row sl"><span class="logo" aria-hidden="true" style="grid-area:logo">K</span><div class="who"><a class="t-name" href="#c05">Prompt Engineer / AI Content Lead</a><span class="t-meta">Kwadrat Media · Łódź</span><span class="t-label why">Zapisana · wygasa za 4 dni</span></div><span class="seg">● Apply</span><span class="t-data rate">14–17 tys. zł</span><span style="grid-area:mode"><span class="chip">Zdalnie</span></span><button class="save js-save" type="button" aria-pressed="true" aria-label="Usuń z zapisanych: Prompt Engineer" style="grid-area:save">★</button></div></div>"""),
("Tryb kompaktowy (.list.compact) · 52 px, bez linii meta", f"""<div class="list compact" style="padding:0;{LIST_COLS}">{ROWS_CANDS}</div>"""),
]

R["c06"] = [
("Wszystkie stany na jasnym", """<div class="sp-row"><span class="badge ok">● Od zaraz</span><span class="badge">Od 01.12</span><span class="badge warn">W rozmowach</span><span class="badge off">Niedostępna</span><span class="badge">Aktywne</span><span class="badge warn">W weryfikacji</span><span class="badge off">Szkic</span><span class="badge off">Zakończone</span></div>"""),
("W wierszu wybranym (.row.sl)", """<div class="list" style="padding:0;--cols:1fr auto auto auto;--areas:'who a b c'"><div class="row sl" style="border-top:1px solid var(--frame)"><div class="who"><span class="t-name">Wiersz wybrany</span></div><span class="badge ok" style="grid-area:a">● Od zaraz</span><span class="badge" style="grid-area:b">Aktywne</span><span class="badge off" style="grid-area:c">Niedostępna</span></div></div>"""),
]

R["c07"] = [
("Chipy faktów i tagi podpisów", """<div class="chips" style="margin-bottom:16px"><span class="chip">Kraków / hybryda</span><span class="chip">B2B lub UoP</span><span class="chip">Senior</span><span class="chip">EN B2+</span></div><div class="sp-row"><span class="tag">Fig. 1 — Wdrożenie, 2025</span><span class="tag">Nr 0042</span></div>"""),
("Chipy poprzedzone plakietką stanu (nagłówek ogłoszenia pracodawcy)", """<div class="chips"><span class="badge">Aktywne</span><span class="chip">Kraków / hybryda</span><span class="chip">26–30 tys. zł</span><span class="chip">B2B / UoP</span></div>"""),
]

R["c08"] = [
("W wierszu, w nagłówku i w wyborze", """<div class="sp-row"><span class="seg">▲ Build</span><span class="seg">● Apply</span><span class="seg">■ Lead</span></div><div class="t-label" style="margin:12px 0">▲ Build · Oferta nr 0042 · dodana 09.11.2026</div><fieldset class="choice" aria-label="Segment (przykład)"><label><input type="radio" name="doc-seg" checked>▲ Build</label><label><input type="radio" name="doc-seg">● Apply</label><label><input type="radio" name="doc-seg">■ Lead</label></fieldset>"""),
]

R["c09"] = [
("32 px (lista, konto) · 40 px (O firmie) · w wierszu .sl", """<div class="sp-row"><span class="logo" aria-hidden="true">W</span><span class="logo" aria-hidden="true">ZŁ</span><span class="logo" aria-hidden="true" style="width:40px;height:40px">W</span><span style="display:inline-flex;gap:12px;align-items:center;font-size:14px"><span class="logo" aria-hidden="true">W</span><span><b>Wektor Labs</b><br><span class="t-meta">Kraków · 48 osób · legal tech</span></span></span></div><div class="list" style="padding:0;--cols:32px 1fr;--areas:'logo who'"><div class="row sl" style="border-top:1px solid var(--frame);min-height:0"><span class="logo" aria-hidden="true" style="grid-area:logo">G</span><div class="who"><span class="t-name">MLOps Engineer</span><span class="t-meta">Gridline · Gdańsk</span></div></div></div>"""),
]

R["c10"] = [
("Kliknij, żeby przełączyć", """<div class="sp-row"><button class="save js-save" type="button" aria-pressed="false" aria-label="Zapisz (przykład)">☆</button><button class="save js-save" type="button" aria-pressed="true" aria-label="Usuń z zapisanych (przykład)">★</button></div>"""),
]

R["c11"] = [
(".frame z nagłówkiem .cap · .panel · .fig z wykresem i podpisem", """<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:start">
<div class="frame"><div class="cap"><span>Fakty</span><span>Nr 0042</span></div><div style="padding:24px;font-size:14px">Ogólna ramka z nagłówkiem <code>.cap</code>.</div></div>
<div class="panel"><div class="cap"><span>Panel</span></div><p style="margin:0;font-size:14px">Grupa treści, np. pola formularza.</p></div>
<figure class="fig" style="margin:0"><div style="height:110px;display:flex;gap:8px;align-items:flex-end;border-bottom:1px solid var(--ink)"><i style="flex:1;height:38%;background:var(--chip)"></i><i style="flex:1;height:55%;background:var(--chip)"></i><i style="flex:1;height:81%;background:var(--chip)"></i><i style="flex:1;height:88%;background:var(--ink)"></i></div><figcaption><span class="t-label">Fig. 1 — Wdrożenie, 2025</span><br>recall@5 wzrósł z 0,38 do 0,88.</figcaption></figure></div>"""),
]

R["c12"] = [
(".kv w karcie faktów · .spec w treści", """<div style="display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);gap:40px;align-items:start">
<div class="side" style="position:static"><dl class="kv"><dt>Widełki</dt><dd class="t-data">26–30 tys. zł</dd><dt>Forma</dt><dd>B2B (netto) / UoP</dd><dt>Dostępność</dt><dd><span class="badge ok">● Od zaraz</span></dd><dt>Ważna do</dt><dd class="t-data">27.11.2026</dd></dl><button class="cta wide" type="button">Aplikuj profilem DoRoboty</button></div>
<dl class="spec"><dt>Konieczne</dt><dd>3+ lata z modelami językowymi w produkcji; Python; ewaluacja LLM</dd><dt>Mile widziane</dt><dd>vLLM, pgvector, fine-tuning LoRA; legal tech</dd><dt>Stack</dt><dd>Python, PyTorch, vLLM, Postgres + pgvector, AWS</dd></dl></div>"""),
]

R["c13"] = [
("Proces rekrutacji", """<ol class="steps-list" style="max-width:640px"><li><span class="n">01</span><span>Rozmowa z rekruterką</span><span class="t-data">30 min</span></li><li><span class="n">02</span><span>Zadanie: ewaluacja prostego systemu RAG (płatne)</span><span class="t-data">3 h</span></li><li><span class="n">03</span><span>Omówienie zadania z zespołem ML</span><span class="t-data">60 min</span></li><li><span class="n">04</span><span>Decyzja</span><span class="t-data">do 5 dni</span></li></ol>"""),
]

R["c14"] = [
("Z .cta · z .cta2 · z .tx", """<div class="sec-head" style="margin-top:0"><div><h2 class="t-sec">Ogłoszenia firmy</h2><p class="t-meta" style="margin:0">Ciemny wiersz: wymaga działania</p></div><button class="cta" type="button">+ Dodaj ogłoszenie</button></div><div class="sec-head"><div><h2 class="t-sec">312 ofert</h2><p class="t-meta" style="margin:0">Zdalnie · sortowanie: najnowsze ↓</p></div><button class="cta2" type="button">Powiadamiaj o nowych z tymi filtrami</button></div>
<div class="sec-head"><h2 class="t-sec">Najdłużej czekają</h2><a class="tx" href="#c14">Wszystkie zgłoszenia (214)</a></div>"""),
]

R["c15"] = [
("Zero wyników filtra", """<div class="empty" style="max-width:560px"><span class="t-label">0 wyników</span><p style="margin:0 0 12px">Najbardziej zawęża filtr „Widełki od 30 tys. zł”.</p><button class="tx" type="button">Wyczyść filtry</button></div>"""),
]

R["c16"] = [
("Lista: 2 zaznaczone", """<div class="actbar" style="position:static;margin-top:0;padding:16px 24px"><span class="t-label">2 zaznaczone</span><button class="tx" type="button">Porównaj</button><button class="tx" type="button">Odznacz</button><button class="cta" type="button">Zaproś 2 osoby do rozmowy</button></div>"""),
("Formularz: szkic", """<div class="actbar" style="position:static;margin-top:0;padding:16px 24px"><span class="t-label">Szkic zapisany 14:32</span><button class="tx" type="button">Zapisz szkic</button><button class="cta" type="button">Dalej: wymagania</button></div>"""),
]

R["c17"] = [
("Domyślne (kliknij, by zobaczyć fokus) · błąd · wybór · select · podsumowanie błędów", """<div class="note-err" role="note" style="margin-bottom:24px"><b>2 pola wymagają poprawy:</b> <a href="#doc-f1">tytuł stanowiska</a>, <a href="#doc-f2">widełki</a>.</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0 24px">
<div class="field"><label for="doc-f0">Lokalizacja</label><input id="doc-f0" value="Kraków"><span class="hint">Miasto albo „zdalnie”.</span></div>
<div class="field err"><label for="doc-f1">Tytuł stanowiska</label><input id="doc-f1" value="" aria-invalid="true" aria-describedby="doc-h1"><span class="hint" id="doc-h1">Wpisz tytuł, np. „Senior ML Engineer, LLM”.</span></div>
<div class="field"><label for="doc-f3">Tryb pracy</label><select id="doc-f3"><option>Hybryda</option><option>Zdalnie</option><option>Biuro</option></select></div>
<div class="field err"><label for="doc-f2">Do (zł / mies., B2B)</label><input id="doc-f2" value="22 000" style="font-family:var(--f-mono)" aria-invalid="true" aria-describedby="doc-h2"><span class="hint" id="doc-h2">Górna granica musi być większa niż dolna (26 000).</span></div>
</div><div class="field"><label id="doc-l-seg">Segment</label><fieldset class="choice" aria-labelledby="doc-l-seg"><label><input type="radio" name="doc-seg2" checked>▲ Build</label><label><input type="radio" name="doc-seg2">● Apply</label><label><input type="radio" name="doc-seg2">■ Lead</label></fieldset></div>"""),
]

R["uklad"] = [
("Strona szczegółu w skali 1:1 (nagłówek · karta faktów · treść)", """<div class="detail" style="padding:0;max-width:none">
<header class="d-head"><a class="back" href="#uklad" style="margin-bottom:24px">‹ Oferty: zdalnie (312)</a><div class="t-label">▲ Build · Oferta nr 0042 · dodana 09.11.2026</div><h1 class="t-h1" style="font-size:40px">Senior ML Engineer, LLM</h1><p class="lead">Wektor Labs. Budujemy asystentów dla kancelarii i działów prawnych.</p><div class="chips"><span class="chip">Kraków / hybryda</span><span class="chip">B2B lub UoP</span><span class="chip">Senior</span></div></header>
<aside class="side" style="position:static"><dl class="kv"><dt>Widełki</dt><dd class="t-data">26–30 tys. zł</dd><dt>Tryb</dt><dd>2 dni w biurze</dd><dt>Ważna do</dt><dd class="t-data">27.11.2026</dd></dl><button class="cta wide" type="button">Aplikuj profilem DoRoboty</button><button class="cta2 wide js-toggle" type="button" aria-pressed="false">Zapisz ofertę</button></aside>
<article class="d-body"><h2 class="t-sec" style="margin-top:40px">Wymagania</h2><dl class="spec"><dt>Konieczne</dt><dd>3+ lata z modelami językowymi w produkcji</dd><dt>Stack</dt><dd>Python, PyTorch, vLLM</dd></dl></article></div>"""),
]

JS = """
document.querySelectorAll('.js-toggle').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')));
document.querySelectorAll('.js-pill').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',!on);b.textContent=b.textContent.replace(on?' ✕':' ▾',on?' ▾':' ✕');}));
document.querySelectorAll('.js-chk').forEach(c=>c.addEventListener('change',()=>c.closest('.row').classList.toggle('sl',c.checked)));
document.querySelectorAll('.js-save').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.textContent=on?'★':'☆';const r=b.closest('.row');if(r)r.classList.toggle('sl',on);}));
"""
