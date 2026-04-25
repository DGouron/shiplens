# Harness Onboarding — Day 1 with the Claude harness (shiplens)

Guide d'arrivée pour un dev qui rejoint shiplens et doit utiliser le **harness Claude** (skills, agents, hooks, pipeline SDD).

---

## TL;DR — les 5 commandes à connaître

```bash
bash scripts/harness-health-shiplens.sh   # Vérifier que le harness est sain
bash scripts/hooks/tests/test-hooks.sh    # Tests des hooks
pnpm test --run                           # Vitest one-shot
bash scripts/worktree.sh create <slug>    # Worktree friction-zéro (si script porté)
pnpm db:migrate                           # Prisma migrate (avec backup intégré)
```

---

## Que fait le harness pour toi

Quand tu lances Claude Code dans shiplens, **13 hooks bash** + **19 skills** + **8 agents** sont actifs.

- **Tu ne peux pas créer un `index.ts`** (barrel exports interdits)
- **Tu ne peux pas commit sur `main`/`master`** — créer une branche `feat/<slug>`
- **Tu ne peux pas push vers `main`/`master`** — passer par PR
- **Tu ne peux pas commit si `pnpm test` échoue** — fix d'abord
- **Le hook `no-logic-in-views.sh`** bloque toute logique React dans les `*.view.tsx`
- **Le hook `enforce-dependency-rule.sh`** bloque les imports inversés Clean Architecture
- **D'autres enforcers** : `enforce-gateway-port-purity.sh`, `enforce-presenter-class.sh`, `enforce-inline-type-imports.sh`, `enforce-gateway-error-in-bad-path.sh`
- **Le hook `require-spec.sh`** bloque l'invocation de `feature-implementer` sans spec valide

---

## Le pipeline SDD — comment livrer une feature

5 étapes :

1. **`/product-manager`** — challenge + INVEST + spec custom DSL → `docs/specs/<bc>/<slug>.md`
2. **`/implement-feature`** (backend) ou **`/implement-feature-frontend`** — orchestre planner + implementer
3. Le `feature-planner` agent → `docs/plans/<slug>.plan.md`
4. Le `feature-implementer` agent → code TDD + tests + `docs/reports/<slug>.report.md`
5. **`/ship`** — commit + push + PR

Cf. `.claude/skills/product-manager/SKILL.md` + `rules/spec-format.md` + `rules/spec-dsl.md`.

---

## Tes 3 premières actions (sanity check)

```bash
# 1. Health-check
bash scripts/harness-health-shiplens.sh

# 2. Tests des hooks
bash scripts/hooks/tests/test-hooks.sh

# 3. Suite Vitest
pnpm test --run
```

---

## Ce qui est bloqué automatiquement

| Interdit | Hook |
|---|---|
| `index.ts` barrel | `no-barrel-exports.sh` |
| Logique dans `*.view.tsx` | `no-logic-in-views.sh` |
| Dependency rule violation | `enforce-dependency-rule.sh` |
| Gateway port qui importe usecase | `enforce-gateway-port-purity.sh` |
| Presenter qui n'est pas une classe | `enforce-presenter-class.sh` |
| Type imports non-inline | `enforce-inline-type-imports.sh` |
| Bad-path stub sans GatewayError | `enforce-gateway-error-in-bad-path.sh` |
| Commit sur main/master | `protect-main-branch.sh` |
| Push vers main/master | `protect-main-push.sh` |
| Commit avec tests rouges | `pre-commit-gate.sh` |
| feature-implementer sans spec | `require-spec.sh` |
| Spec stale en commit | `verify-spec-updated.sh` |

---

## Différences avec solife-v2 (le harness original)

shiplens et solife-v2 partagent le même pattern de harness Claude. Les différences notables :

| Aspect | shiplens | solife-v2 |
|---|---|---|
| Package manager | pnpm | yarn |
| Tracker path | `docs/feature-tracker.md` | `documents/specs/feature-tracker.md` |
| Specs | `docs/specs/<bc>/` | `documents/specs/<bc>/` |
| ADRs | (pas en place) | `documents/adr/` (6 ADRs) |
| Status valides | `implemented`, `drafted`, `planned` | `ready`, `planned`, `implementing`, `done`, `blocked`, `on-hold` |
| Module split | backend + frontend (2 splits) | mono Next.js |

Le `harness-health.sh` est portable — voir `scripts/harness-health-shiplens.sh` (wrapper avec env vars shiplens).

---

## Last update

2026-04-25 — port depuis solife-v2 (Phase 5.2 portabilité framework).
