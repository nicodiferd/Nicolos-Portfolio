# Status: nicolod.org redesign (datasheet aesthetic)

**Date:** 2026-10-10
**Branch:** `redesign/datasheet` (pushed to origin, not merged)
**Status:** Redesign plus the October refresh are committed on the branch and verified locally (wrangler pages dev, headless renders at 1280/375/320 in light and dark, link crawl, a11y and contrast checks). Production still serves the May 2026 `main`. Next step: Nicolo reviews the branch preview, then merge to `main` (Cloudflare Pages auto-deploys from main).

Spec and plan from June live in `docs/superpowers/`.

## October 2026 refresh (what changed)

- **Content synced to the current resume** (`/resume.pdf`, compiled 2026-10-10): title is "AI-Driven Solutions Analyst" at PeopleConnect everywhere (hero, meta, OG, JSON-LD with worksFor), experience bullets, leadership dates, coursework.
- **Certs:** no security certs claimed. One course certificate shown: Intro to Snowflake for Devs, Data Scientists, Data Engineers (Snowflake, via Coursera).
- **Flora and Wedge** are text tiles (no images). Wedge is Donato's app at wedge-golf.dev; Nicolo is a contributor.
- **HomeLab page rewritten** for the live lab in San Diego (back online since 2026-08-31). Public-safe by design: no IPs, no neighborhood, no versions where avoidable, no household details. New card image `images/homelab-status.png`.
- **Resume download fixed.** The old `_redirects` rule had spaces in the target and Cloudflare dropped it, so `/resume.pdf` served the homepage. The PDF now lives at `/resume.pdf`; `/resume`, `/view-resume` and the old spaced URL 301 to it. Opens inline.
- **New:** `404.html` (real 404 status), `robots.txt`, `sitemap.xml`, `images/og-card.png`, OG/Twitter/canonical on every page, GTM on every page, extensionless internal links.
- **Fixes:** Bandit card grid restored, WCAG AA contrast in both themes, mobile menu inert when closed + Escape, skip link focuses main, scroll reveal works without JS, `[hidden]` reset, theme storage guarded.
- **Cleanup:** ~350 lines of dead CSS and the dead animation JS removed; cruft pages and notes deleted; ~15 MB of unused images removed; `Bandit Fancy.png` replaced by `images/bandit.webp`.
- **Local dev:** `npm start` runs `wrangler pages dev` on port 4321 (emulates `_redirects`/`_headers`). Never use port 3000.
- **Cache busting:** every CSS/JS URL carries `?v=redesign-2` (page `<link>`/`<script>` tags, `@import`s in `styles/main.css`, module imports in `js/app.js`). Bump all of them together when CSS/JS changes.

## Open items for Nicolo

1. **Review and merge** `redesign/datasheet` into `main`.
2. **www.nicolod.org has no DNS record**, and the resume links to it. In Cloudflare: add `www.nicolod.org` as a custom domain on the `nicolodwebsite` Pages project, then a Redirect Rule (www to apex, 301, keep path and query). Or change the resume link to `nicolod.org`.
3. **Snowflake course link:** wrap the title in `index.html` (marked `<!-- CERT: ... -->`) with the Coursera verify URL.
4. **Resume LaTeX tweaks:** HomeLab line is outdated (pfSense, Grafana, Bitwarden, Plex); add PDF title/author metadata; consider the www link above.
5. **diferdinando.com** still says student + Security+ / Splunk certified. Update that site, then restore the Visit link on its tile (marked in `index.html`).
6. **Cloudflare zone Browser Cache TTL** (4h) overrides `_headers` for cacheable files. Set Caching > Browser Cache TTL to "Respect Existing Headers".
7. **Stop publishing repo internals:** build output is `.`, so `CLAUDE.md`, `docs/`, `os/` and package files are public (stopgap: `X-Robots-Tag: noindex` in `_headers`). Long-term: move the site into `public/` and set that as the Pages build output directory.
8. **HomeLab copy questions:** keep or drop the patch/backup times and the game-server mention; Home Assistant, Immich and the game server's future.
9. **Optional:** Zedi screenshots show the Next.js dev badge (recapture from a production build); add a Content-Security-Policy after testing.
10. **NicoOS (`os/`)** is being archived: tag it, remove `os/`, take down os.nicolod.org (confirm first).

## Preview

```bash
npm start
```

Serves on http://localhost:4321 with `_redirects` and `_headers` applied.
