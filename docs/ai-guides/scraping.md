# Public scraping — Macquarie Group AI POC

Wave 1 needs a **public, reviewable** corpus. This is not intranet crawl and not authenticated Group systems.

## Tool

```bash
python3 tools/macquarie-poc-scrape/scrape.py --max-pages 40 --out tools/macquarie-poc-scrape/out
```

Stdlib only (no pip). Honours `robots.txt`, host allowlist, path denylist, and a delay between requests.

## Allowed

- Host: `www.macquarie.com` (HTTPS)
- Public marketing, about, investors, newsroom-style pages linked from seeds or the AU sitemap (capped)
- Output: JSONL + one Markdown file per URL under `--out`

## Forbidden

- `/admin/`, `/login/`, `/register/`, `/private-data/`, `/search/`
- Other hosts (no open-web crawl)
- Query strings that robots.txt blocks (`sessionid`, `utm_*`)
- Committing `out/` dumps to git

## After scrape

1. Skim Markdown for junk (cookie banners, empty shells).
2. Follow [rag-ingest.md](rag-ingest.md).
3. Keep the scrape log (`scrape-log.json`) with the batch for audit.

Default User-Agent: `MacquarieGroupAiPocCorpus/1.0 (public pages; robots.txt honoured)`.
