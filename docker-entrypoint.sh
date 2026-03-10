#!/bin/bash
set -e

# Start Postgres in the background
/usr/local/bin/docker-entrypoint.sh postgres &

# Wait for Postgres to be ready
until psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "Waiting for database..."
  sleep 1
done

# Run init.sql every time
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init.sql

# Keep Postgres running in foreground
wait