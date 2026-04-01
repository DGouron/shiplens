#!/usr/bin/env bash
set -euo pipefail

# Blocks git commit if staged files include module code but the corresponding
# spec does not have "## Status: implemented" and the feature-tracker is stale.
# Used as PreToolUse hook on Bash(git commit *).
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.command)

is_commit_command() {
  echo "$COMMAND" | grep -qE "git commit"
}

if ! is_commit_command; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$HOOK_DIR/../.." && pwd)}"
cd "$PROJECT_DIR"

STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)

if [[ -z "$STAGED_FILES" ]]; then
  exit 0
fi

has_module_code() {
  echo "$STAGED_FILES" | grep -q "^src/modules/" 2>/dev/null
}

if ! has_module_code; then
  exit 0
fi

MODIFIED_MODULES=$(echo "$STAGED_FILES" | grep "^src/modules/" | cut -d'/' -f3 | sort -u)

TRACKER="$PROJECT_DIR/docs/feature-tracker.md"
SPECS_DIR="$PROJECT_DIR/docs/specs"

ERRORS=""

for MODULE in $MODIFIED_MODULES; do
  SPEC_FILES=""
  if [[ -f "$TRACKER" ]]; then
    SPEC_NAMES=$(grep -i "| $MODULE |" "$TRACKER" | grep -oP '\[.*?\]\(\Kspecs/[^)]+' | sed 's|^specs/||' || true)
    for SPEC_NAME in $SPEC_NAMES; do
      if [[ -f "$SPECS_DIR/$SPEC_NAME" ]]; then
        SPEC_FILES="${SPEC_FILES} $SPECS_DIR/$SPEC_NAME"
      fi
    done
  fi

  if [[ -z "$SPEC_FILES" ]]; then
    continue
  fi

  for SPEC_FILE in $SPEC_FILES; do
    SPEC_NAME=$(basename "$SPEC_FILE")

    if ! grep -q "^## Status: implemented" "$SPEC_FILE" 2>/dev/null; then
      if echo "$STAGED_FILES" | grep -q "$(basename "$SPEC_FILE")" 2>/dev/null; then
        continue
      fi
      ERRORS="${ERRORS}Spec '$SPEC_NAME' is missing '## Status: implemented'. Update the spec before committing.\n"
    fi
  done

  if [[ -f "$TRACKER" ]]; then
    MODULE_IN_TRACKER=$(grep -i "$MODULE" "$TRACKER" | grep -c "| drafted |" || true)
    if [[ "$MODULE_IN_TRACKER" -gt 0 ]]; then
      if ! echo "$STAGED_FILES" | grep -q "docs/feature-tracker.md" 2>/dev/null; then
        ERRORS="${ERRORS}Feature tracker still shows 'drafted' for module '$MODULE'. Update docs/feature-tracker.md before committing.\n"
      fi
    fi
  fi
done

if [[ -n "$ERRORS" ]]; then
  echo -e "$ERRORS" >&2
  exit 2
fi

exit 0
