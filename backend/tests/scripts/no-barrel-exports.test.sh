#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/../../scripts/hooks/no-barrel-exports.sh"
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

echo "Testing: no-barrel-exports.sh"
echo "---"

# Test 1: blocks index.ts
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/home/user/project/src/modules/auth/index.ts"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks index.ts files" 2 "$EXIT_CODE"

# Test 2: blocks index.js
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/home/user/project/src/shared/index.js"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks index.js files" 2 "$EXIT_CODE"

# Test 3: allows regular .ts files
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/home/user/project/src/modules/auth/user.ts"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows regular TypeScript files" 0 "$EXIT_CODE"

# Test 4: allows files with index in path but not filename
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/home/user/project/src/indexer/search.ts"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows files in directories containing 'index'" 0 "$EXIT_CODE"

# Test 5: allows spec files
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/home/user/project/tests/modules/auth/user.spec.ts"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows spec files" 0 "$EXIT_CODE"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
