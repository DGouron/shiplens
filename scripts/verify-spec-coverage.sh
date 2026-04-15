#!/usr/bin/env bash
set -euo pipefail

# Verifies that each scenario in a spec DSL file has a corresponding test.
# Searches both backend/tests/acceptance/ and frontend/tests/acceptance/.
# A scenario is considered covered if it matches in either workspace.
# Usage: ./scripts/verify-spec-coverage.sh docs/specs/<bc>/my-feature.md
# Exit 0 = all covered, Exit 1 = missing coverage.

SPEC_FILE="${1:-}"

if [[ -z "$SPEC_FILE" ]]; then
  echo "Usage: $0 <spec-file>"
  echo "Example: $0 docs/specs/create-shipment.md"
  exit 1
fi

if [[ ! -f "$SPEC_FILE" ]]; then
  echo "Spec file not found: $SPEC_FILE"
  exit 1
fi

FEATURE_NAME=$(basename "$SPEC_FILE" .md)
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

extract_scenario_labels() {
  sed -n '/^## Scenarios/,/^## /p' "$SPEC_FILE" \
    | grep -E '^- ' \
    | sed 's/^- \([^:]*\):.*/\1/' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

SCENARIOS=$(extract_scenario_labels)

if [[ -z "$SCENARIOS" ]]; then
  echo "No scenarios found in $SPEC_FILE"
  exit 1
fi

BACKEND_ACCEPTANCE="$PROJECT_DIR/backend/tests/acceptance/${FEATURE_NAME}.acceptance.spec.ts"
FRONTEND_ACCEPTANCE="$PROJECT_DIR/frontend/tests/acceptance/${FEATURE_NAME}.acceptance.spec.ts"
MISSING=0
COVERED=0
TOTAL=0

echo "Spec coverage: $FEATURE_NAME"
echo "---"

scenario_is_covered() {
  local scenario="$1"
  { [[ -f "$BACKEND_ACCEPTANCE" ]] && grep -qi "$scenario" "$BACKEND_ACCEPTANCE"; } \
    || { [[ -f "$FRONTEND_ACCEPTANCE" ]] && grep -qi "$scenario" "$FRONTEND_ACCEPTANCE"; }
}

while IFS= read -r scenario; do
  TOTAL=$((TOTAL + 1))

  if scenario_is_covered "$scenario"; then
    echo "  OK  $scenario"
    COVERED=$((COVERED + 1))
  else
    echo "  MISSING  $scenario"
    MISSING=$((MISSING + 1))
  fi
done <<< "$SCENARIOS"

echo "---"
echo "Coverage: $COVERED/$TOTAL scenarios covered"

if [[ "$MISSING" -gt 0 ]]; then
  echo "$MISSING scenario(s) missing test coverage"
  exit 1
fi

exit 0
