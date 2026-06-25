# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the main site (nicolod.org) into a cream-and-red, datasheet-inspired layout with a side-photo hero, simplified numbered-section navigation, a real experience timeline, and per-project detail pages.

**Architecture:** Static HTML/CSS/JS, no build step. One scrolling `index.html` with numbered sections plus standalone project detail pages. CSS stays modular under `styles/` (token file plus per-component files plus page sections in `main.css`). JS stays as ES modules under `js/`. Theme switching keeps the existing `data-theme` + localStorage `preferredTheme` mechanism, with the default flipped to light (cream).

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla ES modules, Google Fonts (Inter, Space Grotesk, JetBrains Mono), Font Awesome 6.5.1 CDN, Formspree, lite-server for local preview.

## Global Constraints

- No em-dashes anywhere (U+2014 is banned repo-wide, body copy and comments alike). Use commas, periods, parentheses, or hyphens.
- Project card copy stays terse: 2 to 3 sentences, no tech laundry lists in the body (tech goes in tag chips).
- No build process for the main site. No new runtime dependencies, no bundler.
- Keep both light and dark themes. Cream/light is the new default. Red is a single accent token, tunable in one place.
- Theme persists in localStorage under key `preferredTheme`; values `system`, `dark`, `light`.
- Do not touch `os/` (NicoOS).
- Do not remove `_headers` or `_redirects`. Resume PDF handling via `_redirects` stays as is.
- Keep the Formspree form action `https://formspree.io/f/xovjlpne` and the `data-ajax` handler.
- Deploys are automatic from the default branch via Cloudflare Pages. This work lands on branch `redesign/datasheet`; it does not deploy until merged.

## Verification approach (no test framework)

This repo has no test runner and is a static site, so each task ends with a verification loop instead of unit tests:

1. **Automated guards** (run from repo root):
   ```bash
   # Guard A: no em-dashes in source (build the U+2014 byte sequence so this file stays clean)
   em=$(printf '\xe2\x80\x94')
   if grep -rn "$em" index.html bandit.html homelab.html flora.html zedi.html styles js 2>/dev/null; then echo "FAIL: em-dash found"; else echo "PASS: no em-dashes"; fi

   # Guard B: every local image/href referenced in HTML exists on disk
   # (strips ?cache-buster and #fragment, resolves web-root / to repo-relative, skips resume.pdf which is served via _redirects)
   for f in index.html bandit.html homelab.html flora.html zedi.html; do
     [ -f "$f" ] || continue
     grep -Eoh '(src|href)="[^"]+"' "$f" | sed -E 's/.*="//; s/"//' \
       | grep -Ev '^(https?:|mailto:|tel:|#|data:)' \
       | while read -r p; do
           p="${p%%#*}"; p="${p%%\?*}"; [ -z "$p" ] && continue
           p="${p#/}"; [ "$p" = "resume.pdf" ] && continue
           [ -f "$p" ] || echo "MISSING in $f: $p"
         done
   done
   echo "asset check done"
   ```
2. **Local preview:** `npm start` serves at http://localhost:3000. Each task lists a browser checklist with exact pass criteria.
3. **Console check:** with the page open, the browser console must show no errors.

A task is "done" only when Guard A prints PASS, Guard B prints no MISSING lines, the browser checklist passes, and the console is clean.

## File structure

Created:
- `flora.html` - Flora detail page.
- `zedi.html` - Zedi detail page (with gallery from `images/zedi-deck-shots/`).
- `styles/components/sections.css` - shared section primitives (`.ds-section`, `.ds-row`, `.chip`, focus tiles, stack table, inverted section).
- `styles/components/detail.css` - shared detail-page layout.

Modified:
- `styles/base/variables.css` - cream/red palette, font tokens.
- `styles/main.css` - import new component files, replace per-page section styles, bump cache-buster version.
- `styles/components/navigation.css` - simplified nav, active state.
- `styles/components/hero.css` - two-column split hero, focus tiles.
- `styles/components/card.css` - project cards plus URL/typographic tile variant.
- `index.html` - rebuilt nav, head (fonts, theme default, cache version), and `<main>` sections.
- `js/app.js` - prune dead behavior (page-transition, counter fallback if stats removed) as sections change.
- `js/modules/navigation.js` - scrollspy active-link state for the new section ids.
- `js/modules/theme.js` - default to light when no saved preference.
- `bandit.html`, `homelab.html` - re-skin to the shared detail template.

Naming and reuse:
- One datasheet row primitive `.ds-row` (meta column left, content right) is built in Task 4 and reused by Experience, Leadership, Education.
- One section wrapper `.ds-section` with a mono header `.ds-section__num` (for example `02 / WORK`).
- One mono chip `.chip` for all tag chips.
- The inverted dark Contact block uses `.section--ink`, which redefines the color tokens locally so it is dark in both themes.

---

### Task 1: Foundation tokens, fonts, theme default

**Files:**
- Modify: `styles/base/variables.css`
- Modify: `index.html` (Google Fonts link, early theme script default, theme selector default option, stylesheet cache-buster)
- Modify: `js/modules/theme.js` (default to light)

**Produces:** the palette and font tokens every later task consumes. Token names kept identical to today so existing component CSS keeps working: `--color-background`, `--color-background-alt`, `--color-surface`, `--color-surface-alt`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-border`, `--color-primary`, `--color-primary-dark`, `--color-primary-light`. New: `--font-display`, `--font-body`, `--font-mono`.

- [ ] **Step 1: Add fonts and flip theme default in `index.html`**

Replace the Google Fonts link line with:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
In the early theme script, change the default from `'system'` to `'light'`:
```js
var saved = localStorage.getItem('preferredTheme') || 'light';
```
Bump the stylesheet cache-buster: change `styles/main.css?v=light-audit-6` to `styles/main.css?v=redesign-1`.
In both theme `<select>` blocks, move `selected` onto the Light option default is fine to leave; the script drives the actual theme.

- [ ] **Step 2: Rewrite the palette in `styles/base/variables.css`**

In `:root`, set the brand reds to an oxblood/signal red and add font tokens (keep all spacing, type-scale, radius, z-index, breakpoint tokens unchanged):
```css
  /* Accent (single source of truth, tune here) */
  --color-primary: #b5271d;
  --color-primary-dark: #8f1c15;
  --color-primary-light: #d8392c;

  /* Fonts */
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
```
Keep `--font-primary` as an alias so nothing breaks: set `--font-primary: var(--font-body);` and `--font-mono` is overridden above.

Make light (cream) the default by setting `:root` semantic colors to the light values, and keep the explicit theme blocks:
```css
[data-theme="light"] {
  --color-background: #f5f2ec;
  --color-background-alt: #efe9df;
  --color-surface: #fbf9f4;
  --color-surface-alt: #efe9df;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #55524b;
  --color-text-muted: #837e74;
  --color-border: rgba(26, 22, 18, 0.14);
  --color-primary: #b5271d;
  --color-primary-dark: #8f1c15;
  --color-primary-light: #d8392c;
  --shadow-sm: 0 1px 2px 0 rgba(40, 30, 20, 0.06);
  --shadow-md: 0 4px 10px -2px rgba(40, 30, 20, 0.10);
  --shadow-lg: 0 12px 24px -6px rgba(40, 30, 20, 0.12);
  --shadow-xl: 0 24px 40px -10px rgba(40, 30, 20, 0.16);
}

[data-theme="dark"] {
  --color-background: #0d0d0f;
  --color-background-alt: #131316;
  --color-surface: #17171a;
  --color-surface-alt: #202024;
  --color-text-primary: #f0ece3;
  --color-text-secondary: #c4bfb5;
  --color-text-muted: #8b867c;
  --color-border: rgba(255, 255, 255, 0.12);
  --color-primary: #e2392c;
  --color-primary-dark: #b5271d;
  --color-primary-light: #f0594c;
}
```
Set the base `:root` background/text defaults to the light values too (so a missing data-theme still renders cream).

- [ ] **Step 3: Default theme to light in `js/modules/theme.js`**

Read the file first. Wherever it reads `localStorage.getItem('preferredTheme')` with a fallback, make the fallback `'light'`. Wherever it computes the effective theme for `system`, keep that logic. Goal: a first-time visitor with no saved preference sees cream.

- [ ] **Step 4: Apply body font**

In `styles/base/base.css` (read it first), ensure `body` uses `var(--font-body)` and headings can opt into `var(--font-display)`. If `body` currently uses `--font-primary`, that now aliases to body font, so it is fine; just confirm.

- [ ] **Step 5: Verify**

Run Guard A and Guard B. Run `npm start`, open http://localhost:3000.
Browser checklist:
- Page background is warm cream by default (no saved theme: clear localStorage first).
- Switching theme to Dark gives near-black with red accent; Light returns to cream; both persist on reload.
- Network tab shows Space Grotesk and JetBrains Mono loading.
- No console errors.

- [ ] **Step 6: Commit**
```bash
git add styles/base/variables.css index.html js/modules/theme.js styles/base/base.css
git commit -m "redesign: cream+red tokens, display+mono fonts, light default"
```

---

### Task 2: Navigation

**Files:**
- Modify: `index.html` (nav and mobile nav markup)
- Modify: `styles/components/navigation.css`
- Modify: `js/modules/navigation.js` (scrollspy)

**Consumes:** tokens from Task 1.
**Produces:** section anchor ids that all later sections must match: `#profile`, `#experience`, `#projects`, `#stack`, `#contact` (Leadership and Education are scroll-only, ids `#leadership`, `#education`).

- [ ] **Step 1: Replace desktop nav menu** in `index.html` with the reduced set:
```html
<ul class="navigation__menu">
  <li class="navigation__item"><a href="#profile" class="navigation__link">Profile</a></li>
  <li class="navigation__item"><a href="#experience" class="navigation__link">Experience</a></li>
  <li class="navigation__item"><a href="#projects" class="navigation__link">Projects</a></li>
  <li class="navigation__item"><a href="#stack" class="navigation__link">Stack</a></li>
  <li class="navigation__item"><a href="#contact" class="navigation__link">Contact</a></li>
  <li class="navigation__item"><a href="/resume.pdf" class="navigation__link navigation__link--btn" download="Nicolo_DiFerdinando_Resume.pdf">Resume</a></li>
  <li class="navigation__item">
    <select class="theme-selector" data-theme-selector aria-label="Theme selector">
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  </li>
</ul>
```
Mirror the same five links plus Resume in `#mobileMenu`. Keep the `ND` brand linking to `#home`.

- [ ] **Step 2: Style the nav** in `styles/components/navigation.css` (read it first, then adjust):
- Nav bar: cream/translucent background with `backdrop-filter: blur(8px)`, a 1px bottom border using `--color-border`, mono small caps not required.
- `.navigation__link` uppercase, letter-spacing 0.04em, `var(--font-mono)` at `--text-sm`, muted color, accent on hover and when `.is-active`.
- `.navigation__link--btn`: bordered pill using `--color-primary` text and border.
- Active state underline or left-accent in red.

- [ ] **Step 3: Scrollspy** in `js/modules/navigation.js` (read it first). Add an IntersectionObserver over sections `#profile, #experience, #projects, #stack, #contact`; toggle `.is-active` on the matching `.navigation__link` whose `href` equals `#id`. Use `rootMargin: '-45% 0px -50% 0px'` so the active link reflects the section near viewport center.

- [ ] **Step 4: Verify** Guard A, Guard B, `npm start`.
Browser checklist:
- Nav shows exactly: Profile, Experience, Projects, Stack, Contact, Resume, theme select.
- Clicking each scrolls to its section (sections exist as stubs for now; if a target is missing the link simply does nothing, acceptable mid-build).
- The Resume link downloads the PDF.
- As you scroll, the active link highlights.
- Mobile menu opens and shows the same links.
- No console errors.

- [ ] **Step 5: Commit**
```bash
git add index.html styles/components/navigation.css js/modules/navigation.js
git commit -m "redesign: simplified anchor nav with scrollspy"
```

---

### Task 3: Hero

**Files:**
- Modify: `index.html` (replace `<section class="hero">`)
- Modify: `styles/components/hero.css`

**Consumes:** tokens (Task 1). **Produces:** `#home` hero and the `.focus-tiles` row.

- [ ] **Step 1: Replace hero markup** with a two-column split:
```html
<section class="hero" id="home">
  <div class="container hero__split">
    <div class="hero__main">
      <p class="hero__eyebrow">SOFTWARE &middot; DATA &middot; SECURITY</p>
      <a class="hero__status" href="#experience">
        <img src="images/pc.webp" alt="PeopleConnect" class="hero__status-logo" width="20" height="20">
        <span>Incoming @ PeopleConnect</span>
      </a>
      <h1 class="hero__title">Nicolo<br>DiFerdinando</h1>
      <p class="hero__bio">
        Industrial engineering grad building software, data pipelines, and security automation.
        I make internal tools that take repetitive work off people's plates, design data systems,
        and ship AI agents with Python and LangChain.
      </p>
      <div class="hero__actions">
        <a href="#projects" class="btn btn--primary">View work</a>
        <a href="#contact" class="btn btn--secondary">Get in touch</a>
        <a href="/resume.pdf" class="btn btn--ghost" download="Nicolo_DiFerdinando_Resume.pdf">Resume</a>
      </div>
    </div>
    <aside class="hero__aside">
      <div class="hero__photo">
        <img src="images/Nicolo.jpeg" alt="Nicolo DiFerdinando" width="420" height="520" fetchpriority="high">
      </div>
      <dl class="hero__chip">
        <div><dt>LOC</dt><dd>San Diego, CA</dd></div>
        <div><dt>FOCUS</dt><dd>AI &middot; Data &middot; Security</dd></div>
      </dl>
    </aside>
  </div>
  <div class="container focus-tiles">
    <a class="focus-tile" href="#projects"><i class="fas fa-robot"></i><span>AI &amp; Agents</span></a>
    <a class="focus-tile" href="#experience"><i class="fas fa-database"></i><span>Data Engineering</span></a>
    <a class="focus-tile" href="#experience"><i class="fas fa-shield-halved"></i><span>Security Automation</span></a>
    <a class="focus-tile" href="#projects"><i class="fas fa-server"></i><span>Infrastructure</span></a>
  </div>
</section>
```
Remove the old `hero__background`, `hero__avatar`, `hero__scroll`, particle markup.

- [ ] **Step 2: Style the hero** in `styles/components/hero.css` (replace old hero rules):
- `.hero__split`: `display:grid; grid-template-columns: 1.15fr 0.85fr; gap: var(--space-16); align-items:center; min-height: 88vh; padding-top: var(--space-24);`
- `.hero__eyebrow`, `.hero__chip dt`: `var(--font-mono)`, `--text-sm`, letter-spacing 0.12em, muted.
- `.hero__status`: inline-flex pill, 1px border `--color-border`, small, logo + text, mono.
- `.hero__title`: `var(--font-display)`, weight 700, `clamp(2.75rem, 7vw, 5.5rem)`, line-height 0.95, letter-spacing -0.02em.
- `.hero__bio`: `--text-lg`, max-width 46ch, secondary color.
- `.hero__photo img`: full width, `border:1px solid var(--color-border)`, slight radius `--radius-sm`, `object-fit:cover`, aspect ratio preserved; subtle `--shadow-lg`.
- `.hero__chip`: grid of two rows, mono labels left, values right, thin top border, `--text-sm`.
- `.focus-tiles`: `display:grid; grid-template-columns: repeat(4,1fr); gap: var(--space-4); margin-top: var(--space-12);` each `.focus-tile` is a bordered square-ish card, icon in red, label in mono, hover lifts and accent-borders.
- Add `.btn--ghost` (text + arrow, no fill) if not present.
- Responsive: at `max-width: 860px`, `.hero__split` becomes one column, photo first or after title (put photo after `.hero__main` in source so text leads, then reorder so photo sits on top on mobile via `order`). `.focus-tiles` becomes 2 columns.

- [ ] **Step 3: Verify** Guard A, Guard B, `npm start`.
Browser checklist:
- Desktop: big name left in Space Grotesk, framed photo right with the LOC/FOCUS chip, PeopleConnect tag with logo visible, four focus tiles below.
- Buttons: View work scrolls to projects stub, Get in touch to contact stub, Resume downloads.
- Mobile (narrow window): columns stack cleanly, tiles go 2-wide, nothing overflows.
- Cream and dark both look right.
- No console errors.

- [ ] **Step 4: Commit**
```bash
git add index.html styles/components/hero.css
git commit -m "redesign: two-column side-photo hero with focus tiles"
```

---

### Task 4: Profile and Experience (builds the .ds-section and .ds-row primitives)

**Files:**
- Modify: `index.html` (replace old About section; add Experience section)
- Create: `styles/components/sections.css`
- Modify: `styles/main.css` (add `@import 'components/sections.css?v=redesign-1';`)

**Produces:** `.ds-section`, `.ds-section__num`, `.ds-row`, `.chip` for reuse by Tasks 6, 7.

- [ ] **Step 1: Add the import** to `styles/main.css` after the existing component imports:
```css
@import 'components/sections.css?v=redesign-1';
```

- [ ] **Step 2: Profile markup** (replace the `about` section). Section id `#profile`:
```html
<section class="ds-section" id="profile">
  <div class="container">
    <p class="ds-section__num">01 / PROFILE</p>
    <div class="ds-section__lead">
      <h2 class="ds-statement">I build the boring stuff so people do not have to: internal tools, data pipelines, and agents that quietly handle the repetitive work.</h2>
      <p class="ds-body">
        Industrial engineering graduate with experience across software engineering, data engineering, and
        cybersecurity automation. Focused on building internal tools that streamline workflows, designing data
        pipelines and database systems, automating reporting, and building agents with LangChain and Python.
      </p>
      <div class="chips">
        <span class="chip">Internal Tooling</span>
        <span class="chip">Data Engineering</span>
        <span class="chip">Security Automation</span>
        <span class="chip">AI Agents</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Experience markup**. Section id `#experience`, using `.ds-row` per role:
```html
<section class="ds-section" id="experience">
  <div class="container">
    <p class="ds-section__num">02 / EXPERIENCE</p>
    <div class="ds-rows">

      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">AUG 2026 &ndash; PRESENT</span><span class="chip chip--accent">Incoming</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">AI-Driven Solutions Analyst</h3>
          <p class="ds-row__org">PeopleConnect</p>
          <ul class="ds-row__points">
            <li>Build and deploy LLM-powered tools and Python scripts (OpenAI, Claude, Zapier, Airflow) to automate high-impact workflows across Growth and Operations.</li>
            <li>Partner with Marketing and Finance on forecasting and campaign optimization using ML and prompt-engineered systems across Snowflake, dbt, and Sigma.</li>
            <li>Translate business problems into AI-driven solutions and run structured experiments measuring time saved, revenue lift, and cost efficiency.</li>
          </ul>
        </div>
      </article>

      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">OCT 2025 &ndash; JUN 2026</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">Business Intelligence Intern</h3>
          <p class="ds-row__org">PeopleConnect</p>
          <ul class="ds-row__points">
            <li>Built interactive dashboards in Sigma, Tableau, and Snowflake serving 50+ stakeholders across Growth, Operations, and Finance.</li>
            <li>Developed and monitored dbt data pipelines with CI/CD, and built a semantic layer service exposing governed metrics through MCP connectors (Claude, ChatGPT, Slack).</li>
            <li>Helped migrate enterprise reporting from Tableau to Sigma, cutting delivery overhead.</li>
          </ul>
        </div>
      </article>

      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">JUN 2025 &ndash; SEP 2025</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">Cybersecurity &amp; IT Intern</h3>
          <p class="ds-row__org">PeopleConnect</p>
          <ul class="ds-row__points">
            <li>Built bash automation for audit reporting and completed a SOC 2 audit in 4 weeks against a projected 10.</li>
            <li>Deployed vulnerability scanning across 200+ endpoints and wrote reusable scripts to reduce risk surface.</li>
          </ul>
        </div>
      </article>

      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">APR 2024 &ndash; JUN 2025</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">Assistant Student SOC Analyst</h3>
          <p class="ds-row__org">Cal Poly ITS</p>
          <ul class="ds-row__points">
            <li>Built a Python Slack app automating SOC workflows by integrating Splunk SOAR playbooks with Slack Bolt REST APIs for real-time incident response.</li>
            <li>Analyzed and responded to 50+ weekly security incidents (suspicious logins, phishing, anomalous traffic) in Splunk Enterprise, collaborating with IT on remediation.</li>
          </ul>
        </div>
      </article>

      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">SUMMER 2022</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">CyberSecurity Intern</h3>
          <p class="ds-row__org">loanDepot</p>
          <ul class="ds-row__points">
            <li>Designed and deployed phishing simulation campaigns to train employees on social engineering threats.</li>
            <li>Gained hands-on exposure to incident response, compliance auditing, and security architecture.</li>
          </ul>
        </div>
      </article>

    </div>
  </div>
</section>
```

- [ ] **Step 4: Write `styles/components/sections.css`** with the shared primitives:
- `.ds-section`: `padding: var(--space-24) 0;` first one may use `--color-background-alt` for subtle banding (alternate banding across sections is encouraged but optional).
- `.ds-section__num`: `var(--font-mono)`, `--text-sm`, letter-spacing 0.12em, color `--color-primary`, border-bottom 1px `--color-border`, padding-bottom `--space-4`, margin-bottom `--space-12`.
- `.ds-statement`: `var(--font-display)`, weight 600, `clamp(1.6rem, 3.2vw, 2.5rem)`, line-height 1.15, max-width 24ch-ish (use ~30ch), tight tracking.
- `.ds-body`: `--text-lg`, line-height 1.8, secondary color, max-width 60ch, margin-top `--space-6`.
- `.chips`: flex wrap, gap `--space-3`, margin-top `--space-8`.
- `.chip`: `var(--font-mono)`, `--text-xs`, uppercase, letter-spacing 0.06em, padding `var(--space-2) var(--space-3)`, 1px border `--color-border`, radius `--radius-sm`, muted text. `.chip--accent`: red border + red text.
- `.ds-rows`: vertical stack.
- `.ds-row`: `display:grid; grid-template-columns: 220px 1fr; gap: var(--space-8); padding: var(--space-8) 0; border-top: 1px solid var(--color-border);`
- `.ds-row__date`: `var(--font-mono)`, `--text-sm`, muted, block.
- `.ds-row__meta`: stack date + optional chip, gap `--space-2`.
- `.ds-row__title`: `var(--font-display)`, weight 600, `--text-xl`.
- `.ds-row__org`: `--text-base`, color `--color-primary`, margin-bottom `--space-3`.
- `.ds-row__points`: list, no bullets, each `li` prefixed with a red `-` via `::before { content: "-"; color: var(--color-primary); }`, line-height 1.7, secondary color, gap.
- Responsive `max-width: 760px`: `.ds-row` collapses to one column, meta row goes horizontal above the body.

- [ ] **Step 5: Verify** Guard A, Guard B (note: HTML entities `&ndash;` and `&middot;` are allowed; the em-dash guard only flags the literal U+2014 character, confirm none used), `npm start`.
Browser checklist:
- Profile reads as a big statement + paragraph + four chips.
- Experience shows five entries, dates in the left column, role/org/bullets right, thin rules between, the first entry shows the red "Incoming" chip.
- Collapses to single column on mobile.
- No console errors.

- [ ] **Step 6: Commit**
```bash
git add index.html styles/components/sections.css styles/main.css
git commit -m "redesign: profile statement and experience timeline"
```

---

### Task 5: Projects grid

**Files:**
- Modify: `index.html` (replace projects section)
- Modify: `styles/components/card.css`

**Consumes:** `.chip` (Task 4), tokens (Task 1). **Produces:** `.proj-grid`, `.proj-card`, `.proj-card--tile`.

- [ ] **Step 1: Projects markup**. Section id `#projects`, mono header `03 / PROJECTS`, a `.proj-grid` of cards. Cards with a photo use `.proj-card`; link-only/no-photo use `.proj-card--tile` (a typographic URL tile). Eight cards in this order: Flora, HomeLab, Bandit, Zedi, Wedge, diferdinando.com, Beyond Wrapped, anthony.diferdinando.com.

Photo card pattern (Flora, HomeLab, Bandit, Zedi, Wedge):
```html
<article class="proj-card">
  <a class="proj-card__media" href="flora.html">
    <img src="images/PLACEHOLDER-flora.png" alt="Flora" loading="lazy">
  </a>
  <div class="proj-card__body">
    <p class="proj-card__cat">SENIOR CAPSTONE / BLOOMFILTER.AI</p>
    <h3 class="proj-card__title">Flora</h3>
    <p class="proj-card__desc">Year-long senior capstone with Bloomfilter, improving HCI for AI-agent integration inside project-management tools, with a focus on driving adoption in enterprise software.</p>
    <div class="chips"><span class="chip">HCI</span><span class="chip">AI Agents</span><span class="chip">Research</span></div>
    <a class="proj-card__link" href="flora.html">View project <i class="fas fa-arrow-right"></i></a>
  </div>
</article>
```
Use these exact contents per card:
- Flora: media link `flora.html`, image `images/PLACEHOLDER-flora.png` (slot), cat `SENIOR CAPSTONE / BLOOMFILTER.AI`, desc as above, chips HCI / AI Agents / Research, link `flora.html` "View project".
- HomeLab: media link `homelab.html`, image `images/Website Header.png`, cat `INFRASTRUCTURE`, desc "Self-hosted Proxmox cluster running 12+ services: pfSense networking, Docker, ZFS mirrored storage, and an observability stack, with fleet-wide SSH automation.", chips Proxmox / Docker / ClickHouse / Cloudflare, link `homelab.html` "Explore setup".
- Bandit: media link `bandit.html`, image `images/Bandit Fancy.png`, cat `STARTUP`, desc "Co-founded a student transportation LLC in San Luis Obispo. Built the app, ran operations, and wound it down after a year of hard lessons.", chips Startup / iOS / Operations, link `bandit.html` "Read the story".
- Zedi: media link `zedi.html`, image `images/zedi-deck-shots/dashboard.png`, cat `PERSONAL FINANCE SAAS`, desc "Full-stack finance platform built end to end: Rust and Axum API, Next.js frontend, Postgres with row-level multi-tenancy, Claude Vision receipt OCR, and Stripe billing.", chips Rust / Next.js / Postgres / Claude Vision, then two links: `zedi.html` "Case study" and `https://zedi.sneeks.ai` (target _blank, rel noopener) "Live site".
- Wedge: media link `https://apps.apple.com` placeholder or none; image `images/wedge_logo.png` (slot, screenshot pending), cat `MOBILE / DONATOS`, desc "Shipped a focused feature inside the Donatos / Wedge golf app as a contributor.", chips iOS / Feature. No detail page; link omitted or external when provided. Add an HTML comment: `<!-- Wedge: replace logo with feature screenshot when provided -->`.

URL tile pattern (diferdinando.com, Beyond Wrapped, anthony.diferdinando.com):
```html
<article class="proj-card proj-card--tile">
  <div class="proj-card__body">
    <p class="proj-card__cat">PORTFOLIO</p>
    <h3 class="proj-card__title">diferdinando.com</h3>
    <p class="proj-card__url">diferdinando.com</p>
    <p class="proj-card__desc">Personal portfolio built with Next.js and TypeScript.</p>
    <div class="chips"><span class="chip">Next.js</span><span class="chip">TypeScript</span></div>
    <a class="proj-card__link" href="https://diferdinando.com" target="_blank" rel="noopener noreferrer">Visit <i class="fas fa-arrow-up-right-from-square"></i></a>
  </div>
</article>
```
- diferdinando.com: cat PORTFOLIO, url `diferdinando.com`, desc as above, chips Next.js / TypeScript, link external "Visit".
- Beyond Wrapped: cat `DATA / ML &middot; IME 565`, url none (omit `.proj-card__url`), desc "Spotify analytics platform with ML-powered audio-feature prediction and context-aware scoring.", chips Python / ML / Streamlit, no link, add a muted `<span class="proj-card__muted">Private repo</span>`.
- anthony.diferdinando.com: cat `DESIGN &middot; BUILD`, url `anthony.diferdinando.com`, desc "Designed and built my brother Anthony's mechanical-engineering portfolio.", chips Next.js / Design, link external "Visit".

- [ ] **Step 2: Style cards** in `styles/components/card.css` (you may keep or replace old card rules; remove the old `.card--icon-card` hero styles from `index.html` inline `<style>` once unused):
- `.proj-grid`: `display:grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-8);` responsive to 1 column under 760px.
- `.proj-card`: surface background, 1px border `--color-border`, radius `--radius-sm`, overflow hidden, flex column, hover lifts (`translateY(-4px)`) and accent border.
- `.proj-card__media img`: full width, `aspect-ratio: 16/10`, `object-fit: cover`, border-bottom 1px `--color-border`.
- `.proj-card__cat`: `var(--font-mono)`, `--text-xs`, letter-spacing 0.1em, muted.
- `.proj-card__title`: `var(--font-display)`, `--text-2xl`, weight 600.
- `.proj-card__url`: `var(--font-mono)`, `--text-sm`, color `--color-primary`.
- `.proj-card__desc`: `--text-base`, secondary, line-height 1.65.
- `.proj-card__link`: red, inline-flex with gap, arrow nudges on hover.
- `.proj-card--tile`: no media; taller padding; a faint background pattern or large muted monogram allowed; reads as a clean link card.
- `.proj-card__muted`: muted mono, used for "Private repo".

- [ ] **Step 3: Create placeholder image slot** so Guard B passes before the real Flora image arrives:
```bash
cp "images/Website Header.png" images/PLACEHOLDER-flora.png
```
Add an HTML comment near the Flora card noting it is a placeholder to be replaced.

- [ ] **Step 4: Verify** Guard A, Guard B, `npm start`.
Browser checklist:
- Two-column grid, eight cards in the specified order.
- Photo cards show images (Flora placeholder, HomeLab header, Bandit art, Zedi dashboard, Wedge logo).
- Tile cards (diferdinando.com, Beyond Wrapped, anthony) read as clean URL cards, Beyond Wrapped shows "Private repo" and no link.
- Zedi shows two links (Case study + Live site).
- Internal links point to flora.html / homelab.html / bandit.html / zedi.html (pages built later; clicking may 404 until Tasks 10 to 11, acceptable mid-build).
- Collapses to one column on mobile.
- No console errors.

- [ ] **Step 5: Commit**
```bash
git add index.html styles/components/card.css images/PLACEHOLDER-flora.png
git commit -m "redesign: project grid with photo cards and URL tiles"
```

---

### Task 6: Stack section

**Files:**
- Modify: `index.html` (replace certifications section with Stack)
- Modify: `styles/components/sections.css` (add `.stack-row`)

**Consumes:** `.ds-section`, `.chip`. 

- [ ] **Step 1: Stack markup**. Section id `#stack`, mono header `04 / STACK`, label/value rows:
```html
<section class="ds-section" id="stack">
  <div class="container">
    <p class="ds-section__num">04 / STACK</p>
    <div class="stack">
      <div class="stack-row"><p class="stack-row__label">LANGUAGES</p><p class="stack-row__val">Python, SQL, Rust, TypeScript, JavaScript, Swift / SwiftUI, Bash, YAML, HTML / CSS</p></div>
      <div class="stack-row"><p class="stack-row__label">AI &amp; DATA</p><p class="stack-row__val">LangChain, PyTorch, OpenAI, Claude, MCP, Snowflake, dbt, Tableau, Sigma, ClickHouse, Grafana</p></div>
      <div class="stack-row"><p class="stack-row__label">WEB &amp; APP</p><p class="stack-row__val">Node.js, React, Next.js, Streamlit, PostgreSQL, MongoDB, Firebase, Supabase, Stripe</p></div>
      <div class="stack-row"><p class="stack-row__label">INFRASTRUCTURE</p><p class="stack-row__val">Docker, Proxmox, Terraform, Linux, Cloudflare, GCP, Railway, CI/CD, Git</p></div>
      <div class="stack-row"><p class="stack-row__label">SECURITY</p><p class="stack-row__val">Splunk, Splunk SOAR, SOC 2, Vulnerability Scanning, Phishing Simulation</p></div>
      <div class="stack-row"><p class="stack-row__label">CERTIFIED</p><p class="stack-row__val"><span class="chip chip--accent">Splunk Enterprise Certified</span></p></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Style** `.stack-row` in `sections.css`: `display:grid; grid-template-columns: 200px 1fr; gap: var(--space-8); padding: var(--space-6) 0; border-top: 1px solid var(--color-border);` label uses `var(--font-mono)`, `--text-sm`, letter-spacing 0.1em, muted; value `--text-lg`, primary text. Collapse to one column under 760px.

- [ ] **Step 3: Verify** Guard A, Guard B, `npm start`.
Browser checklist: six labeled rows, the certified row shows a red chip, collapses on mobile, no console errors.

- [ ] **Step 4: Commit**
```bash
git add index.html styles/components/sections.css
git commit -m "redesign: stack capabilities table"
```

---

### Task 7: Leadership and Education

**Files:**
- Modify: `index.html` (add two sections after Stack)

**Consumes:** `.ds-section`, `.ds-row` (Task 4). No new CSS expected.

- [ ] **Step 1: Leadership markup**. Section id `#leadership`, mono header `05 / LEADERSHIP`, two `.ds-row` entries. Use placeholder briefs (Nicolo will replace) wrapped in a clear comment:
```html
<section class="ds-section" id="leadership">
  <div class="container">
    <p class="ds-section__num">05 / LEADERSHIP</p>
    <div class="ds-rows">
      <!-- LEADERSHIP COPY: placeholder briefs, Nicolo to replace -->
      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">JUN 2025 &ndash; JUN 2026</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">Cal Poly Club Baseball</h3>
          <p class="ds-row__org">Co-President &middot; Player (2023 to 2026)</p>
          <ul class="ds-row__points">
            <li>Co-led the club: roster, scheduling, budget, and travel for a full competitive season.</li>
          </ul>
        </div>
      </article>
      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">SEP 2021 &ndash; JUN 2025</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">Kappa Sigma Fraternity</h3>
          <p class="ds-row__org">President (2022 to 2023) &middot; Risk Manager (2021 to 2025)</p>
          <ul class="ds-row__points">
            <li>Led the chapter as President and ran risk management across multiple years.</li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Education markup**. Section id `#education`, mono header `06 / EDUCATION`, one `.ds-row`:
```html
<section class="ds-section" id="education">
  <div class="container">
    <p class="ds-section__num">06 / EDUCATION</p>
    <div class="ds-rows">
      <article class="ds-row">
        <div class="ds-row__meta"><span class="ds-row__date">SEP 2021 &ndash; JUN 2026</span><span class="ds-row__date">San Luis Obispo, CA</span></div>
        <div class="ds-row__body">
          <h3 class="ds-row__title">B.S. Industrial Engineering</h3>
          <p class="ds-row__org">California Polytechnic State University, San Luis Obispo</p>
          <ul class="ds-row__points">
            <li>Coursework: Data Science, Computer Science, Data Analytics, Enterprise Analytics, Database Management and Design, Operations Research, Machine Learning, Statistics and Design of Experiments, Simulation, Human Factors and Ergonomics, Usability / HCI, Project Management, RAG-assisted LLM systems.</li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify** Guard A, Guard B, `npm start`.
Browser checklist: two clean sections matching the experience styling, collapse on mobile, no console errors.

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "redesign: leadership and education sections"
```

---

### Task 8: Contact (inverted) and footer

**Files:**
- Modify: `index.html` (replace contact section and footer)
- Modify: `styles/components/sections.css` (add `.section--ink`)

**Consumes:** tokens, keeps Formspree form + `data-ajax`.

- [ ] **Step 1: Contact markup**. Section id `#contact`, class `ds-section section--ink`, mono header `07 / CONTACT`:
```html
<section class="ds-section section--ink" id="contact">
  <div class="container">
    <p class="ds-section__num">07 / CONTACT</p>
    <div class="contact-grid">
      <div class="contact-grid__intro">
        <h2 class="ds-statement">Have an idea, a project, or just want to talk shop?</h2>
        <p class="ds-body">I am always down to connect. Reach out and I will get back to you.</p>
        <div class="contact-actions">
          <a class="btn btn--primary" href="mailto:nicodiferd@gmail.com">nicodiferd@gmail.com</a>
          <a class="btn btn--secondary" href="https://www.linkedin.com/in/nicolo-diferdinando/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a class="btn btn--secondary" href="https://github.com/nicodiferd" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
      <form action="https://formspree.io/f/xovjlpne" method="POST" class="contact__form" data-ajax>
        <div class="form__group"><input type="text" name="name" class="form__input" placeholder=" " autocomplete="name" required><label class="form__label">Your Name</label></div>
        <div class="form__group"><input type="email" name="email" class="form__input" placeholder=" " autocomplete="email" required><label class="form__label">Your Email</label></div>
        <div class="form__group"><textarea name="message" rows="5" class="form__textarea" placeholder=" " required></textarea><label class="form__label">Your Message</label></div>
        <input type="text" name="_gotcha" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="btn btn--primary form__submit">Send Message</button>
      </form>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Footer markup** (keep socials, mono signature):
```html
<footer class="footer">
  <div class="container footer__container">
    <p class="footer__text">NICOLO DIFERDINANDO / 2026 &middot; CAL POLY SAN LUIS OBISPO</p>
    <div class="footer__socials">
      <a href="https://github.com/nicodiferd" target="_blank" rel="noopener noreferrer" class="footer__social" aria-label="GitHub"><i class="fab fa-github"></i></a>
      <a href="https://www.linkedin.com/in/nicolo-diferdinando/" target="_blank" rel="noopener noreferrer" class="footer__social" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
      <a href="mailto:nicodiferd@gmail.com" class="footer__social" aria-label="Email"><i class="fas fa-envelope"></i></a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Style** in `sections.css`:
- `.section--ink`: locally redefine tokens so it is dark in both themes:
```css
.section--ink {
  --color-background: #0d0d0f;
  --color-surface: #17171a;
  --color-text-primary: #f0ece3;
  --color-text-secondary: #c4bfb5;
  --color-text-muted: #8b867c;
  --color-border: rgba(255, 255, 255, 0.14);
  --color-primary: #e2392c;
  background: var(--color-background);
  color: var(--color-text-primary);
}
```
- `.contact-grid`: two columns (intro left, form right), gap `--space-16`, collapse under 860px.
- `.contact-actions`: flex wrap, gap `--space-4`.
- Footer signature `var(--font-mono)`, `--text-sm`, letter-spacing 0.08em.

- [ ] **Step 4: Verify** Guard A, Guard B, `npm start`.
Browser checklist:
- Contact section is dark in both light and dark themes (inverted block at the bottom).
- Form labels float, the form submits (or shows the Formspree handler path), buttons are reachable.
- Footer shows mono signature and three working social links.
- No console errors.

- [ ] **Step 5: Commit**
```bash
git add index.html styles/components/sections.css
git commit -m "redesign: inverted contact section and footer"
```

---

### Task 9: JS cleanup and index finalization

**Files:**
- Modify: `js/app.js`
- Modify: `index.html` (remove obsolete inline `<style>`, dead markup, fix script cache-buster)

**Consumes:** all prior sections.

- [ ] **Step 1: Remove dead inline styles** in `index.html` `<head>`: delete the `.card.card--icon-card` and `.card__link--coming-soon` blocks now that those classes are gone. Keep the critical visibility block.

- [ ] **Step 2: Prune `js/app.js`**: the `setupPageTransitions` fade can stay (it only affects internal links). Remove the counter fallback `setTimeout` only if no `[data-counter]` remain (the old stats were removed); the `[data-aos]` fallback can stay harmlessly. Keep `setupFormHandling`, `setupLazyLoading`. Verify no code references removed ids (`#certifications`, old `.stat`, `data-counter`).

- [ ] **Step 3: Bump JS cache-buster** in `index.html`: change `js/app.js?v=refresh-3` to `js/app.js?v=redesign-1`.

- [ ] **Step 4: Update meta** in `<head>`: keep OG image `/images/Nicolo.jpeg`. Update the meta description if desired to: "Nicolo DiFerdinando: builder across software, data, and security. AI agents, data pipelines, infrastructure." (optional, keep em-dash free.)

- [ ] **Step 5: Verify** Guard A, Guard B, `npm start`.
Browser checklist:
- Full page scrolls cleanly through Hero, Profile, Experience, Projects, Stack, Leadership, Education, Contact.
- No console errors or 404s for JS/CSS.
- Theme toggle and scrollspy still work end to end.

- [ ] **Step 6: Commit**
```bash
git add index.html js/app.js
git commit -m "redesign: prune dead markup and js, finalize index"
```

---

### Task 10: Detail-page template, restyle Bandit and HomeLab

**Files:**
- Create: `styles/components/detail.css`
- Modify: `styles/main.css` (import detail.css)
- Modify: `bandit.html`, `homelab.html`

**Consumes:** tokens, `.chip`. **Produces:** the shared detail layout reused by Task 11.

- [ ] **Step 1: Add import** to `styles/main.css`:
```css
@import 'components/detail.css?v=redesign-1';
```

- [ ] **Step 2: Read `bandit.html` and `homelab.html`** to preserve their existing written content (the retrospective copy and the homelab writeup are valuable, keep the prose). Only change the surrounding chrome to the new template.

- [ ] **Step 3: Define the detail template** in `detail.css` and apply to both pages. Template structure:
```html
<header class="detail-top">
  <div class="container detail-top__bar">
    <a class="detail-back" href="index.html#projects"><i class="fas fa-arrow-left"></i> Back</a>
    <select class="theme-selector" data-theme-selector aria-label="Theme selector">...</select>
  </div>
</header>
<main class="detail">
  <div class="container">
    <p class="ds-section__num">PROJECT / BANDIT</p>
    <h1 class="detail__title">Bandit</h1>
    <p class="detail__lead">One-line summary.</p>
    <div class="chips">...tech chips...</div>
    <figure class="detail__hero"><img src="images/Bandit Fancy.png" alt="Bandit"></figure>
    <div class="detail__body"> ...existing prose, restyled... </div>
    <nav class="detail__nav">
      <a href="homelab.html">Next: HomeLab <i class="fas fa-arrow-right"></i></a>
    </nav>
  </div>
</main>
```
Detail CSS: `.detail` max-width readable measure (use `.container` plus an inner `max-width: 820px` for `.detail__body`), `.detail__title` Space Grotesk clamp large, `.detail__hero img` full width bordered, body prose line-height 1.8, headings in display font, links red. Reuse the standard `<footer>` from index.

- [ ] **Step 4: Ensure both pages load fonts and theme** identically to index (same `<head>` font link, early theme script with `'light'` default, main.css `?v=redesign-1`).

- [ ] **Step 5: Verify** Guard A, Guard B, `npm start` then open `/bandit.html` and `/homelab.html`.
Browser checklist:
- Both pages match the new look (cream default, red accent, display headings).
- Existing written content is intact.
- Back link returns to `index.html#projects`. Prev/next links work.
- Theme toggle works on detail pages.
- No console errors.

- [ ] **Step 6: Commit**
```bash
git add styles/components/detail.css styles/main.css bandit.html homelab.html
git commit -m "redesign: shared detail template, restyle bandit and homelab"
```

---

### Task 11: New detail pages, Flora and Zedi

**Files:**
- Create: `flora.html`, `zedi.html`

**Consumes:** `detail.css` (Task 10), gallery images in `images/zedi-deck-shots/`.

- [ ] **Step 1: Build `flora.html`** from the detail template. Content: title Flora, lead "Senior capstone with Bloomfilter improving HCI for AI-agent integration in project-management tools.", chips HCI / AI Agents / Research / Enterprise. Hero image `images/PLACEHOLDER-flora.png` with a comment to swap. Body sections: Overview, The Problem, What I worked on, Outcome (write concise placeholder prose clearly marked `<!-- FLORA: refine copy -->` since this is NDA-adjacent; keep it high level and accurate to the resume line). Prev/next: prev `index.html#projects`, next `zedi.html`.

- [ ] **Step 2: Build `zedi.html`** from the detail template. Content: title Zedi, lead "A personal finance platform I built end to end, live at zedi.sneeks.ai.", chips Rust / Axum / Next.js / Postgres / Claude Vision / Stripe. Hero image `images/zedi-deck-shots/dashboard-full.png`. Body sections: Overview (started June 2025, became real March 2026 via IME 543), The build (Rust/Axum API, Next.js frontend, Postgres row-level multi-tenancy, Claude Vision receipt OCR, CSV/QFX/PDF imports, auto-categorization, Stripe billing, Railway deploy), Live link button to `https://zedi.sneeks.ai`. Gallery grid using the deck shots:
```html
<section class="detail__gallery">
  <h2>Screens</h2>
  <div class="gallery-grid">
    <a href="images/zedi-deck-shots/dashboard-full.png" target="_blank" rel="noopener"><img src="images/zedi-deck-shots/dashboard.png" alt="Dashboard" loading="lazy"></a>
    <a href="images/zedi-deck-shots/transactions-full.png" target="_blank" rel="noopener"><img src="images/zedi-deck-shots/transactions.png" alt="Transactions" loading="lazy"></a>
    <a href="images/zedi-deck-shots/accounts-full.png" target="_blank" rel="noopener"><img src="images/zedi-deck-shots/accounts.png" alt="Accounts" loading="lazy"></a>
    <a href="images/zedi-deck-shots/analytics-full.png" target="_blank" rel="noopener"><img src="images/zedi-deck-shots/analytics.png" alt="Analytics" loading="lazy"></a>
    <a href="images/zedi-deck-shots/receipts-full.png" target="_blank" rel="noopener"><img src="images/zedi-deck-shots/receipts.png" alt="Receipts" loading="lazy"></a>
    <a href="images/zedi-deck-shots/xray-full.png" target="_blank" rel="noopener"><img src="images/zedi-deck-shots/xray.png" alt="X-ray" loading="lazy"></a>
  </div>
</section>
```
Prev/next: prev `flora.html`, next `bandit.html`. Add `.gallery-grid` style to `detail.css`: `display:grid; grid-template-columns: repeat(2,1fr); gap: var(--space-4);` images bordered, hover lifts; one column on mobile.

- [ ] **Step 3: Verify** Guard A, Guard B, `npm start`, open `/flora.html` and `/zedi.html`.
Browser checklist:
- Both pages render with the shared template.
- Zedi gallery shows six screenshots; clicking opens the full-size image.
- Project card links from `index.html#projects` reach these pages and back.
- No console errors.

- [ ] **Step 4: Commit**
```bash
git add flora.html zedi.html styles/components/detail.css
git commit -m "redesign: flora and zedi detail pages with gallery"
```

---

### Task 12: Responsive, theme, and final QA pass

**Files:** any touched above, as needed for fixes.

- [ ] **Step 1: Cross-section responsive sweep.** At widths 375px, 768px, 1024px, 1440px check: nav (mobile menu under ~860px), hero stacking, ds-rows collapse, project grid 1 vs 2 columns, stack rows, contact grid, galleries. Fix overflow or cramped spacing.

- [ ] **Step 2: Theme sweep.** Toggle System / Dark / Light on index and every detail page. Confirm the inverted Contact stays dark in both, the red accent reads well on cream and on near-black, and no element is invisible (for example light text on light background).

- [ ] **Step 3: Accessibility quick pass.** Every image has meaningful `alt`, the skip link works, nav and form are keyboard reachable, focus styles visible, color contrast acceptable on cream.

- [ ] **Step 4: Run both guards once more** across all five HTML files and `styles` and `js`. Resolve any MISSING asset (the only expected placeholder is `images/PLACEHOLDER-flora.png`, which exists from Task 5).

- [ ] **Step 5: Final commit.**
```bash
git add -A
git commit -m "redesign: responsive, theme, and accessibility QA"
```

- [ ] **Step 6: Summary for the user.** Report what shipped, list the placeholders awaiting real content (Flora image and copy, Wedge feature screenshot, Leadership briefs), and confirm the branch is ready to preview and merge.

---

## Self-review notes

- Spec sections mapped to tasks: visual system to Task 1; navigation/IA to Task 2; hero to Task 3; Profile + Experience to Task 4; Projects + detail pages to Tasks 5, 10, 11; Stack to Task 6; Leadership + Education to Task 7; Contact to Task 8; retiring old sections to Task 9; responsive/theme/a11y QA to Task 12. No spec section is unaddressed.
- Placeholder content (Flora image and copy, Wedge screenshot, Leadership briefs) is intentional and clearly marked in HTML comments; these are content handoffs to Nicolo, not plan gaps. A real placeholder image file is created so asset guards pass.
- Reused identifiers are consistent: `.ds-section`, `.ds-section__num`, `.ds-row` (+ `__meta/__date/__title/__org/__points`), `.chip` (+ `--accent`), `.proj-card` (+ `--tile`, `__media/__cat/__title/__url/__desc/__link/__muted`), `.focus-tile`, `.stack-row`, `.section--ink`, detail page classes. Section ids are fixed and referenced by nav and scrollspy: `#home #profile #experience #projects #stack #leadership #education #contact`.
