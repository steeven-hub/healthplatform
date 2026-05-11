from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.shortcuts import render

# Vue pour servir index.html
def serve_react(request, path=None):
    return render(request, 'index.html')

urlpatterns = [
    # Interface d'administration
    path('admin/', admin.site.urls),
    
    # API globale
    path('api/', include('api.urls')), 
    
    # Autres apps
    path('users/', include('users.urls')),
    path('appointments/', include('appointments.urls')),
    path('chat/', include('chat.urls')),
    path('payments/', include('payments.urls')),
    path('consultations/', include('consultations.urls')),
    path('medicalrecords/', include('medicalrecords.urls')),

    # Servir le frontend React pour toutes les autres routes
    re_path(r'^(?!api/|admin/|users/|appointments/|chat/|payments/|consultations/|medicalrecords/).*$', serve_react),
]

# INDISPENSABLE : Permet de consulter les fichiers (PDF, Images) en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)