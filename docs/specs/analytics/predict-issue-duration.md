# Predict probable issue duration

## Status: implemented

## Context
When a PO prioritizes the backlog or plans a cycle, they have no visibility on how long each issue will actually take. A prediction based on the team's history allows them to make more informed planning decisions.

## Rules
- Prediction requires at least 2 completed history cycles to activate
- Prediction is based on similar issues already completed by the team
- Similarity criteria are: label, type, complexity in points, and assigned developer
- Each prediction provides three values: optimistic, probable, and pessimistic
- Prediction is recalculated when the issue characteristics change
- Only issues from the current cycle are subject to prediction
- The calculation approach is statistical: median of cycle times of similar issues

## Scenarios
- nominal prediction: {issue with label "bug", 3 points, history of 15 similar completed bugs} -> optimistic duration + probable duration + pessimistic duration
- prediction with little data: {issue with label "feature", 5 points, only 3 similar issues in history} -> prediction displayed with mention "low confidence"
- insufficient history: {fewer than 2 completed cycles} -> reject "Not enough history to activate predictions. Minimum 2 completed cycles required."
- no similar issues: {issue with a label never seen in history} -> reject "No similar issues found in history. Cannot predict duration."
- issue without points: {current cycle issue without point estimation} -> prediction based on other available criteria (label, type, assignee)
- unassigned issue: {current cycle issue without assigned developer} -> prediction based on team average for remaining criteria
- recalculation after modification: {issue whose label changes from "feature" to "bug"} -> prediction recalculated with the new label
- issue outside cycle: {issue in backlog, not in a current cycle} -> no prediction displayed

## Out of scope
- Artificial intelligence prediction (later phase)
- Taking into account the description text content for prediction
- Predicting the total duration of a cycle
- Automatic issue reassignment suggestions

## Glossary
| Term | Definition |
|------|------------|
| Prediction | Calculated estimate of the probable duration of an issue, based on history |
| Confidence interval | Trio of values (optimistic, probable, pessimistic) framing the predicted duration |
| Similar issue | Already completed issue sharing common criteria with the issue to predict |
| Low confidence | Indication that the prediction relies on a small sample of similar issues |
| Cycle time | Duration between moving to in-progress and completion of an issue |

## Implementation

- **Bounded Context**: Analytics
- **Entity**: `DurationPrediction` — P25/P50/P75 statistical logic for optimistic/probable/pessimistic
- **Use Case**: `PredictIssueDurationUsecase`
- **Controller**: `DurationPredictionController`
- **Gateway**: `DurationPredictionDataInPrismaGateway`
- **Presenter**: `DurationPredictionPresenter`

### Endpoints

| Method | Route | Use Case |
|--------|-------|----------|
| GET | `/api/analytics/teams/:teamId/issues/:issueExternalId/duration-prediction` | PredictIssueDuration |

### Decisions

- No Prisma migration — all data already exists (Issue, Cycle, StateTransition, Label)
- Issue "type" handled via labels (no type field in the Issue model)
- Stateless prediction, calculated on the fly on each GET call
- Binary confidence: < 5 similar issues = low, >= 5 = high
- Percentiles: P25 (optimistic), P50 (probable), P75 (pessimistic)
