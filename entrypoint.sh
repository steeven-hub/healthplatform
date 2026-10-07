#!/usr/bin/env bash
set -euo pipefail

echo "Running database migrations..."
python manage.py migrate --noinput

PORT="${PORT:-10000}"
echo "Starting Daphne on port ${PORT}..."
# Keep Daphne in the foreground so Render can monitor and stop the process.
exec daphne -b 0.0.0.0 -p "${PORT}" health_platform.asgi:application
