#!/usr/bin/env bash
set -euo pipefail

# Enforces Humble Object pattern in frontend views.
# Views live in frontend/src/modules/*/interface-adapters/views/ and must be humble:
# - exactly ONE component per file
# - no React hooks (useState, useEffect, useMemo, useCallback, useReducer, useRef, useContext)
# - no direct fetch() calls
# - no imports from usecases/ or gateways/
# - no domain comparisons or null checks in JSX expressions — the presenter must expose semantic booleans
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

# One component per file: count top-level function declarations starting with an uppercase letter.
# Allowed: `export function FooView(` OR a single `function FooView(` (non-exported helper used by the exported one).
# Rejected: 2+ component declarations in the same file.
COMPONENT_COUNT=$(echo "$TEXT_TO_CHECK" | grep -cE '^[[:space:]]*(export[[:space:]]+)?function[[:space:]]+[A-Z][A-Za-z0-9]*[[:space:]]*\(' || true)
if [[ "$COMPONENT_COUNT" -gt 1 ]]; then
  echo "Humble view violation: more than one React component in a single .view.tsx file (found $COMPONENT_COUNT). Split each component into its own file under views/<feature>/<component>.view.tsx." >&2
  exit 2
fi

# No domain comparisons or null checks in JSX expressions.
# Strategy: first strip lines whose only comparison is the framework-level AsyncState discriminant
# (`state.status === '...'`) which is allowed, then look for any remaining forbidden pattern.
FILTERED=$(echo "$TEXT_TO_CHECK" | grep -vE "state\.status\s*(===|!==)\s*'" || true)

FORBIDDEN_JSX_PATTERNS=(
  '\{[^}]*\b[a-zA-Z_][A-Za-z0-9_]*\.(length|count|size)\b[^}]*(>|<|>=|<=|!=|==)[^}]*\}'
  '\{[^}]*\b[A-Za-z_][A-Za-z0-9_.]*\s*(===|!==)\s*null\b[^}]*\}'
  '\{[^}]*\bnull\s*(===|!==)\s*[A-Za-z_][A-Za-z0-9_.]*\b[^}]*\}'
  '\{[^}]*\b[A-Za-z_][A-Za-z0-9_.]*\s*(===|!==)\s*undefined\b[^}]*\}'
  '\{[^}]*\.\s*filter\s*\([^}]*\}'
  '\{[^}]*\.\s*reduce\s*\([^}]*\}'
  '\{[^}]*\.\s*some\s*\([^}]*\}'
  '\{[^}]*\.\s*every\s*\([^}]*\}'
)

for pattern in "${FORBIDDEN_JSX_PATTERNS[@]}"; do
  if echo "$FILTERED" | grep -qE "$pattern"; then
    echo "Humble view violation: domain logic in JSX. A view must not compute comparisons, null checks, filter, reduce, some, every. Move the decision to the presenter and expose a semantic boolean (e.g. showFoo, isAlert, hasDrift) on the ViewModel, then write {showFoo && ...} in the view." >&2
    exit 2
  fi
done

exit 0
