from django.contrib import admin
from .models import Doctor

class DoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'specialty')
    search_fields = ('user__username', 'specialty')

admin.site.register(Doctor, DoctorAdmin)