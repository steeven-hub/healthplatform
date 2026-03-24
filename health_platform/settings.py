import os
from pathlib import Path

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
    'api',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Toujours en premier
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware', # Important après CorsMiddleware
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'health_platform.urls'

# --- CONFIGURATION SERVEUR (ASGI POUR LE CHAT) ---
WSGI_APPLICATION = 'health_platform.wsgi.application'
ASGI_APPLICATION = 'health_platform.asgi.application'

# --- COUCHE DE COMMUNICATION (CHANNEL LAYERS) ---
# InMemory est parfait pour tes tests sous Windows 10
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

# --- TEMPLATES ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

# --- INTERNATIONALISATION ---
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Porto-Novo'
USE_I18N = True
USE_TZ = True

# --- FICHIERS STATIQUES ET MÉDIAS ---
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --- CORS (POUR LE FRONTEND ANGULAR) ---
CORS_ALLOW_ALL_ORIGINS = True # Pratique en dev, à restreindre en prod
CORS_ALLOW_CREDENTIALS = True

# --- DJANGO REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'