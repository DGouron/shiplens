#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
DB_PATH="$PROJECT_DIR/prisma/dev.db"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_SUBDIR="$BACKUP_DIR/$DATE"

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH — nothing to backup."
  exit 0
fi

mkdir -p "$BACKUP_SUBDIR"

BACKUP_FILE="$BACKUP_SUBDIR/shiplens_backup_${TIMESTAMP}.db"
cp "$DB_PATH" "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true

echo "Backup complete."
