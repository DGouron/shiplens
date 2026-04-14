#!/usr/bin/env bash
set -euo pipefail

# Enforces that presenter files export a class named *Presenter (not a function).
# Applies to *.presenter.ts on Write only (Edit may legitimately modify internals).
# Used as PreToolUse hook on Write.
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.file_path)

is_presenter_file() {
  [[ "$FILE_PATH" == *.presenter.ts ]]
}

if ! is_presenter_file; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.content)

if [[ -z "$CONTENT" ]]; then
  exit 0
fi

if ! echo "$CONTENT" | grep -qE "class\s+\w*Presenter\b"; then
  echo "Presenter convention violation: .presenter.ts files must export a class ending with 'Presenter'. Functions are not allowed." >&2
  exit 2
fi

exit 0
