#!/usr/bin/env python3
"""Render the shared site chrome (utility bar, header + mega menus, mobile
menu, search dialog, footer) into every page, and lint the result.

Usage:
  python3 tools/build_layout.py              # re-render all pages, stamp ?v=<hash>, generate the English site
  python3 tools/build_layout.py --check      # acceptance lint of both languages (exit 1 on problems)
  python3 tools/build_layout.py --i18n-todo  # missing English -> tools/i18n/todo/*.json (fill "en")
  python3 tools/build_layout.py --i18n-merge # filled todo entries -> tools/i18n/en.json
  python3 tools/build_layout.py --migrate    # one-time: wrap legacy chrome in markers

The English site (en/…, assets/data.en.js, assets/site.en.js) is generated from the Vietnamese
source by tools/i18n_build.py; never edit it by hand.

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
  {{L:vi}} {{L:en}}  language switch: this page / its English copy under en/
Any chrome link whose href is exactly the current page also gets aria-current="page".
"""
import hashlib
import html.parser
import os
import re
import sys
import urllib.parse

sys.dont_write_bytecode = True  # no tools/__pycache__ (the Stop hook commits everything)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import i18n_build as i18n  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAYOUT = os.path.join(ROOT, "tools", "layout")
CHROME_PARTS = ["utility.html", "header.html", "mobile.html", "search.html"]
SKIP_DIRS = {".git", "tools", "node_modules", ".claude", i18n.EN_DIR}

# Shared assets get a content-hash query (?v=…) so a deploy never mixes cached old
# HTML/JS with fresh CSS (GitHub Pages serves everything with max-age=600).
ASSETS = ["assets/styles.css", "assets/scenes.js", "assets/data.js", "assets/site.js", "assets/data.en.js", "assets/site.en.js"]
ASSET_RE = re.compile(r'((?:src|href)="(?:\.\./)*)(assets/(?:styles\.css|scenes\.js|data\.js|site\.js|data\.en\.js|site\.en\.js))(?:\?v=([0-9a-f]+))?"')


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


def pages(top=ROOT):
    """Vietnamese source pages (or, with top=<repo>/en, the generated English ones), repo-relative."""
    for dirpath, dirnames, filenames in os.walk(top):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for f in sorted(filenames):
            if f.endswith(".html"):
                full = os.path.join(dirpath, f)
                yield os.path.relpath(full, ROOT).replace(os.sep, "/")


def en_pages():
    return list(pages(os.path.join(ROOT, i18n.EN_DIR))) if os.path.isdir(os.path.join(ROOT, i18n.EN_DIR)) else []


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def write_if_changed(path, text):
    if os.path.isfile(path) and read(path) == text:
        return False
    write(path, text)
    return True


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
    # Language switch: this page (VI) and its generated English copy under en/ (404: the English home).
    out = out.replace("{{L:vi}}", r + rel).replace("{{L:en}}", r + ("en/index.html" if rel == "404.html" else "en/" + rel))
    out = re.sub(r"\{\{C:([\w-]+)\}\}", lambda m: " is-current" if m.group(1) == section else "", out)
    out = re.sub(r"\{\{[AU]:([\w-]+)\}\}", lambda m: aria(m.group(1)), out)
    out = re.sub(r"\{\{O:([\w-]+)\}\}", lambda m: " open" if m.group(1) == section else "", out)
    out = re.sub(r"\{\{S:([\w-]+)\}\}", lambda m: "is-current" if m.group(1) == section else "", out)

    # Exact-page links (no hash) get aria-current="page" unless already marked.
    here = r + rel

    def mark(m):
        tag = m.group(0)
        if "aria-current" in tag or "data-lang=" in tag:
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
    cat = i18n.Catalog()
    changed = 0
    # English builds of data.js / site.js first: their hashes are stamped into the English pages.
    for src in i18n.JS_SOURCES:
        changed += write_if_changed(os.path.join(ROOT, i18n.en_js_name(src)), i18n.make_en_js(src, cat))
    versions = asset_versions()
    vi_texts = {}
    for rel in pages():
        path = os.path.join(ROOT, rel)
        text = read(path)
        if "<!-- layout:chrome -->" not in text:
            print("skip (no markers): " + rel)
            vi_texts[rel] = text
            continue
        m = re.search(r'<body[^>]*data-section="([\w-]+)"', text)
        section = m.group(1) if m else section_for(rel)
        chrome = render(chrome_tpl, rel, section)
        footer = render(footer_tpl, rel, section)
        new = CHROME_RE.sub(lambda _: "<!-- layout:chrome -->\n" + chrome + "\n<!-- /layout:chrome -->", text)
        new = FOOTER_RE.sub(lambda _: "<!-- layout:footer -->\n" + footer + "\n<!-- /layout:footer -->", new)
        new = set_body_attrs(new, rel, section)
        new = stamp_assets(new, versions)
        vi_texts[rel] = new
        if new != text:
            write(path, new)
            changed += 1
    wanted = set()
    for rel, text in vi_texts.items():
        en_rel = i18n.EN_DIR + "/" + rel
        wanted.add(en_rel)
        changed += write_if_changed(os.path.join(ROOT, en_rel), i18n.make_en_page(rel, text, cat, versions))
    for en_rel in en_pages():
        if en_rel not in wanted:
            os.remove(os.path.join(ROOT, en_rel))
            print("removed orphan " + en_rel)
            changed += 1
    for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, i18n.EN_DIR), topdown=False):
        if not os.listdir(dirpath):
            os.rmdir(dirpath)
    print("rendered layout; %d file(s) changed" % changed)
    if cat.missing:
        print("English: %d string(s) still untranslated (shown in Vietnamese) - run --i18n-todo" % len(cat.missing))


def generate_en(cat):
    """In-memory English site: ({repo path: text}, versions). Uses the Vietnamese pages as they are on disk."""
    out = {}
    for src in i18n.JS_SOURCES:
        out[i18n.en_js_name(src)] = i18n.make_en_js(src, cat)
    versions = asset_versions()
    for name, text in out.items():  # hash what would be written, even if the files are stale
        versions[name] = hashlib.sha1(text.encode("utf-8")).hexdigest()[:10]
    for rel in pages():
        out[i18n.EN_DIR + "/" + rel] = i18n.make_en_page(rel, read(os.path.join(ROOT, rel)), cat, versions)
    return out, versions


def i18n_todo():
    cat = i18n.Catalog()
    generate_en(cat)
    n, files = i18n.write_todo(cat)
    print("i18n: %d missing string(s) -> %d file(s) in tools/i18n/todo/ (fill \"en\", then --i18n-merge)" % (n, files))


def i18n_merge():
    cat = i18n.Catalog()
    merged, left, bad = i18n.merge_todo(cat)
    for b in bad:
        print("rejected " + b)
    print("i18n: merged %d, %d still empty, %d rejected" % (merged, left, len(bad)))


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
    for rel in list(pages()) + en_pages():
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
    problems += check_i18n()
    problems = list(dict.fromkeys(problems))  # chrome repeats links; report each once per page
    for pr in problems:
        print(pr)
    print("check: %d problem(s)" % len(problems))
    return 1 if problems else 0


def check_i18n():
    """Source hygiene and the generated English site (see tools/i18n_build.py)."""
    problems, warnings = [], []
    for rel in list(pages()) + ["tools/layout/" + p for p in sorted(os.listdir(LAYOUT)) if p.endswith(".html")]:
        text = read(os.path.join(ROOT, rel))
        for pr in i18n.parse(text)[1]:
            problems.append("%s: %s" % (rel, pr))
        if re.search(r"\ssrcset=|\sstyle=(?:\"[^\"]*|'[^']*)url\(|\s(?:href|src)=[\"']/(?!/)", text):
            problems.append("%s: srcset, style url() or a root-absolute link (the English copy cannot rewrite it)" % rel)
    cat = i18n.Catalog()
    generated, _ = generate_en(cat)
    for path, text in sorted(generated.items()):
        full = os.path.join(ROOT, path)
        if not os.path.isfile(full):
            problems.append("%s: missing (run tools/build_layout.py)" % path)
        elif read(full) != text:
            problems.append("%s: out of date (run tools/build_layout.py)" % path)
    for en_rel in en_pages():
        if en_rel not in generated:
            problems.append("%s: no Vietnamese source page (run tools/build_layout.py to remove it)" % en_rel)
    if cat.missing:
        problems.append("i18n: %d string(s) have no English yet (run --i18n-todo, fill, --i18n-merge)" % len(cat.missing))
        for key, (where, _) in list(cat.missing.items())[:12]:
            problems.append("  %s: %s" % (where, key[:100]))
    problems += ["i18n: " + e for e in dict.fromkeys(cat.errors)]
    if not cat.missing:  # otherwise every untranslated string would be reported twice
        for path, text in sorted(generated.items()):
            left = i18n.js_leftovers(text, path) if path.endswith(".js") else i18n.en_leftovers(text, cat)
            for t in list(dict.fromkeys(left))[:5]:
                problems.append("%s: Vietnamese left in English output: %s" % (path, t))
    unused = [k for k in cat.data if k not in cat.hits]
    if unused:
        warnings.append("%d catalog entr%s unused (e.g. %s)" % (len(unused), "y" if len(unused) == 1 else "ies", ", ".join(repr(k[:40]) for k in unused[:3])))
    for w in warnings:
        print("warning: " + w)
    return problems


if __name__ == "__main__":
    if "--migrate" in sys.argv:
        migrate()
    elif "--i18n-todo" in sys.argv:
        i18n_todo()
    elif "--i18n-merge" in sys.argv:
        i18n_merge()
    elif "--check" in sys.argv:
        sys.exit(check())
    else:
        build()
