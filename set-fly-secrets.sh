#!/bin/bash

echo "Setting Fly.io secrets for LexCloud production..."

JWT_SECRET="lexcloud-jwt-secret-key-2025-production-$(date +%s)-$(openssl rand -hex 16)"

fly secrets set \
  ADMIN_PASSWORD="Msghukuk0714." \
  JWT_SECRET="$JWT_SECRET" \
  DATABASE_URL="postgres://lexcloud_user:$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)@lexcloud-db.internal:5432/lexcloud?sslmode=require" \
  --app app-uxymlzyo

echo "Secrets set successfully!"
echo "JWT_SECRET: $JWT_SECRET"
