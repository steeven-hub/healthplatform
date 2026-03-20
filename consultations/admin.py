from django.contrib import admin
from .models import Consultation

class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'diagnosis', 'created_at')
    list_filter = ('doctor', 'patient')
    search_fields = ('patient__username', 'doctor__username', 'diagnosis')
    readonly_fields = ('created_at',)

admin.site.register(Consultation, ConsultationAdmin)