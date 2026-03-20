import os
from pathlib import Path

# 🔹 Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# 🔹 Secret Key (change pour la prod !)
SECRET_KEY = 'django-insecure-your-secret-key'

# 🔹 Debug
DEBUG = True

# 🔹 Hosts autorisés
ALLOWED_HOSTS = ['*']  # En prod, mettre le domaine ou IP spécifique

# 🔹 Applications installées
INSTALLED_APPS = [
    # Django par défaut
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 🔹 Apps tierces
    'rest_framework',
    'corsheaders',

    # 🔹 Vos apps (ordre important : users en premier)
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

# 🔹 Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Pour autoriser le cross-origin
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# 🔹 CORS (optionnel pour API)
CORS_ALLOW_ALL_ORIGINS = True

# 🔹 URL configuration
ROOT_URLCONF = 'health_platform.urls'

# 🔹 Templates
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

# 🔹 WSGI / ASGI
WSGI_APPLICATION = 'health_platform.wsgi.application'
ASGI_APPLICATION = 'health_platform.asgi.application'

# 🔹 Base utilisateur personnalisé
AUTH_USER_MODEL = 'users.User'

# 🔹 Database (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'health_platform',
        'USER': 'postgres',
        'PASSWORD': 'root',       # Ton mot de passe
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# 🔹 Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# 🔹 Internationalisation
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Porto-Novo'
USE_I18N = True
USE_TZ = True

# 🔹 Fichiers statiques
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# 🔹 Fichiers médias (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# 🔹 DRF Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# 🔹 Email backend (console pour dev)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 🔹 Default auto field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'