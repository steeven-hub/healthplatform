#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running Migrations..."
python manage.py migrate --noinput

echo "Starting Server..."
daphne -b 0.0.0.0 -p 10000 health_platform.asgi:application
