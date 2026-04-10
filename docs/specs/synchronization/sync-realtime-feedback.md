---
status: draft
priority: low
origin: debug-workflow fix/sync-data-accuracy-v2
---

# Sync — Real-time progress feedback

## Context

The Linear sync paginates in batches of 50 issues/cycle. For a cycle with 500 issues, that's ~10 requests. The user has no visual feedback during this time.

## Need

Display sync progress in real time:
- Number of issues fetched / estimated total
- Cycle currently being processed
- Current step (issues, cycles, transitions)

## Constraints to explore

- Push mechanism: SSE, WebSocket, or polling?
- Architecture impact: the HTTP gateway is currently fire-and-forget
- Linear rate limit: batching by 50 is slower than 1 large request, but more predictable

## Decisions to make

- To be specified with `/product-manager` when the topic is prioritized
