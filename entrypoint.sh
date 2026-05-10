#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running Migrations..."
# On tente la migration. Si elle échoue, on affiche l'erreur détaillée
python manage.py migrate --noinput || { 
    echo "--------------------------------------------------------"
    echo "MIGRATION FAILED - Attempting to debug with full output:"
    python manage.py migrate
    echo "--------------------------------------------------------"
    exit 1
}

echo "Starting Server on port ${PORT:-10000}..."
daphne -b 0.0.0.0 -p ${PORT:-10000} health_platform.asgi:application
