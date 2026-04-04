#!/usr/bin/env bash
set -euo pipefail

# Blocks git push to main/master branch.
# Used as PreToolUse hook on Bash(git push *).
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.command)

is_push_command() {
  echo "$COMMAND" | grep -qE "git push"
}

if ! is_push_command; then
  exit 0
fi

# Allow pushes to wiki repos (GitHub wikis only use master)
if echo "$COMMAND" | grep -qE "wiki"; then
  exit 0
fi

pushes_to_protected_branch() {
  echo "$COMMAND" | grep -qE "git push.*(origin\s+(main|master)|origin/main|origin/master)"
}

if pushes_to_protected_branch; then
  echo "Push to main/master is forbidden. Push to your feature branch instead." >&2
  exit 2
fi

exit 0
