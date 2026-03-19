from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, PatientViewSet, DoctorViewSet, AppointmentViewSet,
    ConsultationViewSet, MedicalRecordViewSet, ChatSessionViewSet, ChatMessageViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'medicalrecords', MedicalRecordViewSet)
router.register(r'chatsessions', ChatSessionViewSet)
router.register(r'chatmessages', ChatMessageViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]