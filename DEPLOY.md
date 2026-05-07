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
- `GEMINI_API_KEY`: Votre clé API Google Gemini.
- `SECRET_KEY`: Une clé Django robuste pour la production.

Le projet est maintenant prêt à être conteneurisé. Bonne mise en production !
