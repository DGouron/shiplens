#!/usr/bin/env bash
set -euo pipefail

# Enforces gateway port purity:
# - Backend ports must be abstract class (DI token for NestJS)
# - Frontend ports must be interface (no runtime DI)
# - Never a plain class in a port file
# A port is a file matching *.gateway.ts but NOT *.in-*.gateway.ts.
# Used as PreToolUse hook on Write|Edit.
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.file_path)

is_gateway_port() {
  local filename
  filename=$(basename "$FILE_PATH")
  [[ "$filename" == *.gateway.ts ]] \
    && [[ ! "$filename" =~ ^.+\.in-.+\.gateway\.ts$ ]] \
    && [[ ! "$filename" =~ ^stub\. ]] \
    && [[ ! "$filename" =~ ^failing\. ]]
}

if ! is_gateway_port; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.content)
NEW_STRING=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.new_string)
TEXT_TO_CHECK="${CONTENT}${NEW_STRING}"

if echo "$TEXT_TO_CHECK" | grep -qE "^\s*export\s+class\s+"; then
  echo "Gateway port violation: ports must be 'abstract class' (backend) or 'interface' (frontend). A plain 'class' is not allowed in a port file. File: $FILE_PATH" >&2
  exit 2
fi

exit 0
