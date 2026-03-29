#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
HOOK="$PROJECT_DIR/scripts/hooks/protect-main-branch.sh"
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

echo "Testing: protect-main-branch.sh"
echo "---"

# Test 1: allows non-commit commands
EXIT_CODE=0
echo '{"tool_input":{"command":"git status"}}' \
  | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows non-commit commands" 0 "$EXIT_CODE"

# Test 2: blocks commit on main branch
# We need to simulate being on main - use a temp git repo
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
git init -b main > /dev/null 2>&1
git config user.email "test@test.com"
git config user.name "test"
touch file.txt && git add . && git commit -m "init" > /dev/null 2>&1

EXIT_CODE=0
echo '{"tool_input":{"command":"git commit -m \"test\""}}' \
  | CLAUDE_PROJECT_DIR="$TEMP_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks commit on main branch" 2 "$EXIT_CODE"

# Test 3: allows commit on feature branch
git checkout -b feature/test > /dev/null 2>&1

EXIT_CODE=0
echo '{"tool_input":{"command":"git commit -m \"test\""}}' \
  | CLAUDE_PROJECT_DIR="$TEMP_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows commit on feature branch" 0 "$EXIT_CODE"

# Test 4: blocks commit on master branch
git checkout -b master > /dev/null 2>&1

EXIT_CODE=0
echo '{"tool_input":{"command":"git commit -m \"test\""}}' \
  | CLAUDE_PROJECT_DIR="$TEMP_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks commit on master branch" 2 "$EXIT_CODE"

rm -rf "$TEMP_DIR"
cd "$PROJECT_DIR"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
