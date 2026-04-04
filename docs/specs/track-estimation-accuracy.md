# Track estimation accuracy

## Status: implemented

## Context
Point estimates are rarely compared against reality. The tech lead needs to measure the gap between what was planned and what actually happened, so the team can progressively calibrate its estimates and gain predictability.

## Rules
- Estimation accuracy is measured by comparing estimated points to actual cycle time
- Cycle time serves as a proxy for time actually spent — there is no time tracking
- Issues without point estimates are excluded from accuracy calculation
- Issues without measurable cycle time are excluded from accuracy calculation
- A developer's accuracy score aggregates all their estimated issues over the period
- Estimation trend requires at least 2 completed cycles
- Normalization converts points and durations to a common scale to enable comparison

## Scenarios
- per-issue accuracy: {completed issue, 3 estimated points, 2-day cycle time} -> estimation ratio "3 points / 2 days"
- per-developer accuracy: {developer with 5 estimated and completed issues} -> accuracy score computed across all their issues
- per-label accuracy: {completed issues grouped by label} -> average accuracy score per label
- overestimation detected: {issue estimated at 8 points, half-day cycle time} -> ratio flagged as overestimation
- underestimation detected: {issue estimated at 1 point, 5-day cycle time} -> ratio flagged as underestimation
- improvement trend: {3 completed cycles with estimates} -> accuracy score evolution displayed cycle by cycle
- insufficient history for trend: {fewer than 2 completed cycles} -> reject "Pas assez d'historique pour afficher la tendance. Minimum 2 cycles terminés requis."
- issue without estimate: {completed issue without assigned points} -> issue excluded from calculation + note "X issues without estimate"
- issue without cycle time: {completed issue without in-progress state transition} -> issue excluded from calculation + note "X issues without cycle time"
- team overall score: {all estimated and completed team issues} -> aggregated team accuracy score

## Out of scope
- Actual time tracking (time entry by developers)
- Automatic estimation recommendations for new issues
- Accuracy comparison between teams
- Editing estimates from Shiplens

## Glossary
| Term | Definition |
|------|------------|
| Estimate | Number of points assigned to an issue before its completion |
| Cycle time | Duration between entering in-progress status and completion, used as a proxy for actual time |
| Accuracy score | Measure of the gap between the estimate and actual cycle time, after normalization |
| Normalization | Conversion of points and durations to a common scale to make them comparable |
| Overestimation | Issue whose cycle time is significantly lower than what the estimate predicted |
| Underestimation | Issue whose cycle time is significantly higher than what the estimate predicted |

## Implementation

- **Bounded Context** : Analytics
- **Entity** : `EstimationAccuracy` — logique de ratio, classification, agrégation par dev/label/équipe
- **Use Cases** : `CalculateEstimationAccuracyUsecase`, `GetEstimationTrendUsecase`
- **Controller** : `EstimationAccuracyController`
- **Gateway** : `EstimationAccuracyDataInPrismaGateway`
- **Presenter** : `EstimationAccuracyPresenter`

### Endpoints

| Méthode | Route | Use Case |
|---------|-------|----------|
| GET | `/api/analytics/teams/:teamId/cycles/:cycleId/estimation-accuracy` | CalculateEstimationAccuracy |
| GET | `/api/analytics/teams/:teamId/estimation-trend` | GetEstimationTrend |

### Décisions

- Pas de migration Prisma — toutes les données existent déjà (Issue.points, StateTransition, Label)
- Classification : ratio > 2.0 = sur-estimation, ratio < 0.5 = sous-estimation
- Le gateway filtre les issues éligibles et retourne les compteurs d'exclues séparément
