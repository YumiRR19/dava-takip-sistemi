#!/bin/bash

set -e

BACKUP_DIR="/app/backups"
RESTORE_FILE="$1"

if [ -z "$RESTORE_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/lexcloud_backup_*.sql* 2>/dev/null || echo "No backups found"
    exit 1
fi

if [ ! -f "$RESTORE_FILE" ]; then
    echo "ERROR: Backup file not found: $RESTORE_FILE"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

echo "Starting LexCloud restore from $RESTORE_FILE at $(date)"

TEMP_FILE="$RESTORE_FILE"

if [[ "$RESTORE_FILE" == *.gpg ]]; then
    echo "Decrypting backup file..."
    TEMP_FILE="${RESTORE_FILE%.gpg}"
    gpg --decrypt --output "$TEMP_FILE" "$RESTORE_FILE"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to decrypt backup file"
        exit 1
    fi
fi

echo "WARNING: This will replace all data in the database!"
echo "Press Ctrl+C within 10 seconds to cancel..."
sleep 10

echo "Restoring database..."
pg_restore --clean --if-exists --no-owner --no-privileges --verbose --dbname="$DATABASE_URL" "$TEMP_FILE"

if [ $? -eq 0 ]; then
    echo "Database restore completed successfully at $(date)"
    
    if [[ "$RESTORE_FILE" == *.gpg ]] && [ -f "$TEMP_FILE" ]; then
        rm "$TEMP_FILE"
        echo "Temporary decrypted file removed"
    fi
else
    echo "ERROR: Database restore failed"
    if [[ "$RESTORE_FILE" == *.gpg ]] && [ -f "$TEMP_FILE" ]; then
        rm "$TEMP_FILE"
    fi
    exit 1
fi
