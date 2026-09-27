#!/usr/bin/env bash
# PreToolUse hook (Edit|Write|NotebookEdit): Claude may only modify files inside this repo.
# Anything outside is read-only; writing there needs the user's explicit approval ("ask").
# Allowed without asking: Claude's own memory, plans and temporary scratchpad.
# Always exits 0 — it answers with a permission decision, never crashes the tool call.
python3 -c '
import json, os, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti = data.get("tool_input") or {}
path = ti.get("file_path") or ti.get("notebook_path")
if not path:
    sys.exit(0)
root = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
full = os.path.realpath(os.path.join(root, os.path.expanduser(path)))
home = os.path.expanduser("~")
allowed = [root,
           os.path.realpath(os.path.join(home, ".claude/projects", root.replace("/", "-").replace("_", "-"), "memory")),
           os.path.realpath(os.path.join(home, ".claude/plans")),
           os.path.realpath("/private/tmp/claude-501"), os.path.realpath("/tmp/claude-501")]
if any(full == a or full.startswith(a + os.sep) for a in allowed):
    sys.exit(0)
print(json.dumps({"hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Outside the website repo (" + full + ") - read-only by project rule; approve only as an exception."}}))
' 2>/dev/null
exit 0
