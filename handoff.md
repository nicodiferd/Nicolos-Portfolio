# Status: nicolod.org redesign (datasheet aesthetic)

**Date:** 2026-10-15
**Branch:** `redesign/datasheet` (pushed to origin, not merged)
**Preview:** https://redesign-datasheet.nicolodwebsite.pages.dev
**Status:** Ready to merge to `main` (Cloudflare Pages auto-deploys `main` to nicolod.org). The merge is the coordinator's call. Production still serves the May 2026 `main` until then.

Spec and plan from June live in `docs/superpowers/`. Content rules live in the hub (`~/Developer/personal/nico-hub`, `rules/public-claims.md` and `rules/banned-claims.txt`); see CLAUDE.md.

## 2026-10-15 pass (what changed)

- **Zedi links** point at https://zedi.dev (card and case study). The old host only redirects there now.
- **Repositioning, words only:** hero eyebrow "AI/ML · DATA ENGINEERING", focus chip "AI/ML · Data", focus tiles AI & ML, Data Engineering, Production Software, Infra & Security; bio, profile body and chips, and meta descriptions lead with AI/ML and data. Security stays as one tile and the profile background line. No certifications anywhere: the Snowflake row is labelled COURSES.
- **Zedi card and /zedi** follow `zedi/docs/product-state-2026-10-12.md`: read-only SimpleFIN bank sync on Pro, Claude receipt OCR into line items, the People ledger, dedup and pairing, Postgres RLS with the two-pool tenancy model, Free and Pro pricing ($3.50 a month or $30 a year, 30-day trial with no card). No user counts. Origin dates now match git (precursor agent 2025, Zedi repo January 2026, multi-tenant SaaS in spring 2026 through IME 543); the old "June 2025" and "March 2026" claims are gone.
- **Stack** adds LightGBM, scikit-learn and DuckDB (all imported by the BBLMLP pipeline).
- **Beyond Wrapped** no longer says "Private repo" (the course repo is public); it reads "Team project, IME 565" and the repo link waits on Nicolo.
- **No CSS or JS changed**, so the cache token stays `?v=redesign-2`.
- **Checks run:** local link crawl of every href/src in the root HTML pages plus CSS `@import`s and JS imports (0 internal 404s), `_redirects` rules all 3 tokens with no spaces, `/resume.pdf` 200 `application/pdf`, banned-claims scan clean on site files, 0 em-dashes in tracked files.

## os.nicolod.org takedown (prepared, not deployed)

NicoOS is archived. `os/redirect-worker.js` answers every request (any path, method or query) with a 301 to `https://nicolod.org/`. `os/wrangler.redirect.jsonc` deploys it as the same Worker (`nicoos`) on the same route (`os.nicolod.org/*`), with no static assets and `workers_dev` off. `os/wrangler.jsonc` is untouched and is the rollback. `wrangler deploy --dry-run -c wrangler.redirect.jsonc` passes.

```bash
npx --yes wrangler@4.115.0 login     # wrangler's saved login has expired (checked 2026-10-15)
cd os && npx --yes wrangler@4.115.0 deploy -c wrangler.redirect.jsonc
curl -sI https://os.nicolod.org/anything | grep -iE '^(HTTP|location)'   # expect 301, location https://nicolod.org/
# rollback to NicoOS:
cd os && npm run build && npx --yes wrangler@4.115.0 deploy
```

After the takedown has held for a while: tag the last NicoOS commit, then remove `os/` from the repo.

## Open items for Nicolo

1. **Merge** `redesign/datasheet` into `main` (coordinator, after a look at the preview).
2. **The www host of nicolod.org has no DNS record**, and the resume links to it. In Cloudflare: add the www host as a custom domain on the `nicolodwebsite` Pages project, then a Redirect Rule (www to apex, 301, keep path and query). Or change the resume link to `nicolod.org`.
3. **Resume PDF** (resume-tex lane): its Zedi line still names the old host, its HomeLab line still uses the old cluster wording and service count, and the public PDF still carries a phone number. Rebuild from resume-tex and replace `resume.pdf`.
4. **Snowflake course link:** wrap the title in `index.html` (marked `<!-- COURSE: ... -->`) with the Coursera verify URL, or drop the row.
5. **diferdinando.com** still has student and certification copy. Update that site, then restore the Visit link on its tile (marked in `index.html`).
6. **OG card:** `images/og-card.png` still shows the old "Software · Data · Security" eyebrow. `docs/og-card/og-card.html` has the new one. Render it at 1200x630 (headless Brave from that folder: `--headless=new --window-size=1200,630 --force-device-scale-factor=1 --screenshot=...`), save it under a new name such as `images/og-card-2.png`, and point every page's `og:image` and `twitter:image` at it.
7. **os.nicolod.org takedown:** run the commands above.
8. **Beyond Wrapped repo link:** clear the repo for linking, then replace the "Team project, IME 565" label with a link (marked in `index.html`).
9. **Cloudflare zone Browser Cache TTL** (4h) overrides `_headers` for cacheable files. Set Caching > Browser Cache TTL to "Respect Existing Headers".
10. **Stop publishing repo internals:** build output is `.`, so `CLAUDE.md`, `handoff.md`, `docs/`, `os/` and package files are public (stopgap: `X-Robots-Tag: noindex` in `_headers`). Long-term: move the site into `public/` and set that as the Pages build output directory.
11. **Zedi screenshots** date from July 2026 (old nav, dev badge). Recapture from a production build on demo data, as WebP under new filenames.
12. **HomeLab copy questions:** keep or drop the patch and backup times and the game-server mention; Home Assistant, Immich and the game server's future.
13. **Optional:** add a Content-Security-Policy after testing.

## October 2026 refresh (2026-10-10, already on the branch)

Content synced to the resume (title "AI-Driven Solutions Analyst" at PeopleConnect everywhere), Flora and Wedge as text tiles, HomeLab page rewritten for the live San Diego lab (sanitized), resume download fixed (`/resume.pdf`, with `/resume`, `/view-resume` and the old spaced URL 301ing to it), `404.html`, `robots.txt`, `sitemap.xml`, OG/Twitter/canonical and GTM on every page, extensionless links, WCAG AA contrast, mobile menu fixes, about 350 lines of dead CSS/JS and 15 MB of unused images removed.

## Preview

```bash
npm start
```

Serves on http://localhost:4321 with `_redirects` and `_headers` applied.
