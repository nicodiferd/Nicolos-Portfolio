# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Nicolo DiFerdinando (AI-Driven Solutions Analyst at PeopleConnect, Cal Poly SLO Industrial Engineering '26). It is a static site with a "datasheet" design (cream + red tokens, mono labels) and light/dark themes. The site is deployed on **Cloudflare Pages** at `nicolod.org`.

An older **OS-style portfolio** (NicoOS) lives in the `os/` directory. **NicoOS is being archived:** do not update it, and do not link to it (or its subdomain) from the main site.

## Development Commands

```bash
# Main site: start development server (http://localhost:4321)
npm start
```

`npm start` runs `wrangler pages dev` through npx (pinned version, no npm install needed), so `_redirects` and `_headers` behave locally the way they do in production. Never use port 3000 (Nicolo's zedi-back dev server runs there).

## Architecture & Structure

### Main Site (root)

#### Core Files
- `index.html` - Main portfolio page (hero, profile, experience, projects, stack, leadership, education, contact)
- `flora.html` - Flora detail page (senior capstone with Bloomfilter)
- `zedi.html` - Zedi detail page (personal finance SaaS)
- `bandit.html` - Bandit startup retrospective
- `homelab.html` - HomeLab infrastructure writeup
- `404.html` - Not-found page (Cloudflare Pages serves it for unknown paths)
- `resume.pdf` - Current resume, served at `/resume.pdf` (`/resume` redirects to it)
- `robots.txt`, `sitemap.xml` - Crawl config; add new pages to the sitemap
- `_redirects`, `_headers` - Cloudflare Pages redirect and header rules
- `js/app.js` - Main JS entry point (modules in `js/modules/`: theme, navigation, animations)
- `styles/main.css` - Main stylesheet; imports `styles/base/*` (tokens in `variables.css`) and `styles/components/*` (navigation, hero, card, effects, notifications, sections, detail)
- `images/` - Site images
- `docs/` - Redesign spec and plan (not part of the site, but deployed because the build output is the repo root)

#### Theme System
Light/dark/system theme switching via `data-theme` attribute on `<html>`, persisted in localStorage as `preferredTheme`. Default is light.

#### Key Technologies
- Static HTML5/CSS3/JavaScript
- Font Awesome 6.5.1 (CDN)
- Google Tag Manager for analytics
- Wrangler (`pages dev`, via npx) for local development

#### Deployment
- **Cloudflare Pages**, project name `nicolodwebsite`, custom domain `nicolod.org`.
- Auto-deploys from `main` via the Cloudflare Pages GitHub integration. Push to `main` triggers a build.
- Build settings: build command empty, build output `.`, root directory blank (static site, no build step).
- `nicolodwebsite.pages.dev` is the bare project URL; `nicolod.org` is the custom domain.
- `_headers` and `_redirects` are honored by Cloudflare Pages (same syntax Netlify uses). Don't remove them.
- **History note:** an older Pages project (`nicolod`) sat on the same repo but its Git installation broke in early 2026. We migrated to a new project (`nicolodwebsite`) and re-pointed the custom domain. If deploys ever stop arriving, check the Git installation banner on the project's Deployments tab first.

### NicoOS (`os/`)

**Being archived. Do not update.** Kept below for reference only.

An interactive desktop OS simulator portfolio built with React + TypeScript + Vite.

#### Key Structure
```
os/
  src/
    App.tsx                    # Boot → Login → Desktop phase machine
    state/                     # Window manager (useReducer + Context)
    components/
      Boot/                    # Boot sequence + login screen
      Desktop/                 # Desktop surface + icon grid
      Taskbar/                 # Taskbar, start menu, clock
      Window/                  # Draggable/resizable window component
    apps/                      # App windows (About, Projects, Resume, etc.)
    hooks/                     # useDraggable, useResizable, useClock
    data/                      # App registry, content data
    styles/                    # Theme vars, reset, animations
  wrangler.jsonc               # Cloudflare Workers deployment config
```

#### Features
- CRT-style boot sequence with login screen (skipped on session refresh)
- 8 desktop apps: about_me.exe, projects/, resume.pdf, achievements.log, bandit.txt, homelab.sh, mail.exe, terminal.exe
- Draggable/resizable windows with minimize/maximize/close
- Taskbar with start menu, open window indicators, live clock
- Interactive terminal with commands (help, whoami, neofetch, ls, open, socials, etc.)
- Contact form via Formspree
- Retro aesthetic: JetBrains Mono, green-on-dark, sharp corners, CRT scanlines

#### Key Technologies
- React 19 + TypeScript + Vite
- CSS Modules (no external UI library)
- Custom pointer-event-based drag/resize (no dependencies)
- Font Awesome 6.5.1 (CDN via CSS import)

#### Deployment
- Cloudflare Workers (static assets); route and Worker name are in `os/wrangler.jsonc`
- Deploy: `cd os && npm run build && npx wrangler deploy`

## Important Notes

1. **No build process for main site** - Static site with no compilation/bundling
2. **NicoOS has a build process** - Vite builds to `os/dist/` (gitignored)
3. **No test framework** - Tests are not configured for either site
4. **PDF handling** - The resume is the static file `resume.pdf` at the repo root, served at `/resume.pdf`. `_headers` serves it inline (opens in the browser) and asks for a 1 hour cache, but the zone's Browser Cache TTL overrides shorter values, so a replaced resume can stay cached for up to 4 hours. `_redirects` sends `/resume` and the old `/Nicolo%20DiFerdinando%20Resume.pdf` URL to it. Write spaces in `_redirects` paths as `%20`: Pages drops any rule that is not exactly 2 or 3 whitespace-separated tokens.
5. **Boot skip** - NicoOS stores `nicoos-booted` in sessionStorage to skip boot on refresh
6. **Window state** - Managed via React Context + useReducer, not persisted across sessions
7. **Cache busting (main site)** - Every CSS/JS URL carries a `?v=redesign-N` token: each page's `main.css` `<link>` and `app.js` `<script>`, the 9 `@import`s in `styles/main.css`, and the 3 module imports in `js/app.js`. `_headers` caches `/styles/*` and `/images/*` for 7 days, and in production the zone's Browser Cache TTL (4h) overrides shorter values, so `/js/*` (no-cache in `_headers`) and `/resume.pdf` are also cached for up to 4 hours. After any CSS or JS edit, bump the token everywhere, e.g. `grep -rl "v=redesign-2" *.html styles js | xargs sed -i '' 's/v=redesign-2/v=redesign-3/g'`, then check `grep -rn "v=redesign" *.html styles js` shows only the new token. Images are not versioned: give a changed image a new filename. (Setting Caching > Browser Cache TTL to "Respect Existing Headers" in the Cloudflare dashboard would make the shorter `_headers` values take effect.)

## Style

- **No em-dashes anywhere in this repo.** The em-dash (Unicode U+2014, the long horizontal dash typographers use to break clauses) is banned from body copy, code comments, and docs alike. Use commas, periods, parentheses, or hyphens instead. Applies to user-facing text and developer-facing comments equally.

## Common Tasks

### Updating Resume
1. Overwrite `resume.pdf` at the repo root with the new PDF (keep that exact filename; links, `_headers` and `_redirects` all point at it).
2. Check it locally with `npm start`, then open http://localhost:4321/resume.pdf.
3. Make sure site copy (job titles, dates, certifications) still matches the new resume.
4. Do not copy it into `os/` (NicoOS is being archived).

### Modifying NicoOS Content
- App content lives in `os/src/apps/`. Each app is a standalone React component.
- App registry (icons, filenames, default sizes) is in `os/src/data/apps.ts`
- Boot messages are in `os/src/components/Boot/BootScreen.tsx`
- Terminal commands are in `os/src/apps/TerminalApp/TerminalApp.tsx`

### Adding a New NicoOS App
1. Create a new directory in `os/src/apps/NewApp/`
2. Add the app to the `AppId` type in `os/src/state/types.ts`
3. Register it in `os/src/data/apps.ts` with icon, filename, and default size
4. Add the component to `os/src/apps/AppRenderer.tsx`

### Deploying NicoOS
```bash
cd os && npm run build && npx wrangler deploy
```
