#!/bin/bash

set -e

BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/lexcloud_backup_$DATE.sql"
GPG_RECIPIENT="lexcloud-backup@system.local"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "Starting LexCloud backup at $(date)"

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

echo "Creating database backup..."
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --verbose --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Database backup created successfully: $BACKUP_FILE"
    
    BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "unknown")
    echo "Backup size: $BACKUP_SIZE bytes"
    
    echo "Encrypting backup..."
    if command -v gpg >/dev/null 2>&1; then
        gpg --trust-model always --encrypt --armor --recipient "$GPG_RECIPIENT" --output "$BACKUP_FILE.gpg" "$BACKUP_FILE"
        if [ $? -eq 0 ]; then
            rm "$BACKUP_FILE"
            echo "Backup encrypted and original removed"
        else
            echo "WARNING: Encryption failed, keeping unencrypted backup"
        fi
    else
        echo "WARNING: GPG not available, backup stored unencrypted"
    fi
    
    echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "lexcloud_backup_*.sql*" -mtime +$RETENTION_DAYS -delete
    
    echo "Backup completed successfully at $(date)"
else
    echo "ERROR: Database backup failed"
    exit 1
fi
