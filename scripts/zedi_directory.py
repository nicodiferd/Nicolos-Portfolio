#!/usr/bin/env python3
"""Rebuild the zedi.dev page directory on zedi.html.

Reads https://zedi.dev/sitemap.xml, fetches each page's <title> and meta
description, groups the pages by their first path segment and rewrites the
block between the zedi-directory markers in zedi.html. Standard library only.

    python3 scripts/zedi_directory.py            # rewrite zedi.html
    python3 scripts/zedi_directory.py --check    # exit 1 if zedi.html is stale
"""

import datetime
import html
import pathlib
import re
import sys
import urllib.request

SITE = "https://zedi.dev"
PAGE = pathlib.Path(__file__).resolve().parent.parent / "zedi.html"
START = "<!-- zedi-directory:start -->"
END = "<!-- zedi-directory:end -->"

# (key, label, blurb, first path segments). Unknown segments land in "product".
GROUPS = [
    ("guides", "Guides", "What Zedi does for one specific job.", {"for"}),
    ("compare", "Compare", "Zedi next to other money apps, line by line.", {"compare"}),
    ("switch", "Switch", "Bring your history over from another app.", {"switch"}),
    ("product", "Product", "Pricing, bank sync and what changed.", {"pricing", "bank-sync", "simplefin", "changelog", "status"}),
    ("company", "Company", "Partners, data policy and terms.", {"partners", "privacy", "terms"}),
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "nicolod.org zedi directory"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", "replace")


def page_info(url):
    doc = fetch(url)
    title = re.search(r"<title[^>]*>(.*?)</title>", doc, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', doc)
    title = html.unescape(re.sub(r"<[^>]+>", "", title.group(1))).strip() if title else url
    title = re.sub(r"\s*\|\s*Zedi\s*$", "", title)
    return title, html.unescape(desc.group(1)).strip() if desc else ""


def group_of(path):
    seg = path.strip("/").split("/")[0]
    for key, _, _, segs in GROUPS:
        if seg in segs:
            return key
    return "product"


def render(pages, today):
    esc = html.escape
    total = len(pages)
    by_group = {key: [] for key, *_ in GROUPS}
    for p in pages:
        by_group[group_of(p["path"])].append(p)
    i = " " * 8
    out = [START]
    out.append(f'{i}<div class="zdir__head">')
    out.append(f'{i}  <h2 id="zdir-title">Every page on zedi.dev</h2>')
    out.append(f"{i}  <p>{total} guides, comparisons and help pages, read from zedi.dev on {today}.</p>")
    out.append(f"{i}</div>")
    out.append(f'{i}<div class="zdir__tools">')
    out.append(f'{i}  <label class="sr-only" for="zdir-q">Filter pages</label>')
    out.append(f'{i}  <input id="zdir-q" class="zdir__search" type="search" placeholder="Filter {total} pages: try venmo, ynab or pdf" autocomplete="off">')
    out.append(f'{i}  <div class="zdir__tabs" role="group" aria-label="Sections">')
    out.append(f'{i}    <button type="button" class="zdir__tab" data-group="all" aria-pressed="true">All<span>{total}</span></button>')
    for key, label, _, _ in GROUPS:
        if by_group[key]:
            out.append(f'{i}    <button type="button" class="zdir__tab" data-group="{key}" aria-pressed="false">{label}<span>{len(by_group[key])}</span></button>')
    out.append(f"{i}  </div>")
    out.append(f"{i}</div>")
    for key, label, blurb, _ in GROUPS:
        items = by_group[key]
        if not items:
            continue
        out.append(f'{i}<div class="zdir__group" data-group="{key}">')
        out.append(f"{i}  <h3>{label}</h3>")
        out.append(f"{i}  <p>{esc(blurb)}</p>")
        out.append(f'{i}  <ul class="zdir__list">')
        for p in items:
            text = esc(f"{p['title']} {p['desc']} {p['path']}".lower(), quote=True)
            out.append(f'{i}    <li class="zdir__item" data-text="{text}">')
            out.append(f'{i}      <a class="zdir__link" href="{esc(SITE + p["path"])}" target="_blank" rel="noopener noreferrer">')
            out.append(f'{i}        <span class="zdir__title">{esc(p["title"])}</span>')
            out.append(f'{i}        <span class="zdir__path">zedi.dev{esc(p["path"])}</span>')
            out.append(f"{i}      </a>")
            if p["desc"]:
                out.append(f'{i}      <p class="zdir__desc">{esc(p["desc"])}</p>')
            out.append(f"{i}    </li>")
        out.append(f"{i}  </ul>")
        out.append(f"{i}</div>")
    out.append(f'{i}<p class="zdir__empty" hidden>No page matches that filter.</p>')
    out.append(f"{i}{END}")
    return "\n".join(out)


def main():
    sitemap = fetch(SITE + "/sitemap.xml")
    urls = re.findall(r"<loc>([^<]+)</loc>", sitemap)
    pages = []
    for url in urls:
        path = url.replace(SITE, "") or "/"
        if path == "/":
            continue  # the landing page is linked at the top of zedi.html
        title, desc = page_info(url)
        pages.append({"path": path, "title": title, "desc": desc})
    today = datetime.date.today().isoformat()
    page = PAGE.read_text()
    block = render(pages, today)
    new = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: block, page, count=1, flags=re.S)
    if "--check" in sys.argv:
        strip = lambda s: re.sub(r"read from zedi\.dev on \d{4}-\d{2}-\d{2}", "", s)
        stale = strip(new) != strip(page)
        print("stale" if stale else "up to date")
        sys.exit(1 if stale else 0)
    PAGE.write_text(new)
    print(f"{len(pages)} pages written to {PAGE.name}")


if __name__ == "__main__":
    main()
