# Portfolio Redesign Design

Date: 2026-06-25
Site: nicolod.org (main static site only)
Reference inspiration: anthony.diferdinando.com (the "engineering datasheet" aesthetic, light touch)

## Overview

Rework the main portfolio (`index.html`, `styles/`, `js/`) to adopt the clean, structured, datasheet-inspired layout of anthony.diferdinando.com, applied to Nicolo's software / data / security identity. The landing page changes from a centered avatar hero to a two-column split with the photo off to the side. Navigation gets simpler and clearer, with a single scrolling page plus dedicated detail pages for deep projects. Every project reads as a distinct, well-labeled unit with its own imagery and links.

NicoOS (`os/`) is out of scope and untouched.

## Goals

- Adopt the side-photo hero and big bold display type from the reference.
- Cleaner navigation: fewer top-level items, numbered sections, clear separation per item.
- Turn the lone "Download Resume" button into a real Experience timeline.
- Give each project clear imagery, tags, and links; deep projects get their own detail pages.
- Keep light and dark themes, switch the default to a light cream base, and move the accent to red.

## Non-goals

- No changes to NicoOS.
- No build step added (main site stays static HTML/CSS/JS).
- No CMS or data-driven rendering; content stays in HTML.

## Visual system

### Palette
- Light (new default): warm cream/paper background, ink-black text, red accent.
- Dark (toggle retained): near-black background, off-white text, the same red accent.
- Red: a slightly oxblood / signal red rather than fire-engine. Exact value tuned during build, exposed as a single token so it is easy to adjust.
- One inverted section: Contact renders dark in light mode (like the reference footer block).

### Typography
- Display (name, section headers): Space Grotesk, bold, tight tracking.
- Body: Inter (already loaded).
- Labels / metadata (section numbers, dates, tags, captions): JetBrains Mono, used sparingly. This ties the look to NicoOS.

### Light-touch datasheet treatment
Keep the structural bones, drop the heavy gimmicks.

Keep:
- Two-column hero, photo to the side, in a clean frame.
- Huge bold name.
- Label-left / content-right rows for Experience, Stack, Leadership, Education.
- Mono section markers, for example `02 / WORK`.
- Bordered mono tag chips.
- Thin horizontal rules between entries.
- A single inverted dark Contact section.

Drop or minimize:
- No `FIG. 0X` labels on every image.
- No `DRAWN / DISC / LOC / REV` title-block table. Replace with a slim info chip (Location, Focus) beside the hero photo.
- No full graph-paper grid. At most a faint hint behind the hero.

### Design tokens
Rework `styles/base/variables.css`: new cream/red light palette, updated dark palette, add Space Grotesk and JetBrains Mono font tokens, keep the existing spacing / type-scale / radius / shadow tokens. The single red accent lives in one token.

## Information architecture

Single scrolling page with anchor navigation and numbered sections:

`00 Hero | 01 Profile | 02 Experience | 03 Projects | 04 Stack | 05 Leadership | 06 Education | 07 Contact`

Top nav (reduced from today's 8 items): `Profile, Experience, Projects, Stack, Contact`, plus a Resume button and the theme toggle. Mobile nav mirrors this.

The old standalone "Certifications & Achievements" grid is retired. Its content is redistributed into Experience, Leadership, Projects, and Stack. The Splunk Enterprise certification appears as a badge in Stack.

## Section-by-section

### 00 Hero
Two-column split.
- Left: mono eyebrow (for example `ENGINEER / BUILDER, AI, DATA, SECURITY`), a status tag reading "Incoming @ PeopleConnect" with the PeopleConnect logo (`images/pc.webp` or `pc1.webp`), giant "Nicolo DiFerdinando", a tight bio adapted from the resume About Me, then buttons: `View work` (red), `Get in touch` (outline), and Resume download.
- Right: `images/Nicolo.jpeg` in a clean frame, with a slim info chip beside or below it (Location: San Diego bound, Focus: AI / Data / Security).
- Below the split: four focus tiles with icons: AI & Agents, Data Engineering, Security Automation, Infrastructure.

### 01 Profile
One large statement line plus a supporting paragraph from the resume, then tag chips: Internal Tooling, Data Engineering, Security Automation, AI Agents.

### 02 Experience
Timeline, label-left (date range) / content-right (role, company, 2 to 3 bullets), thin rules between entries. Five entries from the resume:
1. AI-Driven Solutions Analyst, PeopleConnect, Aug 2026 to present, marked "Incoming".
2. Business Intelligence Intern, PeopleConnect, Oct 2025 to Jun 2026.
3. Cybersecurity & IT Intern, PeopleConnect, Jun 2025 to Sep 2025.
4. Assistant Student SOC Analyst, Cal Poly ITS, Apr 2024 to Jun 2025.
5. CyberSecurity Intern, loanDepot, Summer 2022.

The repeated PeopleConnect entries intentionally show internal progression.

### 03 Projects
Two-column image-card grid. Each card: image (or a clean URL / browser-chip tile when no photo), mono category caption, title, short description, tag chips, and a link (detail page or external).

Projects, in priority order:
1. Flora (Senior Capstone, Bloomfilter.ai), started Oct 2025. Detail page `flora.html` (new). HCI design for AI agent integration in PM tools.
2. HomeLab, started Sep 2024. Detail page `homelab.html` (restyle existing).
3. Bandit, student transportation LLC. Detail page `bandit.html` (restyle existing).
4. Zedi, personal finance SaaS, started Jun 2025, became real Mar 2026 via IME 543. Detail page `zedi.html` (new), gallery from `images/zedi-deck-shots/`. External link zedi.sneeks.ai.
5. diferdinando.com, portfolio. External-link card, no photo (URL/browser-chip tile).
6. Beyond Wrapped, Spotify analytics ML (IME 565). Card only, no photo, private repo tile.
7. anthony.diferdinando.com, brother's portfolio. External-link card, no photo (tile, framed as "built my brother's site").
8. Wedge (Donatos app), small card noting one shipped feature, using `images/wedge_logo.png`. No detail page.

Every card has a clearly marked photo slot so Nicolo can drop images in over time.

### 04 Stack
Capabilities table, label/value rows from the resume Skills:
- Languages: Python, SQL, Rust, TypeScript, JavaScript, Swift/SwiftUI, Bash, YAML, HTML/CSS.
- AI & Data: LangChain, PyTorch, OpenAI, Claude, MCP, Snowflake, dbt, Tableau, Sigma, ClickHouse, Grafana.
- Web & App: Node.js, React, Next.js, Streamlit, PostgreSQL, MongoDB, Firebase, Supabase, Stripe.
- Infrastructure: Docker, Proxmox, Terraform, Linux, Cloudflare, GCP, Railway, CI/CD, Git.
- Security: Splunk, Splunk SOAR, SOC 2, vulnerability scanning, phishing simulation. Splunk Enterprise Certified badge.

### 05 Leadership
Own compact section, same clean timeline style, with a brief on each (Nicolo to draft final copy; placeholder copy used until then):
- Cal Poly Club Baseball, Co-President (Jun 2025 to Jun 2026), Player (2023 to Jun 2026).
- Kappa Sigma Fraternity, President (Dec 2022 to Mar 2023), Risk Manager (Sep 2021 to Jun 2025).

### 06 Education
Cal Poly San Luis Obispo, BS Industrial Engineering, Sep 2021 to Jun 2026, with coursework highlights from the resume.

### 07 Contact
Inverted dark section. Mono label, big bold statement, contact buttons (email, LinkedIn, GitHub), and the existing Formspree form. Footer with a mono signature line.

## Detail-page template (shared)

A single consistent template, reused across Flora, Zedi, Bandit, HomeLab:
- Back-to-home link, project title, one-line summary.
- Hero image.
- Overview paragraph.
- "The build" body sections.
- Tech-stack chips.
- Image gallery (Zedi uses `images/zedi-deck-shots/`).
- Live / external links.
- Previous / next project navigation.

Bandit and HomeLab are re-skinned to this template. Flora and Zedi are new pages.

## Files and implementation plan

- `styles/base/variables.css`: new cream/red light palette, updated dark palette, Space Grotesk + JetBrains Mono tokens, single red accent token.
- `styles/components/navigation.css`: simplified nav, numbered sections support.
- `styles/components/hero.css`: two-column split hero, focus tiles, info chip, status tag.
- `styles/components/card.css`: project image cards, tag chips, URL/browser-chip tile variant.
- New CSS for Experience / Stack / Leadership / Education label-left rows and the inverted Contact section (either new component files or page sections in `main.css`, following the existing import pattern).
- `index.html`: rebuilt section structure per the IA above.
- `js/app.js` and modules: keep theme toggle, smooth-scroll anchor nav, magnetic buttons, counters as still relevant. Remove behavior tied to retired sections.
- Fonts: add Space Grotesk and JetBrains Mono via Google Fonts; keep Inter.
- Detail pages: `flora.html` (new), `zedi.html` (new), `bandit.html` (restyle), `homelab.html` (restyle).
- `_redirects` / `_headers`: leave intact; resume PDF handling unchanged.

## Asset inventory

Available now:
- Hero: `images/Nicolo.jpeg`.
- PeopleConnect logo: `images/pc.webp`, `images/pc1.webp`.
- Wedge: `images/wedge_logo.png`.
- Zedi gallery: `images/zedi-deck-shots/` (dashboard, accounts, transactions, analytics, receipts, xray, each with a `-full` variant).
- Bandit: `images/Bandit Fancy.png`, `images/Bandit_Logo_Inverted.png`.
- Existing screenshots may be reused where relevant.

No photos for: diferdinando.com, Beyond Wrapped, anthony.diferdinando.com (these use typographic / URL tiles).

Nicolo is adding more project images over time; all photo locations are explicit slots so they can be filled incrementally.

## Content to be drafted by Nicolo

- Final Leadership briefs for both roles (placeholder copy until provided).
- Wedge feature screenshot and one-line description.
- Any project images beyond what is staged.

## Style constraints

- No em-dashes anywhere (repo rule, U+2014 banned). Use commas, periods, parentheses, or hyphens.
- Keep project card copy terse: 2 to 3 sentences, no tech laundry lists in the card body (tech goes in tag chips).
