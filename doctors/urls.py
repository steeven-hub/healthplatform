from django.urls import path
from . import views

urlpatterns = [

    # liste des médecins
    path('', views.doctor_list, name='doctor_list'),

    # détail d’un médecin
    path('<int:id>/', views.doctor_detail, name='doctor_detail'),

    # créer un médecin
    path('create/', views.create_doctor, name='create_doctor'),

]