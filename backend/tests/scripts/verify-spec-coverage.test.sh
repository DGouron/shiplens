#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
SCRIPT="$PROJECT_DIR/scripts/verify-spec-coverage.sh"
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

setup() {
  mkdir -p "$PROJECT_DIR/docs/specs"
  mkdir -p "$PROJECT_DIR/tests/acceptance"

  cat > "$PROJECT_DIR/docs/specs/test-coverage.md" << 'SPEC'
# Test Coverage Feature

## Rules
- something is required

## Scenarios
- valid: {input: "data"} → status "ok"
- missing input: {} → reject "Input is required"
SPEC

  cat > "$PROJECT_DIR/tests/acceptance/test-coverage.acceptance.spec.ts" << 'TEST'
describe('Test Coverage (acceptance)', () => {
  it('valid: creates with ok status', () => {
    expect(true).toBe(true)
  })

  it('missing input: rejects with error', () => {
    expect(true).toBe(true)
  })
})
TEST
}

cleanup() {
  rm -f "$PROJECT_DIR/docs/specs/test-coverage.md"
  rm -f "$PROJECT_DIR/tests/acceptance/test-coverage.acceptance.spec.ts"
}

trap cleanup EXIT
setup

echo "Testing: verify-spec-coverage.sh"
echo "---"

# Test 1: exits 0 when all scenarios are covered
EXIT_CODE=0
"$SCRIPT" "$PROJECT_DIR/docs/specs/test-coverage.md" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "exits 0 when all scenarios covered" 0 "$EXIT_CODE"

# Test 2: exits 1 when a scenario is missing coverage
rm "$PROJECT_DIR/tests/acceptance/test-coverage.acceptance.spec.ts"
cat > "$PROJECT_DIR/tests/acceptance/test-coverage.acceptance.spec.ts" << 'TEST'
describe('Test Coverage (acceptance)', () => {
  it('valid: creates with ok status', () => {
    expect(true).toBe(true)
  })
})
TEST

EXIT_CODE=0
"$SCRIPT" "$PROJECT_DIR/docs/specs/test-coverage.md" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "exits 1 when scenario missing coverage" 1 "$EXIT_CODE"

# Test 3: exits 1 when no spec file provided
EXIT_CODE=0
"$SCRIPT" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "exits 1 when no spec file provided" 1 "$EXIT_CODE"

# Test 4: exits 1 when spec file does not exist
EXIT_CODE=0
"$SCRIPT" "docs/specs/nonexistent.md" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "exits 1 when spec file does not exist" 1 "$EXIT_CODE"

# Test 5: shows coverage summary
setup
OUTPUT=$("$SCRIPT" "$PROJECT_DIR/docs/specs/test-coverage.md" 2>&1)
if echo "$OUTPUT" | grep -q "2/2 scenarios covered"; then
  echo "  PASS  shows coverage summary"
  PASSED=$((PASSED + 1))
else
  echo "  FAIL  shows coverage summary (got: $OUTPUT)"
  FAILED=$((FAILED + 1))
fi

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
