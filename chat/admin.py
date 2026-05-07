from django.contrib import admin
from .models import ChatSession, ChatMessage

class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at')
    filter_horizontal = ('participants',)
    readonly_fields = ('created_at', 'started_at')

class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'sender', 'sender_user', 'timestamp')
    list_filter = ('session', 'sender')
    search_fields = ('content',)
    readonly_fields = ('timestamp',)

admin.site.register(ChatSession, ChatSessionAdmin)
admin.site.register(ChatMessage, ChatMessageAdmin)
