#!/usr/bin/env python3
"""Render the shared site chrome (utility bar, header + mega menus, mobile
menu, search dialog, footer) into every page, and lint the result.

Usage:
  python3 tools/build_layout.py            # re-render all pages + stamp ?v=<hash> on shared assets
  python3 tools/build_layout.py --migrate  # one-time: wrap legacy chrome in markers
  python3 tools/build_layout.py --check    # acceptance lint (exit 1 on problems)

Each page carries:
  <body data-section="dao-tao" data-root="../">
  <!-- layout:chrome --> ... <!-- /layout:chrome -->
  <!-- layout:footer --> ... <!-- /layout:footer -->

Partials live in tools/layout/*.html and use these placeholders:
  {{R}}      relative prefix to the site root ("" or "../"; "/" for 404.html)
  {{C:key}}  " is-current" when the page belongs to section `key`
  {{A:key}}  aria-current for main-nav items ("page" on the section index, else "true")
  {{U:key}}  same as A, for utility links
  {{O:key}}  " open" on the mobile <details> of the current section
  {{S:key}}  "is-current" class value for the mobile <summary>
Any chrome link whose href is exactly the current page also gets aria-current="page".
"""
import hashlib
import html.parser
import os
import re
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAYOUT = os.path.join(ROOT, "tools", "layout")
CHROME_PARTS = ["utility.html", "header.html", "mobile.html", "search.html"]
SKIP_DIRS = {".git", "tools", "node_modules", ".claude"}

# Shared assets get a content-hash query (?v=…) so a deploy never mixes cached old
# HTML/JS with fresh CSS (GitHub Pages serves everything with max-age=600).
ASSETS = ["assets/styles.css", "assets/scenes.js", "assets/data.js", "assets/site.js"]
ASSET_RE = re.compile(r'((?:src|href)="(?:\.\./)*)(assets/(?:styles\.css|scenes\.js|data\.js|site\.js))(?:\?v=([0-9a-f]+))?"')


def asset_versions():
    out = {}
    for a in ASSETS:
        with open(os.path.join(ROOT, a), "rb") as f:
            out[a] = hashlib.sha1(f.read()).hexdigest()[:10]
    return out


def stamp_assets(text, versions):
    return ASSET_RE.sub(lambda m: '%s%s?v=%s"' % (m.group(1), m.group(2), versions[m.group(2)]), text)

# Directory -> nav section. Pages outside this map get section "none".
SECTION_BY_DIR = {
    "gioi-thieu": "gioi-thieu", "dao-tao": "dao-tao", "nghien-cuu": "nghien-cuu",
    "sinh-vien": "sinh-vien", "tin-tuc": "tin-tuc",
    "su-kien": "tin-tuc", "doi-ngu": "doi-ngu", "doanh-nghiep": "doanh-nghiep",
    "bieu-mau": "bieu-mau", "alumni": "alumni", "hoc-lieu": "sinh-vien", "search": "search",
}
SECTION_INDEX = {"home": "index.html"}
for _d, _s in SECTION_BY_DIR.items():
    SECTION_INDEX.setdefault(_s, _d + "/index.html")

CHROME_RE = re.compile(r"<!-- layout:chrome -->.*?<!-- /layout:chrome -->", re.S)
FOOTER_RE = re.compile(r"<!-- layout:footer -->.*?<!-- /layout:footer -->", re.S)


def pages():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for f in sorted(filenames):
            if f.endswith(".html"):
                full = os.path.join(dirpath, f)
                yield os.path.relpath(full, ROOT).replace(os.sep, "/")


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write(path, text):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def root_prefix(rel):
    if rel == "404.html":
        # 404 is served at arbitrary paths: its links are relative to a <base> tag that
        # an inline script in its <head> sets to the site root ("/" or "/<repo>/" on GitHub Pages).
        return ""
    return "../" * rel.count("/")


def section_for(rel):
    if rel == "index.html":
        return "home"
    head = rel.split("/")[0] if "/" in rel else ""
    return SECTION_BY_DIR.get(head, "none")


def render(template, rel, section):
    r = root_prefix(rel)

    def aria(key):
        if key != section:
            return ""
        return ' aria-current="page"' if SECTION_INDEX.get(key) == rel else ' aria-current="true"'

    out = template.replace("{{R}}", r)
    out = re.sub(r"\{\{C:([\w-]+)\}\}", lambda m: " is-current" if m.group(1) == section else "", out)
    out = re.sub(r"\{\{[AU]:([\w-]+)\}\}", lambda m: aria(m.group(1)), out)
    out = re.sub(r"\{\{O:([\w-]+)\}\}", lambda m: " open" if m.group(1) == section else "", out)
    out = re.sub(r"\{\{S:([\w-]+)\}\}", lambda m: "is-current" if m.group(1) == section else "", out)

    # Exact-page links (no hash) get aria-current="page" unless already marked.
    here = r + rel

    def mark(m):
        tag = m.group(0)
        if "aria-current" in tag:
            return tag
        return tag[:-1] + ' aria-current="page">'
    out = re.sub(r'<a [^>]*href="%s"[^>]*>' % re.escape(here), mark, out)
    return out


def set_body_attrs(text, rel, section):
    def fix(m):
        attrs = m.group(1)
        attrs = re.sub(r'\s+data-(section|root)="[^"]*"', "", attrs)
        return '<body%s data-section="%s" data-root="%s">' % (attrs, section, root_prefix(rel))
    return re.sub(r"<body([^>]*)>", fix, text, count=1)


def build():
    chrome_tpl = "\n".join(read(os.path.join(LAYOUT, p)).rstrip() for p in CHROME_PARTS)
    footer_tpl = read(os.path.join(LAYOUT, "footer.html")).rstrip()
    versions = asset_versions()
    changed = 0
    for rel in pages():
        path = os.path.join(ROOT, rel)
        text = read(path)
        if "<!-- layout:chrome -->" not in text:
            print("skip (no markers): " + rel)
            continue
        m = re.search(r'<body[^>]*data-section="([\w-]+)"', text)
        section = m.group(1) if m else section_for(rel)
        chrome = render(chrome_tpl, rel, section)
        footer = render(footer_tpl, rel, section)
        new = CHROME_RE.sub(lambda _: "<!-- layout:chrome -->\n" + chrome + "\n<!-- /layout:chrome -->", text)
        new = FOOTER_RE.sub(lambda _: "<!-- layout:footer -->\n" + footer + "\n<!-- /layout:footer -->", new)
        new = set_body_attrs(new, rel, section)
        new = stamp_assets(new, versions)
        if new != text:
            write(path, new)
            changed += 1
    print("rendered layout; %d file(s) changed" % changed)


def migrate():
    for rel in pages():
        path = os.path.join(ROOT, rel)
        text = read(path)
        if "<!-- layout:chrome -->" in text:
            continue
        start = text.find('<a class="skip-link"')
        ends = [i for i in (text.find('<nav class="breadcrumb'), text.find("<main")) if i > -1]
        if start < 0 or not ends:
            print("cannot migrate (chrome not found): " + rel)
            continue
        end = min(ends)
        text = text[:start] + "<!-- layout:chrome -->\n<!-- /layout:chrome -->\n\n" + text[end:]
        text = re.sub(r'<footer class="site-footer">.*?</footer>',
                      "<!-- layout:footer -->\n<!-- /layout:footer -->", text, count=1, flags=re.S)
        text = set_body_attrs(text, rel, section_for(rel))
        write(path, text)
        print("migrated " + rel)


class PageScan(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.imgs = [], set(), []
        self.h1 = 0
        self.title = False
        self.desc = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.title = True
        if tag == "meta" and a.get("name") == "description" and a.get("content"):
            self.desc = True
        if tag == "a" and "href" in a:
            self.links.append(("href", a["href"]))
        if tag in ("img", "script", "link") and (a.get("src") or a.get("href")):
            self.links.append(("src", a.get("src") or a.get("href")))
        if tag == "img":
            self.imgs.append(a)


def ids_in(rel, cache):
    if rel not in cache:
        text = read(os.path.join(ROOT, rel))
        scan = PageScan()
        scan.feed(text)
        # ids created by inline render scripts: id="x" / id='x' / id=\"x\" inside JS strings
        js_ids = set(re.findall(r"""id=\\?["']([\w-]+)\\?["']""", text))
        if 'id="prog-root"' in text:
            # program pages are rendered by assets/site.js; track ids come from data.js
            site = read(os.path.join(ROOT, "assets", "site.js"))
            data = read(os.path.join(ROOT, "assets", "data.js"))
            js_ids |= set(re.findall(r"""id=\\?["']([\w-]+)\\?["']""", site))
            js_ids |= set(re.findall(r'key: "([\w-]+)"', data))
        cache[rel] = scan.ids | js_ids
    return cache[rel]


def check():
    problems = []
    id_cache = {}
    versions = asset_versions()
    for rel in pages():
        text = read(os.path.join(ROOT, rel))
        for m in ASSET_RE.finditer(text):
            if m.group(3) != versions[m.group(2)]:
                problems.append("%s: stale asset version for %s (run tools/build_layout.py)" % (rel, m.group(2)))
        scan = PageScan()
        scan.feed(text)
        base = os.path.dirname(rel)
        if scan.h1 != 1:
            problems.append("%s: %d <h1> elements" % (rel, scan.h1))
        if not scan.title:
            problems.append("%s: missing <title>" % rel)
        if not scan.desc:
            problems.append("%s: missing meta description" % rel)
        for img in scan.imgs:
            if "alt" not in img:
                problems.append("%s: <img src=%s> missing alt" % (rel, img.get("src")))
            if not (img.get("width") and img.get("height")):
                problems.append("%s: <img src=%s> missing width/height" % (rel, img.get("src")))
        for kind, url in scan.links:
            if url == "#" or url == "":
                problems.append("%s: empty/# link" % rel)
                continue
            p = urllib.parse.urlsplit(url)
            if p.scheme or url.startswith("//") or url.startswith("mailto:") or url.startswith("tel:"):
                continue
            if p.path.startswith("/"):  # root-absolute
                target = p.path.lstrip("/")
            elif p.path:
                target = os.path.normpath(os.path.join(base, p.path)).replace(os.sep, "/")
            else:
                target = rel
            if target.endswith("/") or target in ("", "."):
                target = (target.rstrip("/") + "/index.html").lstrip("/")
            full = os.path.join(ROOT, target)
            if not os.path.isfile(full):
                problems.append("%s: broken %s -> %s" % (rel, kind, url))
                continue
            if p.fragment and target.endswith(".html") and p.fragment not in ids_in(target, id_cache):
                problems.append("%s: missing anchor -> %s" % (rel, url))
    problems = list(dict.fromkeys(problems))  # chrome repeats links; report each once per page
    for pr in problems:
        print(pr)
    print("check: %d problem(s)" % len(problems))
    return 1 if problems else 0


if __name__ == "__main__":
    if "--migrate" in sys.argv:
        migrate()
    elif "--check" in sys.argv:
        sys.exit(check())
    else:
        build()
