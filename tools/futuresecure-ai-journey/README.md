# futuresecure.ai monthly journey

Tracks public pages on [www.futuresecure.ai](https://www.futuresecure.ai/) and appends a monthly change log under `futuresecure-ai/journey/`.

Stdlib only. HTML text only — no video or binary asset downloads.

```bash
python3 tools/futuresecure-ai-journey/track.py
bash tools/futuresecure-ai-journey/commit-as-nobody.sh
```

Commits are `nobody <noreply@localhost>`. Do not set a personal `user.name` / `user.email`, `github.actor`, or a personal token for this path.

Schedule YAML (same identity): `github-monthly.yml`. Copy it to `.github/workflows/futuresecure-ai-monthly.yml` if Actions is enabled.
