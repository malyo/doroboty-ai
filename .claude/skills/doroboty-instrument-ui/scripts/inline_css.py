#!/usr/bin/env python3
"""Wkleja aktualny instrument.css i favicon do plików HTML, żeby działały samodzielnie.

Po co: podgląd plików w aplikacji Claude (i załączniki, e-maile, artefakty) otwiera HTML
jako data: URL, więc <link href="instrument.css"> nie ma do czego się odwołać i strona traci style.

Użycie:
  python3 inline_css.py strona.html [inna.html ...]            # CSS z assets/instrument.css skilla
  python3 inline_css.py --css ścieżka/instrument.css strona.html

Favicon (assets/favicon.svg: czarny kwadrat z pomarańczową kropką) trafia do <head> jako data: URI
w <link rel="icon" id="ins-favicon">, bo w podglądzie plik obok strony też nie byłby widoczny.

Lokalne fonty z instrument.css (url("fonts/….woff2")) są zamieniane na data: URI, z tego samego powodu.

Idempotentne: zamienia <link rel="stylesheet" href="...instrument.css"> albo istniejący blok
<style id="instrument-css">…</style> na świeżą kopię. Pozostałe <style> strony zostają nietknięte.
"""
import argparse, base64, os, re, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CSS = os.path.join(HERE, "..", "assets", "instrument.css")
LINK = re.compile(r'<link[^>]*href="[^"]*instrument\.css"[^>]*>', re.I)
BLOCK = re.compile(r'<style id="instrument-css">.*?</style>', re.S)
FAVICON_SVG = os.path.join(HERE, "..", "assets", "favicon.svg")
FAVICON = re.compile(r'<link[^>]*id="ins-favicon"[^>]*>')
OTHER_ICON = re.compile(r'<link[^>]*rel="(?:shortcut )?icon"[^>]*>', re.I)

def favicon_tag():
    svg = open(FAVICON_SVG, encoding="utf-8").read().strip()
    return f'<link rel="icon" id="ins-favicon" type="image/svg+xml" href="data:image/svg+xml,{urllib.parse.quote(svg)}">'

def with_favicon(s):
    tag = favicon_tag()
    if FAVICON.search(s):
        return FAVICON.sub(lambda _: tag, s)
    if OTHER_ICON.search(s):          # strona ma własną ikonę — nie nadpisuj
        return s
    return re.sub(r'(<meta charset="[^"]*">)', lambda m: m.group(1) + tag, s, count=1)

FONT_URL = re.compile(r'url\("(fonts/[^"]+\.woff2)"\)')

def embed_fonts(css, css_dir):
    def rep(m):
        path = os.path.join(css_dir, m.group(1))
        data = base64.b64encode(open(path, "rb").read()).decode()
        return f'url("data:font/woff2;base64,{data}")'
    return FONT_URL.sub(rep, css)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--css", default=DEFAULT_CSS)
    ap.add_argument("files", nargs="+")
    a = ap.parse_args()
    css = open(a.css, encoding="utf-8").read().strip()
    css = embed_fonts(css, os.path.dirname(os.path.abspath(a.css)))
    block = f'<style id="instrument-css">\n{css}\n</style>'
    for f in a.files:
        s = open(f, encoding="utf-8").read()
        if BLOCK.search(s):
            s, n = BLOCK.subn(lambda _: block, s)
        else:
            s, n = LINK.subn(lambda _: block, s)
        if n == 0:
            print(f"pominięto (brak linku do instrument.css ani bloku): {f}", file=sys.stderr)
            continue
        s = with_favicon(s)
        open(f, "w", encoding="utf-8").write(s)
        print(f"ok: {f}")

if __name__ == "__main__":
    main()
