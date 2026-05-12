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
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copie des dépendances et installation
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Construction du frontend
COPY Health_platform_frontend/ ./Health_platform_frontend/
WORKDIR /app/Health_platform_frontend
RUN npm install && npm run build

# Retour au répertoire racine
WORKDIR /app

# Copie du code source
COPY . .

# Collecte des fichiers statiques
RUN python manage.py collectstatic --noinput --settings=health_platform.settings

# Variables d'environnement par défaut
ENV DJANGO_SETTINGS_MODULE=health_platform.settings

# Exposer le port
EXPOSE 10000

# Rendre le script d'entrée exécutable
RUN chmod +x entrypoint.sh

# Commande de démarrage forcée via ENTRYPOINT
ENTRYPOINT ["./entrypoint.sh"]
