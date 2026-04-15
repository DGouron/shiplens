# Migrate member health trends page

## Status: ready (slice 5/6)

Slice 5 of the frontend migration. Depends on Slice 1 (setup-react-spa) and Slice 2 (extract-design-system).

## Context

The member health trends page displays 5 health signals for a team member computed over their last N completed cycles: estimation score evolution, underestimation ratio, average cycle time, drifting tickets count, and median review time. Each signal shows the latest value, a trend direction (rising/falling/stable), and a color-coded health indicator (green/orange/red). The current implementation is an inline HTML template (`member-health-trends.html.ts`) that fetches a single API endpoint and renders signal cards with trend arrows and color-coded borders.

## Rules

- The member health trends page is a React route at `/member-health-trends`
- The route reads `teamId` and `memberName` from URL query parameters
- A "Back to cycle report" link navigates to `/cycle-report?teamId=xxx`
- Data fetching uses a `useMemberHealthViewModel` hook that calls `GET /api/analytics/teams/:teamId/members/:memberName/health?cycles=N`
- The hook returns a discriminated union: `loading` | `loaded` | `empty` | `error`
- A cycle count selector allows the user to choose how many completed sprints to analyze (default: 5)
- Changing the cycle count refetches the data
- The `loaded` state contains `signals: HealthSignalViewModel[]` (always 5 signals)
- Each signal displays: label, latest value, trend direction (arrow icon), health indicator (colored dot/border)
- Signal health colors: green = favorable trend, orange = first deviation or mixed, red = unfavorable for 2+ consecutive cycles
- A signal with insufficient history (fewer than 3 cycles) displays the raw value with "Not enough data" note
- A signal marked "Not applicable" (e.g., estimation for a member with no estimated issues) displays that label
- The empty state ("No data available for this member") is displayed when the member has no completed cycles
- The page title shows the member name
- Breadcrumbs show: Shiplens / Cycle Report / Member name
- All user-facing text comes from the translation system (matching `MemberHealthTrendsTranslationKeys`)
- The `MemberHealthTrendsPageController` HTML endpoint is removed in Slice 6
- Every component and hook has Vitest tests

## Scenarios

- nominal health: {Alice, 4 cycles, improving estimation score} -> 5 signal cards displayed + estimation signal green with rising arrow
- chronic underestimation: {Bob, 3 cycles, rising underestimation 40% -> 45% -> 50%} -> underestimation signal red + rising arrow + value "50%"
- drifting cycle time: {Alice, 3 cycles, rising cycle time} -> cycle time signal red + rising arrow
- lingering review: {Charlie, 3 cycles, median review time doubling each cycle} -> review signal red + rising arrow
- improvement: {Alice, 3 cycles, drifting tickets decreasing} -> drift signal green + falling arrow
- mixed trend: {Bob, 4 cycles, cycle time oscillating} -> cycle time signal orange
- insufficient history: {new member, 1 cycle} -> 5 signals with raw values + "Not enough data" note on each
- no completed cycles: {member without history} -> empty state "No data available for this member"
- not applicable signal: {member with no estimated issues} -> estimation and underestimation signals show "Not applicable"
- cycle count change: {user changes selector from 5 to 3} -> data refetched with `cycles=3` + signals updated
- back navigation: {user clicks "Back to cycle report"} -> navigates to `/cycle-report?teamId=xxx`
- loading state: {data being fetched} -> skeleton signal cards displayed
- error state: {API returns 500} -> error message displayed
- locale french: {workspace language is FR} -> all labels in French
- locale english: {workspace language is EN} -> all labels in English

## Out of scope

- Modifying the `MemberHealthPresenter` or `GetMemberHealthUsecase`
- Changing the health API response shape
- Multi-curve temporal charts
- Comparison between members
- Automatic recommendations based on signals
- Team-level health signals

## Glossary

| Term | Definition |
|------|------------|
| Health signal | A metric computed over N cycles revealing a positive or negative trend in a member's work patterns |
| Trend direction | Arrow indicating whether a signal value is rising, falling, or stable over recent cycles |
| Health indicator | Color code (green/orange/red) summarizing whether the trend is favorable, mixed, or unfavorable |
