# POC facts (retrieve these first)

Use this page as a short corpus chunk. It restates decisions; it does not replace the strategy paper.

## Mission

Macquarie Group AI POC uses Future Secure AI (FSAI) digital workers that report to a human manager. Success is a repeatable pattern: worker, manager, controls, measured outcome.

## Waves

- Wave 0: Echelon control plane (identity, teams, secrets, observability)
- Wave 1: Retrieval over an approved corpus (HyperRAG)
- Wave 2: One process assistant with human sign-off
- Wave 3: Multiple workers under one manager

## Public corpus (Wave 1 demo only)

- Source: public `www.macquarie.com` pages collected by `tools/macquarie-poc-scrape`
- Not a source of client data, intranet, or authenticated portals
- Human review before vectorise

## Platform map

- Echelon API/UI: worker catalogue and SSO
- `fsai_rag` / RAG API: `vectorise`, `retrieve`
- Cortex: chat
- AWS `ap-southeast-2`, envs `dev` / `sit` / `prod`
- Datadog: AWS integration for inventory and telemetry

## Hard no

No unsupervised write-back in Wave 1. No credit, trading, or client-advice workers in this POC. No scraping of `/login/` or `/private-data/`.
