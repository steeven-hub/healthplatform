from django.contrib import admin
from .models import Patient, Doctor, Appointment, Consultation, MedicalRecord, ChatSession, ChatMessage, ApiRecord

# Enregistrement simple pour les modèles de base
admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(Appointment)
admin.site.register(Consultation)
admin.site.register(MedicalRecord)
admin.site.register(ChatSession)
admin.site.register(ChatMessage)

# Configuration spécifique pour ApiRecord (Corrigée)
@admin.register(ApiRecord)
class ApiRecordAdmin(admin.ModelAdmin):
    # On n'utilise que les champs qui existent réellement dans ton modèle ApiRecord
    list_display = ('endpoint', 'timestamp') 
    readonly_fields = ('timestamp',) # timestamp est auto_now_add, donc lecture seule
    list_filter = ('timestamp', 'endpoint')
    search_fields = ('endpoint', 'request_data', 'response_data')