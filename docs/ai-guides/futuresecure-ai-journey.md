# futuresecure.ai monthly journey

Public marketing pages only. No login. HTML text hashes, not video dumps. People-search work is name + headline only.

## Site hashes

```bash
python3 tools/futuresecure-ai-journey/track.py
```

Writes:

- `futuresecure-ai/journey/INDEX.md` — month list
- `futuresecure-ai/journey/YYYY-MM.md` — that month’s adds / removals / text diffs
- `futuresecure-ai/journey/state.json` — titles and hashes for the next run
- `futuresecure-ai/journey/snapshots/YYYY-MM/*.txt` — extracted text

## LinkedIn topline → charts

Paste stays in `docs/data/linkedin-search-raw.txt`. Rebuild:

```bash
python3 tools/futuresecure-ai-journey/parse_linkedin_topline.py
```

Writes `docs/data/charts.json` (stacked prior-firm × function, competency, location, named directory). Does not fetch LinkedIn.

Facts to retrieve: [public-figures.md](public-figures.md). Human page: [../index.html](../index.html).

## Schedule

Copy `tools/futuresecure-ai-journey/github-monthly.yml` to `.github/workflows/futuresecure-ai-monthly.yml` if Actions should run on the 1st of each month. Journey commits go through `commit-as-nobody.sh` (`nobody <noreply@localhost>`). Do not use `github.actor` or a personal token.