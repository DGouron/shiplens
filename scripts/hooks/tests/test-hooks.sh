#!/usr/bin/env bash
set -u

# Test harness for all PreToolUse hooks.
# Runs cases for each hook, asserts exit codes, prints a summary.
# Usage: bash scripts/hooks/tests/test-hooks.sh
# Exit 0 = all pass, Exit 1 = at least one failure.

HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PASS=0
FAIL=0
FAILURES=()

assert_hook() {
  local description="$1"
  local expected_exit="$2"
  local hook_name="$3"
  local payload="$4"

  echo "$payload" | bash "$HOOKS_DIR/$hook_name" >/dev/null 2>&1
  local actual_exit=$?

  if [[ "$actual_exit" == "$expected_exit" ]]; then
    echo "  OK     $description"
    PASS=$((PASS + 1))
  else
    echo "  FAIL   $description (expected exit $expected_exit, got $actual_exit)"
    FAIL=$((FAIL + 1))
    FAILURES+=("[$hook_name] $description")
  fi
}

section() {
  echo ""
  echo "--- $1 ---"
}

# ─────────────────────────────────────────────────────────────────────────────
section "no-logic-in-views.sh"

assert_hook "view with viewModel prop is allowed" 0 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"export function DashboardView({ viewModel }) { return <div>{viewModel.title}</div>; }"}}'

assert_hook "useState in view is blocked" 2 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"const [x, setX] = useState(0);"}}'

assert_hook "useEffect in view is blocked" 2 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"useEffect(() => {}, []);"}}'

assert_hook "importing React hooks is blocked" 2 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"import { useState } from \"react\";"}}'

assert_hook "fetch() call in view is blocked" 2 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"const data = await fetch(\"/api\");"}}'

assert_hook "importing gateway in view is blocked" 2 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"import { X } from \"../gateways/y.in-http.gateway.ts\";"}}'

assert_hook "importing usecase in view is blocked" 2 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/views/dashboard.view.tsx","content":"import { X } from \"../../usecases/y.usecase.ts\";"}}'

assert_hook "non-view file is ignored" 0 "no-logic-in-views.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/hooks/use-dashboard.ts","content":"const [x, setX] = useState(0);"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "enforce-dependency-rule.sh"

assert_hook "entity importing from interface-adapters is blocked" 2 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.ts","content":"import { Z } from \"../../interface-adapters/gateways/y.in-prisma.gateway.ts\";"}}'

assert_hook "entity importing from usecases is blocked" 2 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.ts","content":"import { Z } from \"../../usecases/create-y.usecase.ts\";"}}'

assert_hook "usecase importing from interface-adapters is blocked" 2 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/usecases/create-y.usecase.ts","content":"import { Z } from \"../interface-adapters/gateways/y.in-prisma.gateway.ts\";"}}'

assert_hook "entity importing from same module entities is allowed" 0 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.ts","content":"import { Z } from \"../z/z.ts\";"}}'

assert_hook "usecase importing gateway port from entities is allowed" 0 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/usecases/create-y.usecase.ts","content":"import { YGateway } from \"../entities/y/y.gateway.ts\";"}}'

assert_hook "interface-adapter file is ignored" 0 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/interface-adapters/gateways/y.in-prisma.gateway.ts","content":"import { Z } from \"../../usecases/create-y.usecase.ts\";"}}'

assert_hook "file outside src/modules is ignored" 0 "enforce-dependency-rule.sh" \
  '{"tool_input":{"file_path":"/repo/scripts/foo.ts","content":"import { X } from \"../interface-adapters/y\";"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "enforce-gateway-port-purity.sh"

assert_hook "interface port is allowed" 0 "enforce-gateway-port-purity.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/entities/y/y.gateway.ts","content":"export interface YGateway { fetch(): Promise<void>; }"}}'

assert_hook "abstract class port is allowed" 0 "enforce-gateway-port-purity.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.gateway.ts","content":"export abstract class YGateway { abstract fetch(): Promise<void>; }"}}'

assert_hook "plain class in port is blocked" 2 "enforce-gateway-port-purity.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.gateway.ts","content":"export class YGateway {}"}}'

assert_hook "in-prisma impl with class is allowed" 0 "enforce-gateway-port-purity.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/interface-adapters/gateways/y.in-prisma.gateway.ts","content":"export class YInPrismaGateway {}"}}'

assert_hook "in-http impl with class is allowed" 0 "enforce-gateway-port-purity.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/modules/x/interface-adapters/gateways/y.in-http.gateway.ts","content":"export class YInHttpGateway {}"}}'

assert_hook "non-gateway file is ignored" 0 "enforce-gateway-port-purity.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.ts","content":"export class Y {}"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "enforce-presenter-class.sh"

assert_hook "presenter class is allowed" 0 "enforce-presenter-class.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/interface-adapters/presenters/y.presenter.ts","content":"export class YPresenter { present(x) { return x; } }"}}'

assert_hook "presenter as function is blocked on Write" 2 "enforce-presenter-class.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/interface-adapters/presenters/y.presenter.ts","content":"export function presentY(x) { return x; }"}}'

assert_hook "Edit on presenter (no content field) is allowed" 0 "enforce-presenter-class.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/interface-adapters/presenters/y.presenter.ts","new_string":"// tweak"}}'

assert_hook "non-presenter file is ignored" 0 "enforce-presenter-class.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.ts","content":"export function presentY(x) { return x; }"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "enforce-inline-type-imports.sh"

assert_hook "inline type import is allowed" 0 "enforce-inline-type-imports.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/x.ts","content":"import { type Foo } from \"./foo\";"}}'

assert_hook "mixed inline type import is allowed" 0 "enforce-inline-type-imports.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/x.ts","content":"import { Bar, type Foo } from \"./foo\";"}}'

assert_hook "import type is blocked" 2 "enforce-inline-type-imports.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/x.ts","content":"import type { Foo } from \"./foo\";"}}'

assert_hook "non-ts file is ignored" 0 "enforce-inline-type-imports.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/x.md","content":"import type { Foo } from \"./foo\";"}}'

assert_hook "tsx file is checked" 2 "enforce-inline-type-imports.sh" \
  '{"tool_input":{"file_path":"/repo/frontend/src/x.tsx","content":"import type { Foo } from \"./foo\";"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "no-barrel-exports.sh (existing)"

assert_hook "index.ts creation is blocked" 2 "no-barrel-exports.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/index.ts","content":"export * from \"./foo\";"}}'

assert_hook "non-index .ts file is allowed" 0 "no-barrel-exports.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/foo.ts","content":"export const X = 1;"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "enforce-gateway-error-in-bad-path.sh (existing)"

assert_hook "bad-path stub with GatewayError is allowed" 0 "enforce-gateway-error-in-bad-path.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/testing/bad-path/failing.y.gateway.ts","content":"throw new GatewayError(\"boom\");"}}'

assert_hook "bad-path stub with plain Error is blocked" 2 "enforce-gateway-error-in-bad-path.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/testing/bad-path/failing.y.gateway.ts","content":"throw new Error(\"boom\");"}}'

assert_hook "non bad-path file is ignored" 0 "enforce-gateway-error-in-bad-path.sh" \
  '{"tool_input":{"file_path":"/repo/backend/src/modules/x/entities/y/y.ts","content":"throw new Error(\"boom\");"}}'

# ─────────────────────────────────────────────────────────────────────────────
section "require-spec.sh (existing)"

assert_hook "feature-implementer with existing spec ref is allowed" 0 "require-spec.sh" \
  '{"tool_input":{"subagent_type":"feature-implementer","prompt":"docs/specs/identity/connect-linear-workspace.md"}}'

assert_hook "frontend-implementer with existing spec ref is allowed" 0 "require-spec.sh" \
  '{"tool_input":{"subagent_type":"frontend-implementer","prompt":"docs/specs/analytics/migrate-dashboard-page.md"}}'

assert_hook "frontend-implementer without spec is blocked" 2 "require-spec.sh" \
  '{"tool_input":{"subagent_type":"frontend-implementer","prompt":"Please implement the dashboard"}}'

assert_hook "frontend-planner (non-implementer) is ignored" 0 "require-spec.sh" \
  '{"tool_input":{"subagent_type":"frontend-planner","prompt":"anything"}}'

assert_hook "substring implementer name is not matched" 0 "require-spec.sh" \
  '{"tool_input":{"subagent_type":"some-feature-implementer-other","prompt":"docs/specs/analytics/migrate-dashboard-page.md"}}'

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "==="
echo "Results: $PASS passed, $FAIL failed"
if [[ "$FAIL" -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for failure in "${FAILURES[@]}"; do
    echo "  - $failure"
  done
  exit 1
fi
exit 0
