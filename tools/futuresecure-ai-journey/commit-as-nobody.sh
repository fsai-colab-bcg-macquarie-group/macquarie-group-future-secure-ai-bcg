#!/usr/bin/env bash
# Stage and commit journey files as nobody. No actor, bot, or personal identity.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

export GIT_AUTHOR_NAME=nobody
export GIT_AUTHOR_EMAIL=noreply@localhost
export GIT_COMMITTER_NAME=nobody
export GIT_COMMITTER_EMAIL=noreply@localhost
unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE || true

git add futuresecure-ai/journey
if git diff --cached --quiet; then
  echo "No journey changes."
  exit 0
fi

TREE=$(git write-tree)
PARENT=$(git rev-parse HEAD)
COMMIT=$(git -c core.hooksPath=/dev/null commit-tree "$TREE" -p "$PARENT" -m "Update public figures journey")
git -c core.hooksPath=/dev/null update-ref HEAD "$COMMIT"

if [[ "${1:-}" == "--push" ]]; then
  git push origin HEAD
fi
