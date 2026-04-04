#!/usr/bin/env bash
set -euo pipefail

# Configures branch protection rules for the master branch.
# Requires: gh CLI authenticated with admin access.
#
# Usage: ./scripts/setup-branch-protection.sh owner/repo

REPO="${1:?Usage: $0 owner/repo}"

gh api "repos/${REPO}/branches/master/protection" \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint & Type Check", "Unit Tests", "Build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

echo "Branch protection configured for ${REPO}:master"
