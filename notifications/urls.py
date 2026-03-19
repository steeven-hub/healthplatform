from django.urls import path
from . import views

urlpatterns = [
    path('', views.notification_list, name='notification_list'),
    path('send/', views.send_notification, name='send_notification'),
]