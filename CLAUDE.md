# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Nicolo DiFerdinando, featuring a multi-theme static website with cybersecurity-focused content. The site is deployed on **Cloudflare Pages** at `nicolod.org`.

An alternate **OS-style portfolio** (NicoOS) lives in the `os/` directory. It is a React-based interactive desktop simulator deployed on Cloudflare Workers at `os.nicolod.org`.

## Development Commands

```bash
# Main site: install dependencies
npm install

# Main site: start development server (runs on http://localhost:3000)
npm start

# NicoOS: install dependencies
cd os && npm install

# NicoOS: start development server
cd os && npm run dev

# NicoOS: build and deploy
cd os && npm run build && npx wrangler deploy
```

## Architecture & Structure

### Main Site (root)

#### Core Files
- `index.html` - Main portfolio page
- `bandit.html` - Bandit startup retrospective
- `homelab.html` - HomeLab infrastructure writeup
- `view-resume.html` - Resume viewer page
- `js/app.js` - Main JS entry point
- `styles/main.css` - Main stylesheet

#### Theme System
Light/dark/system theme switching via `data-theme` attribute on `<html>`, persisted in localStorage as `preferredTheme`.

#### Key Technologies
- Static HTML5/CSS3/JavaScript
- Font Awesome 6.5.1 (CDN)
- Google Tag Manager for analytics
- Lite-server for development

#### Deployment
- **Cloudflare Pages**, project name `nicolodwebsite`, custom domain `nicolod.org`.
- Auto-deploys from `main` via the Cloudflare Pages GitHub integration. Push to `main` triggers a build.
- Build settings: build command empty, build output `.`, root directory blank (static site, no build step).
- `nicolodwebsite.pages.dev` is the bare project URL; `nicolod.org` is the custom domain.
- `_headers` and `_redirects` are honored by Cloudflare Pages (same syntax Netlify uses). Don't remove them.
- **History note:** an older Pages project (`nicolod`) sat on the same repo but its Git installation broke in early 2026. We migrated to a new project (`nicolodwebsite`) and re-pointed the custom domain. If deploys ever stop arriving, check the Git installation banner on the project's Deployments tab first.

### NicoOS (`os/`)

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
- Cloudflare Workers (static assets) at `os.nicolod.org`
- Config in `wrangler.jsonc` (route pattern: `os.nicolod.org/*`)
- Also available at `nicoos.nicoloha-mail.workers.dev`
- Deploy: `cd os && npm run build && npx wrangler deploy`

## Important Notes

1. **No build process for main site** - Static site with no compilation/bundling
2. **NicoOS has a build process** - Vite builds to `os/dist/` (gitignored)
3. **No test framework** - Tests are not configured for either site
4. **PDF handling** - Resume PDF is served via Cloudflare Pages redirect rules (`_redirects` in repo root) and directly from public/ (NicoOS)
5. **Boot skip** - NicoOS stores `nicoos-booted` in sessionStorage to skip boot on refresh
6. **Window state** - Managed via React Context + useReducer, not persisted across sessions

## Style

- **No em-dashes anywhere in this repo.** The em-dash (Unicode U+2014, the long horizontal dash typographers use to break clauses) is banned from body copy, code comments, and docs alike. Use commas, periods, parentheses, or hyphens instead. Applies to user-facing text and developer-facing comments equally.

## Common Tasks

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

### Updating Resume
1. Replace `Nicolo DiFerdinando Resume.pdf` with the new version
2. Copy to `os/public/` as well for NicoOS
3. Ensure the filename matches or update `_redirects` accordingly
