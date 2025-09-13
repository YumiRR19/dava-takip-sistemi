#!/bin/bash

set -e

BACKUP_DIR="/app/backups"
TEST_DB_URL="${TEST_DATABASE_URL:-$DATABASE_URL}"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/restore_test_${DATE}.log"

echo "🧪 Starting weekly restore test at $(date)" | tee "$LOG_FILE"

LATEST_BACKUP=$(find "$BACKUP_DIR" -name "lexcloud_backup_*.sql.gpg" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup files found" | tee -a "$LOG_FILE"
    exit 1
fi

echo "📁 Testing backup: $(basename "$LATEST_BACKUP")" | tee -a "$LOG_FILE"

TEST_DB_NAME="lexcloud_restore_test_${DATE}"
echo "🗄️ Creating test database: $TEST_DB_NAME" | tee -a "$LOG_FILE"

echo "🔓 Decrypting and restoring backup..." | tee -a "$LOG_FILE"
if gpg --quiet --batch --passphrase-file /app/backup_passphrase.txt \
       --decrypt "$LATEST_BACKUP" | \
   psql "$TEST_DB_URL" -c "CREATE DATABASE $TEST_DB_NAME;" && \
   gpg --quiet --batch --passphrase-file /app/backup_passphrase.txt \
       --decrypt "$LATEST_BACKUP" | \
   psql "${TEST_DB_URL%/*}/$TEST_DB_NAME"; then
    
    echo "✅ Restore successful" | tee -a "$LOG_FILE"
    
    echo "🔍 Verifying restored data..." | tee -a "$LOG_FILE"
    
    CLIENTS_COUNT=$(psql "${TEST_DB_URL%/*}/$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM clients WHERE is_deleted = false;" 2>/dev/null || echo "0")
    CASES_COUNT=$(psql "${TEST_DB_URL%/*}/$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM cases WHERE is_deleted = false;" 2>/dev/null || echo "0")
    
    echo "📊 Restored data counts: Clients=$CLIENTS_COUNT, Cases=$CASES_COUNT" | tee -a "$LOG_FILE"
    
    echo "🧹 Cleaning up test database..." | tee -a "$LOG_FILE"
    psql "$TEST_DB_URL" -c "DROP DATABASE $TEST_DB_NAME;" 2>/dev/null || true
    
    echo "✅ RESTORE TEST PASSED" | tee -a "$LOG_FILE"
    echo "$(date): Weekly restore test PASSED - $LATEST_BACKUP" >> "$BACKUP_DIR/backup.log"
    
else
    echo "❌ RESTORE TEST FAILED" | tee -a "$LOG_FILE"
    echo "$(date): Weekly restore test FAILED - $LATEST_BACKUP" >> "$BACKUP_DIR/backup.log"
    
    psql "$TEST_DB_URL" -c "DROP DATABASE IF EXISTS $TEST_DB_NAME;" 2>/dev/null || true
    exit 1
fi

echo "🎉 Weekly restore test completed successfully at $(date)" | tee -a "$LOG_FILE"
