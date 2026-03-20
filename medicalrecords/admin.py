from django.contrib import admin
from .models import MedicalRecord

class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'record_type', 'date_created')
    readonly_fields = ('doctor', 'date_created')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            # Assigne le doctor connecté au moment de la création
            obj.doctor = request.user.doctor
        super().save_model(request, obj, form, change)

admin.site.register(MedicalRecord, MedicalRecordAdmin)