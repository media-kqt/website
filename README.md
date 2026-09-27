# Website Khoa Quản trị — ULAW (prototype)

Static multi-page prototype for Khoa Quản trị, Trường Đại học Luật TP. Hồ Chí Minh. Plain HTML + CSS + vanilla JS. No build step is needed to view it.

## Running

```bash
python3 -m http.server 8000      # then open http://localhost:8000/
```

Opening `index.html` directly (`file://`) also works: all links, including search results, are relative. `404.html` is only meaningful when served (the host shows it for missing paths); it sets a `<base>` at runtime so its links work at any depth.

## Xem trên thiết bị khác (view on other devices)

- **Same Wi-Fi/LAN:** `python3 -m http.server 8000 --bind 0.0.0.0`, then open `http://<this-computer-IP>:8000/` on the phone (find the IP with `hostname -I`). Works only while the computer and server are running.
- **Anywhere – GitHub Pages:** the GitHub repo → Settings → Pages → *Deploy from a branch* → `development` / `/ (root)`. The site is then at `https://<owner>.github.io/<repo>/` and updates on every push. The free plan requires a public repo.
- `404.html` sets its `<base>` at runtime (site root, or `/<repo>/` on `*.github.io`), so it works under the Pages sub-path too.
