# Draft Tracker

Draft specs captured but not yet finalized by `/product-manager`. This file is the PM's waiting room — ideas live here until they are refined into actionable specs or dropped.

This file is read by `/product-manager` **only on explicit request**. It is never loaded at session start, to keep the PM's context clean when writing a new spec.

## Lifecycle

- **Add**: a new draft lands here when an idea is captured outside a full PM session (e.g. during `/debug-workflow`, a retro, or an incident)
- **Promote**: when `/product-manager` finalizes a draft, its line moves to `feature-tracker.md` with status `ready` and is removed from here
- **Stale**: entries older than 30 days are flagged `stale` on manual review. The user decides case by case to **keep**, **drop**, or **refine now**. No automatic deletion.

## Drafts

| Idea | Spec | Origin | Priority | Added | Status |
|------|------|--------|----------|-------|--------|
| Sync real-time progress feedback | [sync-realtime-feedback](specs/sync-realtime-feedback.md) | debug-workflow fix/sync-data-accuracy-v2 | low | 2026-04-03 | draft |
