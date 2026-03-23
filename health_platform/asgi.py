import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Importation des deux routages
import chat.routing 
import notifications.routing  # <--- AJOUTE CETTE LIGNE

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_platform.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            # On combine les deux listes d'URLs avec le signe "+"
            chat.routing.websocket_urlpatterns + 
            notifications.routing.websocket_urlpatterns
        )
    ),
})