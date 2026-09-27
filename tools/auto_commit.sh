#!/usr/bin/env bash
# Stop hook: auto-commit pending work on the local `development` branch.
# Never pushes. Always exits 0 so it can't block Claude.
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
[ "$(git branch --show-current)" = "development" ] || exit 0
g=$(git rev-parse --git-dir)
[ -e "$g/MERGE_HEAD" ] || [ -d "$g/rebase-merge" ] || [ -d "$g/rebase-apply" ] && exit 0
changes=$(git status --porcelain)
[ -n "$changes" ] || exit 0
git add -A
n=$(git diff --cached --name-only | wc -l | tr -d ' ')
files=$(git diff --cached --name-only | head -3 | paste -sd ',' - | sed 's/,/, /g')
[ "$n" -gt 3 ] && files="$files, …"
if git commit -q -m "auto: $n file(s) changed — $files" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; then
  echo "{\"systemMessage\": \"Auto-committed $n file(s) on development: $(git rev-parse --short HEAD)\"}"
fi
exit 0
