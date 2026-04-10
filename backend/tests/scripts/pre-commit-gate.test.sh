#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
HOOK="$PROJECT_DIR/scripts/hooks/pre-commit-gate.sh"
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

echo "Testing: pre-commit-gate.sh"
echo "---"

# Test 1: allows non-commit commands
EXIT_CODE=0
echo '{"tool_input":{"command":"git status"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows non-commit commands" 0 "$EXIT_CODE"

# Test 2: allows git commit when tests pass (real project tests)
EXIT_CODE=0
echo '{"tool_input":{"command":"git commit -m \"test\""}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows commit when tests pass" 0 "$EXIT_CODE"

# Test 3: blocks git commit when tests fail (fake project with no package.json)
TEMP_DIR=$(mktemp -d)
EXIT_CODE=0
echo '{"tool_input":{"command":"git commit -m \"test\""}}' \
  | CLAUDE_PROJECT_DIR="$TEMP_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks commit when tests fail" 2 "$EXIT_CODE"
rm -rf "$TEMP_DIR"

# Test 4: allows git log (not a commit)
EXIT_CODE=0
echo '{"tool_input":{"command":"git log --oneline"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows git log" 0 "$EXIT_CODE"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
