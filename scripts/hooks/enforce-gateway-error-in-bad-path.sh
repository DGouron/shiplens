#!/usr/bin/env bash
set -euo pipefail

# Blocks writing throw new Error() in bad-path failing gateway stubs.
# Bad-path stubs must use GatewayError (or a domain-specific error class).
# Used as PreToolUse hook on Write|Edit.
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.file_path)

is_bad_path_stub() {
  [[ "$FILE_PATH" == */bad-path/failing.*.ts ]]
}

if ! is_bad_path_stub; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.content)
NEW_STRING=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.new_string)
TEXT_TO_CHECK="${CONTENT}${NEW_STRING}"

if echo "$TEXT_TO_CHECK" | grep -q 'throw new Error('; then
  echo "Bad-path stubs must use GatewayError, not Error. Import GatewayError from '@shared/foundation/gateway-error.js'." >&2
  exit 2
fi

exit 0
