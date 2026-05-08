import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_platform.settings')

# Initialise Django ASGI pour charger les applications
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

def application(scope):
    """
    Entry point for ASGI applications.
    Handles both HTTP and WebSocket connections.
    """
    # Charger dynamiquement les routages uniquement lorsque nécessaire
    # Ceci est une mesure de sécurité pour éviter les importations circulaires
    # ou les chargements trop précoces qui causent AppRegistryNotReady
    chat_routing = __import__('chat.routing', fromlist=['websocket_urlpatterns']).websocket_urlpatterns
    notifications_routing = __import__('notifications.routing', fromlist=['websocket_urlpatterns']).websocket_urlpatterns

    return ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                chat_routing + notifications_routing
            )
        ),
    })(scope)