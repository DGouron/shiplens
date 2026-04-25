#!/usr/bin/env bash
set -u

# scripts/harness-health.sh — Detect drift in the Claude harness.
# Five checks: hooks branched, skills parseable, paths exist, ADRs coherent, tracker valid.
# Read-only — never modifies anything (--fix flag is a placeholder for future).
# Portable to other projects via env vars (see ENV section below).
#
# Usage:
#   bash scripts/harness-health.sh             Full check, exit 0 if all green
#   bash scripts/harness-health.sh --quiet     Only output failures
#   bash scripts/harness-health.sh --json      Output JSON (for CI parsing)
#
# Environment (portability):
#   HARNESS_ROOT            default: $(git rev-parse --show-toplevel)  Project root
#   CLAUDE_DIR              default: .claude                            Claude config directory
#   HOOKS_DIR               default: scripts/hooks                      Hooks scripts directory
#   DOCS_DIR                default: documents                          Project docs directory
#   ADR_DIR                 default: documents/adr                      ADRs directory
#   SPECS_DIR               default: documents/specs                    Specs directory
#   FEATURE_TRACKER         default: documents/specs/feature-tracker.md Tracker file
#   SETTINGS_FILE           default: .claude/settings.json              Settings file
#   HOOKS_TEST_FILE         default: scripts/hooks/tests/test-hooks.sh  Hooks tests entrypoint
#
# Exit codes:
#   0  all checks pass
#   1  at least one check failed
#   2  fatal error (env not git, missing required tools)

HARNESS_ROOT="${HARNESS_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || echo "")}"

if [[ -z "$HARNESS_ROOT" ]]; then
  echo "[harness-health] FATAL: not inside a git repository (and HARNESS_ROOT not overridden)" >&2
  exit 2
fi

cd "$HARNESS_ROOT"

CLAUDE_DIR="${CLAUDE_DIR:-.claude}"
HOOKS_DIR="${HOOKS_DIR:-scripts/hooks}"
DOCS_DIR="${DOCS_DIR:-documents}"
ADR_DIR="${ADR_DIR:-documents/adr}"
SPECS_DIR="${SPECS_DIR:-documents/specs}"
FEATURE_TRACKER="${FEATURE_TRACKER:-documents/specs/feature-tracker.md}"
SETTINGS_FILE="${SETTINGS_FILE:-.claude/settings.json}"
HOOKS_TEST_FILE="${HOOKS_TEST_FILE:-scripts/hooks/tests/test-hooks.sh}"

QUIET=0
OUTPUT_JSON=0
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=1 ;;
    --json) OUTPUT_JSON=1 ;;
    --fix) echo "[harness-health] --fix not implemented yet, running read-only" >&2 ;;
  esac
done

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNED=0
FINDINGS=()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() {
  if [[ "$QUIET" -eq 0 && "$OUTPUT_JSON" -eq 0 ]]; then
    echo "$@" >&2
  fi
}

check_section() {
  log ""
  log "[harness-health] CHECK: $1"
}

pass() {
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
  log "  ✅ $1"
}

fail() {
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
  FINDINGS+=("FAIL: $1")
  if [[ "$OUTPUT_JSON" -eq 0 ]]; then
    echo "  ❌ $1" >&2
  fi
}

warn() {
  CHECKS_WARNED=$((CHECKS_WARNED + 1))
  FINDINGS+=("WARN: $1")
  log "  ⚠️  $1"
}

# ---------------------------------------------------------------------------
# CHECK 1: Hooks branched in settings.json AND scripts exist + executable
# ---------------------------------------------------------------------------

check_hooks_branched() {
  check_section "1/5 — Hooks branched in $SETTINGS_FILE"

  if [[ ! -f "$SETTINGS_FILE" ]]; then
    fail "$SETTINGS_FILE not found"
    return
  fi

  if ! command -v python3 >/dev/null 2>&1; then
    fail "python3 not available — cannot parse JSON settings"
    return
  fi

  # Extract all hook commands from settings.json
  local referenced_hooks
  referenced_hooks=$(python3 -c "
import json, re, sys
try:
    data = json.load(open('$SETTINGS_FILE'))
    hooks = data.get('hooks', {})
    seen = set()
    for event_name, entries in hooks.items():
        for entry in entries:
            for hook in entry.get('hooks', []):
                cmd = hook.get('command', '')
                # Match scripts/hooks/<name>.sh inside the command (handles \$CLAUDE_PROJECT_DIR prefix and quotes)
                m = re.search(r'$HOOKS_DIR/([\w-]+\.sh)', cmd)
                if m:
                    seen.add(m.group(1))
    for h in sorted(seen):
        print(h)
except Exception as e:
    print(f'__ERROR__:{e}', file=sys.stderr)
    sys.exit(1)
")

  if [[ -z "$referenced_hooks" ]]; then
    warn "No hooks referenced in $SETTINGS_FILE"
    return
  fi

  local count=0
  while IFS= read -r hook_name; do
    [[ -z "$hook_name" ]] && continue
    local hook_path="$HOOKS_DIR/$hook_name"
    count=$((count + 1))

    if [[ ! -f "$hook_path" ]]; then
      fail "Hook referenced in settings.json but missing on disk: $hook_path"
      continue
    fi
    if [[ ! -x "$hook_path" ]]; then
      fail "Hook exists but not executable (chmod +x): $hook_path"
      continue
    fi
  done <<< "$referenced_hooks"

  pass "$count hooks branched in settings.json, all exist and are executable"

  # Check for orphans: hooks on disk not referenced in settings.json (warn only)
  local on_disk
  on_disk=$(ls "$HOOKS_DIR"/*.sh 2>/dev/null | xargs -n1 basename 2>/dev/null | grep -v "parse-json.sh" || true)
  while IFS= read -r hook_name; do
    [[ -z "$hook_name" ]] && continue
    if ! echo "$referenced_hooks" | grep -qFx "$hook_name"; then
      warn "Hook on disk but NOT referenced in settings.json (orphan): $HOOKS_DIR/$hook_name"
    fi
  done <<< "$on_disk"
}

# ---------------------------------------------------------------------------
# CHECK 2: Hooks tests still green
# ---------------------------------------------------------------------------

check_hooks_tests() {
  check_section "2/5 — Hooks automated tests"

  if [[ ! -f "$HOOKS_TEST_FILE" ]]; then
    warn "$HOOKS_TEST_FILE not found — cannot validate hook behavior"
    return
  fi

  local test_output
  if test_output=$(bash "$HOOKS_TEST_FILE" 2>&1); then
    local passed
    passed=$(echo "$test_output" | grep -oE 'Tests passed: [0-9]+' | grep -oE '[0-9]+' || echo "?")
    pass "Hooks test suite green ($passed tests)"
  else
    fail "Hooks test suite has failures (run: bash $HOOKS_TEST_FILE)"
  fi
}

# ---------------------------------------------------------------------------
# CHECK 3: Skills parseable (frontmatter has name + description)
# ---------------------------------------------------------------------------

check_skills_parseable() {
  check_section "3/5 — Skills parseable"

  if [[ ! -d "$CLAUDE_DIR/skills" ]]; then
    warn "$CLAUDE_DIR/skills/ not found — no skills to check"
    return
  fi

  local skill_count=0
  local broken_count=0
  local seen_names=()

  for skill_md in "$CLAUDE_DIR/skills"/*/SKILL.md; do
    [[ ! -f "$skill_md" ]] && continue
    skill_count=$((skill_count + 1))

    # Extract frontmatter via python3 (between --- delimiters)
    local fm_data
    fm_data=$(python3 -c "
import re, sys
content = open('$skill_md').read()
m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
if not m:
    print('__NO_FRONTMATTER__')
    sys.exit(0)
fm = m.group(1)
name_m = re.search(r'^name:\s*[\'\"]?(\S+?)[\'\"]?\s*\$', fm, re.MULTILINE)
desc_m = re.search(r'^description:', fm, re.MULTILINE)
print(f\"name={name_m.group(1) if name_m else '__MISSING__'}|hasdesc={'yes' if desc_m else 'no'}\")
" 2>/dev/null)

    if [[ "$fm_data" == "__NO_FRONTMATTER__" ]]; then
      fail "Skill has no frontmatter: $skill_md"
      broken_count=$((broken_count + 1))
      continue
    fi

    local name has_desc
    name=$(echo "$fm_data" | sed -n 's/^name=\([^|]*\)|.*$/\1/p')
    has_desc=$(echo "$fm_data" | sed -n 's/^.*hasdesc=\(.*\)$/\1/p')

    if [[ "$name" == "__MISSING__" || -z "$name" ]]; then
      fail "Skill missing 'name' in frontmatter: $skill_md"
      broken_count=$((broken_count + 1))
      continue
    fi
    if [[ "$has_desc" != "yes" ]]; then
      fail "Skill missing 'description' in frontmatter: $skill_md"
      broken_count=$((broken_count + 1))
      continue
    fi

    # Detect duplicates
    local dup=0
    for existing in "${seen_names[@]:-}"; do
      if [[ "$existing" == "$name" ]]; then
        dup=1
        break
      fi
    done
    if [[ "$dup" -eq 1 ]]; then
      fail "Duplicate skill name '$name' (multiple SKILL.md files declare it)"
      broken_count=$((broken_count + 1))
      continue
    fi
    seen_names+=("$name")
  done

  if [[ "$broken_count" -eq 0 ]]; then
    pass "$skill_count skills, all frontmatters valid, no duplicates"
  fi
}

# ---------------------------------------------------------------------------
# CHECK 4: ADR numbering coherent
# ---------------------------------------------------------------------------

check_adrs() {
  check_section "4/5 — ADR numbering"

  if [[ ! -d "$ADR_DIR" ]]; then
    warn "$ADR_DIR not found — no ADRs to check"
    return
  fi

  # Collect all ADR files (pattern ADR-NNNN-*.md)
  local adr_files
  adr_files=$(ls "$ADR_DIR"/ADR-*.md 2>/dev/null | sort || true)

  if [[ -z "$adr_files" ]]; then
    warn "No ADR-NNNN-*.md files found in $ADR_DIR/"
    return
  fi

  local prev_num=0
  local count=0
  local has_gap=0
  local seen_nums=()

  while IFS= read -r adr_file; do
    [[ -z "$adr_file" ]] && continue
    count=$((count + 1))

    # Extract number from filename
    local num
    num=$(basename "$adr_file" | sed -nE 's/^ADR-0*([0-9]+)-.*\.md$/\1/p')
    if [[ -z "$num" ]]; then
      fail "ADR filename does not match ADR-NNNN-<slug>.md: $adr_file"
      continue
    fi

    # Detect duplicates
    local dup=0
    for existing in "${seen_nums[@]:-}"; do
      if [[ "$existing" == "$num" ]]; then
        dup=1
        break
      fi
    done
    if [[ "$dup" -eq 1 ]]; then
      fail "Duplicate ADR number $num (collision)"
      continue
    fi
    seen_nums+=("$num")

    # Check for gap (only if expected sequential)
    if [[ "$num" -ne $((prev_num + 1)) ]]; then
      has_gap=1
    fi
    prev_num=$num

    # Validate Status header (handles both "**Status** :" and "- **Status** :" formats)
    local status_line
    status_line=$(grep -m1 -E '^\s*-?\s*\*\*Status\*\*\s*:' "$adr_file" || true)
    if [[ -z "$status_line" ]]; then
      warn "ADR-$num has no '**Status**:' line: $adr_file"
    elif ! echo "$status_line" | grep -qE '(accepted|proposed|superseded by ADR-)'; then
      warn "ADR-$num status not recognized (expected: accepted/proposed/superseded by ADR-NNNN): $status_line"
    fi
  done <<< "$adr_files"

  if [[ "$has_gap" -eq 1 ]]; then
    warn "ADR numbering has gaps (not strictly sequential)"
  fi

  pass "$count ADRs, all parseable, no number collisions"
}

# ---------------------------------------------------------------------------
# CHECK 5: Feature tracker consistency
# ---------------------------------------------------------------------------

check_tracker() {
  check_section "5/5 — Feature tracker"

  if [[ ! -f "$FEATURE_TRACKER" ]]; then
    warn "$FEATURE_TRACKER not found — pipeline SDD not yet active"
    return
  fi

  # Accept multiple SDD status vocabularies (solife: ready/planned/implementing/done,
  # shiplens: implemented/drafted/planned). Position-agnostic — we just want at least
  # one valid status token between pipes anywhere in the row.
  local valid_statuses="ready|planned|implementing|done|blocked|on-hold|implemented|drafted|shipped"
  local entry_count=0
  local invalid_count=0

  while IFS= read -r line; do
    # Skip header/separator/legend rows: must start with `|` and have at least 3 pipes
    [[ ! "$line" =~ ^\| ]] && continue
    local pipe_count
    pipe_count=$(echo "$line" | grep -o '|' | wc -l)
    [[ "$pipe_count" -lt 3 ]] && continue

    # Skip table separator rows (e.g. |---|---|...)
    if echo "$line" | grep -qE '^\|[ -|:]+\|$'; then
      continue
    fi

    # Skip table header (does it contain a known status anywhere?)
    if ! echo "$line" | grep -qE "\| ?($valid_statuses) ?\|"; then
      # Could be the header row or an entry with an unknown status — distinguish.
      # If the row contains a markdown link `[...](...)`, treat it as a malformed entry.
      if echo "$line" | grep -qE '\[[^]]+\]\([^)]+\.md\)'; then
        fail "Tracker row has no recognized status: $line"
        invalid_count=$((invalid_count + 1))
      fi
      continue
    fi

    entry_count=$((entry_count + 1))

    # Extract spec link and check that the file exists
    local spec_link
    spec_link=$(echo "$line" | grep -oE '\(([^)]+\.md)\)' | tr -d '()' | head -1 || true)
    if [[ -n "$spec_link" ]]; then
      # Try both: relative to SPECS_DIR (solife format) and relative to FEATURE_TRACKER's dir (shiplens format)
      local spec_path_a="$SPECS_DIR/$spec_link"
      local tracker_dir
      tracker_dir=$(dirname "$FEATURE_TRACKER")
      local spec_path_b="$tracker_dir/$spec_link"
      if [[ ! -f "$spec_path_a" && ! -f "$spec_path_b" ]]; then
        fail "Tracker entry references missing spec file: $spec_link (tried $spec_path_a and $spec_path_b)"
        invalid_count=$((invalid_count + 1))
      fi
    fi
  done < "$FEATURE_TRACKER"

  if [[ "$entry_count" -eq 0 ]]; then
    warn "Feature tracker is empty — pipeline SDD not yet exercised"
  elif [[ "$invalid_count" -eq 0 ]]; then
    pass "$entry_count tracker entries, all statuses valid, all spec links resolve"
  fi
}

# ---------------------------------------------------------------------------
# Run all checks
# ---------------------------------------------------------------------------

check_hooks_branched
check_hooks_tests
check_skills_parseable
check_adrs
check_tracker

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

if [[ "$OUTPUT_JSON" -eq 1 ]]; then
  python3 -c "
import json
findings = $(printf '%s\n' "${FINDINGS[@]:-}" | python3 -c 'import sys, json; print(json.dumps([line.strip() for line in sys.stdin if line.strip()]))')
print(json.dumps({
    'passed': $CHECKS_PASSED,
    'failed': $CHECKS_FAILED,
    'warned': $CHECKS_WARNED,
    'findings': findings,
    'status': 'OK' if $CHECKS_FAILED == 0 else 'FAILED'
}, indent=2))
"
else
  log ""
  log "================================================================"
  log "  Passed:  $CHECKS_PASSED"
  log "  Failed:  $CHECKS_FAILED"
  log "  Warned:  $CHECKS_WARNED"
  log "================================================================"
fi

if [[ "$CHECKS_FAILED" -gt 0 ]]; then
  exit 1
fi
exit 0
