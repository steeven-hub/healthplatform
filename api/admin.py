from django.contrib import admin
from .models import ApiRecord

# Configuration spécifique pour ApiRecord
@admin.register(ApiRecord)
class ApiRecordAdmin(admin.ModelAdmin):
    list_display = ('endpoint', 'timestamp') 
    readonly_fields = ('timestamp',)
    list_filter = ('timestamp', 'endpoint')
    search_fields = ('endpoint', 'request_data', 'response_data')
