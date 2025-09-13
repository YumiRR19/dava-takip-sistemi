#!/bin/bash

set -e

BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="lexcloud_backup_${DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"
DATABASE_URL="${DATABASE_URL}"

mkdir -p "$BACKUP_DIR"

echo "🔄 Starting daily backup at $(date)"

echo "📊 Creating database dump..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"

echo "🔒 Encrypting backup..."
gpg --symmetric --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
    --s2k-digest-algo SHA512 --s2k-count 65536 --force-mdc \
    --passphrase-file /app/backup_passphrase.txt \
    --output "$BACKUP_DIR/$ENCRYPTED_FILE" \
    "$BACKUP_DIR/$BACKUP_FILE"

rm "$BACKUP_DIR/$BACKUP_FILE"

echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "lexcloud_backup_*.sql.gpg" -mtime +7 -delete

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$ENCRYPTED_FILE" | cut -f1)
echo "✅ Backup completed: $ENCRYPTED_FILE ($BACKUP_SIZE)"
echo "$(date): Backup $ENCRYPTED_FILE created successfully ($BACKUP_SIZE)" >> "$BACKUP_DIR/backup.log"

echo "🔍 Verifying backup integrity..."
if gpg --quiet --batch --passphrase-file /app/backup_passphrase.txt \
       --decrypt "$BACKUP_DIR/$ENCRYPTED_FILE" > /dev/null 2>&1; then
    echo "✅ Backup integrity verified"
    echo "$(date): Backup $ENCRYPTED_FILE integrity verified" >> "$BACKUP_DIR/backup.log"
else
    echo "❌ Backup integrity check failed"
    echo "$(date): ERROR - Backup $ENCRYPTED_FILE integrity check failed" >> "$BACKUP_DIR/backup.log"
    exit 1
fi

echo "🎉 Daily backup completed successfully at $(date)"
