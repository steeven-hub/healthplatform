#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running Migrations..."
python manage.py migrate --noinput || { 
    echo "MIGRATION FAILED - Attempting to debug with full output:"
    python manage.py migrate
    exit 1
}

echo "Starting Server on port 10000..."
# Utilisation de 'exec' pour que Daphne reçoive les signaux de terminaison de Render
exec daphne -b 0.0.0.0 -p 10000 health_platform.asgi:application
