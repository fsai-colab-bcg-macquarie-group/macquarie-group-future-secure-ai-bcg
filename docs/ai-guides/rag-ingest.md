# RAG ingest from public scrape

Scraped files are **not** live in the vector store until a use-case operator vectorises them.

## Inputs

From `tools/macquarie-poc-scrape/out/`:

- `pages.jsonl` — one JSON object per page: `url`, `title`, `fetched_at`, `text`
- `md/*.md` — same content as Markdown (`title`, source URL, body)

## Path into FSAI HyperRAG

1. Copy approved `.md` or `.txt` files into a working corpus folder (not `out/` in git).
2. Use `fsai-rag-api-main` `POST /vectorise/` (multipart file) **or** library `SparseVectoriser` in `fsai_rag-main`.
3. Record `collection_name` (example: `macquarie_poc_public`).
4. `POST /retrieve/` with the returned `vectoriser_id` for smoke queries.

Eval before any demo: citation present, no invented URLs, refuse questions that need non-public data.

## Suggested smoke queries

- What businesses does Macquarie Group describe on its public site?
- Where is the Group headquartered according to public pages?
- What investor or newsroom pages were ingested (list sources)?

If retrieve cannot name a source URL from the scrape, do not show the answer in a stakeholder demo.
