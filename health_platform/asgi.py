import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_platform.settings')

# Initialize Django ASGI application early.
# This should initialize the app registry.
django_asgi_app = get_asgi_application()

# Import Channels components
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Import app-specific routing modules AFTER Django is initialized.
# This is crucial to avoid AppRegistryNotReady.
import chat.routing
import notifications.routing

application = ProtocolTypeRouter({
    # Route all standard HTTP requests through Django's ASGI application.
    "http": django_asgi_app,

    # Route WebSocket requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            # Combine URL patterns from chat and notifications apps
            chat.routing.websocket_urlpatterns +
            notifications.routing.websocket_urlpatterns
        )
    ),
})