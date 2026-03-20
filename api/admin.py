from django.contrib import admin
from .models import ApiRecord

@admin.register(ApiRecord)
class ApiRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'appointment', 'consultation', 'created_at', 'updated_at')
    search_fields = ('patient__user__username', 'doctor__user__username')
    list_filter = ('created_at', 'doctor')
    readonly_fields = ('created_at', 'updated_at')