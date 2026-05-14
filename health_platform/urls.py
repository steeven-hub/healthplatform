from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import FileResponse
from django.contrib.auth import views as auth_views
import os

# Vue pour servir index.html
def serve_react(request, path=None):
    return FileResponse(open(os.path.join(settings.BASE_DIR, 'Health_platform_frontend', 'dist', 'index.html'), 'rb'))

urlpatterns = [
    # Interface d'administration
    path('admin/', admin.site.urls),
    
    # API globale
    path('api/', include('api.urls')), 
    
    # Authentification / Mot de passe
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    
    # Autres apps
    path('users/', include('users.urls')),
    path('appointments/', include('appointments.urls')),
    path('chat/', include('chat.urls')),
    path('payments/', include('payments.urls')),
    path('consultations/', include('consultations.urls')),
    path('medicalrecords/', include('medicalrecords.urls')),

    # Servir le frontend React pour toutes les autres routes
    re_path(r'^(?!api/|admin/|users/|appointments/|chat/|payments/|consultations/|medicalrecords/|password_reset/|reset/).*$', serve_react),
]

# INDISPENSABLE : Permet de consulter les fichiers (PDF, Images) en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)