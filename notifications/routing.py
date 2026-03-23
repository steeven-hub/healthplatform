from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Utilise path pour une correspondance exacte et propre
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
]