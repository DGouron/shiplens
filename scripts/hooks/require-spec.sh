#!/usr/bin/env bash
set -euo pipefail

# Blocks feature-implementer agent if no spec file exists.
# Used as PreToolUse hook on Agent.
# Exit 0 = allow, Exit 2 = block with feedback to Claude.

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.subagent_type)
PROMPT=$(echo "$INPUT" | "$HOOK_DIR/parse-json.sh" tool_input.prompt)

is_feature_implementer() {
  echo "$TOOL_NAME" | grep -qi "feature-implementer"
}

if ! is_feature_implementer; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$HOOK_DIR/../.." && pwd)}"

spec_file_referenced() {
  echo "$PROMPT" | grep -oP 'docs/specs/[a-z0-9-]+\.md' | head -1 || true
}

SPEC_REF=$(spec_file_referenced || true)

if [[ -z "$SPEC_REF" ]]; then
  echo "No spec file referenced in the prompt. Create a spec first with /product-manager." >&2
  exit 2
fi

if [[ ! -f "$PROJECT_DIR/$SPEC_REF" ]]; then
  echo "Spec file '$SPEC_REF' does not exist. Create it first with /product-manager." >&2
  exit 2
fi

SPEC_CONTENT=$(cat "$PROJECT_DIR/$SPEC_REF")

has_rules_section() {
  echo "$SPEC_CONTENT" | grep -q "^## Rules"
}

has_scenarios_section() {
  echo "$SPEC_CONTENT" | grep -q "^## Scenarios"
}

if ! has_rules_section; then
  echo "Spec '$SPEC_REF' is missing the '## Rules' section. Fix it before implementing." >&2
  exit 2
fi

if ! has_scenarios_section; then
  echo "Spec '$SPEC_REF' is missing the '## Scenarios' section. Fix it before implementing." >&2
  exit 2
fi

exit 0
