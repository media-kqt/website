#!/usr/bin/env bash
# SessionStart hook: inject SESSION.md (conversation continuation notes) into Claude's context.
root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
f="$root/SESSION.md"
[ -f "$f" ] || exit 0
python3 - "$f" <<'PY'
import json, sys
text = open(sys.argv[1], encoding="utf-8").read()
print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
    "additionalContext": "Continuation notes from SESSION.md (update it at the end of each request):\n\n" + text}}, ensure_ascii=False))
PY
exit 0
