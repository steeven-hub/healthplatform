"""
ASGI config for health_platform project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
from django.core.asgi import get_asgi_application

# Indique le module settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_platform.settings')

application = get_asgi_application()