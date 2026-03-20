from django.contrib import admin
from .models import Notification

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'message', 'is_read', 'created_at')
    readonly_fields = ('created_at',)
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'message')

admin.site.register(Notification, NotificationAdmin)