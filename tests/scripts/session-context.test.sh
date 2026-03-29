#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
HOOK="$PROJECT_DIR/scripts/hooks/session-context.sh"
TRACKER="$PROJECT_DIR/docs/feature-tracker.md"
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

assert_output_contains() {
  local description="$1"
  local expected="$2"
  local actual="$3"

  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS  $description"
    PASSED=$((PASSED + 1))
  else
    echo "  FAIL  $description (expected output to contain '$expected')"
    FAILED=$((FAILED + 1))
  fi
}

ORIGINAL_TRACKER=""
if [[ -f "$TRACKER" ]]; then
  ORIGINAL_TRACKER=$(cat "$TRACKER")
fi

restore_tracker() {
  if [[ -n "$ORIGINAL_TRACKER" ]]; then
    echo "$ORIGINAL_TRACKER" > "$TRACKER"
  else
    cat > "$TRACKER" << 'EOF'
# Feature Tracker

| Feature | Spec | Plan | Status | Date |
|---------|------|------|--------|------|
EOF
  fi
}

trap restore_tracker EXIT

echo "Testing: session-context.sh"
echo "---"

# Test 1: exits cleanly with empty tracker
cat > "$TRACKER" << 'EOF'
# Feature Tracker

| Feature | Spec | Plan | Status | Date |
|---------|------|------|--------|------|
EOF

EXIT_CODE=0
OUTPUT=$(echo '{}' | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" 2>/dev/null) || EXIT_CODE=$?
assert_exit_code "exits cleanly with empty tracker" 0 "$EXIT_CODE"

# Test 2: reports features in progress
cat > "$TRACKER" << 'EOF'
# Feature Tracker

| Feature | Spec | Plan | Status | Date |
|---------|------|------|--------|------|
| create-shipment | docs/specs/create-shipment.md | docs/plans/create-shipment.plan.md | implementing | 2026-03-29 |
| track-parcel | docs/specs/track-parcel.md | - | drafted | 2026-03-29 |
EOF

EXIT_CODE=0
OUTPUT=$(echo '{}' | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" 2>/dev/null) || EXIT_CODE=$?
assert_exit_code "reports features" 0 "$EXIT_CODE"
assert_output_contains "mentions in progress count" "1 in progress" "$OUTPUT"
assert_output_contains "mentions drafted count" "1 drafted" "$OUTPUT"

# Test 3: outputs valid JSON with additionalContext
HAS_CONTEXT=$(echo "$OUTPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('additionalContext',''))" 2>/dev/null)
if [[ -n "$HAS_CONTEXT" ]]; then
  echo "  PASS  outputs valid JSON with additionalContext"
  PASSED=$((PASSED + 1))
else
  echo "  FAIL  outputs valid JSON with additionalContext"
  FAILED=$((FAILED + 1))
fi

# Test 4: handles missing tracker file
BACKUP_TRACKER=$(cat "$TRACKER")
rm -f "$TRACKER"
EXIT_CODE=0
echo '{}' | CLAUDE_PROJECT_DIR="$PROJECT_DIR" "$HOOK" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "handles missing tracker file" 0 "$EXIT_CODE"
echo "$BACKUP_TRACKER" > "$TRACKER"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
