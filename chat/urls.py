from django.urls import path
from . import views

urlpatterns = [
    # 📋 Liste des conversations
    path('', views.chat_sessions, name='chat_sessions'),

    # 💬 Détail d'une conversation
    path('<int:session_id>/', views.chat_detail, name='chat_detail'),

    # 📩 Envoyer message
    path('send/<int:session_id>/', views.send_message, name='send_message'),
]