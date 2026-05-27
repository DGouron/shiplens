#!/usr/bin/env bash
set -euo pipefail

# debug-workflow.sh — Scaffolding for the /debug-workflow skill
#
# Subcommands:
#   init <slug>      Create documents/debug/<slug>/ with templates
#   list             List all debug folders + their status
#   status <slug>    Show progress of a debug session (which phases done)
#   clean <slug>     Remove a debug folder (only if no proof/ has files — safety)
#   help             Show this message
#
# Used by skill .claude/skills/debug-workflow/SKILL.md (Phase 0 INTAKE).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
DEBUG_DIR="$PROJECT_DIR/documents/debug"

usage() {
  cat <<'EOF'
debug-workflow.sh — Scaffolding for the /debug-workflow skill

Subcommands:
  init <slug>      Create documents/debug/<slug>/ with templates
  list             List all debug folders + their status
  status <slug>    Show progress of a debug session (which phases done)
  clean <slug>     Remove a debug folder (only if no proof/ has files — safety)
  help             Show this message

Used by skill .claude/skills/debug-workflow/SKILL.md (Phase 0 INTAKE).
EOF
  exit 1
}

slug_validate() {
  local slug="$1"
  if [[ ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo "Error: slug must be kebab-case (a-z, 0-9, dashes only). Got: '$slug'" >&2
    exit 2
  fi
  if [[ ${#slug} -gt 50 ]]; then
    echo "Error: slug too long (>50 chars). Keep it short and descriptive." >&2
    exit 2
  fi
}

cmd_init() {
  local slug="${1:-}"
  if [[ -z "$slug" ]]; then
    echo "Usage: $0 init <slug>" >&2
    exit 1
  fi
  slug_validate "$slug"

  local target="$DEBUG_DIR/$slug"
  if [[ -d "$target" ]]; then
    echo "Folder $target already exists. Aborting (use a different slug or remove manually)." >&2
    exit 3
  fi

  mkdir -p "$target/proof"

  cat > "$target/00-intake.md" <<EOF
# Intake — $slug

## Symptôme observable
<Ce que je vois vs ce que j'attends. Pas de "ça marche pas" — décris ce qui s'affiche.>

## Étapes de reproduction
1.
2.
3.

## Scope utilisateur
- [ ] Tous les utilisateurs
- [ ] Rôle spécifique : <admin | bureau | super-admin | ...>
- [ ] Donnée spécifique : <description>

## Régression
- [ ] Oui, depuis : <commit/date/déploiement>
- [ ] Non, bug existait déjà
- [ ] Inconnu

## Environnement
- [ ] Local
- [ ] Staging
- [ ] Prod
- Reproductible localement : oui / non / partiellement

## Logs / erreurs vues
- Console browser :
- Terminal :
- Vercel / Supabase :

## Classification (détermine le type de test à écrire)
- [ ] UI / interaction / layout / responsive → **Playwright e2e**
- [ ] Logique métier / calcul / validation / data → **Vitest unit/integration**
- [ ] API route / contrat HTTP → **Vitest integration** (route handler) + Playwright si UX impactée

## Bounded Context concerné
<ex: memberManagement, donations, equipment, ...>

## Slug
$slug
EOF

  cat > "$target/01-investigation.md" <<'EOF'
<!-- This file will be filled by the debug-investigator agent (Phase 1).
     See .claude/agents/debug-investigator.md for the structure. -->
EOF

  cat > "$target/02-fix.md" <<'EOF'
<!-- This file will be filled by the orchestrator or feature-implementer (Phase 3).

# Fix — <slug>

## Files changed
- path/to/file1.ts
- path/to/file2.ts

## Diff summary
<short description of what changed and why>

## Tests added/modified
- backend/tests/modules/<bc>/...

## pnpm verify : ✅
-->
EOF

  cat > "$target/03-proof.md" <<'EOF'
<!-- This file will be filled by the orchestrator (Phase 4).
     Follow .claude/skills/debug-workflow/rules/proof-of-fix.md template. -->
EOF

  cat > "$target/04-test-plan.md" <<'EOF'
<!-- This file will be filled by the qa-tester agent (Phase 5).
     Follow .claude/skills/debug-workflow/rules/test-plan-template.md template. -->
EOF

  cat > "$target/report.md" <<EOF
<!-- Final synthesis written at Phase 6. -->

# Debug Report — $slug

## Summary
<1-2 sentences>

## Artifacts
- Intake: 00-intake.md
- Investigation: 01-investigation.md
- Fix: 02-fix.md
- Proof: 03-proof.md
- Test plan: 04-test-plan.md

## Root cause
<file:line — mechanism>

## Files modified
<list>

## Tests added
<list>

## Sign-off
- [ ] pnpm verify ✅
- [ ] Chrome MCP repro ✅ (or manual fallback)
- [ ] QA test plan written
- [ ] Manual QA checklist completed
EOF

  echo "[debug-workflow] Created $target"
  echo "[debug-workflow] Next: fill 00-intake.md, then run /debug-workflow to start the pipeline"
}

cmd_list() {
  if [[ ! -d "$DEBUG_DIR" ]]; then
    echo "No debug sessions yet. Create one with: $0 init <slug>"
    return 0
  fi
  printf "%-40s %-15s %-30s\n" "SLUG" "STATUS" "LAST UPDATED"
  printf "%-40s %-15s %-30s\n" "----" "------" "------------"
  for dir in "$DEBUG_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    local slug
    slug=$(basename "$dir")
    local status="intake"
    [[ -s "$dir/01-investigation.md" ]] && grep -q "ROOT_CAUSE_FOUND\|NEEDS_MORE_INFO\|UNREPRODUCIBLE" "$dir/01-investigation.md" 2>/dev/null && status="investigated"
    [[ -s "$dir/02-fix.md" ]] && ! head -3 "$dir/02-fix.md" | grep -q "^<!--" && status="fixed"
    [[ -s "$dir/03-proof.md" ]] && ! head -3 "$dir/03-proof.md" | grep -q "^<!--" && status="proven"
    [[ -s "$dir/04-test-plan.md" ]] && ! head -3 "$dir/04-test-plan.md" | grep -q "^<!--" && status="tested"
    local updated
    updated=$(date -r "$dir" '+%Y-%m-%d %H:%M' 2>/dev/null || echo "?")
    printf "%-40s %-15s %-30s\n" "$slug" "$status" "$updated"
  done
}

cmd_status() {
  local slug="${1:-}"
  if [[ -z "$slug" ]]; then
    echo "Usage: $0 status <slug>" >&2
    exit 1
  fi
  local target="$DEBUG_DIR/$slug"
  if [[ ! -d "$target" ]]; then
    echo "No such slug: $slug" >&2
    exit 4
  fi
  echo "Phases for $slug:"
  for phase in "00-intake" "01-investigation" "02-fix" "03-proof" "04-test-plan" "report"; do
    local file="$target/$phase.md"
    if [[ ! -f "$file" ]]; then
      echo "  ❌ $phase.md (missing)"
    elif head -3 "$file" | grep -q "^<!--"; then
      echo "  ⏳ $phase.md (template, not filled)"
    else
      echo "  ✅ $phase.md"
    fi
  done
  local proof_count
  proof_count=$(find "$target/proof" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "  📷 proof/ : $proof_count file(s)"
}

cmd_clean() {
  local slug="${1:-}"
  if [[ -z "$slug" ]]; then
    echo "Usage: $0 clean <slug>" >&2
    exit 1
  fi
  local target="$DEBUG_DIR/$slug"
  if [[ ! -d "$target" ]]; then
    echo "No such slug: $slug" >&2
    exit 4
  fi
  local proof_count
  proof_count=$(find "$target/proof" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$proof_count" -gt 0 ]]; then
    echo "Refuses to clean: $target/proof/ contains $proof_count file(s) — manual cleanup needed." >&2
    exit 5
  fi
  rm -rf "$target"
  echo "[debug-workflow] Removed $target"
}

main() {
  local subcmd="${1:-help}"
  shift || true
  case "$subcmd" in
    init) cmd_init "$@" ;;
    list) cmd_list "$@" ;;
    status) cmd_status "$@" ;;
    clean) cmd_clean "$@" ;;
    help|--help|-h) usage ;;
    *) echo "Unknown subcommand: $subcmd" >&2; usage ;;
  esac
}

main "$@"
