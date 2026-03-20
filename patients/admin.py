from django.contrib import admin
from .models import Patient

class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date_of_birth')
    readonly_fields = ()
    list_filter = ('date_of_birth',)
    search_fields = ('user__username',)

admin.site.register(Patient, PatientAdmin)