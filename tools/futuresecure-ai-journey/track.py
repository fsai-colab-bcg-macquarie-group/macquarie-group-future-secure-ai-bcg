#!/usr/bin/env python3
"""Monthly public-page tracker for www.futuresecure.ai.

Stdlib only. Writes a journey log of page adds, removals, and text changes.
Does not download video/binary assets.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

ORIGIN = "https://www.futuresecure.ai"
USER_AGENT = "FSAI-public-journey/1.0"
SEED_PATHS = (
    "/",
    "/ai-co-workers",
    "/the-red-zone",
    "/sectors",
    "/customers",
    "/technology",
    "/leadership",
    "/careers",
    "/privacy",
    "/404",
)
SKIP_PREFIXES = ("mailto:", "tel:", "javascript:", "data:", "#")
SKIP_SUFFIXES = (
    ".pdf",
    ".zip",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".avif",
    ".webp",
    ".mp4",
    ".webm",
    ".css",
    ".js",
    ".json",
    ".woff",
    ".woff2",
)


class Extractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._skip = 0
        self._in_title = False
        self._title_buf: list[str] = []
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

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"} and self._skip:
            self._skip -= 1
            return
        if tag == "title":
            self._in_title = False
            self.title = " ".join("".join(self._title_buf).split())

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        if self._in_title:
            self._title_buf.append(data)
            return
        text = " ".join(data.split())
        if text:
            self._parts.append(text)

    @property
    def text(self) -> str:
        return "\n".join(self._parts)


def fetch(url: str, timeout: int = 45) -> tuple[int, str]:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
    with urlopen(req, timeout=timeout) as resp:
        body = resp.read().decode("utf-8", errors="replace")
        return resp.status, body


def is_internal_path(href: str, base: str) -> str | None:
    if not href or href.startswith(SKIP_PREFIXES):
        return None
    absu = urldefrag(urljoin(base, href))[0]
    parsed = urlparse(absu)
    host = parsed.netloc.replace("www.", "")
    if host and host != "futuresecure.ai":
        return None
    path = parsed.path or "/"
    if any(path.lower().endswith(s) for s in SKIP_SUFFIXES):
        return None
    if path.startswith("/template/"):
        return None
    return path


def slug(path: str) -> str:
    return "home" if path in ("", "/") else path.strip("/").replace("/", "_")


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_robots() -> RobotFileParser:
    rp = RobotFileParser()
    try:
        rp.set_url(f"{ORIGIN}/robots.txt")
        rp.read()
    except Exception:
        pass
    return rp


def collect_pages() -> dict[str, dict]:
    rp = load_robots()
    queue = list(SEED_PATHS)
    seen: set[str] = set()
    pages: dict[str, dict] = {}
    while queue:
        path = queue.pop(0)
        if path in seen:
            continue
        seen.add(path)
        url = ORIGIN + path
        if rp.can_fetch and not rp.can_fetch(USER_AGENT, url):
            continue
        try:
            status, html = fetch(url)
        except HTTPError as e:
            if path != "/404":
                time.sleep(0.4)
                continue
            pages[path] = {
                "url": url,
                "status": e.code,
                "title": "",
                "text": "",
                "error": str(e.code),
            }
            time.sleep(0.4)
            continue
        except URLError as e:
            pages[path] = {
                "url": url,
                "status": 0,
                "title": "",
                "text": "",
                "error": str(e.reason),
            }
            time.sleep(0.4)
            continue
        ext = Extractor()
        try:
            ext.feed(html)
        except Exception:
            pass
        pages[path] = {
            "url": url,
            "status": status,
            "title": ext.title,
            "text": ext.text,
            "html_sha256": sha(html),
            "text_sha256": sha(ext.text),
            "bytes": len(html.encode("utf-8")),
        }
        for href in ext.links:
            nxt = is_internal_path(href, url)
            if nxt and nxt not in seen and nxt not in queue:
                queue.append(nxt)
        time.sleep(0.4)
    return pages


def summarize(prev: dict, curr: dict) -> tuple[list[str], list[str], list[str], list[str]]:
    prev_pages = set((prev.get("pages") or {}).keys())
    curr_pages = set(curr["pages"].keys())
    added = sorted(curr_pages - prev_pages)
    removed = sorted(prev_pages - curr_pages)
    changed: list[str] = []
    unchanged: list[str] = []
    for path in sorted(curr_pages & prev_pages):
        a = prev["pages"][path]
        b = curr["pages"][path]
        if a.get("text_sha256") != b.get("text_sha256") or a.get("title") != b.get("title"):
            changed.append(path)
        else:
            unchanged.append(path)
    return added, removed, changed, unchanged


def text_diff_lines(old: str, new: str, limit: int = 40) -> list[str]:
    old_lines = [ln for ln in old.splitlines() if ln.strip()]
    new_lines = [ln for ln in new.splitlines() if ln.strip()]
    old_set = set(old_lines)
    new_set = set(new_lines)
    out: list[str] = []
    for line in new_lines:
        if line not in old_set:
            out.append(f"+ {line}")
        if len(out) >= limit:
            return out
    for line in old_lines:
        if line not in new_set:
            out.append(f"- {line}")
        if len(out) >= limit:
            return out
    return out


def month_key(when: datetime) -> str:
    return when.strftime("%Y-%m")


def write_journey(root: Path, current: dict, previous: dict | None, when: datetime) -> Path:
    journey = root / "futuresecure-ai" / "journey"
    snapshots = journey / "snapshots" / month_key(when)
    snapshots.mkdir(parents=True, exist_ok=True)
    prev_pages = (previous or {}).get("pages") or {}
    added, removed, changed, unchanged = summarize(previous or {}, current)

    for path, rec in current["pages"].items():
        (snapshots / f"{slug(path)}.txt").write_text(rec.get("text") or "", encoding="utf-8")

    lines = [
        f"# futuresecure.ai — {month_key(when)}",
        "",
        f"Checked {when.strftime('%Y-%m-%d')} UTC against {ORIGIN}.",
        "",
        f"- Pages now: **{len(current['pages'])}**",
        f"- Added: **{len(added)}**",
        f"- Removed: **{len(removed)}**",
        f"- Changed: **{len(changed)}**",
        f"- Unchanged: **{len(unchanged)}**",
        "",
    ]
    if not previous:
        lines += ["First journey entry. Baseline text hashes stored for later months.", ""]
    if added:
        lines += ["## Added pages", ""]
        for path in added:
            title = current["pages"][path].get("title") or "(no title)"
            lines.append(f"- `{path}` — {title}")
        lines.append("")
    if removed:
        lines += ["## Removed pages", ""]
        for path in removed:
            title = prev_pages.get(path, {}).get("title") or "(no title)"
            lines.append(f"- `{path}` — {title}")
        lines.append("")
    if changed:
        lines += ["## Changed pages", ""]
        for path in changed:
            old = prev_pages.get(path, {})
            new = current["pages"][path]
            lines.append(f"### `{path}`")
            if old.get("title") != new.get("title"):
                lines.append(f"- Title: {old.get('title')!r} → {new.get('title')!r}")
            diffs = text_diff_lines(old.get("text") or "", new.get("text") or "")
            if diffs:
                lines.append("```diff")
                lines.extend(diffs)
                lines.append("```")
            else:
                lines.append("- Text hash changed (whitespace or ordering).")
            lines.append("")
    if not added and not removed and not changed and previous:
        lines += ["No public-page text changes this month.", ""]

    month_file = journey / f"{month_key(when)}.md"
    month_file.write_text("\n".join(lines) + "\n", encoding="utf-8")

    state = {
        "origin": ORIGIN,
        "checked_at": when.isoformat(),
        "month": month_key(when),
        "page_count": len(current["pages"]),
        "pages": {
            path: {
                "url": rec.get("url"),
                "status": rec.get("status"),
                "title": rec.get("title"),
                "html_sha256": rec.get("html_sha256"),
                "text_sha256": rec.get("text_sha256"),
                "bytes": rec.get("bytes"),
                "error": rec.get("error"),
            }
            for path, rec in sorted(current["pages"].items())
        },
    }
    (journey / "state.json").write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

    months = sorted(
        p.stem
        for p in journey.glob("20*.md")
        if re.fullmatch(r"\d{4}-\d{2}", p.stem)
    )
    index = [
        "# futuresecure.ai journey",
        "",
        "Monthly public-page change log. Latest state is `state.json`.",
        "",
    ]
    for m in reversed(months):
        index.append(f"- [{m}]({m}.md)")
    index.append("")
    (journey / "INDEX.md").write_text("\n".join(index), encoding="utf-8")
    return month_file


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    args = parser.parse_args()
    root = args.root.resolve()
    when = datetime.now(timezone.utc)
    state_path = root / "futuresecure-ai" / "journey" / "state.json"
    previous = None
    if state_path.exists():
        previous = json.loads(state_path.read_text(encoding="utf-8"))
    pages = collect_pages()
    current = {"pages": pages, "checked_at": when.isoformat()}
    month_file = write_journey(root, current, previous, when)
    print(f"wrote {month_file}")
    print(f"pages {len(pages)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
