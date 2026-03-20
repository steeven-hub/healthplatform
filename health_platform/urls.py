from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from patients.views import PatientViewSet
from doctors.views import DoctorViewSet
from appointments.views import AppointmentViewSet
from consultations.views import ConsultationViewSet
from medicalrecords.views import MedicalRecordViewSet
from chat.views import ChatSessionViewSet, ChatMessageViewSet
from notifications.views import NotificationViewSet
from users.api_views import UserViewSet  # <- DRF

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
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('', include('users.urls')),  # <- routes HTML
]