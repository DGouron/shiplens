#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/../../scripts/hooks/enforce-gateway-error-in-bad-path.sh"
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

echo "Testing: enforce-gateway-error-in-bad-path.sh"
echo "---"

# Test 1: blocks throw new Error() in bad-path failing stub (Write)
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/project/src/modules/analytics/testing/bad-path/failing.foo.gateway.ts","content":"throw new Error(\"oops\")"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks throw new Error() in bad-path stub (Write)" 2 "$EXIT_CODE"

# Test 2: blocks throw new Error() in bad-path failing stub (Edit)
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/project/src/modules/analytics/testing/bad-path/failing.foo.gateway.ts","old_string":"old","new_string":"throw new Error(\"oops\")"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "blocks throw new Error() in bad-path stub (Edit)" 2 "$EXIT_CODE"

# Test 3: allows throw new GatewayError() in bad-path stub
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/project/src/modules/analytics/testing/bad-path/failing.foo.gateway.ts","content":"throw new GatewayError(\"oops\")"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows throw new GatewayError() in bad-path stub" 0 "$EXIT_CODE"

# Test 4: allows throw new Error() in regular files (not bad-path)
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/project/src/modules/analytics/usecases/foo.usecase.ts","content":"throw new Error(\"oops\")"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows throw new Error() in non-bad-path files" 0 "$EXIT_CODE"

# Test 5: allows domain-specific errors in bad-path stub
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/project/src/modules/audit/testing/bad-path/failing.ai.gateway.ts","content":"throw new AiProviderUnavailableError()"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows domain-specific errors in bad-path stub" 0 "$EXIT_CODE"

# Test 6: allows good-path stubs without restriction
EXIT_CODE=0
echo '{"tool_input":{"file_path":"/project/src/modules/analytics/testing/good-path/stub.foo.gateway.ts","content":"return []"}}' \
  | "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "allows good-path stubs without restriction" 0 "$EXIT_CODE"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
