# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, multi-page prototype website for **Khoa Quản trị (Faculty of Management), Trường Đại học Luật TP. Hồ Chí Minh (ULAW)**. All content is in Vietnamese. There is no framework, bundler or package manager: plain HTML + one CSS file + vanilla ES5-style JS (IIFEs, `var`, no modules).

The original requirements spec is [Prompt_website_Khoa_Quan_tri_ULAW_hop_nhat.md](Prompt_website_Khoa_Quan_tri_ULAW_hop_nhat.md). Read it before changing design, navigation or content — but later user edit requests override it wherever they differ (the spec itself ranks them first; the rules below already reflect them); [SESSION.md](SESSION.md) lists those changes. [README.md](README.md) lists what is illustrative and what ULAW still has to supply.

## Commands

```
python3 -m http.server 8000             # serve; file:// also works except 404.html
python3 tools/build_layout.py           # re-render shared chrome into every page + stamp ?v=<hash> on shared assets
python3 tools/build_layout.py --check   # lint (exits 1 on problems): dead links/anchors, href="#", one <h1>, title/description, img alt+size, stale asset ?v=
python3 tools/build_layout.py --migrate # one-time: wrap legacy chrome in markers (new pages: add markers by hand)
```

Hooks in `.claude/settings.json`: **Stop** → `tools/auto_commit.sh` auto-commits every finished request, but only while `development` is checked out (it silently no-ops on `main` or mid-merge/rebase; it never pushes); **SessionStart** → `tools/session_context.sh` injects SESSION.md into context; **PreToolUse** (Edit/Write/NotebookEdit) → `tools/guard_paths.sh` enforces the write scope below.

There is no test suite. `--check` is the only automated gate: run it after any change to pages, partials or data.

**Cache busting / deploy.** GitHub Pages (`hotrucvi.github.io/website`, built from `main`) serves every file with `max-age=600`, so pages reference `assets/{styles.css,scenes.js,data.js,site.js}` as `…?v=<sha1[:10]>`. After editing any of those four files, run `build_layout.py` (never hand-edit the `?v=`); `--check` fails on a stale hash. `development` auto-commits are not live until merged into `main`.

## Architecture

**Shared chrome is generated.** The utility bar, header with mega menus, mobile menu, search dialog and footer live in `tools/layout/*.html`. `build_layout.py` writes them into every page between `<!-- layout:chrome -->…<!-- /layout:chrome -->` and `<!-- layout:footer -->…<!-- /layout:footer -->`. Never edit chrome inside a page, because it is overwritten on the next run.
- **Placeholders:** `{{R}}` is the relative root prefix. `{{C:key}}`, `{{A:key}}`, `{{U:key}}`, `{{O:key}}` and `{{S:key}}` set current/open state from `<body data-section="…">`, which the script derives from the page's directory (`SECTION_BY_DIR`).
- **Exact-page links** get `aria-current="page"`.
- **`404.html`** gets an empty prefix; an inline script in its `<head>` writes a `<base>` (site root, or `/<repo>/` on `*.github.io`).
- **New page:** copy the skeleton of an existing page with empty markers, then run the script.

**Directories → sections** (`SECTION_BY_DIR` in `build_layout.py`): `gioi-thieu` Giới thiệu · `dao-tao` Đào tạo · `nghien-cuu` Nghiên cứu · `doi-ngu` Đội ngũ · `sinh-vien` + `hoc-lieu` Sinh viên · `doanh-nghiep` Đối tác · `alumni` · `tin-tuc` + `su-kien` Tin tức & Sự kiện · `bieu-mau` Biểu mẫu · `search`. A new top-level directory must be added there.

**Script load order.**
- `assets/scenes.js` (SVG illustrations, `ULAW_sceneSvg`, `ULAW_heroSvg`) and `assets/data.js` (all content globals) load in `<head>`.
- `assets/site.js` loads at the end of `<body>`. It holds all behaviour: menus, dialogs, search, form validation, carousel.
- It also renders data-driven views into hooks such as `#prog-root`, `[data-program-cards]` (per-program image + colour tone from `PROGRAM_LOOK`), `[data-program-list]`, `[data-faq]`, `[data-scene]`, `[data-dropdown]` (admissions CTA), `#home-news`/`#news-split` (`newsSplit()`: 3 newest news + chronological list) and `#home-events`/`[data-event-cal]` (`eventCalendar()`: month calendar + event info), and `#library-app`.
- Sinh viên hooks: `[data-sv-notices]` (notice board), `[data-sv-posts]`, `[data-sv-photos]` and `[data-sv-clubs]`, fed by `ULAW_STUDENT_POSTS/PHOTOS/CLUBS`.
- Đối tác hooks: `[data-partners]` (sliding logo strip), `[data-internships]` and `[data-jobs]`, fed by `ULAW_PARTNERS/INTERNSHIPS/JOBS`.
- Empty collections render dashed template frames. The 2 newest jobs and internships by `date` get a "New" tag.
- Inline page scripts run before `site.js`, so they must not capture `ULAW_url`/`ULAW_esc` at parse time.

**Data conventions (`assets/data.js`).**
- Items carry `status: verified|illustrative|pending`, `sourceUrl` and `updatedAt`.
- Always read collections through `ULAW_published(list)`, which filters to `verified` when `ULAW_PUBLISH_MODE === "production"` (set at the top of `data.js`; currently `"prototype"`).
- Many collections are intentionally empty arrays (e.g. `ULAW_EVENTS`, `ULAW_GUEST_EXPERTS`, `ULAW_FACULTY_MOMENTS`). `site.js` then renders template cards or a "Thông tin đang cập nhật" state, so fill real data there instead of hard-coding it in HTML.
- URLs in data are relative to the site root without a leading slash. `site.js` prefixes them with `body[data-root]` via `url()`.
- `image` is either a scene key from `scenes.js` or an image path.
- Student-only Học liệu items never get file URLs and are never added to `ULAW_SEARCH_INDEX`.
- Admissions is external: `ULAW_ADMISSIONS_URL` (đại học) and `ULAW_ADMISSIONS_POSTGRAD_URL` (sau đại học). There is no internal Tuyển sinh page.

**Program pages** (`dao-tao/<slug>.html`) contain only a static hero (H1, lede, metadata) and `<div id="prog-root" data-slug>`. `site.js` renders everything else from `ULAW_PROGRAMS`, including `#chinh-quy`/`#tich-hop` track cards when a program has `tracks`. Adding a program means:
1. Add the data entry.
2. Copy a program page with the new slug.
3. Add it to the mega menu and mobile partials.

**Styling.** Design tokens are on `:root` in `assets/styles.css`:
- Filled primary buttons (`.btn-primary`) use ULAW logo green `--ulaw-green-deep #2C7564` (hover #1F5C4F); links and headings stay blue.
- Main palette: `--primary #2D55A8`, `--primary-deep #2B6595`, `--utility #1C56AE`, and `--cta` and `--accent` = red #D91E36: `--cta` for admissions CTAs and urgent labels (New tag, deadlines, pins, language menu), `--accent` for tab-title H1s, section bars and the alumni network. Round chevron buttons use `--ulaw-green #43937F` (the ULAW logo ring).
- Editorial headings (user request):
  - `--accent` (red #D91E36) for tab-title H1s (`.hero h1`, `.section > .max-w-wide > h1`), with a bold navy `.lede`.
  - Section intros are minimal: eyebrow, then a navy 800 h2, then the text below. There is no bar, underline, card or badge.
  - `site.js` `chevronize()` swaps a trailing "→" in `.link-arrow`, `.card-link`, `.mobile-all` and `.mega-col-link` for a round ULAW-green `.chev`, including content rendered later.
- ULAW six-colour accents `--c-blue/-green/-purple/-orange/-deep/-teal` and the multicolour `--brand-stripe`; the "Colour layer" block at the end of the file applies them. Use them as decoration; text on colour uses the `*-ink` variants so it meets WCAG AA.
- The desktop nav appears at ≥1280px; below that, the hamburger is used.

## Write scope (user rule)

- Claude modifies files **only inside this repo**. Everything outside is **read-only**; any exception needs the user's explicit approval first.
- Allowed without asking: Claude's own auto memory, `~/.claude/plans/` and the session scratchpad under `/private/tmp/claude-501/`.
- Enforced by `.claude/settings.json`:
  - PreToolUse hook `tools/guard_paths.sh` answers "ask" for any Edit/Write/NotebookEdit outside those paths.
  - The Bash sandbox limits shell writes to the repo plus the memory and plans dirs; running unsandboxed always prompts.
  - `sudo` is denied.

## Content rules (from the spec)

- Never invent official data: names, achievements, tuition, admission figures, program codes, dates or events. Unverified content shows an "illustrative" badge or a designed "Thông tin đang cập nhật" empty state.
- No `href="#"` or dead links. Items without a real target are plain text labelled "Đang cập nhật".
- Forms without a backend say "Biểu mẫu minh họa, chưa gửi dữ liệu" and use `data-demo-form` (validated, never sent). Never build forms that collect student passwords.
- Restricted Học liệu access goes only through official ULAW SSO/OIDC with server-side checks. Nothing restricted goes in this repo.
- Home H1 slogan is "Tư duy Quản trị – Bản lĩnh pháp lý".
- Never use assets, logos, rankings or content from other universities (Văn Lang, RMIT, UEH).
- Utility bar: E-Learning (↗ `https://lms.hcmulaw.edu.vn/`, chosen by the user although it returned 500 when checked) · Biểu mẫu · Liên hệ · round search button at the far right (visible at every width).
- Main nav: Giới thiệu · Đào tạo · Nghiên cứu · Đội ngũ · Sinh viên · Đối tác · Alumni · Tin tức & Sự kiện + "Tư vấn tuyển sinh" dropdown.
- VI/EN switch: flag dropdown at the far right of the utility bar (markup `tools/layout/utility.html`). EN = Google Website Translator, loaded only after EN is chosen; the choice lives in `localStorage['ulaw-lang']` (wins over the `googtrans` cookie). Mechanics are commented at the top of the switch block in `site.js`; mark non-translatable text `notranslate`.
- The header only just fits at 1280px, so check fit at 1280–1920px when adding items.
- Keep one H1 per page and visible focus states, respect `prefers-reduced-motion`, and allow no horizontal overflow at 1440/1024/768/390px.

## Memory layers

| Layer | Where | Holds |
|---|---|---|
| 1. Project guide | this `CLAUDE.md` (committed) | How the code works, commands, content rules — stable facts |
| 2. Auto memory | `~/.claude/projects/<project-path-slug>/memory/MEMORY.md` (the slug depends on the checkout path, e.g. `-Users-trucviho-Public-website-new`) + one-fact files | Who the user is, their preferences and decisions that outlive a session |
| 3. Continuation | [SESSION.md](SESSION.md) (committed, injected at session start) | Current state, recent changes, open questions, next steps |

At the end of every request: update SESSION.md (add the change newest-first, update open questions, trim to ~80 lines), save any new durable preference or decision to auto memory, and update this file only when architecture or rules change.
