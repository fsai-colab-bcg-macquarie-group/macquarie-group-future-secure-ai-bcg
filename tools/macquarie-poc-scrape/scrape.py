#!/usr/bin/env python3
"""Collect public www.macquarie.com pages for the Macquarie Group AI POC corpus.

Honours robots.txt. Same-host only. No login. Stdlib only.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

ALLOWED_HOSTS = frozenset({"www.macquarie.com"})
ROBOTS_URL = "https://www.macquarie.com/robots.txt"
USER_AGENT = "MacquarieGroupAiPocCorpus/1.0 (public pages; robots.txt honoured)"
DEFAULT_SEEDS = (
    "https://www.macquarie.com/au/en.html",
    "https://www.macquarie.com/au/en/about.html",
    "https://www.macquarie.com/au/en/about/company.html",
    "https://www.macquarie.com/au/en/investors.html",
    "https://www.macquarie.com/au/en/expertise.html",
    "https://www.macquarie.com/au/en/about/newsroom.html",
)
SITEMAP_AU = "https://www.macquarie.com/au/en/sitemap.xml"
DISALLOW_PREFIXES = (
    "/admin/",
    "/login/",
    "/register/",
    "/private-data/",
    "/showcase/",
    "/tmp/",
    "/cgi-bin/",
    "/search/",
)

SKIP_SUFFIXES = (
    ".pdf",
    ".zip",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".mp4",
    ".css",
    ".js",
    ".woff",
    ".woff2",
)


class _Extractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._skip = 0
        self._title_buf: list[str] = []
        self._in_title = False
        self._parts: list[str] = []
        self.links: list[str] = []
        self.title = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip += 1
            return
        if tag == "title":
            self._in_title = True
        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(href)
        if tag in {"p", "h1", "h2", "h3", "h4", "li", "br", "div", "section", "article"}:
            self._parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"} and self._skip:
            self._skip -= 1
            return
        if tag == "title":
            self._in_title = False
            self.title = "".join(self._title_buf).strip()

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        if self._in_title:
            self._title_buf.append(data)
            return
        text = data.strip()
        if text:
            self._parts.append(text + " ")

    def text(self) -> str:
        raw = "".join(self._parts)
        raw = re.sub(r"[ \t]+", " ", raw)
        raw = re.sub(r"\n{3,}", "\n\n", raw)
        return raw.strip()


def _fetch(url: str, timeout: int = 30) -> tuple[int, str, str]:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xml;q=0.9,*/*;q=0.8"})
    with urlopen(req, timeout=timeout) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        body = resp.read().decode(charset, errors="replace")
        final = resp.geturl()
        return resp.status, body, final


def _normalize(url: str) -> str | None:
    url, _ = urldefrag(url)
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return None
    if parsed.hostname not in ALLOWED_HOSTS:
        return None
    path = parsed.path or "/"
    lower = path.lower()
    if any(lower.endswith(suf) for suf in SKIP_SUFFIXES):
        return None
    if any(path.startswith(p) or lower.startswith(p) for p in DISALLOW_PREFIXES):
        return None
    if "sessionid=" in (parsed.query or "").lower() or "utm_source=" in (parsed.query or "").lower():
        return None
    # Drop tracking queries; keep bare path for corpus stability
    clean = parsed._replace(scheme="https", query="", fragment="")
    return clean.geturl()


def _parse_sitemap(xml_text: str) -> list[str]:
    urls: list[str] = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return urls
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for loc in root.findall(".//sm:loc", ns) or root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
        if loc.text:
            urls.append(loc.text.strip())
    if not urls:
        for loc in root.iter():
            if loc.tag.endswith("loc") and loc.text:
                urls.append(loc.text.strip())
    return urls


def _load_robots() -> RobotFileParser:
    rp = RobotFileParser()
    rp.set_url(ROBOTS_URL)
    try:
        _, body, _ = _fetch(ROBOTS_URL)
        rp.parse(body.splitlines())
    except (URLError, HTTPError, TimeoutError, OSError):
        rp.parse(["User-agent: *", "Allow: /"])
    return rp


def _allowed(rp: RobotFileParser, url: str) -> bool:
    try:
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        return False


def crawl(seeds: Iterable[str], max_pages: int, delay: float, use_sitemap: bool) -> list[dict]:
    rp = _load_robots()
    queue: list[str] = []
    seen: set[str] = set()

    def enqueue(raw: str) -> None:
        n = _normalize(raw)
        if not n or n in seen:
            return
        if not _allowed(rp, n):
            return
        seen.add(n)
        queue.append(n)

    for s in seeds:
        enqueue(s)
    if use_sitemap:
        try:
            _, sm, _ = _fetch(SITEMAP_AU)
            for u in _parse_sitemap(sm):
                enqueue(u)
                if len(queue) >= max_pages * 3:
                    break
        except (URLError, HTTPError, TimeoutError, OSError):
            pass

    pages: list[dict] = []
    i = 0
    while i < len(queue) and len(pages) < max_pages:
        url = queue[i]
        i += 1
        time.sleep(delay)
        try:
            status, html, final = _fetch(url)
        except (URLError, HTTPError, TimeoutError, OSError) as exc:
            pages.append(
                {
                    "url": url,
                    "ok": False,
                    "error": str(exc),
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                }
            )
            continue
        final_n = _normalize(final) or url
        if not _allowed(rp, final_n):
            continue
        extractor = _Extractor()
        try:
            extractor.feed(html)
            extractor.close()
        except Exception:
            continue
        text = extractor.text()
        if len(text) < 80:
            continue
        rec = {
            "url": final_n,
            "ok": True,
            "status": status,
            "title": extractor.title or final_n,
            "text": text,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
        pages.append(rec)
        for href in extractor.links:
            enqueue(urljoin(final_n, href))
    return pages


def write_out(pages: list[dict], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    md_dir = out_dir / "md"
    md_dir.mkdir(exist_ok=True)
    jsonl_path = out_dir / "pages.jsonl"
    log_path = out_dir / "scrape-log.json"
    ok_pages = [p for p in pages if p.get("ok")]
    with jsonl_path.open("w", encoding="utf-8") as fh:
        for p in ok_pages:
            fh.write(json.dumps(p, ensure_ascii=False) + "\n")
    for idx, p in enumerate(ok_pages, start=1):
        slug = re.sub(r"[^a-z0-9]+", "-", urlparse(p["url"]).path.lower()).strip("-")[:80] or f"page-{idx}"
        body = f"# {p['title']}\n\nSource: {p['url']}\nFetched: {p['fetched_at']}\n\n{p['text']}\n"
        (md_dir / f"{idx:03d}-{slug}.md").write_text(body, encoding="utf-8")
    log_path.write_text(
        json.dumps(
            {
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "ok": len(ok_pages),
                "failed": len(pages) - len(ok_pages),
                "urls": [p.get("url") for p in pages],
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Scrape public Macquarie Group pages for the AI POC corpus.")
    parser.add_argument("--max-pages", type=int, default=25)
    parser.add_argument("--delay", type=float, default=1.0, help="Seconds between requests")
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parent / "out")
    parser.add_argument("--no-sitemap", action="store_true")
    parser.add_argument("--seed", action="append", default=[], help="Extra seed URL (repeatable)")
    args = parser.parse_args(argv)
    seeds = list(DEFAULT_SEEDS) + list(args.seed)
    pages = crawl(seeds, max_pages=max(1, args.max_pages), delay=max(0.25, args.delay), use_sitemap=not args.no_sitemap)
    write_out(pages, args.out)
    ok = sum(1 for p in pages if p.get("ok"))
    print(f"wrote {ok} pages to {args.out}", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
