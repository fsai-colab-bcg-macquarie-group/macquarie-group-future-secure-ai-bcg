# Macquarie Group public corpus scraper

Collects **public** `www.macquarie.com` HTML for the AI POC Wave 1 corpus. Stdlib only.

```bash
python3 tools/macquarie-poc-scrape/scrape.py --max-pages 40
```

Writes `out/pages.jsonl`, `out/md/*.md`, and `out/scrape-log.json`. The `out/` directory is gitignored.

Rules and ingest: [docs/ai-guides/scraping.md](../../docs/ai-guides/scraping.md), [docs/ai-guides/rag-ingest.md](../../docs/ai-guides/rag-ingest.md).
