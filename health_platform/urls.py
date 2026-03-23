from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API globale (Centralise tes endpoints REST)
    path('api/', include('api.urls')), 
    
    # URLs des applications spécifiques
    path('users/', include('users.urls')),
    path('appointments/', include('appointments.urls')),
    path('chat/', include('chat.urls')),
    
    # On peut aussi ajouter les autres si tu as des vues spécifiques
    # path('patients/', include('patients.urls')),
    # path('doctors/', include('doctors.urls')),
]

# INDISPENSABLE : Permet de consulter les fichiers (PDF, Images) en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)