import os
from pathlib import Path
import dj_database_url

# --- CHEMINS DE BASE ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SÉCURITÉ ---
SECRET_KEY = 'django-insecure-votre-cle-reelle-ici' # À changer en production
DEBUG = True
ALLOWED_HOSTS = ['*']

# --- APPLICATIONS (ORDRE CRITIQUE) ---
INSTALLED_APPS = [
    'daphne',  # Doit être AVANT 'django.contrib.staticfiles'
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'channels', 

    # Local apps (AfriHealth)
    'users',
    'patients',
    'doctors',
    'appointments',
    'consultations',
    'medicalrecords',
    'chat',
    'notifications',
    'payments',
    'api',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Toujours en premier
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware', 
    'django.middleware.csrf.CsrfViewMiddleware', # Essentiel pour la sécurité des formulaires
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'health_platform.urls'

# --- CONFIGURATION SERVEUR (ASGI POUR LE CHAT) ---
WSGI_APPLICATION = 'health_platform.wsgi.application'
ASGI_APPLICATION = 'health_platform.asgi.application'

# --- COUCHE DE COMMUNICATION (CHANNEL LAYERS) ---
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

# --- TEMPLATES ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'api' / 'templates', # Ajouté pour trouver tes fichiers dans api/templates
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- MODÈLE UTILISATEUR PERSONNALISÉ ---
AUTH_USER_MODEL = 'users.User'

# --- BASE DE DONNÉES (POSTGRESQL) ---
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    print("CONSIGNES : Base de données de PRODUCTION détectée.")
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    print("CONSIGNES : Aucune DATABASE_URL trouvée, utilisation du LOCALHOST.")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'health_platform',
            'USER': 'postgres',
            'PASSWORD': 'root', 
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }

# --- GESTION DE L'AUTHENTIFICATION ET REDIRECTION ---
LOGIN_URL = None
LOGIN_REDIRECT_URL = None
LOGOUT_REDIRECT_URL = None  

# --- CONFIGURATION CSRF (POUR ÉVITER L'ERREUR 403) ---
CSRF_TRUSTED_ORIGINS = [
    'http://127.0.0.1:8000', 
    'http://localhost:8000', 
    'http://localhost:5173',
    'https://healthplatform.onrender.com'
]
CSRF_COOKIE_HTTPONLY = False  # Permet la lecture si nécessaire par JS

# --- INTERNATIONALISATION ---
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Porto-Novo'
USE_I18N = True
USE_TZ = True

# --- FICHIERS STATIQUES ET MÉDIAS ---
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'Health_platform_frontend' / 'dist',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --- CORS (POUR LE FRONTEND ANGULAR / REACT) ---
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_CREDENTIALS = True

# --- DJANGO REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# --- CONFIGURATION STRIPE ---
# Si vous n'avez pas encore défini la clé, une valeur factice est utilisée pour éviter le crash.
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_default_value")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_test_default_value")

# --- CONFIGURATION EMAIL ---
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# --- CLÉS API ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "CLE_PAR_DEFAUT")
API_KEY = GEMINI_API_KEY

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'