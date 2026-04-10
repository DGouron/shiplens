#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARSE_JSON="$SCRIPT_DIR/../../scripts/hooks/parse-json.sh"
PASSED=0
FAILED=0

assert_output() {
  local description="$1"
  local expected="$2"
  local actual="$3"

  if [[ "$actual" == "$expected" ]]; then
    echo "  PASS  $description"
    PASSED=$((PASSED + 1))
  else
    echo "  FAIL  $description (expected '$expected', got '$actual')"
    FAILED=$((FAILED + 1))
  fi
}

assert_empty() {
  local description="$1"
  local actual="$2"

  if [[ -z "$actual" ]]; then
    echo "  PASS  $description"
    PASSED=$((PASSED + 1))
  else
    echo "  FAIL  $description (expected empty, got '$actual')"
    FAILED=$((FAILED + 1))
  fi
}

echo "Testing: parse-json.sh"
echo "---"

# Test 1: extracts top-level string
OUTPUT=$(echo '{"name":"shiplens"}' | "$PARSE_JSON" name)
assert_output "extracts top-level string" "shiplens" "$OUTPUT"

# Test 2: extracts nested value
OUTPUT=$(echo '{"tool_input":{"command":"git commit"}}' | "$PARSE_JSON" tool_input.command)
assert_output "extracts nested value" "git commit" "$OUTPUT"

# Test 3: extracts deeply nested value
OUTPUT=$(echo '{"a":{"b":{"c":"deep"}}}' | "$PARSE_JSON" a.b.c)
assert_output "extracts deeply nested value" "deep" "$OUTPUT"

# Test 4: returns empty for missing path
OUTPUT=$(echo '{"name":"shiplens"}' | "$PARSE_JSON" missing)
assert_empty "returns empty for missing path" "$OUTPUT"

# Test 5: returns empty for missing nested path
OUTPUT=$(echo '{"a":{"b":"c"}}' | "$PARSE_JSON" a.x.y)
assert_empty "returns empty for missing nested path" "$OUTPUT"

# Test 6: handles null value
OUTPUT=$(echo '{"name":null}' | "$PARSE_JSON" name)
assert_empty "handles null value" "$OUTPUT"

# Test 7: extracts numeric value
OUTPUT=$(echo '{"count":42}' | "$PARSE_JSON" count)
assert_output "extracts numeric value" "42" "$OUTPUT"

# Test 8: handles file path with spaces
OUTPUT=$(echo '{"tool_input":{"file_path":"/home/user/my project/file.ts"}}' | "$PARSE_JSON" tool_input.file_path)
assert_output "handles file path with spaces" "/home/user/my project/file.ts" "$OUTPUT"

echo "---"
echo "Results: $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 ]]
