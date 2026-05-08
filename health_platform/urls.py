from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Redirection de la racine vers l'accueil API
    path('', RedirectView.as_view(url='/api/home/', permanent=True)),
    
    # Interface d'administration
    path('admin/', admin.site.urls),
    
    # API globale et Vues de l'application (Centralise tes endpoints REST, Login, Register, IA)
    # C'est ici que se trouvent /api/login/, /api/register/, /api/home/, etc.
    path('api/', include('api.urls')), 
    
    # URLs des applications spécifiques (Si tu as des routes dédiées à l'intérieur de ces dossiers)
    path('users/', include('users.urls')),
    path('appointments/', include('appointments.urls')),
    path('chat/', include('chat.urls')),
    path('payments/', include('payments.urls')),
    
    # Tu peux décommenter au fur et à mesure si tu ajoutes des fichiers urls.py dans ces dossiers
    # path('patients/', include('patients.urls')),
    # path('doctors/', include('doctors.urls')),
    path('consultations/', include('consultations.urls')),
    path('medical-records/', include('medicalrecords.urls')),
]

# INDISPENSABLE : Permet de consulter les fichiers (PDF, Images) en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)