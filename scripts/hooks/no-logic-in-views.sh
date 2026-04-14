#!/usr/bin/env bash
set -euo pipefail

# Enforces Humble Object pattern in frontend views.
# Views live in frontend/src/modules/*/interface-adapters/views/ and must be humble:
# - no React hooks (useState, useEffect, useMemo, useCallback, useReducer, useRef, useContext)
# - no direct fetch() calls
# - no imports from usecases/ or gateways/
# Used as PreToolUse hook on Write|Edit.
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.file_path)

is_view_file() {
  [[ "$FILE_PATH" == */interface-adapters/views/*.tsx ]] \
    || [[ "$FILE_PATH" == */interface-adapters/views/**/*.tsx ]]
}

if ! is_view_file; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.content)
NEW_STRING=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.new_string)
TEXT_TO_CHECK="${CONTENT}${NEW_STRING}"

if echo "$TEXT_TO_CHECK" | grep -qE '\buse(State|Effect|Memo|Callback|Reducer|Ref|Context)\s*\('; then
  echo "Humble view violation: React hooks (useState/useEffect/useMemo/useCallback/useReducer/useRef/useContext) are forbidden in .view.tsx files. Move state and effects into a hook under interface-adapters/hooks/." >&2
  exit 2
fi

if echo "$TEXT_TO_CHECK" | grep -qE "^import\s*\{[^}]*\b(useState|useEffect|useMemo|useCallback|useReducer|useRef|useContext)\b[^}]*\}\s*from\s*['\"]react['\"]"; then
  echo "Humble view violation: importing React hooks into a .view.tsx is forbidden. Move logic to a hook." >&2
  exit 2
fi

if echo "$TEXT_TO_CHECK" | grep -qE '\bfetch\s*\('; then
  echo "Humble view violation: direct fetch() call in a view. Use a gateway accessed through a hook." >&2
  exit 2
fi

if echo "$TEXT_TO_CHECK" | grep -qE "from\s*['\"][^'\"]*/(usecases|gateways)/"; then
  echo "Humble view violation: importing usecase or gateway in a view. Views must only receive a viewModel prop from their hook." >&2
  exit 2
fi

exit 0
