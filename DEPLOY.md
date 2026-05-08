# Instructions de déploiement pour AfriHealth

## 1. Prérequis
- Docker et Docker Compose installés sur votre serveur.

## 2. Construction de l'image
```bash
docker build -t afrihealth-backend .
```

## 3. Lancement en production
Utilisez un fichier `docker-compose.yml` pour orchestrer le backend, la base de données PostgreSQL et Nginx (pour servir les fichiers statiques).

## 4. Configuration des variables d'environnement
Avant de lancer le conteneur, assurez-vous de définir les variables suivantes :
- `STRIPE_SECRET_KEY`: Votre clé secrète Stripe.
- `STRIPE_WEBHOOK_SECRET`: Votre clé de signature de webhook Stripe.
- `GEMINI_API_KEY`: Votre clé API Google Gemini.
- `SECRET_KEY`: Une clé Django robuste pour la production.

## 5. Base de données
Le projet est configuré pour PostgreSQL. Si vous déployez avec Docker Compose, assurez-vous que le service de base de données est nommé `db` ou mettez à jour le `HOST` dans `settings.py`.

## 6. Migrations
N'oubliez pas d'exécuter les migrations après le lancement du conteneur :
```bash
docker exec -it <container_id> python manage.py migrate
```
