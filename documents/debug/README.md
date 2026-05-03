# `documents/debug/` — Debug Workflow Artifacts

Output dir of the `/debug-workflow` skill. One folder per bug investigated.

## Layout

```
documents/debug/
├── README.md                          # This file
└── <slug>/                            # One folder per bug (kebab-case slug)
    ├── 00-intake.md                   # Phase 0 — bug description, classification
    ├── 01-investigation.md            # Phase 1 — root cause (debug-investigator agent)
    ├── 02-fix.md                      # Phase 3 — files changed, diff summary
    ├── 03-proof.md                    # Phase 4 — proof of fix (tests + Chrome MCP repro)
    ├── 04-test-plan.md                # Phase 5 — QA test plan (qa-tester agent)
    ├── report.md                      # Phase 6 — final synthesis
    └── proof/                         # Screenshots, GIFs, network captures
        ├── before-*.png
        ├── after-*.png
        └── ...
```

## Lifecycle

1. **Init** : `bash scripts/debug-workflow.sh init <slug>` creates the folder with templates
2. **Fill** : the orchestrator + agents fill the .md files phase by phase
3. **Sign-off** : `report.md` summarises, user runs `/ship` to commit + PR
4. **Archive** : after merge, the folder stays in git history (don't delete — it's the audit trail)

## Slug naming

- `kebab-case-3-5-mots`
- Descriptive of the symptom, not the suspected cause (the cause is unknown at intake)
- Examples :
  - ✅ `admin-members-list-mobile-error`
  - ✅ `member-search-debounce-focus-loss`
  - ✅ `donation-pdf-blank`
  - ❌ `bug-1` (not descriptive)
  - ❌ `fix-presenter-null` (assumes the cause)
  - ❌ `mb` (acronym)

## Useful commands

```bash
# Create a new debug session
bash scripts/debug-workflow.sh init <slug>

# List all sessions + status
bash scripts/debug-workflow.sh list

# Check progress of a session
bash scripts/debug-workflow.sh status <slug>

# Clean a session (only if proof/ is empty — safety)
bash scripts/debug-workflow.sh clean <slug>
```

## Conventions

- One bug = one slug = one branch = one PR (cf. `.claude/rules/scope-discipline.md`)
- Proof screenshots go in `proof/` subfolder, referenced by name from `03-proof.md`
- Don't gitignore the `proof/` folder by default — small PNGs are fine. If a session generates large GIFs, decide case by case.
- Update `report.md` last (it's the synthesis, not a draft)

## Related

- Skill : `.claude/skills/debug-workflow/SKILL.md`
- Agents : `.claude/agents/debug-investigator.md`, `.claude/agents/qa-tester.md`
- Rules : `.claude/skills/debug-workflow/rules/`
- Script : `scripts/debug-workflow.sh`
