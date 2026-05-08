#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running Migrations..."
python manage.py migrate --noinput

echo "Starting Server on port ${PORT:-10000}..."
daphne -b 0.0.0.0 -p ${PORT:-10000} health_platform.asgi:application
