# Website Khoa Quản trị — ULAW (prototype)

Static multi-page prototype for Khoa Quản trị, Trường Đại học Luật TP. Hồ Chí Minh. Plain HTML + CSS + vanilla JS. No build step is needed to view it.

## Running

```bash
python3 -m http.server 8000      # then open http://localhost:8000/
```

Opening `index.html` directly (`file://`) also works: all links, including search results, are relative. `404.html` is only meaningful when served (the host shows it for missing paths); it sets a `<base>` at runtime so its links work at any depth.

## Xem trên thiết bị khác (view on other devices)

- **Same Wi-Fi/LAN:** `python3 -m http.server 8000 --bind 0.0.0.0`, then open `http://<this-computer-IP>:8000/` on the phone (find the IP with `hostname -I`). Works only while the computer and server are running.
- **Anywhere – GitHub Pages:** repo `duchuy0411/ulawsite` → Settings → Pages → *Deploy from a branch* → `development` / `/ (root)`. The site is then at `https://duchuy0411.github.io/ulawsite/` and updates on every push. The free plan requires a public repo.
- `404.html` sets its `<base>` at runtime (site root, or `/<repo>/` on `*.github.io`), so it works under the Pages sub-path too.

## Editing

| What | Where |
|---|---|
| Programs, news, events, hero slides, Học liệu catalogue, forms, FAQ | `assets/data.js` |
| Header, mega menus, mobile menu, search dialog, footer | `tools/layout/*.html`, then run `python3 tools/build_layout.py` |
| Colours, typography, components | `assets/styles.css` (tokens on `:root`) |
| Behaviour and data-driven sections | `assets/site.js` |
| Illustrations (stand-ins for photos) | `assets/scenes.js` |

Every content item carries `status` (`verified` / `illustrative` / `pending`), `sourceUrl` and `updatedAt`. Setting `window.ULAW_PUBLISH_MODE = "production"` in `data.js` renders only `verified` items.

`python3 tools/build_layout.py --check` lints every page for:
- broken links and anchors
- `href="#"`
- anything other than exactly one `<h1>`
- missing title or description
- images without alt or size

## Routes

`/`, `/gioi-thieu/`, `/dao-tao/` + 7 program pages, `/doi-ngu/` (+ profile layout sample), `/nghien-cuu/`, `/sinh-vien/`, `/doanh-nghiep/`, `/tin-tuc/` (+ sample article), `/su-kien/`, `/bieu-mau/`, `/search/`, `/hoc-lieu/`, `404.html`.

## What was checked (headless Chrome, 1440 / 1024 / 768 / 390 px)

- **Layout:** no horizontal overflow, exactly one H1 and no JS errors on all 18 pages at all four widths.
- **Colours and nav:** the utility bar is `#1C56AE`, and nav current state is set with `aria-current`.
- **Tin tức & Sự kiện:** 2 columns at 1440/1024 and 1 column at 768/390.
- **Mega menu:** opens, closes on a second click, an outside click or Esc, and focus returns to the trigger.
- **Carousel:**
  - Auto-advances every 5.5 s.
  - Pauses on hover and while the pause button is on.
  - Prev/next work.
  - No autoplay under `prefers-reduced-motion`.
- **Forms:** inline validation and a required consent checkbox; nothing is sent.
- **Học liệu:** filters, deep links (`#ctdt`, `#de-cuong`), and empty state.
- **Mobile menu:** focus moves in, Esc closes it, and it has a single accordion level.
- **Search over `file://`:** result links resolve.

Not checked: real screen readers, Safari/Firefox, or a production host.

## Illustrative vs. needed from ULAW

Everything is **illustrative or pending**. No official data, names, figures or dates are invented. Before launch ULAW needs to provide:

- the official logo and brand guideline (the palette is sampled from reference images)
- licensed photos to replace the labelled SVG illustrations (`image` fields in `data.js` accept image paths)
- the Quản trị – Luật **Tích hợp** program details
- admissions data: methods, plan, tuition, scholarships, financial aid
- real news items and a verified event schedule
- staff profiles with permission to publish
- links or files for the forms
- **Học liệu** files, with access rights and **ULAW SSO/OIDC** plus server-side permission checks

Restricted documents must never be placed in this repo or any public asset folder. The Học liệu sign-in flow is illustrative only; no login is simulated and no passwords are collected. The floating VI/EN switch uses Google Website Translator (machine translation, labelled "Bản dịch tự động"); the choice is kept in localStorage (so it is also attempted on file://) and the script loads only after a visitor picks EN; if Google does not respond within ~10 s the menu says the translation is unavailable. Replace with an edited English version for key pages when available.
