"""Generate the English site from the Vietnamese source (used by tools/build_layout.py).

The Vietnamese pages, tools/layout/*.html, assets/data.js and assets/site.js are the only hand-edited
sources. From them this module writes:
  en/<same path>.html      every page, translated, one level deeper (shares assets/ with the VI site)
  assets/data.en.js        data.js / site.js with every Vietnamese string literal replaced
  assets/site.en.js
Translations come from tools/i18n/en.json, a flat {Vietnamese: English} catalog keyed only by the
Vietnamese text, so one Vietnamese string always gets the same English (filters compare these values
across pages, data and code). Terms and style: tools/i18n/GLOSSARY.md.

Translation units
  HTML text  the phrasing content of a block element (or a run of it inside a container). Inline tags
             become numbered slots: <1>…</1>, and <2/> for img/svg/br/input or skipped elements. Leading
             and trailing children without letters (icons, arrows, "*") stay outside the unit.
             English values keep the slots and may add <br …> or <wbr>.
  Attributes alt, title, aria-label, placeholder, data-alt, data-msg, meta description; "|" lists in
             data-types/-only/-type/-slots/-rotator (item by item); value when it has diacritics.
  JS strings every string literal found in the catalog, outside /* i18n:off */ … /* i18n:on */.
             A missing literal is an error when it looks Vietnamese (diacritics or ASCII_VI words).
  Keys       entity-decoded, NFC, ASCII whitespace collapsed; leading/trailing whitespace and arrows
             (→ ↗ ‹ › ▸) are cut off and restored verbatim. Namespaces: "q:<query>" for ?q= values of
             links to the search page, "ctx:<name>:<text>" inside data-i18n-ctx="name".
Markup      data-i18n="off" and lang="vi" subtrees are copied untouched; data-lang="vi|en" links are
             the language switch.
"""
import difflib
import html
import html.parser
import json
import os
import re
import unicodedata
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "tools", "i18n", "en.json")
TODO_DIR = os.path.join(ROOT, "tools", "i18n", "todo")
EN_DIR = "en"
JS_SOURCES = ["assets/data.js", "assets/site.js"]  # -> assets/data.en.js, assets/site.en.js

VI_RE = re.compile("[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", re.I)
# Vietnamese UI words without diacritics that a JS literal may hold (checked on the text outside tags).
ASCII_VI = re.compile(r"(?<![\w-])(Xem|Ghim|Trang|Tham gia|Vinh danh|NCKH|Khoa|tin|TC|CN|T[2-7]|Th\d{1,2}|Th--)(?![\w-])")
LETTER = re.compile(r"[^\W\d_]")
ARROWS = "→↗‹›▸"
EDGE_RE = re.compile(r"^([\s%s]*)(.*?)([\s%s]*)$" % (ARROWS, ARROWS), re.S)
SLOT_RE = re.compile(r"<(/?)(\d+)(/?)>")
EXTRA_TAG_RE = re.compile(r"<(?:br\b[^<>]*|wbr)>")

INLINE = set("a abbr b bdi bdo br cite code data dfn em i img input kbd mark q s samp small span strong sub sup "
             "svg time u var wbr".split())
VOID = set("area base br col embed hr img input link meta param source track wbr".split())
OPAQUE = set("script style svg template textarea math".split())
TEXT_ATTRS = {"alt", "title", "aria-label", "placeholder", "data-alt", "data-msg"}
LIST_ATTRS = {"data-types", "data-only", "data-type", "data-slots", "data-rotator"}
URL_ATTRS = {"href", "src", "action", "poster"}
ATTR_RE = re.compile(r"""(\s+)([^\s"'>/=]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=<>`]+))?""")


# ---------------------------------------------------------------- keys and catalog

def norm_text(s):
    return re.sub(r"[ \t\r\n\f]+", " ", unicodedata.normalize("NFC", s))


def split_edges(s):
    m = EDGE_RE.match(s)
    return m.group(1), m.group(2), m.group(3)


def looks_vi(text):
    return bool(VI_RE.search(text) or ASCII_VI.search(re.sub(r"<[^<>]*>", " ", text)))


class Catalog:
    def __init__(self, path=CATALOG):
        self.path = path
        self.data = {}
        if os.path.isfile(path):
            with open(path, encoding="utf-8") as fh:
                self.data = json.load(fh)
        self.hits = set()
        self.missing = {}   # key -> [where, context]
        self.errors = []    # invariant problems

    def get(self, key, where, context="", required=True):
        if key in self.data:
            self.hits.add(key)
            return self.data[key]
        if required and key not in self.missing:
            self.missing[key] = [where, context]
        return None

    def save(self):
        write_json(self.path, dict(sorted(self.data.items())))


def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=1)
        fh.write("\n")


def slots(s):
    return sorted(m.group(0) for m in SLOT_RE.finditer(s))


def check_pair(key, en, kind):
    """Problems with an English value, or [] (kind: html | js | part)."""
    out = []
    if kind == "html":
        if slots(key) != slots(en):
            out.append("slots differ")
        rest = EXTRA_TAG_RE.sub("", SLOT_RE.sub("", en))
        if "<" in rest and re.search(r"<[a-zA-Z/!]", rest):
            out.append("raw tags other than <br>/<wbr>")
    elif kind == "js":
        tags = lambda s: sorted(re.findall(r"<[^<>]+>", s))
        if tags(key) != tags(en):
            out.append("HTML tags differ")
        for ch in '"<>=':
            if key.count(ch) != en.count(ch):
                out.append("count of %s differs" % ch)
        if set(re.findall(r"\{\w+\}", key)) != set(re.findall(r"\{\w+\}", en)):
            out.append("{slots} differ")
        if "</script" in en.lower():
            out.append("contains </script")
        if re.search(r"<[a-zA-Z]", key) and re.search(r"&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)", en):
            out.append("bare & in an HTML fragment")
    elif kind == "part" and "|" in en:
        out.append("list item contains |")
    if kind != "js" and re.search(r"&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);", en):
        out.append("write plain characters, not HTML entities")
    if VI_RE.search(en) and en != key:
        out.append("English still has Vietnamese diacritics")
    return out


# ---------------------------------------------------------------- HTML tree with source offsets

class Node:
    __slots__ = ("tag", "attrs", "a", "b", "c", "d", "kids", "parent")

    def __init__(self, tag, attrs, a, b, parent):
        self.tag, self.attrs, self.a, self.b = tag, dict(attrs), a, b
        self.c = self.d = b
        self.kids, self.parent = [], parent

    def attr(self, name):
        return self.attrs.get(name)


class TreeParser(html.parser.HTMLParser):
    """Element tree with offsets: a=tag start, b=end of start tag, c=start of end tag, d=end."""

    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src = src
        self.lines = [0] + [m.end() for m in re.finditer("\n", src)]
        self.root = Node("#root", [], 0, 0, None)
        self.stack = [self.root]
        self.problems = []
        self.open_text = None

    def pos(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def _event(self):
        p = self.pos()
        if self.open_text is not None:
            self.open_text.c = self.open_text.d = p
            self.open_text = None
        return p

    def handle_starttag(self, tag, attrs):
        a = self._event()
        n = Node(tag, attrs, a, a + len(self.get_starttag_text()), self.stack[-1])
        self.stack[-1].kids.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        a = self._event()
        n = Node(tag, attrs, a, a + len(self.get_starttag_text()), self.stack[-1])
        self.stack[-1].kids.append(n)

    def handle_endtag(self, tag):
        a = self._event()
        e = self.src.index(">", a) + 1
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                if i != len(self.stack) - 1:
                    self.problems.append("<%s> closed by </%s> at line %d" % (self.stack[-1].tag, tag, self.getpos()[0]))
                for x in self.stack[i + 1:]:
                    x.c = x.d = a
                self.stack[i].c, self.stack[i].d = a, e
                del self.stack[i:]
                return
        self.problems.append("stray </%s> at line %d" % (tag, self.getpos()[0]))

    def handle_data(self, data):
        a = self._event()
        n = Node("#text", [], a, a, self.stack[-1])
        self.stack[-1].kids.append(n)
        self.open_text = n

    def handle_comment(self, data):
        a = self._event()
        n = Node("#comment", [], a, a + len(data) + 7, self.stack[-1])
        self.stack[-1].kids.append(n)

    def handle_decl(self, decl):
        self._event()

    def close(self):
        super().close()
        if self.open_text is not None:
            self.open_text.c = self.open_text.d = len(self.src)
        for x in self.stack[1:]:
            self.problems.append("<%s> never closed" % x.tag)


def parse(src):
    p = TreeParser(src)
    p.feed(src)
    p.close()
    return p.root, p.problems


def skipped(n):
    return n.tag not in ("#text", "#comment", "#root") and (
        n.tag in OPAQUE or n.attr("data-i18n") == "off" or (n.attr("lang") == "vi" and n.tag != "html"))


def text_of(n, src):
    return html.unescape(src[n.a:n.d])


def has_letters(nodes, src):
    for n in nodes:
        if n.tag == "#text":
            if LETTER.search(text_of(n, src)):
                return True
        elif n.tag != "#comment" and not skipped(n) and has_letters(n.kids, src):
            return True
    return False


def is_phrasing(n):
    if n.tag in ("#text", "#comment"):
        return True
    if n.tag not in INLINE:
        return False
    if n.tag in VOID or skipped(n):
        return True
    return all(is_phrasing(k) for k in n.kids)


def collect_units(root, src):
    """[(nodes, ctx)]: runs of sibling nodes that form one translation unit."""
    units = []

    def trim(nodes):
        nodes = list(nodes)
        while nodes and not has_letters(nodes[:1], src):
            nodes.pop(0)
        while nodes and not has_letters(nodes[-1:], src):
            nodes.pop()
        return nodes

    def emit(nodes, ctx):
        nodes = trim(nodes)
        if not nodes:
            return
        one = nodes[0]
        if len(nodes) == 1 and one.tag in INLINE and not skipped(one) and one.tag not in VOID:
            return emit(one.kids, one.attr("data-i18n-ctx") or ctx)
        elems = [n for n in nodes if n.tag not in ("#text", "#comment")]
        texts = [n for n in nodes if n.tag == "#text"]
        if len(elems) >= 2 and not any(LETTER.search(text_of(t, src)) for t in texts):
            # Link lists, breadcrumbs, alternative spans (uh-full / uh-short): one unit per item.
            # Styled words in a heading (<span>A</span> <span>B</span>) stay one unit.
            if any(e.tag in ("a", "button") for e in elems) or not any(text_of(t, src) for t in texts):
                for n in nodes:
                    if n.tag not in ("#text", "#comment"):
                        emit([n], ctx)
                return
        units.append((nodes, ctx))

    def walk(n, ctx):
        if n.tag in ("#text", "#comment") or skipped(n):
            return
        ctx = n.attr("data-i18n-ctx") or ctx
        if n.tag != "#root" and n.tag not in INLINE and n.kids and all(is_phrasing(k) for k in n.kids):
            emit(n.kids, ctx)
            return
        run = []
        for k in n.kids + [None]:
            if k is not None and is_phrasing(k):
                run.append(k)
                continue
            if run:
                emit(run, ctx)
                run = []
            if k is not None:
                walk(k, ctx)

    walk(root, None)
    return units


def unit_template(nodes, src):
    """(key, left, right, tags): tags[k-1] = (open, close) raw markup of slot k (close None = <k/>)."""
    parts, tags = [], []

    def w(n):
        if n.tag == "#text":
            parts.append(norm_text(text_of(n, src)))
            return
        if n.tag == "#comment" or n.tag in VOID or skipped(n):
            tags.append((src[n.a:n.d], None))
            parts.append("<%d/>" % len(tags))
            return
        tags.append((src[n.a:n.b], src[n.c:n.d]))
        k = len(tags)
        parts.append("<%d>" % k)
        for x in n.kids:
            w(x)
        parts.append("</%d>" % k)

    for n in nodes:
        w(n)
    left, core, right = split_edges(norm_text("".join(parts)))
    return core, left, right, tags


def expand(en, tags):
    out, pos = [], 0
    for m in re.finditer(r"<(/?)(\d+)(/?)>|<br\b[^<>]*>|<wbr>", en):
        out.append(html.escape(en[pos:m.start()], quote=False))
        if m.group(2):
            op, cl = tags[int(m.group(2)) - 1]
            out.append(op if not m.group(1) else (cl or ""))
        else:
            out.append(m.group(0))
        pos = m.end()
    out.append(html.escape(en[pos:], quote=False))
    return "".join(out)


# ---------------------------------------------------------------- JavaScript strings

JS_KW = set("return typeof case do else in of new delete void throw instanceof yield await".split())
JS_REGEX_BEFORE = set("( , = : [ ! & | ? { } ; + - * % < > ~ ^".split())
JS_WORD = re.compile(r"[A-Za-z_$][\w$]*|\d[\w.]*")


def js_tokens(src, where="js"):
    """[(kind, text)] covering src exactly; kinds ws com str re id p."""
    i, n, out, prev = 0, len(src), [], None
    while i < n:
        c = src[i]
        if c in " \t\r\n":
            j = i
            while j < n and src[j] in " \t\r\n":
                j += 1
            out.append(("ws", src[i:j]))
            i = j
            continue
        if src.startswith("//", i):
            j = src.find("\n", i)
            j = n if j < 0 else j
            out.append(("com", src[i:j]))
            i = j
            continue
        if src.startswith("/*", i):
            j = src.index("*/", i + 2) + 2
            out.append(("com", src[i:j]))
            i = j
            continue
        if c in "\"'":
            j = i + 1
            while src[j] != c:
                if src[j] == "\\":
                    j += 1
                elif src[j] == "\n":
                    raise ValueError("%s: unterminated string at offset %d" % (where, i))
                j += 1
            out.append(("str", src[i:j + 1]))
            prev = "str"
            i = j + 1
            continue
        if c == "`":
            raise ValueError("%s: template literal at offset %d (ES5 only)" % (where, i))
        if c == "/" and (prev is None or prev in JS_REGEX_BEFORE or prev in JS_KW):
            j, cls = i + 1, False
            while True:
                ch = src[j]
                if ch == "\\":
                    j += 2
                    continue
                if ch == "\n":
                    raise ValueError("%s: unterminated regex at offset %d" % (where, i))
                if cls:
                    cls = ch != "]"
                elif ch == "[":
                    cls = True
                elif ch == "/":
                    break
                j += 1
            j += 1
            while j < n and src[j].isalpha():
                j += 1
            out.append(("re", src[i:j]))
            prev = "re"
            i = j
            continue
        m = JS_WORD.match(src, i)
        if m:
            out.append(("id", m.group()))
            prev = m.group() if m.group() in JS_KW else "id"
            i = m.end()
            continue
        out.append(("p", c))
        prev = c if c not in ")]" else "val"
        i += 1
    assert "".join(t for _, t in out) == src
    return out


JS_ESC = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}


def js_decode(lit):
    body = lit[1:-1]

    def r(m):
        e = m.group(1)
        if e[0] in "xu" and len(e) > 1:
            return chr(int(e[1:], 16))
        if e == "\n":
            return ""
        return JS_ESC.get(e, e)
    return re.sub(r"\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|.|\n)", r, body)


def js_encode(val, q):
    val = val.replace("\\", "\\\\").replace(q, "\\" + q).replace("\n", "\\n").replace("\r", "\\r")
    return q + val.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029") + q


def translate_js_value(val, cat, where, plural=False):
    """English for one decoded literal, or None to keep it as is."""
    if not LETTER.search(val):
        return None
    left, core, right = split_edges(norm_text(val))
    if "|" in core and "<" not in core:
        parts = core.split("|")
        out = []
        for p in parts:
            p = p.strip()
            if p == "all" or not LETTER.search(p):
                out.append(p)
                continue
            en = cat.get(p, where, core, required=looks_vi(p))
            if en is None:
                return None
            for e in check_pair(p, en, "part"):
                cat.errors.append("%s: %r -> %r: %s" % (where, p, en, e))
            out.append(en)
        return left + "|".join(out) + right
    en = cat.get(core, where, "", required=looks_vi(core))
    if en is None:
        return None
    for e in check_pair(core, en, "js"):
        cat.errors.append("%s: %r -> %r: %s" % (where, core, en, e))
    if "|" in en and not plural:
        cat.errors.append("%s: %r -> %r: '|' is only allowed in ULAW_nOf units" % (where, core, en))
    return left + en + right


def translate_js(src, cat, where):
    toks = js_tokens(src, where)
    out, off, sig = [], False, []
    for kind, text in toks:
        if kind == "com":
            if "i18n:off" in text:
                off = True
            elif "i18n:on" in text:
                off = False
        if kind == "str" and not off:
            plural = len(sig) >= 2 and sig[-1] == "(" and sig[-2] in ("nOf", "ULAW_nOf")
            new = translate_js_value(js_decode(text), cat, where, plural)
            if new is not None:
                text = js_encode(new, text[0])
        if kind not in ("ws", "com"):
            sig.append(text)
        out.append(text)
    return "".join(out)


def js_leftovers(src, where):
    """Vietnamese-looking literals left outside i18n:off (for the English output scan)."""
    found, off = [], False
    for kind, text in js_tokens(src, where):
        if kind == "com":
            off = ("i18n:off" in text) or (off and "i18n:on" not in text)
        elif kind == "str" and not off and looks_vi(js_decode(text)):
            found.append(js_decode(text))
    return found


def make_en_js(rel, cat):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        src = fh.read()
    body = translate_js(src, cat, rel)
    return ("// GENERATED by tools/build_layout.py from %s with tools/i18n/en.json. Do not edit.\n" % rel) + body


def en_js_name(rel):
    return rel[:-3] + ".en.js"


# ---------------------------------------------------------------- pages

def is_page_url(u):
    path = re.split(r"[?#]", u, 1)[0]
    return path == "" or path.endswith(".html") or path.endswith("/")


def rewrite_url(u):
    if not u or re.match(r"^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|//|/|#)", u) or is_page_url(u):
        return u
    return "../" + u


def translate_attr_text(val, cat, where, required=True):
    if not LETTER.search(val):
        return None
    left, core, right = split_edges(norm_text(val))
    en = cat.get(core, where, "(attribute)", required=required)
    if en is None:
        return None
    for e in check_pair(core, en, "text"):
        cat.errors.append("%s: %r -> %r: %s" % (where, core, en, e))
    return left + en + right


def translate_list(val, cat, where):
    out = []
    for p in val.split("|"):
        q = p.strip()
        if q == "all" or not LETTER.search(q):
            out.append(p)
            continue
        en = cat.get(norm_text(q), where, val)
        if en is None:
            return None
        for e in check_pair(q, en, "part"):
            cat.errors.append("%s: %r -> %r: %s" % (where, q, en, e))
        out.append(en)
    return "|".join(out)


def translate_search_query(u, cat, where):
    """links to the search page carry a keyword: ?q=<Vietnamese> -> ?q=<English>."""
    parts = urllib.parse.urlsplit(u)
    if not parts.path.endswith("search/index.html") or "q=" not in parts.query:
        return u
    qs = urllib.parse.parse_qsl(parts.query, keep_blank_values=True)
    new = []
    for k, v in qs:
        if k == "q" and LETTER.search(v):
            en = cat.get("q:" + norm_text(v), where, "search keyword")
            v = en if en is not None else v
        new.append((k, v))
    return urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(new)))


def encode_attr(val, quote):
    val = val.replace("&", "&amp;")
    if quote == "'":
        return "'" + val.replace("'", "&#39;") + "'"
    return '"' + val.replace('"', "&quot;") + '"'


def rewrite_tag(n, raw, rel, cat, lang_links, body_roots):
    """New start-tag text for the English page (attributes only; the tag name stays)."""
    where = EN_DIR + "/" + rel
    in_skip = any(skipped(p) for p in ancestors(n))

    def repl(m):
        space, name, eq, qv = m.groups()
        if qv is None:
            return m.group(0)
        quote = qv[0] if qv[0] in "\"'" else '"'
        raw_val = qv[1:-1] if qv[0] in "\"'" else qv
        val = html.unescape(raw_val)
        lname = name.lower()
        new = None
        if n.tag == "html" and lname == "lang":
            new = "en"
        elif n.tag == "body" and lname == "data-root":
            new = body_roots[0]
        elif lname in URL_ATTRS:
            if n.attr("data-lang") and lname == "href":
                new = lang_links[n.attr("data-lang")]
            else:
                new = translate_search_query(rewrite_url(val), cat, where)
        elif in_skip or skipped(n):
            new = None
        elif lname in TEXT_ATTRS or (n.tag == "meta" and lname == "content" and (n.attr("name") or "") == "description"):
            new = translate_attr_text(val, cat, where)
        elif lname in LIST_ATTRS:
            new = translate_list(val, cat, where)
        elif lname == "value" and VI_RE.search(val):
            new = translate_attr_text(val, cat, where)
        elif VI_RE.search(val):
            cat.errors.append("%s: Vietnamese in <%s %s> is not a translatable attribute" % (where, n.tag, name))
        if new is None or new == val:
            return m.group(0)
        return space + name + (eq or "=") + encode_attr(new, quote)

    out = ATTR_RE.sub(repl, raw)
    if n.tag == "body":
        out = re.sub(r"\s+data-page-root=\"[^\"]*\"", "", out)
        out = out[:-1] + ' data-page-root="%s">' % body_roots[1]
    return out


def ancestors(n):
    p = n.parent
    while p is not None:
        yield p
        p = p.parent


def lang_targets(rel):
    """hrefs of the switch links on the English copy of rel."""
    if rel == "404.html":  # its <base> is <root>en/
        return {"vi": "../index.html", "en": "index.html"}
    return {"vi": "../" * (rel.count("/") + 1) + rel, "en": os.path.basename(rel)}


def make_en_page(rel, vi_text, cat, versions):
    """English copy of the rendered Vietnamese page rel (path relative to the repo root)."""
    where = EN_DIR + "/" + rel
    root, _ = parse(vi_text)
    m = re.search(r'<body[^>]*\sdata-root="([^"]*)"', vi_text)
    vi_root = m.group(1) if m else ""
    body_roots = ("../" + vi_root, vi_root)
    links = lang_targets(rel)
    edits = []

    def walk(n):
        for k in n.kids:
            if k.tag == "#comment":
                raw = vi_text[k.a:k.d]
                if "layout:" not in raw:
                    edits.append((k.a, k.d, ""))
                continue
            if k.tag == "#text":
                continue
            new = rewrite_tag(k, vi_text[k.a:k.b], rel, cat, links, body_roots)
            if new != vi_text[k.a:k.b]:
                edits.append((k.a, k.b, new))
            if k.tag == "script" and not k.attr("src") and k.c > k.b:
                js = vi_text[k.b:k.c]
                new_js = translate_js(js, cat, where)
                if new_js != js:
                    edits.append((k.b, k.c, new_js))
            if k.tag not in ("script", "style"):
                walk(k)
    walk(root)
    text = splice(vi_text, edits)

    # pass 2: text units, on the rewritten markup
    root, _ = parse(text)
    edits = []
    prev = ""
    for nodes, ctx in collect_units(root, text):
        key, left, right, tags = unit_template(nodes, text)
        full = ("ctx:%s:%s" % (ctx, key)) if ctx else key
        en = cat.get(full, where, prev[:120])
        prev = key
        if en is None:
            continue
        for e in check_pair(key, en, "html"):
            cat.errors.append("%s: %r -> %r: %s" % (where, key, en, e))
        edits.append((nodes[0].a, nodes[-1].d, html.escape(left, quote=False) + expand(en, tags) + html.escape(right, quote=False)))
    text = splice(text, edits)
    # scripts: the English builds of data.js / site.js
    text = re.sub(r'((?:\.\./)*assets/)(data|site)\.js(?:\?v=[0-9a-f]+)?"',
                  lambda m: '%s%s.en.js?v=%s"' % (m.group(1), m.group(2), versions.get("assets/%s.en.js" % m.group(2), "")), text)
    return text


def splice(text, edits):
    out, pos = [], 0
    for a, b, new in sorted(edits):
        if a < pos:
            raise ValueError("overlapping edits at %d" % a)
        out.append(text[pos:a])
        out.append(new)
        pos = b
    out.append(text[pos:])
    return "".join(out)


def en_leftovers(text, cat):
    """Vietnamese left in an English page outside lang="vi" / data-i18n="off" (names in the catalog
    as identity entries are allowed)."""
    root, _ = parse(text)
    allowed = {k for k, v in cat.data.items() if k == v}
    found = []

    def walk(n, skip):
        for k in n.kids:
            if k.tag == "#text":
                t = norm_text(text_of(k, text)).strip()
                if not skip and VI_RE.search(t) and t not in allowed:
                    found.append(t[:80])
            elif k.tag != "#comment":
                s = skip or skipped(k)
                if k.tag == "script" and not k.attr("src"):
                    found.extend(js_leftovers(text[k.b:k.c], "inline script"))
                    continue
                if not s:
                    for a, v in k.attrs.items():
                        if v and a not in URL_ATTRS and VI_RE.search(v) and norm_text(v).strip() not in allowed:
                            found.append("%s=%s" % (a, v[:60]))
                walk(k, s)
    walk(root, False)
    return found


# ---------------------------------------------------------------- todo / merge

def write_todo(cat, per_file=160):
    """Missing units -> tools/i18n/todo/NN-<source>.json for translators ([{vi, en, where, context, hint}])."""
    if os.path.isdir(TODO_DIR):
        for f in os.listdir(TODO_DIR):
            if f.endswith(".json"):
                os.remove(os.path.join(TODO_DIR, f))
    groups = {}
    keys = list(cat.data.keys())
    for key, (where, context) in cat.missing.items():
        close = difflib.get_close_matches(key, keys, n=1, cutoff=0.8)
        item = {"vi": key, "en": "", "where": where, "context": context}
        if close:
            item["hint"] = "similar: %s => %s" % (close[0], cat.data[close[0]])
        groups.setdefault(where, []).append(item)
    files, cur, name = [], [], None
    for where in sorted(groups):
        for item in groups[where]:
            cur.append(item)
            if len(cur) >= per_file:
                files.append(cur)
                cur = []
    if cur:
        files.append(cur)
    for i, chunk in enumerate(files):
        tag = re.sub(r"[^\w]+", "-", chunk[0]["where"]).strip("-")
        write_json(os.path.join(TODO_DIR, "%02d-%s.json" % (i + 1, tag)), chunk)
    return len(cat.missing), len(files)


def merge_todo(cat):
    merged, left, bad = 0, 0, []
    if not os.path.isdir(TODO_DIR):
        return merged, left, bad
    for f in sorted(os.listdir(TODO_DIR)):
        if not f.endswith(".json"):
            continue
        path = os.path.join(TODO_DIR, f)
        with open(path, encoding="utf-8") as fh:
            items = json.load(fh)
        rest = []
        for it in items:
            en = (it.get("en") or "").strip()
            if not en:
                rest.append(it)
                continue
            key = it["vi"]
            core = key.split(":", 2)[2] if key.startswith("ctx:") else key
            kind = "html" if SLOT_RE.search(core) else "js" if "<" in core else "text"
            probs = check_pair(core, en, kind) if not key.startswith("q:") else []
            if probs:
                bad.append("%s: %r -> %r: %s" % (f, key, en, "; ".join(probs)))
                rest.append(it)
                continue
            cat.data[key] = en
            merged += 1
        left += len(rest)
        if rest:
            write_json(path, rest)
        else:
            os.remove(path)
    cat.save()
    return merged, left, bad
