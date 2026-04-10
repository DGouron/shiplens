#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
HOOK="$PROJECT_DIR/scripts/hooks/protect-main-push.sh"
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

echo "Testing: protect-main-push.sh"
echo "---"

# Test 1: allows non-push commands
EXIT_CODE=0
echo '{"tool_input":{"command":"git status"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows non-push commands" 0 "$EXIT_CODE"

# Test 2: blocks push to main
EXIT_CODE=0
echo '{"tool_input":{"command":"git push origin main"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks push to main" 2 "$EXIT_CODE"

# Test 3: blocks push to master
EXIT_CODE=0
echo '{"tool_input":{"command":"git push origin master"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks push to master" 2 "$EXIT_CODE"

# Test 4: allows push to feature branch
EXIT_CODE=0
echo '{"tool_input":{"command":"git push origin feat/my-feature"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows push to feature branch" 0 "$EXIT_CODE"

# Test 5: allows push with -u flag to feature branch
EXIT_CODE=0
echo '{"tool_input":{"command":"git push -u origin feat/my-feature"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows push -u to feature branch" 0 "$EXIT_CODE"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
