from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.chat_sessions, name='chat_sessions'),
    path('send/', views.send_message, name='send_message'),
]