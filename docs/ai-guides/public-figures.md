# Public figures — retrieve this first

Independent tally of Future Secure AI (FSAI) from public pages and press. Not a company publication. Human briefing: [../index.html](../index.html). Payload: [../data/charts.json](../data/charts.json).

As of 2026-09-10 unless noted.

## What this is / is not

- **Is:** name + headline LinkedIn topline, leadership-page bios, marketing site, AFR, Business Wire, citybiz.
- **Is not:** a staff roster, a city file, an audited financials pack, or LinkedIn profile scrape.
- Other-employer and junk cards are dropped. Search-adjacent cards are **not** a verified headcount.

## Entity hygiene

- This firm: Future Secure AI / futuresecure.ai — Sydney origin, Austin HQ (2026 press).
- Not Tel Aviv “Future Secure.” Not “Future Secure Providers.”

## Proof of work

| Item | Public record |
|------|----------------|
| Independent trial | Macquarie (AFR, Sep 2025). Economics not disclosed |
| Named investor | Macquarie (same article). Same house as the trial |
| Logos on site | Macquarie, Healius, Orrick, FIS, TOGA |
| Speakers labelled former | Macquarie (Kwesi Nicholas), Orrick (Nigel Tranter) |
| Sectors claimed | 12 |
| Anonymised $ stories | 3 (identity withheld) |
| Audited dollar outcomes on the briefing | 0 |

Job ads still say the product was jointly developed with a global financial institution. That is the same house on both sides of the table.

## Headcount (not one series)

| Figure | Source |
|--------|--------|
| ~40 at start of 2025 | Hewlin public post |
| 71 | LinkedIn widget: 282 − 211 YoY people |
| ~100 | LinkedIn: 282 ÷ (1 + 181.9%) |
| 282 | LinkedIn company snippet |
| 300+ in 2025 | Hewlin public post |
| +3.8% monthly | LinkedIn snippet |
| Size band | 201–500 |
| Industry label | Software Development |

Countries on the widget: Australia, Brazil, United States, Canada, Vietnam. Website footer: eight hubs (Austin HQ, NYC, Chicago, Toronto, Sydney, Melbourne, Brisbane, Auckland). Brisbane and Auckland are footer-only vs the April HQ press list. No public split per hub.

## Named headlines (n=129)

People-search cards that name FSAI/Future Secure AI, plus names that match the leadership page.

| Tag | Count |
|------|------:|
| C-suite / founders | 3 |
| Directors / executives | 20 |
| AI / ML / data | 40 |
| Software engineering | 7 |
| Platform / SRE / cloud | 4 |
| Quality engineering | 8 |
| Delivery / product / BA | 13 |
| Talent / people | 6 |
| Legal / risk / finance | 6 |
| Operations | 4 |
| Design | 2 |
| Unclassified / other | 16 |
| C-suite / exec / director seniority | 32 (24.8%) |
| Generic / unspecified competency | 83 (64.3%) |
| Slogan title, no stack | 14 |
| Named tools / models | 6 |
| Headlines with no location word | 125 |
| Vietnam in headline | 0 |
| Headline that names a prior firm | 14 |

QA titles (8) exceed software engineering (7). Delivery/BA (13) exceeds platform (4). Slogan-only exceeds named stacks.

## Leadership page (n=37)

Seat tags inferred from public bios, not from a published org chart. Business Wire (Mar 2026) names Todd Hewlin President.

| Prior firm on bio | Seats |
|-------------------|------:|
| Macquarie | 6 |
| Deloitte | 6 |
| BCG | 5 |
| McKinsey | 3 |
| AMP | 2 |
| Cohere | 2 |
| Netflix | 1 |
| AWS | 1 |
| A&O Shearman | 1 |
| Other / unstated | 10 |

Consulting + buyer-bank (McKinsey, BCG, Deloitte, Macquarie) = 20 of 37. Product-lab firms (Cohere, Netflix, AWS) = 4.

| Seat tag | Count |
|----------|------:|
| C-suite / founders | 9 |
| Directors / executives | 17 |
| Legal / risk / finance | 4 |
| Platform / SRE / cloud | 2 |
| AI / ML / data | 2 |
| Delivery / product / BA | 1 |
| Talent / people | 1 |
| Operations | 1 |
| Software engineering | 0 |

Founders on the public record: Mehrdad Baghai (McKinsey / CSIRO / growth books); Michael Hunter (Macquarie Capital). Homepage: “not SaaS, not SI, not consulting.” The published ExCo is still that overlay.

## Outcome claims (uncheckable here)

- 10x / 10x–20x operating cost (job ads; Austin HQ press)
- Payback in six months (Austin HQ press)
- US$20–30M annual benefit (anonymised FS case)
- ~10% PE hold-period uplift (anonymised waste-asset story)
- 100+ agents, 5–10 year run (site / press)
- A$200m / US$1bn+ IPO (Street Talk reprints — rumour, not a filing)
- Live `/404` title still a Webflow template string (Sep 2026 crawl)

## Rebuild

```bash
python3 tools/futuresecure-ai-journey/parse_linkedin_topline.py
```

Writes `docs/data/charts.json`. Does not fetch LinkedIn.

Monthly marketing-page hashes: `python3 tools/futuresecure-ai-journey/track.py` → `futuresecure-ai/journey/`.
