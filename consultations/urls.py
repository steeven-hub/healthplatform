from django.urls import path
from . import views

urlpatterns = [
    path('', views.consultation_list, name='consultation_list'),
    path('create/', views.create_consultation, name='create_consultation'),
]