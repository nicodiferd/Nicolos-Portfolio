# Status: nicolod.org redesign (datasheet aesthetic)

**Date:** 2026-07-29
**Branch:** `redesign/datasheet`
**Status:** COMPLETE. All 12 plan tasks done and committed, QA pass finished. Awaiting Nicolo's review, then merge to `main` (Cloudflare Pages auto-deploys from main).

Spec and plan live in `docs/superpowers/` (2026-06-25). This file used to be a mid-implementation handoff; the remaining items below are content slots for Nicolo, not build work.

## Content updated for the post-graduation reality (July 2026)

- Hero status: AI Analyst @ PeopleConnect (starts 8/3, San Diego).
- Experience: full-time role marked Current, San Diego location.
- Flora: Best in Lab win on the card, detail page, and education section.
- HomeLab: offline for the move. Terminal-style card/hero image (`images/homelab-offline.png`), status chip, "The Move South" timeline entry, service badges flipped to Offline.
- Education: Graduated chip. Footer: CAL POLY SLO '26, SAN DIEGO, CA.
- Resume PDF restored to repo root (the `_redirects` target had been deleted).

## Placeholders awaiting real content from Nicolo

1. **Flora image**: `images/PLACEHOLDER-flora.png` (generated datasheet-style slot), used on index + flora.html. Drop in a real image and update both references.
2. **HomeLab rack photo**: swap `images/homelab-offline.png` on the index card once the lab is back up in San Diego (also revert the Offline badges and status chip on homelab.html).
3. **Wedge feature screenshot**: `images/wedge_logo.png` still used on the card.
4. **Leadership briefs**: copy in `index.html#leadership` is drafted from the graduation post, marked with an HTML comment for refinement.
5. **Flora detail copy**: high level because NDA-adjacent, marked `<!-- FLORA: refine copy -->`.

## Preview

```bash
npx --yes http-server -p 4321 -c-1 .
```
Port 3000 is Nicolo's zedi-back dev server; never use it. `/resume.pdf` 404s locally (Cloudflare `_redirects` handles it in prod).
