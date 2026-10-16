# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Nicolo DiFerdinando (AI-Driven Solutions Analyst at PeopleConnect, Cal Poly SLO Industrial Engineering '26). It is a static site with a "datasheet" design (cream + red tokens, mono labels) and light/dark themes. The site is deployed on **Cloudflare Pages** at `nicolod.org`.

Positioning: AI/ML and data engineering lead; security and infrastructure are supporting depth, never certifications.

## Content rules (read before editing copy)

The content rules live in the coordination hub, `~/Developer/personal/nico-hub` (GitHub `nicodiferd/nico-hub`, private):

- `rules/public-claims.md`: the **truth rule**. Every fact on the site comes from a source file, never from memory: roles, dates, education and skills from the resume (`resume-tex/data/profile.yaml` once it exists, until then `pdftotext resume.pdf -`); Zedi facts from `zedi/docs/public-facts.yaml` (until it exists, `zedi/docs/product-state-*.md`); homelab facts from `homelab.html` itself. If no source supports a claim, it does not ship.
- `rules/banned-claims.txt`: one regex per line. Run every `all`-scope regex (`grep -iE`) over the deployable files (everything but `docs/`, `os/`, `node_modules/`, plus `pdftotext resume.pdf -`) before you push. Zero hits.
- `CHARTER.md`: positioning and the coordinator's autonomy gates.

Never on the site: certification claims, Zedi user counts or revenue, homelab IPs, hostnames, schedules or household details.

## Development Commands

```bash
# Main site: start development server (http://localhost:4321)
npm start
```

`npm start` runs `wrangler pages dev` through npx (pinned version, no npm install needed), so `_redirects` and `_headers` behave locally the way they do in production. Never use port 3000 (Nicolo's zedi-back dev server runs there). `python3 -m http.server` also works for a quick check, but it does not apply `_redirects` or pretty URLs (`/zedi` is `zedi.html`).

## Architecture & Structure

#### Core Files
- `index.html` - Main portfolio page (hero, profile, experience, projects, stack, leadership, education, contact)
- `flora.html` - Flora detail page (senior capstone with Bloomfilter)
- `zedi.html` - Zedi detail page (personal finance SaaS, live at https://zedi.dev)
- `bandit.html` - Bandit startup retrospective
- `homelab.html` - HomeLab infrastructure writeup (sanitized snapshot)
- `404.html` - Not-found page (Cloudflare Pages serves it for unknown paths)
- `resume.pdf` - Current resume, served at `/resume.pdf` (`/resume` redirects to it)
- `robots.txt`, `sitemap.xml` - Crawl config; add new pages to the sitemap
- `_redirects`, `_headers` - Cloudflare Pages redirect and header rules
- `js/app.js` - Main JS entry point (modules in `js/modules/`: theme, navigation, animations)
- `styles/main.css` - Main stylesheet; imports `styles/base/*` (tokens in `variables.css`) and `styles/components/*` (navigation, hero, card, effects, notifications, sections, detail)
- `images/` - Site images
- `docs/` - Redesign spec and plan, and `docs/og-card/og-card.html` (source of `images/og-card.png`). Not part of the site, but deployed because the build output is the repo root

#### Theme System
Light/dark/system theme switching via `data-theme` attribute on `<html>`, persisted in localStorage as `preferredTheme`. Default is light.

#### Key Technologies
- Static HTML5/CSS3/JavaScript
- Font Awesome 6.5.1 (CDN)
- Google Tag Manager for analytics
- Wrangler (`pages dev`, via npx) for local development

#### Deployment
- **Cloudflare Pages**, project name `nicolodwebsite`, custom domain `nicolod.org`.
- Auto-deploys from `main` via the Cloudflare Pages GitHub integration. Push to `main` triggers a build. Other branches get previews at `<branch>.nicolodwebsite.pages.dev` (the check run on the commit carries the URL: `gh api repos/nicodiferd/Nicolos-Portfolio/commits/<sha>/check-runs`).
- Build settings: build command empty, build output `.`, root directory blank (static site, no build step).
- `nicolodwebsite.pages.dev` is the bare project URL; `nicolod.org` is the custom domain.
- `_headers` and `_redirects` are honored by Cloudflare Pages (same syntax Netlify uses). Don't remove them.
- **History note:** an older Pages project (`nicolod`) sat on the same repo but its Git installation broke in early 2026. We migrated to a new project (`nicolodwebsite`) and re-pointed the custom domain. If deploys ever stop arriving, check the Git installation banner on the project's Deployments tab first.

### NicoOS (`os/`): archived

An old React desktop-sim portfolio, still live at os.nicolod.org as the Cloudflare Worker `nicoos` (`os/wrangler.jsonc`). Do not update it and do not link to it. Its takedown is prepared but not deployed: `os/redirect-worker.js` (301 to https://nicolod.org/) and `os/wrangler.redirect.jsonc`; commands are in `handoff.md`.

## Important Notes

1. **No build process for the main site** - Static site with no compilation/bundling
2. **No test framework** - Verify with a link crawl (curl every internal href/src), the banned-claims scan and a check for em-dashes in tracked files
3. **PDF handling** - The resume is the static file `resume.pdf` at the repo root, served at `/resume.pdf`. `_headers` serves it inline (opens in the browser) and asks for a 1 hour cache, but the zone's Browser Cache TTL overrides shorter values, so a replaced resume can stay cached for up to 4 hours. `_redirects` sends `/resume` and the old `/Nicolo%20DiFerdinando%20Resume.pdf` URL to it. Write spaces in `_redirects` paths as `%20`: Pages drops any rule that is not exactly 2 or 3 whitespace-separated tokens.
4. **Cache busting** - Every CSS/JS URL carries a `?v=redesign-N` token: each page's `main.css` `<link>` and `app.js` `<script>`, the 9 `@import`s in `styles/main.css`, and the 3 module imports in `js/app.js`. `_headers` caches `/styles/*` and `/images/*` for 7 days, and in production the zone's Browser Cache TTL (4h) overrides shorter values, so `/js/*` (no-cache in `_headers`) and `/resume.pdf` are also cached for up to 4 hours. After any CSS or JS edit, bump the token everywhere, e.g. `grep -rl "v=redesign-2" *.html styles js | xargs sed -i '' 's/v=redesign-2/v=redesign-3/g'`, then check `grep -rn "v=redesign" *.html styles js` shows only the new token. HTML-only edits need no bump. Images are not versioned: give a changed image a new filename.

## Style

- **No em-dashes anywhere in this repo.** The em-dash (Unicode U+2014, the long horizontal dash typographers use to break clauses) is banned from body copy, code comments, and docs alike. Use commas, periods, parentheses, or hyphens instead. Applies to user-facing text and developer-facing comments equally.
- `handoff.md`, `CLAUDE.md`, `docs/` and `os/` are publicly served. Never write secrets, security findings or private details in them.

## Common Tasks

### Updating Resume
1. Overwrite `resume.pdf` at the repo root with the new PDF (keep that exact filename; links, `_headers` and `_redirects` all point at it).
2. Check it locally with `npm start`, then open http://localhost:4321/resume.pdf.
3. Make sure site copy (job titles, dates, skills) still matches the new resume, and run the banned-claims scan on `pdftotext resume.pdf -`.
4. Do not copy it into `os/` (NicoOS is archived).
