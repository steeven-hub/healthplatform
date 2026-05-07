from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import *

router = DefaultRouter()
# ... (rest of router config)
# router.register(r'users', UserViewSet)
# router.register(r'patients', PatientViewSet)
# router.register(r'doctors', DoctorViewSet)
# router.register(r'appointments', AppointmentViewSet)
# router.register(r'consultations', ConsultationViewSet)

# # ViewSets avec basename obligatoire (ceux utilisant get_queryset)
# router.register(r'medicalrecords', MedicalRecordViewSet, basename='medicalrecord')
# router.register(r'chatsessions', ChatSessionViewSet)
# router.register(r'chatmessages', ChatMessageViewSet)
# router.register(r'api-records', ApiRecordViewSet)
# router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # 1. API REST (préfixée par api/ dans le navigateur via le routeur)
    path('', include(router.urls)), 
    
    # Authentification par Token pour le frontend
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),

    # 2. Routes IA et Stats
    path('ai-assistant/', ai_assistant_view, name='ai_assistant'),
    path('chat-sessions/', chat_sessions_list_api, name='chat_sessions_list'),
    path('chat-sessions/<int:session_id>/delete/', delete_chat_session_api, name='delete_chat_session'),
    path('stats/', dashboard_stats_api, name='dashboard_stats'),
    path('patient-detail/<str:patient_id>/', patient_detail_api, name='patient_detail'),
    path('notifications/', notifications_api, name='notifications'),
    path('me/', get_me, name='get_me'),
    path('admissions/', admissions_list_api, name='admissions_list'),
    path('admissions/create/', create_admission_api, name='create_admission'),
    path('medical-records/create/', create_medical_record_api, name='create_medical_record'),
    path('availability/', availability_api, name='availability'),
    path('list-doctors/', list_doctors_api, name='list_doctors'),
    path('book-appointment/', book_appointment_api, name='book_appointment'),
    path('appointments/<int:appointment_id>/status/', update_appointment_status_api, name='update_appointment_status'),
    path('update-profile/', update_profile_api, name='update_profile'),
    path('token-login/', token_login_api, name='token_login'),
    path('generate-report/', generate_medical_report, name='generate_report'),

    # 3. Vues Authentification (Seront accessibles via /api/login/, etc.)
    path('login/', login_view, name='login_page'),
    path('register/', register_view, name='register_page'),
    path('logout/', logout_user, name='logout'),
    path('home/', dashboard_view, name='home'),
    path('patients-list/', patients_list_view, name='patients_list'),
]