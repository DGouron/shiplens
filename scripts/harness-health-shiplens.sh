#!/usr/bin/env bash
# Wrapper that runs harness-health.sh with shiplens-specific env vars.
# Usage: bash scripts/harness-health-shiplens.sh [--quiet|--json]

DOCS_DIR=docs \
SPECS_DIR=docs/specs \
ADR_DIR=docs/adr \
FEATURE_TRACKER=docs/feature-tracker.md \
exec bash "$(dirname "$0")/harness-health.sh" "$@"
