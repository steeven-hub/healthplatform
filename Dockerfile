# Utilisation d'une image Python légère
FROM python:3.14-slim

# Empêcher Python de générer des fichiers .pyc et mettre en cache les sorties
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copie des dépendances et installation
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Variables d'environnement par défaut (à surcharger en prod)
ENV DJANGO_SETTINGS_MODULE=health_platform.settings

# Exposer le port de Gunicorn
EXPOSE 8000

# Commande de démarrage (Gunicorn pour WSGI)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "health_platform.wsgi:application"]
