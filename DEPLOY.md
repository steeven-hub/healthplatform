# Déploiement AfriHealth

## Déploiement sur Render avec le runtime Python

Configurez le service Render avec les commandes suivantes :

- **Runtime** : Python 3.12 ou plus récent (Django 6 l'exige)
- **Build Command** : `./build.sh`
- **Start Command** : `./entrypoint.sh`
- **Health Check Path** (facultatif) : `/api/health/`

`build.sh` installe les dépendances et collecte les fichiers statiques. Les migrations sont exécutées au démarrage par `entrypoint.sh`, lorsque la base de données est joignable. Daphne écoute sur `0.0.0.0` et utilise le port `PORT` fourni par Render.

Ajoutez ces variables dans **Environment** sur Render :

- `DATABASE_URL` : URL interne de votre base PostgreSQL Render
- `SECRET_KEY` : clé Django robuste et privée
- `DEBUG` : `False`
- `STRIPE_SECRET_KEY` : clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` : secret de signature du webhook Stripe
- `GEMINI_API_KEY` : clé API Google Gemini

Ne placez pas les valeurs secrètes dans Git. Si vous utilisez le Dockerfile plutôt que le runtime Python, laissez Render construire et lancer le Dockerfile ; son entrypoint applique également les migrations et respecte `PORT`.

## Déploiement avec Docker

Prérequis : Docker installé sur le serveur.

### Construire l'image

```bash
docker build -t afrihealth-backend .
```

### Lancer en production

Utilisez Docker Compose pour orchestrer le backend, PostgreSQL et, si nécessaire, un serveur Nginx pour les fichiers statiques. Définissez les variables d'environnement indiquées ci-dessus pour le conteneur.

Pour une base PostgreSQL Docker Compose, le projet doit pouvoir la joindre via `DATABASE_URL`. N'oubliez pas que les migrations sont exécutées au démarrage du backend.
