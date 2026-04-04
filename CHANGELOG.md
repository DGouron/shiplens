# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Open-source readiness: LICENSE (MIT), SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md
- CI pipeline with GitHub Actions (lint, types, tests, build)
- Issue and PR templates
- Branch protection setup script

## [0.0.1] - 2026-04-04

Initial development release with 22 implemented features.

### Added

- **Identity**: Linear workspace connection via OAuth and Personal API Key
- **Synchronization**: team selection, reference data sync (labels, statuses, members, projects), issue & cycle sync with pagination, real-time webhook sync
- **Analytics**: cycle metrics (velocity, throughput, cycle time, lead time, scope creep, completion rate), AI-generated sprint reports with export, blocked issue detection (scheduled hourly), bottleneck analysis by status, estimation accuracy tracking, issue duration prediction, workspace dashboard with team KPIs, cycle report page with piloting data, member cycle profile with AI digest, dashboard empty states, estimation score as days per point
- **Audit**: custom audit rules (file-based), Packmind practice import, audit results in sprint reports
- **Notification**: Slack sprint report delivery, Slack blocked issue alerts (scheduled daily)
- **Infrastructure**: Clean Architecture + Screaming Architecture foundation, Prisma + SQLite, Zod validation, Vitest + Playwright test setup, Docker multi-stage build

### Changed

- Replaced ESLint + Prettier with Biome
- Replaced `var` with `const`/`let` across codebase

### Fixed

- Runtime crash from unresolved path aliases and missing dotenv
- Cycle time and lead time rounding in presenter
- Soft-deleted issues excluded from cycle metrics
- Cycle name fallback to cycle number
- Milestone unique constraint during sync
- Blocked issue alerts filtered by team
- Assignee breakdown columns in cycle report
