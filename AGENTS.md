# Agent instructions

This repository holds (1) an FSAI platform archive for enterprise POCs and (2) an independent public-figures briefing. Follow these rules without being asked.

## Where to read first

1. `llms.txt` — machine index for the whole repo
2. `docs/llms.txt` / `docs/ai-guides/public-figures.md` — public figures (retrieve before quoting the firm)
3. `README.md` — infra
4. `docs/macquarie-group-ai-strategy.md` — POC strategy
5. `docs/index.html` — the one human briefing (old HTML files are redirects)

## Public figures

- Quote [docs/ai-guides/public-figures.md](docs/ai-guides/public-figures.md) and `docs/data/charts.json`. Do not flatten investor and customer into two independent proofs.
- LinkedIn work is **name + headline only**. Do not log in. Do not scrape `/in/` profiles. Do not treat search-adjacent cards as a roster.
- Do not invent per-person cities. Location is title-words vs the company-widget country list.
- Do not confuse this firm with Tel Aviv “Future Secure” or “Future Secure Providers.”
- Rebuild charts with `python3 tools/futuresecure-ai-journey/parse_linkedin_topline.py`. Monthly site hashes: `tools/futuresecure-ai-journey/track.py`.
- Git commits for this repo: `nobody <noreply@localhost>`. Journey automation: `tools/futuresecure-ai-journey/commit-as-nobody.sh`. Do not use `github.actor`, personal emails, Co-authored-by trailers, or a personal PAT for that workflow (a personal token stamps a user on the push).
- GitHub Pages source is `/docs` on `main`. Preview: `python3 -m http.server 43147 --directory docs`.

## Platform / Macquarie POC

- Public Macquarie Group web content for RAG demos: `www.macquarie.com` only, via `tools/macquarie-poc-scrape`.
- Internal Group systems, client data, trading, advice, and HR decisioning are out of scope.
- Do not weaken auth, scrape behind login, or add unrestricted web browsing against live files.

### Infra facts

- Region: AWS `ap-southeast-2`
- Envs: `dev` / `sit` / `prod`
- Platform Terraform: `echelon-infra-main/terraform`
- RAG library + API: `fsai_rag-main`, `fsai-rag-api-main`
- Control plane: `echelon-api-main`, `echelon-frontend-main`

### Scraping

- Honour `https://www.macquarie.com/robots.txt`
- Disallow paths include `/admin/`, `/login/`, `/register/`, `/private-data/`, `/search/*`
- Rate-limit; same-host only; cap page count
- Write output under `tools/macquarie-poc-scrape/out/` (gitignored). Do not commit full dumps.

## Changes

- Keep secrets out of git.
- Do not destroy Echelon, RAG, or Macquarie scrape tools when editing the briefing.
- After user-facing doc or scraper changes, push to `origin/main` when the user asked to push.
