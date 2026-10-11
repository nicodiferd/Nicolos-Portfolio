# nicolod.org

Personal portfolio of Nicolo DiFerdinando. Static HTML/CSS/JS, no build step, deployed on Cloudflare Pages from `main`.

## Run locally

```bash
npm start   # http://localhost:4321
```

Uses `wrangler pages dev` (via npx), so `_redirects` and `_headers` work locally like they do in production.

## Layout

- `index.html` plus detail pages: `flora.html`, `zedi.html`, `bandit.html`, `homelab.html`; `404.html` is the not-found page
- `styles/`, `js/`, `images/`
- `resume.pdf` (served at `/resume.pdf`, `/resume` redirects to it)
- `_redirects`, `_headers`, `robots.txt`, `sitemap.xml`
- `os/` is an archived side project (NicoOS) and is not maintained

To update the resume, overwrite `resume.pdf` and keep the filename.
