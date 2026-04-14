#!/usr/bin/env bash
set -euo pipefail

# Enforces inline type imports:
#   GOOD: import { type Foo } from './foo';
#   BAD : import type { Foo } from './foo';
# Used as PreToolUse hook on Write|Edit.
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.file_path)

is_typescript_file() {
  [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.tsx ]]
}

if ! is_typescript_file; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.content)
NEW_STRING=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.new_string)
TEXT_TO_CHECK="${CONTENT}${NEW_STRING}"

if echo "$TEXT_TO_CHECK" | grep -qE "^\s*import\s+type\s+"; then
  echo "Inline type import required: use 'import { type X } from ...' instead of 'import type { X } from ...'. See .claude/rules/coding-standards.md." >&2
  exit 2
fi

exit 0
