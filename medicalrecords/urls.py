from django.urls import path
from . import views

urlpatterns = [
    path('', views.medical_record_list, name='medical_record_list'),
    path('<int:patient_id>/', views.patient_medical_record, name='patient_medical_record'),
]