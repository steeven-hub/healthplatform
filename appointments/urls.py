from django.urls import path
from . import views

urlpatterns = [
    # Liste des rendez-vous
    path('', views.appointment_list, name='appointment_list'),

    # Prendre / réserver un rendez-vous
    path('book/', views.book_appointment, name='book_appointment'),

    # Créer un rendez-vous (optionnel si book_appointment couvre déjà)
    path('create/', views.create_appointment, name='create_appointment'),

    # Modifier un rendez-vous
    path('edit/<int:appointment_id>/', views.edit_appointment, name='edit_appointment'),

    # Supprimer un rendez-vous
    path('delete/<int:appointment_id>/', views.delete_appointment, name='delete_appointment'),

    # Détail d’un rendez-vous
    path('<int:appointment_id>/', views.appointment_detail, name='appointment_detail'),
]