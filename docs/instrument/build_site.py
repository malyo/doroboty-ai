#!/usr/bin/env python3
"""Builds docs/instrument/site/ — the only thing to publish for the Instrument prototypes (git-ignored).

Run from the repository root:  python3 docs/instrument/build_site.py

site/ contains:
  index.html                      → redirect to the prototype index
  prototypes/*.html               → 6 prototype pages (index + 5 screens)
  wzorce/*.html                   → 3 page templates from the project skill
  design-system/komponenty.html   → component documentation (template links rewired to wzorce/)
  robots.txt                      → disallow indexing

Every page gets <meta name="robots" content="noindex, nofollow"> and a "Prototyp DoRoboty.ai · dane fikcyjne" bar.
Sources stay unchanged; site/ is recreated on every run and the script fails if any local link leaves site/.
Never publish the repository or docs/instrument/ itself; publish site/ only.
"""
import os, re, shutil, sys

ROOT = os.path.abspath(os.path.dirname(__file__))  # docs/instrument
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
SITE = os.path.join(ROOT, "site")
SKILL_ASSETS = os.path.join(REPO, ".claude", "skills", "doroboty-instrument-ui", "assets")

NOINDEX = '<meta name="robots" content="noindex, nofollow">'
BAR = ('<div role="note" style="background:var(--ink,#1c1c1c);color:#fff;font:400 11px/1 \'Departure Mono\',ui-monospace,monospace;'
       'letter-spacing:1px;text-transform:uppercase;padding:8px 16px;text-align:center">'
       'Prototyp DoRoboty.ai · dane fikcyjne · nie jest to działający serwis</div>')

def prepare(html):
    if 'name="robots"' not in html:
        html = re.sub(r'(<meta charset="[^"]*">)', lambda m: m.group(1) + NOINDEX, html, count=1)
    html = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + BAR, html, count=1)
    return html

def write(rel, html):
    out = os.path.join(SITE, rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(html)

def main():
    if os.path.exists(SITE):
        shutil.rmtree(SITE)
    pages = []
    for name in sorted(os.listdir(os.path.join(ROOT, "prototypes"))):
        if name.endswith(".html"):
            write(f"prototypes/{name}", prepare(open(os.path.join(ROOT, "prototypes", name), encoding="utf-8").read()))
            pages.append(f"prototypes/{name}")
    for name in ("candidate-list.html", "candidate-profile.html", "job-form.html"):
        write(f"wzorce/{name}", prepare(open(os.path.join(SKILL_ASSETS, name), encoding="utf-8").read()))
        pages.append(f"wzorce/{name}")
    doc = open(os.path.join(ROOT, "design-system", "komponenty.html"), encoding="utf-8").read()
    doc = doc.replace("../../../.claude/skills/doroboty-instrument-ui/assets/", "../wzorce/")
    write("design-system/komponenty.html", prepare(doc))
    pages.append("design-system/komponenty.html")
    write("index.html", '<!doctype html><html lang="pl"><head><meta charset="utf-8">' + NOINDEX +
          '<meta http-equiv="refresh" content="0; url=prototypes/index.html"><title>DoRoboty.ai · prototypy</title></head>'
          '<body><p><a href="prototypes/index.html">Przejdź do prototypów DoRoboty.ai</a></p></body></html>')
    open(os.path.join(SITE, "robots.txt"), "w").write("User-agent: *\nDisallow: /\n")

    # every local link must resolve to a file inside site/
    problems = []
    for rel in pages + ["index.html"]:
        html = open(os.path.join(SITE, rel), encoding="utf-8").read()
        for u in re.findall(r'(?:href|src)="([^"#]+)', html):
            if u.startswith(("http://", "https://", "data:", "mailto:", "javascript:")):
                continue
            target = os.path.normpath(os.path.join(SITE, os.path.dirname(rel), u))
            if not target.startswith(SITE + os.sep) or not os.path.exists(target):
                problems.append(f"{rel} → {u}")
    total = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(SITE) for f in fs)
    print(f"site/: {len(pages) + 1} pages, {round(total / 1024)} KB")
    if problems:
        print("BROKEN LINKS:\n  " + "\n  ".join(problems)); sys.exit(1)
    print("All local links resolve to files inside site/.")

if __name__ == "__main__":
    main()
