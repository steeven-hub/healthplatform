from django.contrib import admin
from .models import Appointment

class AppointmentAdmin(admin.ModelAdmin):
    # Champs exacts du modèle
    list_display = ('id', 'patient', 'doctor', 'date', 'status')
    list_filter = ('status', 'date')  # Champs exacts pour filtrer
    search_fields = ('patient__username', 'doctor__username')  # recherche par nom d'utilisateur

admin.site.register(Appointment, AppointmentAdmin)