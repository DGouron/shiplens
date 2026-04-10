#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
HOOK="$PROJECT_DIR/scripts/hooks/require-spec.sh"
PASSED=0
FAILED=0

assert_exit_code() {
  local description="$1"
  local expected_code="$2"
  local actual_code="$3"

  if [[ "$actual_code" -eq "$expected_code" ]]; then
    echo "  PASS  $description"
    PASSED=$((PASSED + 1))
  else
    echo "  FAIL  $description (expected exit $expected_code, got $actual_code)"
    FAILED=$((FAILED + 1))
  fi
}

setup_valid_spec() {
  mkdir -p "$PROJECT_DIR/docs/specs"
  cat > "$PROJECT_DIR/docs/specs/test-feature.md" << 'SPEC'
# Test Feature

## Contexte
A test feature.

## Rules
- something is required

## Scenarios
- valid: {input: "data"} → status "ok"
SPEC
}

setup_incomplete_spec() {
  mkdir -p "$PROJECT_DIR/docs/specs"
  cat > "$PROJECT_DIR/docs/specs/incomplete-feature.md" << 'SPEC'
# Incomplete Feature

## Contexte
Missing rules and scenarios.
SPEC
}

cleanup() {
  rm -f "$PROJECT_DIR/docs/specs/test-feature.md"
  rm -f "$PROJECT_DIR/docs/specs/incomplete-feature.md"
}

trap cleanup EXIT

echo "Testing: require-spec.sh"
echo "---"

setup_valid_spec
setup_incomplete_spec

# Test 1: allows non-feature-implementer agents
EXIT_CODE=0
echo '{"tool_input":{"subagent_type":"event-storming","prompt":"analyze the domain"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows non-feature-implementer agents" 0 "$EXIT_CODE"

# Test 2: blocks feature-implementer without spec reference
EXIT_CODE=0
echo '{"tool_input":{"subagent_type":"feature-implementer","prompt":"implement the feature"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks implementer without spec reference" 2 "$EXIT_CODE"

# Test 3: blocks feature-implementer with nonexistent spec
EXIT_CODE=0
echo '{"tool_input":{"subagent_type":"feature-implementer","prompt":"implement docs/specs/nonexistent.md"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks implementer with nonexistent spec" 2 "$EXIT_CODE"

# Test 4: allows feature-implementer with valid spec
EXIT_CODE=0
echo '{"tool_input":{"subagent_type":"feature-implementer","prompt":"implement docs/specs/test-feature.md"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows implementer with valid spec" 0 "$EXIT_CODE"

# Test 5: blocks feature-implementer with incomplete spec (no Rules section)
EXIT_CODE=0
echo '{"tool_input":{"subagent_type":"feature-implementer","prompt":"implement docs/specs/incomplete-feature.md"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks implementer with incomplete spec" 2 "$EXIT_CODE"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
